import { notFound, redirect } from "next/navigation";
import { Video } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { MediaModule } from "@/components/event/MediaModule";
import { getLocale } from "@/lib/i18n";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, locale] = await Promise.all([
    prisma.event.findUnique({ where: { id }, select: { videoEnabled: true } }),
    getLocale(),
  ]);
  if (!event) notFound();
  if (!event.videoEnabled) redirect(`/eveniment/${id}`);
  const t = DICTIONARIES[locale].media;

  return (
    <MediaModule
      eventId={id}
      service="video"
      title={t.videoTitle}
      description={t.videoDesc}
      icon={<Video className="size-5" />}
    />
  );
}
