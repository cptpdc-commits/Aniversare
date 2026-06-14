import { notFound } from "next/navigation";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { saveBudgetItem, deleteBudgetItem } from "@/lib/actions/budget";
import { PageHeader, EmptyState } from "@/components/event/PageHeader";
import { EntityDialog, type Field } from "@/components/event/EntityDialog";
import { DeleteButton } from "@/components/event/RowActions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BUDGET_STAGES, labelOf, localizeOptions } from "@/lib/constants";
import { formatMoney } from "@/lib/utils";
import { getLocale } from "@/lib/i18n";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";

export default async function BudgetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, locale] = await Promise.all([
    prisma.event.findUnique({ where: { id }, include: { budgetItems: true } }),
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

  const planned = event.budgetItems.reduce((s, b) => s + b.planned, 0);
  const actual = event.budgetItems.reduce((s, b) => s + b.actual, 0);
  const budget = event.totalBudget || planned;
  const remaining = budget - actual;
  const pct = budget ? Math.round((actual / budget) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={t.budget.title}
        description={t.budget.desc}
        action={
          <EntityDialog title={t.budget.new} triggerLabel={t.budget.add} saveLabel={t.common.save} fields={FIELDS} action={saveBudgetItem.bind(null, id, null)} />
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Summary icon={<Wallet className="size-4 text-indigo-500" />} label={t.budget.totalBudget} value={formatMoney(budget, cur)} />
        <Summary icon={<TrendingDown className="size-4 text-amber-500" />} label={t.budget.spent} value={formatMoney(actual, cur)} />
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

function Summary({ icon, label, value, valueClass = "text-slate-900" }: { icon: React.ReactNode; label: string; value: string; valueClass?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">{icon} {label}</div>
        <div className={`mt-1 text-xl font-bold ${valueClass}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
