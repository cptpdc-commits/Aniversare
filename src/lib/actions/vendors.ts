"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireEventAccess } from "@/lib/session";

function rp(eventId: string) {
  revalidatePath(`/eveniment/${eventId}`, "layout");
}

export async function saveVendor(eventId: string, vendorId: string | null, formData: FormData) {
  await requireEventAccess(eventId);
  const data = {
    name: String(formData.get("name") || "").trim(),
    service: String(formData.get("service") || "altul"),
    contact: String(formData.get("contact") || "").trim() || null,
    status: String(formData.get("status") || "de_contactat"),
    cost: parseFloat(String(formData.get("cost") || "0")) || 0,
    notes: String(formData.get("notes") || "").trim() || null,
  };
  if (!data.name) return;

  if (vendorId) {
    await prisma.vendor.update({ where: { id: vendorId }, data });
  } else {
    await prisma.vendor.create({ data: { ...data, eventId } });
  }
  rp(eventId);
}

export async function setVendorStatus(eventId: string, vendorId: string, status: string) {
  await requireEventAccess(eventId);
  await prisma.vendor.update({ where: { id: vendorId }, data: { status } });
  rp(eventId);
}

export async function deleteVendor(eventId: string, vendorId: string) {
  await requireEventAccess(eventId);
  await prisma.vendor.delete({ where: { id: vendorId } });
  rp(eventId);
}
