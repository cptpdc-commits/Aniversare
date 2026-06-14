"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireEventAccess } from "@/lib/session";

function rp(eventId: string) {
  revalidatePath(`/eveniment/${eventId}`, "layout");
}

export async function saveMenuItem(eventId: string, itemId: string | null, formData: FormData) {
  await requireEventAccess(eventId);
  const data = {
    name: String(formData.get("name") || "").trim(),
    category: String(formData.get("category") || "fel_principal"),
    quantity: String(formData.get("quantity") || "").trim() || null,
    cost: parseFloat(String(formData.get("cost") || "0")) || 0,
    notes: String(formData.get("notes") || "").trim() || null,
  };
  if (!data.name) return;

  if (itemId) {
    await prisma.menuItem.update({ where: { id: itemId }, data });
  } else {
    await prisma.menuItem.create({ data: { ...data, eventId } });
  }
  rp(eventId);
}

export async function deleteMenuItem(eventId: string, itemId: string) {
  await requireEventAccess(eventId);
  await prisma.menuItem.delete({ where: { id: itemId } });
  rp(eventId);
}
