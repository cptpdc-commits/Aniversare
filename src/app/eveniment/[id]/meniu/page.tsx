import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveMenuItem, deleteMenuItem } from "@/lib/actions/menu";
import { PageHeader, EmptyState } from "@/components/event/PageHeader";
import { EntityDialog, type Field } from "@/components/event/EntityDialog";
import { DeleteButton } from "@/components/event/RowActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MENU_CATEGORIES, localizeOptions } from "@/lib/constants";
import { formatMoney } from "@/lib/utils";
import { getLocale } from "@/lib/i18n";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";

export default async function MenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, locale] = await Promise.all([
    prisma.event.findUnique({ where: { id }, include: { menuItems: true } }),
    getLocale(),
  ]);
  if (!event) notFound();
  const t = DICTIONARIES[locale];
  const cur = event.currency;

  const FIELDS: Field[] = [
    { name: "name", label: t.menu.fName, type: "text", required: true, placeholder: t.menu.namePlaceholder },
    { name: "category", label: t.menu.fCategory, type: "select", width: "half", options: localizeOptions(MENU_CATEGORIES, locale) },
    { name: "cost", label: t.menu.fCost, type: "number", width: "half", min: "0", step: "10" },
    { name: "quantity", label: t.menu.fQuantity, type: "text", placeholder: t.menu.quantityPlaceholder },
    { name: "notes", label: t.menu.fNotes, type: "textarea" },
  ];

  const total = event.menuItems.reduce((s, m) => s + m.cost, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={t.menu.title}
        description={t.menu.desc}
        action={
          <EntityDialog title={t.menu.new} triggerLabel={t.menu.add} saveLabel={t.common.save} fields={FIELDS} action={saveMenuItem.bind(null, id, null)} />
        }
      />

      <div className="mb-6 rounded-lg bg-slate-100 px-4 py-2 text-sm">
        {t.menu.totalCost}: <strong>{formatMoney(total, cur)}</strong>
      </div>

      {event.menuItems.length === 0 ? (
        <EmptyState message={t.menu.empty} />
      ) : (
        <div className="grid gap-6">
          {MENU_CATEGORIES.map((cat) => {
            const items = event.menuItems.filter((m) => m.category === cat.value);
            if (items.length === 0) return null;
            const catTotal = items.reduce((s, m) => s + m.cost, 0);
            return (
              <Card key={cat.value}>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>{cat.labels[locale]}</CardTitle>
                  <span className="text-sm text-slate-400">{formatMoney(catTotal, cur)}</span>
                </CardHeader>
                <CardContent className="flex flex-col gap-1">
                  {items.map((m) => (
                    <div key={m.id} className="flex flex-col gap-1 rounded-lg px-2 py-1.5 hover:bg-slate-50 sm:flex-row sm:items-center sm:gap-3">
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-slate-800">{m.name}</span>
                        {m.quantity && <span className="ml-2 text-xs text-slate-400">{m.quantity}</span>}
                        {m.notes && <p className="text-xs text-slate-400">{m.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="flex-1 text-sm text-slate-600 sm:flex-none">{formatMoney(m.cost, cur)}</span>
                        <EntityDialog title={t.menu.edit} mode="edit" saveLabel={t.common.save} fields={FIELDS} values={m} action={saveMenuItem.bind(null, id, m.id)} />
                        <DeleteButton action={deleteMenuItem.bind(null, id, m.id)} confirmMessage={`${t.common.delete}: ${m.name}?`} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
