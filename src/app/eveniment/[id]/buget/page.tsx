import { notFound } from "next/navigation";
import { TrendingUp, TrendingDown, Wallet, Home, UtensilsCrossed, Gift, Truck, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { saveBudgetItem, deleteBudgetItem } from "@/lib/actions/budget";
import { PageHeader, EmptyState } from "@/components/event/PageHeader";
import { EntityDialog, type Field } from "@/components/event/EntityDialog";
import { DeleteButton } from "@/components/event/RowActions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatMoney } from "@/lib/utils";
import { getLocale } from "@/lib/i18n";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";
import { BUDGET_STAGES, labelOf, localizeOptions } from "@/lib/constants";

export default async function BudgetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, locale] = await Promise.all([
    prisma.event.findUnique({
      where: { id },
      include: {
        budgetItems: true,
        venue: true,
        menuItems: true,
        gifts: true,
        vendors: true,
      },
    }),
    getLocale(),
  ]);
  if (!event) notFound();
  const t = DICTIONARIES[locale];
  const cur = event.currency;

  const FIELDS: Field[] = [
    { name: "label", label: t.budget.fLabel, type: "text", required: true, placeholder: t.budget.labelPlaceholder },
    { name: "stage", label: t.budget.fStage, type: "select", options: localizeOptions(BUDGET_STAGES, locale) },
    { name: "planned", label: t.budget.fPlanned, type: "number", width: "half", min: "0", step: "50" },
    { name: "actual", label: t.budget.fActual, type: "number", width: "half", min: "0", step: "50" },
  ];

  // Rânduri automate din celelalte secțiuni
  const venueCost = event.venue?.cost ?? 0;
  const menuCost = event.menuItems.reduce((s, m) => s + m.cost, 0);
  const giftsCost = event.gifts.reduce((s, g) => s + g.price, 0);
  const vendorsCost = event.vendors.reduce((s, v) => s + v.cost, 0);

  const autoRows = [
    { key: "venue", label: event.venue?.name ?? "Sală / Locație", cost: venueCost, icon: <Home className="size-3.5" />, color: "indigo" as const, href: `/eveniment/${id}/sala` },
    { key: "menu", label: "Meniu", cost: menuCost, icon: <UtensilsCrossed className="size-3.5" />, color: "emerald" as const, href: `/eveniment/${id}/meniu` },
    { key: "gifts", label: "Cadouri", cost: giftsCost, icon: <Gift className="size-3.5" />, color: "amber" as const, href: `/eveniment/${id}/cadouri` },
    { key: "vendors", label: "Furnizori", cost: vendorsCost, icon: <Truck className="size-3.5" />, color: "slate" as const, href: `/eveniment/${id}/furnizori` },
  ].filter((r) => r.cost > 0 || r.key === "venue");

  const autoTotal = venueCost + menuCost + giftsCost + vendorsCost;
  const manualPlanned = event.budgetItems.reduce((s, b) => s + b.planned, 0);
  const manualActual = event.budgetItems.reduce((s, b) => s + b.actual, 0);

  const totalPlanned = autoTotal + manualPlanned;
  const budget = event.totalBudget || totalPlanned;
  const totalSpent = autoTotal + manualActual;
  const remaining = budget - totalSpent;
  const pct = budget ? Math.min(Math.round((totalSpent / budget) * 100), 999) : 0;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={t.budget.title}
        description={t.budget.desc}
        action={
          <EntityDialog
            title={t.budget.new}
            triggerLabel={t.budget.add}
            saveLabel={t.common.save}
            fields={FIELDS}
            action={saveBudgetItem.bind(null, id, null)}
          />
        }
      />

      {/* Sumar */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Summary icon={<Wallet className="size-4 text-indigo-500" />} label={t.budget.totalBudget} value={formatMoney(budget, cur)} />
        <Summary icon={<TrendingDown className="size-4 text-amber-500" />} label={t.budget.spent} value={formatMoney(totalSpent, cur)} />
        <Summary
          icon={remaining >= 0 ? <TrendingUp className="size-4 text-emerald-500" /> : <TrendingDown className="size-4 text-rose-500" />}
          label={remaining >= 0 ? t.budget.remaining : t.budget.overrun}
          value={formatMoney(Math.abs(remaining), cur)}
          valueClass={remaining >= 0 ? "text-emerald-600" : "text-rose-600"}
        />
      </div>
      <div className="mb-8">
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-slate-600">{t.budget.consumption}</span>
          <span className="font-medium">{pct}%</span>
        </div>
        <Progress value={pct} barClassName={pct > 100 ? "bg-rose-500" : "bg-amber-500"} />
      </div>

      {/* Rânduri automate */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Din secțiuni</span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>
      <div className="mb-6 grid gap-2">
        {autoRows.map((r) => (
          <a key={r.key} href={r.href}>
            <Card className="transition-all hover:border-slate-300 hover:shadow-sm">
              <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                <div className="min-w-0 flex-1 flex items-center gap-2">
                  <Badge color={r.color} className="gap-1 shrink-0">
                    {r.icon} {r.label}
                  </Badge>
                  <span className="text-xs text-slate-400">introdus în secțiunea respectivă</span>
                </div>
                <span className="text-sm font-semibold text-slate-800 shrink-0">
                  {formatMoney(r.cost, cur)}
                </span>
              </CardContent>
            </Card>
          </a>
        ))}
        {autoRows.every((r) => r.cost === 0) && (
          <p className="text-sm text-slate-400 py-2">Niciun cost introdus în Sală, Meniu, Cadouri sau Furnizori.</p>
        )}
      </div>

      {/* Cheltuieli extra manuale */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Cheltuieli extra</span>
        <div className="h-px flex-1 bg-slate-100" />
        <EntityDialog
          title={t.budget.new}
          triggerLabel={t.budget.add}
          saveLabel={t.common.save}
          fields={FIELDS}
          action={saveBudgetItem.bind(null, id, null)}
        />
      </div>

      {event.budgetItems.length === 0 ? (
        <EmptyState message={t.budget.empty} />
      ) : (
        <div className="grid gap-2">
          {event.budgetItems.map((b) => {
            const ip = b.planned ? Math.round((b.actual / b.planned) * 100) : 0;
            return (
              <Card key={b.id}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium text-slate-900">{b.label}</span>
                        <Badge color="slate">{labelOf(BUDGET_STAGES, b.stage, locale)}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="flex-1 text-sm font-medium text-slate-700 sm:flex-none">
                        {formatMoney(b.actual, cur)} <span className="text-slate-400">/ {formatMoney(b.planned, cur)}</span>
                      </span>
                      <EntityDialog title={t.budget.edit} mode="edit" saveLabel={t.common.save} fields={FIELDS} values={b} action={saveBudgetItem.bind(null, id, b.id)} />
                      <DeleteButton action={deleteBudgetItem.bind(null, id, b.id)} confirmMessage={`${t.common.delete}: ${b.label}?`} />
                    </div>
                  </div>
                  <Progress value={ip} className="mt-2" barClassName={ip > 100 ? "bg-rose-500" : undefined} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Summary({ icon, label, value, valueClass = "text-slate-900" }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">{icon} {label}</div>
        <div className={`mt-1 text-xl font-bold ${valueClass}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
