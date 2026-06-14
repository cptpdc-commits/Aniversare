import Link from "next/link";
import { Phone, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/event/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VENDOR_STATUS, labelOf, colorOf } from "@/lib/constants";
import { formatMoney } from "@/lib/utils";
import { getLocale } from "@/lib/i18n";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";

/**
 * Panou comun pentru modulele opționale Muzică și Video.
 * Reunește furnizorii și elementele de buget legate de serviciul respectiv.
 */
export async function MediaModule({
  eventId,
  service, // "muzica" | "video"
  title,
  description,
  icon,
}: {
  eventId: string;
  service: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  const [event, vendors, budgetItems, locale] = await Promise.all([
    prisma.event.findUnique({ where: { id: eventId }, select: { currency: true } }),
    prisma.vendor.findMany({ where: { eventId, service } }),
    prisma.budgetItem.findMany({ where: { eventId, stage: service } }),
    getLocale(),
  ]);
  const t = DICTIONARIES[locale].media;
  const cur = event?.currency ?? "MDL";

  const base = `/eveniment/${eventId}`;
  const vendorCost = vendors.reduce((s, v) => s + v.cost, 0);
  const planned = budgetItems.reduce((s, b) => s + b.planned, 0);
  const actual = budgetItems.reduce((s, b) => s + b.actual, 0);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={title} description={description} />

      <div className="mb-6 flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
        <div className="rounded-lg bg-white p-2 text-indigo-600">{icon}</div>
        <div className="text-sm text-slate-600">
          {t.intro}{" "}
          <Link href={`${base}/furnizori`} className="font-medium text-indigo-600 hover:underline">
            {t.vendors}
          </Link>{" "}
          {t.introAnd}{" "}
          <Link href={`${base}/buget`} className="font-medium text-indigo-600 hover:underline">
            {t.budget}
          </Link>
          .
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{t.vendors}</CardTitle>
            <Link href={`${base}/furnizori`} className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline">
              {t.manage} <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {vendors.length === 0 ? (
              <EmptyState message={t.noVendors} />
            ) : (
              vendors.map((v) => (
                <div key={v.id} className="flex flex-col gap-2 rounded-lg border border-slate-100 p-3 sm:flex-row sm:items-center sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-slate-900">{v.name}</span>
                    {v.contact && (
                      <p className="flex items-center gap-1 text-xs text-slate-500">
                        <Phone className="size-3" /> {v.contact}
                      </p>
                    )}
                    {v.notes && <p className="text-xs text-slate-400">{v.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex-1 text-sm font-medium text-slate-700 sm:flex-none">{formatMoney(v.cost, cur)}</span>
                    <Badge color={colorOf(VENDOR_STATUS, v.status)}>{labelOf(VENDOR_STATUS, v.status, locale)}</Badge>
                  </div>
                </div>
              ))
            )}
            {vendors.length > 0 && (
              <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-semibold">
                <span>{t.totalVendors}</span>
                <span>{formatMoney(vendorCost, cur)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{t.budget}</CardTitle>
            <Link href={`${base}/buget`} className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline">
              {t.manage} <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {budgetItems.length === 0 ? (
              <EmptyState message={t.noBudget} />
            ) : (
              <div className="flex flex-col gap-2 text-sm">
                {budgetItems.map((b) => (
                  <div key={b.id} className="flex justify-between">
                    <span className="text-slate-700">{b.label}</span>
                    <span className="font-medium">
                      {formatMoney(b.actual, cur)} <span className="text-slate-400">/ {formatMoney(b.planned, cur)}</span>
                    </span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-slate-100 pt-2 font-semibold">
                  <span>{DICTIONARIES[locale].common.total}</span>
                  <span>{formatMoney(actual, cur)} / {formatMoney(planned, cur)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
