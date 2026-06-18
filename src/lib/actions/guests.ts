"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireEventAccess } from "@/lib/session";

function rp(eventId: string) {
  revalidatePath(`/eveniment/${eventId}`, "layout");
}

export async function saveGuest(eventId: string, guestId: string | null, formData: FormData) {
  await requireEventAccess(eventId);
  const status = String(formData.get("status") || "in_asteptare");
  const data = {
    name: String(formData.get("name") || "").trim(),
    contact: String(formData.get("contact") || "").trim() || null,
    status,
    companions: parseInt(String(formData.get("companions") || "0")) || 0,
    children: parseInt(String(formData.get("children") || "0")) || 0,
    tableName: String(formData.get("tableName") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  };
  if (!data.name) return;

  if (guestId) {
    const existing = await prisma.guest.findUnique({ where: { id: guestId }, select: { status: true, confirmedAt: true } });
    const confirmedAt =
      status === "confirmat"
        ? existing?.confirmedAt ?? new Date()
        : null;
    await prisma.guest.update({ where: { id: guestId }, data: { ...data, confirmedAt } });
  } else {
    await prisma.guest.create({
      data: { ...data, eventId, confirmedAt: status === "confirmat" ? new Date() : null },
    });
  }
  rp(eventId);
}

export async function setGuestStatus(eventId: string, guestId: string, status: string) {
  await requireEventAccess(eventId);
  await prisma.guest.update({
    where: { id: guestId },
    data: { status, confirmedAt: status === "confirmat" ? new Date() : null },
  });
  rp(eventId);
}

export async function deleteGuest(eventId: string, guestId: string) {
  await requireEventAccess(eventId);
  await prisma.guest.delete({ where: { id: guestId } });
  rp(eventId);
}

export type ImportGuest = {
  name: string;
  contact?: string | null;
  companions?: number;
  status?: string;
};

/** Creează în bloc o listă de invitați (import din text/fișier). Returnează câți au fost adăugați. */
export async function importGuests(eventId: string, guests: ImportGuest[]): Promise<number> {
  await requireEventAccess(eventId);
  const rows = (guests ?? [])
    .map((g) => ({
      name: String(g.name || "").trim(),
      contact: g.contact ? String(g.contact).trim() : null,
      companions: Number.isFinite(g.companions) ? Math.max(0, Math.trunc(g.companions as number)) : 0,
      status: g.status === "confirmat" || g.status === "refuzat" ? g.status : "in_asteptare",
      eventId,
    }))
    .filter((g) => g.name.length > 0);

  if (rows.length === 0) return 0;

  await prisma.guest.createMany({ data: rows });
  rp(eventId);
  return rows.length;
}
