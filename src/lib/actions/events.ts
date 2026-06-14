"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser, requireEventAccess, requireEventOwner } from "@/lib/session";

export async function getEvents() {
  const user = await requireUser();
  return prisma.event.findMany({
    where: { members: { some: { userId: user.id } } },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { guests: true, tasks: true } },
    },
  });
}

export async function getEvent(id: string) {
  await requireEventAccess(id);
  return prisma.event.findUnique({
    where: { id },
    include: {
      organizers: { orderBy: { name: "asc" } },
      guests: { orderBy: { createdAt: "asc" } },
      gifts: { include: { organizer: true } },
      menuItems: true,
      venue: true,
      tasks: { include: { organizer: true }, orderBy: { createdAt: "asc" } },
      budgetItems: true,
      vendors: true,
    },
  });
}

export async function createEvent(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const type = String(formData.get("type") || "aniversare");
  const dateRaw = String(formData.get("date") || "");
  const totalBudget = parseFloat(String(formData.get("totalBudget") || "0")) || 0;
  const description = String(formData.get("description") || "").trim() || null;
  const currency = (String(formData.get("currency") || "MDL").trim().toUpperCase() || "MDL").slice(0, 6);

  const event = await prisma.event.create({
    data: {
      name,
      type,
      date: dateRaw ? new Date(dateRaw) : null,
      totalBudget,
      description,
      currency,
      // Creatorul devine owner-ul evenimentului.
      members: { create: { userId: user.id, role: "owner" } },
    },
  });
  revalidatePath("/");
  redirect(`/eveniment/${event.id}`);
}

export async function updateEvent(id: string, formData: FormData) {
  await requireEventAccess(id);
  const name = String(formData.get("name") || "").trim();
  const type = String(formData.get("type") || "aniversare");
  const dateRaw = String(formData.get("date") || "");
  const totalBudget = parseFloat(String(formData.get("totalBudget") || "0")) || 0;
  const description = String(formData.get("description") || "").trim() || null;
  const currency = (String(formData.get("currency") || "MDL").trim().toUpperCase() || "MDL").slice(0, 6);

  await prisma.event.update({
    where: { id },
    data: {
      name,
      type,
      date: dateRaw ? new Date(dateRaw) : null,
      totalBudget,
      description,
      currency,
    },
  });
  revalidatePath(`/eveniment/${id}`);
  revalidatePath("/");
}

export async function toggleModule(
  id: string,
  module: "musicEnabled" | "videoEnabled",
  value: boolean
) {
  await requireEventAccess(id);
  await prisma.event.update({ where: { id }, data: { [module]: value } });
  revalidatePath(`/eveniment/${id}`);
}

export async function deleteEvent(id: string) {
  // Doar owner-ul poate șterge evenimentul.
  await requireEventOwner(id);
  await prisma.event.delete({ where: { id } });
  revalidatePath("/");
  redirect("/");
}
