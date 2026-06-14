import { notFound } from "next/navigation";
import { Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { saveVendor, setVendorStatus, deleteVendor } from "@/lib/actions/vendors";
import { PageHeader, EmptyState } from "@/components/event/PageHeader";
import { EntityDialog, type Field } from "@/components/event/EntityDialog";
import { DeleteButton, StatusSelect } from "@/components/event/RowActions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VENDOR_SERVICES, VENDOR_STATUS, labelOf, colorOf, localizeOptions } from "@/lib/constants";
import { formatMoney } from "@/lib/utils";
import { getLocale } from "@/lib/i18n";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";

export default async function VendorsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, locale] = await Promise.all([
    prisma.event.findUnique({ where: { id }, include: { vendors: true } }),
    getLocale(),
  ]);
  if (!event) notFound();
  const t = DICTIONARIES[locale];
  const cur = event.currency;
  const statusOptions = localizeOptions(VENDOR_STATUS, locale);

  const FIELDS: Field[] = [
    { name: "name", label: t.vendors.fName, type: "text", required: true, placeholder: t.vendors.namePlaceholder },
    { name: "service", label: t.vendors.fService, type: "select", width: "half", options: localizeOptions(VENDOR_SERVICES, locale) },
    { name: "status", label: t.vendors.fStatus, type: "select", width: "half", options: statusOptions },
    { name: "contact", label: t.vendors.fContact, type: "text", width: "half", placeholder: t.vendors.contactPlaceholder },
    { name: "cost", label: t.vendors.fCost, type: "number", width: "half", min: "0", step: "50" },
    { name: "notes", label: t.vendors.fNotes, type: "textarea" },
  ];

  const totalCost = event.vendors.reduce((s, v) => s + v.cost, 0);
  const confirmed = event.vendors.filter((v) => v.status === "confirmat" || v.status === "platit").length;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={t.vendors.title}
        description={t.vendors.desc}
        action={
          <EntityDialog title={t.vendors.new} triggerLabel={t.vendors.add} saveLabel={t.common.save} fields={FIELDS} action={saveVendor.bind(null, id, null)} />
        }
      />

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="rounded-lg bg-slate-100 px-4 py-2 text-sm">
          {t.vendors.totalCost}: <strong>{formatMoney(totalCost, cur)}</strong>
        </div>
        <div className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          {t.vendors.confirmed}: <strong>{confirmed} / {event.vendors.length}</strong>
        </div>
      </div>

      {event.vendors.length === 0 ? (
        <EmptyState message={t.vendors.empty} />
      ) : (
        <div className="grid gap-2">
          {event.vendors.map((v) => (
            <Card key={v.id}>
              <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-medium text-slate-900">{v.name}</span>
                    <Badge color="indigo">{labelOf(VENDOR_SERVICES, v.service, locale)}</Badge>
                    <Badge color={colorOf(VENDOR_STATUS, v.status)} className="sm:hidden">
                      {labelOf(VENDOR_STATUS, v.status, locale)}
                    </Badge>
                  </div>
                  {v.contact && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <Phone className="size-3" /> {v.contact}
                    </p>
                  )}
                  {v.notes && <p className="mt-0.5 text-xs text-slate-400">{v.notes}</p>}
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-sm font-medium text-slate-700">{formatMoney(v.cost, cur)}</span>
                  <Badge color={colorOf(VENDOR_STATUS, v.status)} className="hidden sm:inline-flex">
                    {labelOf(VENDOR_STATUS, v.status, locale)}
                  </Badge>
                  <StatusSelect value={v.status} options={statusOptions} action={setVendorStatus.bind(null, id, v.id)} className="flex-1 sm:flex-none" />
                  <EntityDialog title={t.vendors.edit} mode="edit" saveLabel={t.common.save} fields={FIELDS} values={v} action={saveVendor.bind(null, id, v.id)} />
                  <DeleteButton action={deleteVendor.bind(null, id, v.id)} confirmMessage={`${t.common.delete}: ${v.name}?`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
