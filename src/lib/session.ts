import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";

const COOKIE = "session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 zile

/** Creează o sesiune nouă pentru utilizator și setează cookie-ul. */
export async function createSession(userId: string): Promise<void> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + MAX_AGE * 1000);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // În dev rulăm pe http://IP (WebView), deci cookie-ul nu poate fi „secure".
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** Utilizatorul curent (sau null). Memorat per cerere cu cache(). */
export const getCurrentUser = cache(async () => {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
});

/** Distruge sesiunea curentă (logout). */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
    store.delete(COOKIE);
  }
}

/** Cere un utilizator autentificat; altfel redirect la /login. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Verifică accesul curentului la un eveniment.
 * Returnează { user, member } sau null dacă nu e membru / nu e autentificat.
 */
export async function getEventAccess(eventId: string) {
  const user = await getCurrentUser();
  if (!user) return null;
  const member = await prisma.eventMember.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
  });
  if (!member) return null;
  return { user, member };
}

/**
 * Cere acces la eveniment: dacă nu e autentificat → /login;
 * dacă e autentificat dar nu e membru → 404.
 */
export async function requireEventAccess(eventId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const member = await prisma.eventMember.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
  });
  if (!member) notFound();
  return { user, member };
}

/** Cere ca utilizatorul curent să fie owner al evenimentului. */
export async function requireEventOwner(eventId: string) {
  const access = await requireEventAccess(eventId);
  if (access.member.role !== "owner") notFound();
  return access;
}
