"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireEventAccess } from "@/lib/session";

function rp(eventId: string) {
  revalidatePath(`/eveniment/${eventId}`, "layout");
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6"];

export async function saveOrganizer(eventId: string, organizerId: string | null, formData: FormData) {
  await requireEventAccess(eventId);
  const name = String(formData.get("name") || "").trim();
  const role = String(formData.get("role") || "").trim() || null;
  if (!name) return;

  if (organizerId) {
    await prisma.organizer.update({ where: { id: organizerId }, data: { name, role } });
  } else {
    const count = await prisma.organizer.count({ where: { eventId } });
    await prisma.organizer.create({
      data: { name, role, color: COLORS[count % COLORS.length], eventId },
    });
  }
  rp(eventId);
}

export async function deleteOrganizer(eventId: string, organizerId: string) {
  await requireEventAccess(eventId);
  await prisma.organizer.delete({ where: { id: organizerId } });
  rp(eventId);
}
