"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireEventAccess } from "@/lib/session";

function rp(eventId: string) {
  revalidatePath(`/eveniment/${eventId}`, "layout");
}

export async function saveBudgetItem(eventId: string, itemId: string | null, formData: FormData) {
  await requireEventAccess(eventId);
  const data = {
    label: String(formData.get("label") || "").trim(),
    stage: String(formData.get("stage") || "altul"),
    planned: parseFloat(String(formData.get("planned") || "0")) || 0,
    actual: parseFloat(String(formData.get("actual") || "0")) || 0,
  };
  if (!data.label) return;

  if (itemId) {
    await prisma.budgetItem.update({ where: { id: itemId }, data });
  } else {
    await prisma.budgetItem.create({ data: { ...data, eventId } });
  }
  rp(eventId);
}

export async function deleteBudgetItem(eventId: string, itemId: string) {
  await requireEventAccess(eventId);
  await prisma.budgetItem.delete({ where: { id: itemId } });
  rp(eventId);
}
