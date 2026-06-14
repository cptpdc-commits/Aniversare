import Link from "next/link";
import { CalendarDays, Users, PartyPopper, ArrowRight } from "lucide-react";
import { getEvents } from "@/lib/actions/events";
import { requireUser } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { EVENT_TYPES, labelOf } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/utils";
import { getLocale } from "@/lib/i18n";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";
import { BCP47 } from "@/lib/i18n/config";

export default async function HomePage() {
  const [user, events, locale] = await Promise.all([requireUser(), getEvents(), getLocale()]);
  const t = DICTIONARIES[locale];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
            <PartyPopper className="size-4" /> {t.home.badge}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.home.title}</h1>
          <p className="mt-1 text-slate-500">{t.home.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-500">{user.name}</span>
          <LanguageSwitcher current={locale} />
          <LogoutButton label={t.auth.logout} />
          <CreateEventDialog locale={locale} />
        </div>
      </header>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="rounded-full bg-indigo-50 p-4">
              <PartyPopper className="size-8 text-indigo-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">{t.home.emptyTitle}</h2>
            <p className="max-w-sm text-sm text-slate-500">{t.home.emptyText}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map((event) => (
            <Link key={event.id} href={`/eveniment/${event.id}`}>
              <Card className="group h-full transition-all hover:border-indigo-300 hover:shadow-md">
                <CardContent className="flex h-full flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge color="indigo">{labelOf(EVENT_TYPES, event.type, locale)}</Badge>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900 group-hover:text-indigo-700">
                        {event.name}
                      </h3>
                    </div>
                    <ArrowRight className="size-5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500" />
                  </div>
                  <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-4" /> {formatDate(event.date, BCP47[locale])}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="size-4" /> {event._count.guests} {t.home.guests}
                    </span>
                    <span className="font-medium text-slate-700">
                      {formatMoney(event.totalBudget, event.currency)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
