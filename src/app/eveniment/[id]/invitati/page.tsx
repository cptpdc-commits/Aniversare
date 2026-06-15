import { notFound } from "next/navigation";
import { Users, UserCheck, Clock, UserX, Phone, Baby } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { saveGuest, setGuestStatus, deleteGuest } from "@/lib/actions/guests";
import { PageHeader, EmptyState } from "@/components/event/PageHeader";
import { EntityDialog, type Field } from "@/components/event/EntityDialog";
import { DeleteButton, StatusSelect } from "@/components/event/RowActions";
import { ImportGuestsDialog } from "@/components/event/ImportGuestsDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GUEST_STATUS, labelOf, colorOf, localizeOptions } from "@/lib/constants";
import { getLocale } from "@/lib/i18n";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";

export default async function GuestsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, locale] = await Promise.all([
    prisma.event.findUnique({ where: { id }, include: { guests: { orderBy: { createdAt: "asc" } } } }),
    getLocale(),
  ]);
  if (!event) notFound();
  const t = DICTIONARIES[locale];
  const statusOptions = localizeOptions(GUEST_STATUS, locale);

  const FIELDS: Field[] = [
    { name: "name", label: t.guests.fName, type: "text", required: true, placeholder: t.guests.namePlaceholder },
    { name: "contact", label: t.guests.fContact, type: "text", width: "half", placeholder: t.guests.contactPlaceholder },
    { name: "status", label: t.guests.fStatus, type: "select", width: "half", options: statusOptions },
    { name: "companions", label: t.guests.fCompanions, type: "number", width: "half", min: "0", placeholder: "0" },
    { name: "children", label: t.guests.fChildren, type: "number", width: "half", min: "0", placeholder: "0" },
    { name: "tableName", label: t.guests.fTable, type: "text", width: "half", placeholder: t.guests.tablePlaceholder },
    { name: "notes", label: t.guests.fNotes, type: "textarea", placeholder: t.guests.notesPlaceholder },
  ];

  // Ordine pe status: confirmați întâi, apoi în așteptare, refuzații la final
  // (în interiorul fiecărei grupe se păstrează ordinea adăugării).
  const STATUS_ORDER: Record<string, number> = { confirmat: 0, in_asteptare: 1, refuzat: 2 };
  const guests = [...event.guests].sort(
    (a, b) => (STATUS_ORDER[a.status] ?? 1) - (STATUS_ORDER[b.status] ?? 1)
  );
  const confirmed = guests.filter((g) => g.status === "confirmat");
  const pending = guests.filter((g) => g.status === "in_asteptare");
  const declined = guests.filter((g) => g.status === "refuzat");

  // Persoane confirmate: la masa adulților = 1 (invitatul) + însoțitori; copiii (la masa copiilor) separat.
  const confAdults = confirmed.reduce((s, g) => s + 1 + g.companions, 0);
  const confChildren = confirmed.reduce((s, g) => s + g.children, 0);
  const confTotal = confAdults + confChildren;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={t.guests.title}
        description={t.guests.desc}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <ImportGuestsDialog eventId={id} locale={locale} />
            <EntityDialog
              title={t.guests.new}
              triggerLabel={t.guests.add}
              saveLabel={t.common.save}
              fields={FIELDS}
              action={saveGuest.bind(null, id, null)}
            />
          </div>
        }
      />

      {/* Statistici unificate */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          icon={<Users className="size-4 text-slate-400" />}
          label={t.guests.total}
          value={guests.length}
          sub={`${t.guests.confirmed}: ${confirmed.length}`}
        />
        <Stat
          icon={<UserCheck className="size-4 text-emerald-500" />}
          label={t.guests.confirmedPeople}
          value={confTotal}
          sub={`${confAdults} ${t.guests.adults} · ${confChildren} ${t.guests.kidsTableShort}`}
          highlight
        />
        <Stat
          icon={<Clock className="size-4 text-amber-500" />}
          label={t.guests.pending}
          value={pending.length}
        />
        <Stat
          icon={<UserX className="size-4 text-rose-500" />}
          label={t.guests.declined}
          value={declined.length}
        />
      </div>

      {guests.length === 0 ? (
        <EmptyState message={t.guests.empty} />
      ) : (
        <div className="flex flex-col gap-2">
          {guests.map((g) => (
            <Card key={g.id}>
              <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-medium text-slate-900">{g.name}</span>
                    {/* Badge de status vizibil pe mobil lângă nume (pe desktop apare în rândul de control) */}
                    <Badge color={colorOf(GUEST_STATUS, g.status)} className="sm:hidden">
                      {labelOf(GUEST_STATUS, g.status, locale)}
                    </Badge>
                    {g.companions > 0 && (
                      <Badge color="slate" className="gap-1">
                        <Users className="size-3" /> +{g.companions}
                      </Badge>
                    )}
                    {g.children > 0 && (
                      <Badge color="amber" className="gap-1">
                        <Baby className="size-3" /> {g.children} · {t.guests.kidsTableShort}
                      </Badge>
                    )}
                    {g.tableName && <span className="text-xs text-slate-400">· {g.tableName}</span>}
                  </div>
                  {g.contact && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <Phone className="size-3" /> {g.contact}
                    </p>
                  )}
                  {g.notes && <p className="mt-0.5 text-xs text-slate-400">{g.notes}</p>}
                </div>
                {/* Rând de control: pe mobil ocupă toată lățimea sub nume; pe desktop e inline */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <Badge
                    color={colorOf(GUEST_STATUS, g.status)}
                    className="hidden sm:inline-flex"
                  >
                    {labelOf(GUEST_STATUS, g.status, locale)}
                  </Badge>
                  <StatusSelect
                    value={g.status}
                    options={statusOptions}
                    action={setGuestStatus.bind(null, id, g.id)}
                    className="flex-1 sm:flex-none"
                  />
                  <EntityDialog
                    title={t.guests.edit}
                    mode="edit"
                    saveLabel={t.common.save}
                    fields={FIELDS}
                    values={g}
                    action={saveGuest.bind(null, id, g.id)}
                  />
                  <DeleteButton action={deleteGuest.bind(null, id, g.id)} confirmMessage={`${t.common.delete}: ${g.name}?`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value, sub, highlight }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-indigo-200 bg-indigo-50/60" : ""}>
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">{icon} {label}</div>
        <div className={`mt-1 text-2xl font-bold ${highlight ? "text-indigo-700" : "text-slate-900"}`}>{value}</div>
        {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
      </CardContent>
    </Card>
  );
}
