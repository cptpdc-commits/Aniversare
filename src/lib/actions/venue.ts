"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireEventAccess } from "@/lib/session";

export async function saveVenue(eventId: string, formData: FormData) {
  await requireEventAccess(eventId);
  const data = {
    name: String(formData.get("name") || "").trim(),
    address: String(formData.get("address") || "").trim() || null,
    capacity: parseInt(String(formData.get("capacity") || "")) || null,
    cost: parseFloat(String(formData.get("cost") || "0")) || 0,
    contact: String(formData.get("contact") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  };
  if (!data.name) return;

  await prisma.venue.upsert({
    where: { eventId },
    update: data,
    create: { ...data, eventId },
  });
  revalidatePath(`/eveniment/${eventId}`, "layout");
}

export async function deleteVenue(eventId: string) {
  await requireEventAccess(eventId);
  await prisma.venue.deleteMany({ where: { eventId } });
  revalidatePath(`/eveniment/${eventId}`, "layout");
}
