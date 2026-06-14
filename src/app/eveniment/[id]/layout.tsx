import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EventSidebar } from "@/components/event/EventSidebar";
import { getLocale } from "@/lib/i18n";
import { requireEventAccess } from "@/lib/session";

export default async function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Verifică autentificarea + apartenența la eveniment (redirect /login sau 404).
  const { user } = await requireEventAccess(id);
  const [event, locale] = await Promise.all([
    prisma.event.findUnique({
      where: { id },
      select: { id: true, name: true, musicEnabled: true, videoEnabled: true },
    }),
    getLocale(),
  ]);

  if (!event) notFound();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <EventSidebar
        eventId={event.id}
        eventName={event.name}
        musicEnabled={event.musicEnabled}
        videoEnabled={event.videoEnabled}
        locale={locale}
        userName={user.name}
      />
      <div className="flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</div>
    </div>
  );
}
