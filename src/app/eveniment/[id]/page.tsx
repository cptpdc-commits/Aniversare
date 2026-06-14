import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Users,
  ListChecks,
  Wallet,
  CalendarClock,
  Building2,
  Handshake,
  ArrowRight,
} from "lucide-react";
import { getEvent } from "@/lib/actions/events";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  EVENT_TYPES,
  BUDGET_STAGES,
  VENDOR_STATUS,
  labelOf,
  colorOf,
} from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/utils";
import { getLocale } from "@/lib/i18n";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";
import { BCP47 } from "@/lib/i18n/config";

function daysUntil(date: Date | null): number | null {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [event, locale] = await Promise.all([getEvent(id), getLocale()]);
  if (!event) notFound();
  const t = DICTIONARIES[locale];
  const cur = event.currency;

  const confirmed = event.guests.filter((g) => g.status === "confirmat");
  const totalHeads = confirmed.reduce((s, g) => s + 1 + g.companions + g.children, 0);
  const rsvpPct = event.guests.length
    ? Math.round((confirmed.length / event.guests.length) * 100)
    : 0;

  const doneTasks = event.tasks.filter((t) => t.status === "finalizat").length;
  const taskPct = event.tasks.length
    ? Math.round((doneTasks / event.tasks.length) * 100)
    : 0;

  const plannedTotal = event.budgetItems.reduce((s, b) => s + b.planned, 0);
  const actualTotal = event.budgetItems.reduce((s, b) => s + b.actual, 0);
  const budgetBase = event.totalBudget || plannedTotal;
  const budgetPct = budgetBase ? Math.round((actualTotal / budgetBase) * 100) : 0;

  const days = daysUntil(event.date);
  const base = `/eveniment/${id}`;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge color="indigo">{labelOf(EVENT_TYPES, event.type, locale)}</Badge>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{event.name}</h1>
          <p className="mt-1 flex items-center gap-2 text-slate-500">
            <CalendarClock className="size-4" /> {formatDate(event.date, BCP47[locale])}
          </p>
        </div>
        {days !== null && days >= 0 && (
          <div className="rounded-xl bg-indigo-600 px-5 py-3 text-center text-white">
            <div className="text-3xl font-bold leading-none">{days}</div>
            <div className="text-xs opacity-80">
              {days === 0 ? t.dashboard.today : days === 1 ? t.dashboard.dayLeft : t.dashboard.daysLeft}
            </div>
          </div>
        )}
      </div>

      {event.description && (
        <p className="mb-8 max-w-2xl text-slate-600">{event.description}</p>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          href={`${base}/invitati`}
          icon={<Users className="size-5 text-indigo-500" />}
          label={t.dashboard.guestsConfirmed}
          value={`${confirmed.length} / ${event.guests.length}`}
          hint={`${totalHeads} ${t.dashboard.people}`}
          pct={rsvpPct}
        />
        <StatCard
          href={`${base}/checklist`}
          icon={<ListChecks className="size-5 text-emerald-500" />}
          label={t.dashboard.tasksDone}
          value={`${doneTasks} / ${event.tasks.length}`}
          hint={`${taskPct}${t.dashboard.percentComplete}`}
          pct={taskPct}
          barClassName="bg-emerald-500"
        />
        <StatCard
          href={`${base}/buget`}
          icon={<Wallet className="size-5 text-amber-500" />}
          label={t.dashboard.budgetSpent}
          value={formatMoney(actualTotal, cur)}
          hint={`${t.dashboard.of} ${formatMoney(budgetBase, cur)}`}
          pct={budgetPct}
          barClassName={budgetPct > 100 ? "bg-rose-500" : "bg-amber-500"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.budgetByStage}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {event.budgetItems.length === 0 && (
              <p className="text-sm text-slate-500">{t.dashboard.noBudget}</p>
            )}
            {event.budgetItems.map((item) => {
              const pct = item.planned ? Math.round((item.actual / item.planned) * 100) : 0;
              return (
                <div key={item.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-700">
                      {item.label}{" "}
                      <span className="text-slate-400">· {labelOf(BUDGET_STAGES, item.stage, locale)}</span>
                    </span>
                    <span className="font-medium text-slate-900">
                      {formatMoney(item.actual, cur)} / {formatMoney(item.planned, cur)}
                    </span>
                  </div>
                  <Progress value={pct} barClassName={pct > 100 ? "bg-rose-500" : undefined} />
                </div>
              );
            })}
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-semibold">
              <span>{t.common.total}</span>
              <span>
                {formatMoney(actualTotal, cur)} / {formatMoney(plannedTotal, cur)}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-4 text-slate-400" /> {t.dashboard.venue}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {event.venue ? (
                <div className="text-sm">
                  <p className="font-medium text-slate-900">{event.venue.name}</p>
                  {event.venue.address && <p className="text-slate-500">{event.venue.address}</p>}
                  <p className="mt-2 text-slate-600">
                    {t.venue.capacity}: {event.venue.capacity ?? "—"} · {formatMoney(event.venue.cost, cur)}
                  </p>
                </div>
              ) : (
                <Link
                  href={`${base}/sala`}
                  className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                >
                  {t.dashboard.addVenue} <ArrowRight className="size-3.5" />
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Handshake className="size-4 text-slate-400" /> {t.dashboard.vendors}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {event.vendors.length === 0 && (
                <p className="text-sm text-slate-500">{t.dashboard.noVendors}</p>
              )}
              {event.vendors.map((v) => (
                <div key={v.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{v.name}</span>
                  <Badge color={colorOf(VENDOR_STATUS, v.status)}>
                    {labelOf(VENDOR_STATUS, v.status, locale)}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  href,
  icon,
  label,
  value,
  hint,
  pct,
  barClassName,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  pct: number;
  barClassName?: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full transition-all hover:border-indigo-300 hover:shadow-md">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">{label}</span>
            {icon}
          </div>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          <div className="mb-2 text-xs text-slate-400">{hint}</div>
          <Progress value={pct} barClassName={barClassName} />
        </CardContent>
      </Card>
    </Link>
  );
}
