"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireEventAccess } from "@/lib/session";

function rp(eventId: string) {
  revalidatePath(`/eveniment/${eventId}`, "layout");
}

export async function saveGift(eventId: string, giftId: string | null, formData: FormData) {
  await requireEventAccess(eventId);
  const data = {
    title: String(formData.get("title") || "").trim(),
    description: String(formData.get("description") || "").trim() || null,
    price: parseFloat(String(formData.get("price") || "0")) || 0,
    status: String(formData.get("status") || "idee"),
    link: String(formData.get("link") || "").trim() || null,
    organizerId: String(formData.get("organizerId") || "") || null,
  };
  if (!data.title) return;

  if (giftId) {
    await prisma.gift.update({ where: { id: giftId }, data });
  } else {
    await prisma.gift.create({ data: { ...data, eventId } });
  }
  rp(eventId);
}

export async function setGiftStatus(eventId: string, giftId: string, status: string) {
  await requireEventAccess(eventId);
  await prisma.gift.update({ where: { id: giftId }, data: { status } });
  rp(eventId);
}

export async function deleteGift(eventId: string, giftId: string) {
  await requireEventAccess(eventId);
  await prisma.gift.delete({ where: { id: giftId } });
  rp(eventId);
}
