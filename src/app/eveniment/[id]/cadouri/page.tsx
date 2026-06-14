import { notFound } from "next/navigation";
import { Gift, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { saveGift, setGiftStatus, deleteGift } from "@/lib/actions/gifts";
import { PageHeader, EmptyState } from "@/components/event/PageHeader";
import { EntityDialog, type Field } from "@/components/event/EntityDialog";
import { DeleteButton, StatusSelect } from "@/components/event/RowActions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GIFT_STATUS, labelOf, colorOf, localizeOptions } from "@/lib/constants";
import { formatMoney } from "@/lib/utils";
import { getLocale } from "@/lib/i18n";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";

export default async function GiftsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, locale] = await Promise.all([
    prisma.event.findUnique({ where: { id }, include: { gifts: { include: { organizer: true } }, organizers: true } }),
    getLocale(),
  ]);
  if (!event) notFound();
  const t = DICTIONARIES[locale];
  const cur = event.currency;
  const statusOptions = localizeOptions(GIFT_STATUS, locale);

  const organizerOptions = [
    { value: "", label: t.gifts.noResponsible },
    ...event.organizers.map((o) => ({ value: o.id, label: o.name })),
  ];

  const FIELDS: Field[] = [
    { name: "title", label: t.gifts.fGift, type: "text", required: true, placeholder: t.gifts.giftPlaceholder },
    { name: "price", label: t.gifts.fPrice, type: "number", width: "half", min: "0", step: "10" },
    { name: "status", label: t.gifts.fStatus, type: "select", width: "half", options: statusOptions },
    { name: "organizerId", label: t.gifts.fResponsible, type: "select", options: organizerOptions },
    { name: "link", label: t.gifts.fLink, type: "text", placeholder: "https://..." },
    { name: "description", label: t.gifts.fDescription, type: "textarea" },
  ];

  const total = event.gifts.reduce((s, g) => s + g.price, 0);
  const bought = event.gifts.filter((g) => g.status === "cumparat").reduce((s, g) => s + g.price, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={t.gifts.title}
        description={t.gifts.desc}
        action={
          <EntityDialog title={t.gifts.new} triggerLabel={t.gifts.add} saveLabel={t.common.save} fields={FIELDS} action={saveGift.bind(null, id, null)} />
        }
      />

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="rounded-lg bg-slate-100 px-4 py-2 text-sm">
          {t.gifts.totalValue}: <strong>{formatMoney(total, cur)}</strong>
        </div>
        <div className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          {t.gifts.bought}: <strong>{formatMoney(bought, cur)}</strong>
        </div>
      </div>

      {event.gifts.length === 0 ? (
        <EmptyState message={t.gifts.empty} />
      ) : (
        <div className="grid gap-2">
          {event.gifts.map((g) => (
            <Card key={g.id}>
              <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="shrink-0 rounded-lg bg-indigo-50 p-2">
                    <Gift className="size-4 text-indigo-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-medium text-slate-900">{g.title}</span>
                      {g.link && (
                        <a href={g.link} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-700">
                          <ExternalLink className="size-3.5" />
                        </a>
                      )}
                      <Badge color={colorOf(GIFT_STATUS, g.status)} className="sm:hidden">
                        {labelOf(GIFT_STATUS, g.status, locale)}
                      </Badge>
                    </div>
                    {g.description && <p className="text-xs text-slate-500">{g.description}</p>}
                    {g.organizer && (
                      <p className="mt-0.5 text-xs text-slate-400">{t.gifts.responsibleLabel}: {g.organizer.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-sm font-medium text-slate-700">{formatMoney(g.price, cur)}</span>
                  <Badge color={colorOf(GIFT_STATUS, g.status)} className="hidden sm:inline-flex">
                    {labelOf(GIFT_STATUS, g.status, locale)}
                  </Badge>
                  <StatusSelect value={g.status} options={statusOptions} action={setGiftStatus.bind(null, id, g.id)} className="flex-1 sm:flex-none" />
                  <EntityDialog title={t.gifts.edit} mode="edit" saveLabel={t.common.save} fields={FIELDS} values={{ title: g.title, price: g.price, status: g.status, link: g.link, description: g.description, organizerId: g.organizerId ?? "" }} action={saveGift.bind(null, id, g.id)} />
                  <DeleteButton action={deleteGift.bind(null, id, g.id)} confirmMessage={`${t.common.delete}: ${g.title}?`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
