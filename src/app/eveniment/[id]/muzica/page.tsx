import { notFound, redirect } from "next/navigation";
import { Music } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { MediaModule } from "@/components/event/MediaModule";
import { getLocale } from "@/lib/i18n";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";

export default async function MusicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, locale] = await Promise.all([
    prisma.event.findUnique({ where: { id }, select: { musicEnabled: true } }),
    getLocale(),
  ]);
  if (!event) notFound();
  if (!event.musicEnabled) redirect(`/eveniment/${id}`);
  const t = DICTIONARIES[locale].media;

  return (
    <MediaModule
      eventId={id}
      service="muzica"
      title={t.musicTitle}
      description={t.musicDesc}
      icon={<Music className="size-5" />}
    />
  );
}
