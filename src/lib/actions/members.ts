"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { generateInviteCode } from "@/lib/auth";
import { requireUser, requireEventOwner } from "@/lib/session";

/** Owner generează un cod/link de invitație pentru eveniment. */
export async function createInvite(eventId: string) {
  await requireEventOwner(eventId);
  await prisma.eventInvite.create({
    data: { eventId, code: generateInviteCode(), role: "editor" },
  });
  revalidatePath(`/eveniment/${eventId}/setari`);
}

/** Owner revocă o invitație. */
export async function deleteInvite(eventId: string, inviteId: string) {
  await requireEventOwner(eventId);
  await prisma.eventInvite.deleteMany({ where: { id: inviteId, eventId } });
  revalidatePath(`/eveniment/${eventId}/setari`);
}

/** Owner elimină un colaborator (nu și pe sine / alt owner). */
export async function removeMember(eventId: string, memberId: string) {
  await requireEventOwner(eventId);
  const member = await prisma.eventMember.findUnique({ where: { id: memberId } });
  if (member && member.eventId === eventId && member.role !== "owner") {
    await prisma.eventMember.delete({ where: { id: memberId } });
  }
  revalidatePath(`/eveniment/${eventId}/setari`);
}

/**
 * Utilizatorul curent acceptă o invitație după cod și devine colaborator.
 * Întoarce eventId-ul (sau aruncă dacă codul e invalid).
 */
export async function acceptInvite(code: string) {
  const user = await requireUser();
  const invite = await prisma.eventInvite.findUnique({ where: { code } });
  if (!invite || (invite.expiresAt && invite.expiresAt < new Date())) {
    redirect("/?invite=invalid");
  }
  // Creează apartenența dacă nu există deja.
  await prisma.eventMember.upsert({
    where: { eventId_userId: { eventId: invite.eventId, userId: user.id } },
    update: {},
    create: { eventId: invite.eventId, userId: user.id, role: invite.role },
  });
  revalidatePath("/");
  redirect(`/eveniment/${invite.eventId}`);
}
