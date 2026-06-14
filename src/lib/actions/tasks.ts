"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireEventAccess } from "@/lib/session";

function rp(eventId: string) {
  revalidatePath(`/eveniment/${eventId}`, "layout");
}

export async function saveTask(eventId: string, taskId: string | null, formData: FormData) {
  await requireEventAccess(eventId);
  const dueRaw = String(formData.get("dueDate") || "");
  const data = {
    title: String(formData.get("title") || "").trim(),
    stage: String(formData.get("stage") || "planificare"),
    status: String(formData.get("status") || "de_facut"),
    dueDate: dueRaw ? new Date(dueRaw) : null,
    organizerId: String(formData.get("organizerId") || "") || null,
  };
  if (!data.title) return;

  if (taskId) {
    await prisma.task.update({ where: { id: taskId }, data });
  } else {
    await prisma.task.create({ data: { ...data, eventId } });
  }
  rp(eventId);
}

export async function setTaskStatus(eventId: string, taskId: string, status: string) {
  await requireEventAccess(eventId);
  await prisma.task.update({ where: { id: taskId }, data: { status } });
  rp(eventId);
}

export async function deleteTask(eventId: string, taskId: string) {
  await requireEventAccess(eventId);
  await prisma.task.delete({ where: { id: taskId } });
  rp(eventId);
}
