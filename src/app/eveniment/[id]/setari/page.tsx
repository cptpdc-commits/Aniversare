import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateEvent, deleteEvent } from "@/lib/actions/events";
import { PageHeader } from "@/components/event/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { ModuleToggle } from "@/components/event/ModuleToggle";
import { DeleteEventButton } from "@/components/event/DeleteEventButton";
import { CollaboratorsPanel } from "@/components/event/CollaboratorsPanel";
import { requireEventAccess } from "@/lib/session";
import { EVENT_TYPES } from "@/lib/constants";
import { getLocale } from "@/lib/i18n";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";
import { CURRENCY_SUGGESTIONS } from "@/lib/i18n/config";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const access = await requireEventAccess(id);
  const [event, locale, memberRows, invites] = await Promise.all([
    prisma.event.findUnique({ where: { id } }),
    getLocale(),
    prisma.eventMember.findMany({
      where: { eventId: id },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.eventInvite.findMany({ where: { eventId: id }, orderBy: { createdAt: "desc" } }),
  ]);
  if (!event) notFound();
  const t = DICTIONARIES[locale];

  const isOwner = access.member.role === "owner";
  const members = memberRows.map((m) => ({
    id: m.id,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
    isYou: m.userId === access.user.id,
  }));

  const dateValue = event.date ? new Date(event.date).toISOString().slice(0, 16) : "";
  const updateAction = updateEvent.bind(null, id);
  const deleteAction = deleteEvent.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t.settings.title} description={t.settings.desc} />

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t.settings.details}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateAction} className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="name">{t.settings.fName}</Label>
                <Input id="name" name="name" defaultValue={event.name} required />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="type">{t.settings.fType}</Label>
                  <Select id="type" name="type" defaultValue={event.type}>
                    {EVENT_TYPES.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.labels[locale]}</option>
                    ))}
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="date">{t.settings.fDate}</Label>
                  <Input id="date" name="date" type="datetime-local" defaultValue={dateValue} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="currency">{t.settings.fCurrency}</Label>
                  <Input id="currency" name="currency" list="currency-list" defaultValue={event.currency} maxLength={6} className="uppercase" />
                  <datalist id="currency-list">
                    {CURRENCY_SUGGESTIONS.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                  <p className="text-xs text-slate-400">{t.currency.hint}</p>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="totalBudget">{t.settings.fBudget}</Label>
                  <Input id="totalBudget" name="totalBudget" type="number" min="0" step="100" defaultValue={event.totalBudget} />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="description">{t.settings.fDescription}</Label>
                <Textarea id="description" name="description" defaultValue={event.description ?? ""} />
              </div>
              <div className="flex justify-end">
                <Button type="submit">{t.settings.saveChanges}</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.settings.modules}</CardTitle>
            <CardDescription>{t.settings.modulesDesc}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <ModuleToggle
              eventId={id}
              module="musicEnabled"
              initial={event.musicEnabled}
              label={t.settings.music}
              description={t.settings.musicDesc}
            />
            <ModuleToggle
              eventId={id}
              module="videoEnabled"
              initial={event.videoEnabled}
              label={t.settings.video}
              description={t.settings.videoDesc}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.members.title}</CardTitle>
            <CardDescription>{t.members.desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <CollaboratorsPanel
              eventId={id}
              isOwner={isOwner}
              members={members}
              invites={invites.map((i) => ({ id: i.id, code: i.code }))}
              labels={{
                owner: t.members.owner,
                editor: t.members.editor,
                you: t.members.you,
                createInvite: t.members.createInvite,
                inviteHint: t.members.inviteHint,
                pendingInvites: t.members.pendingInvites,
                copy: t.members.copy,
                copied: t.members.copied,
                revoke: t.members.revoke,
                remove: t.members.remove,
                removeConfirm: t.members.removeConfirm,
                noMembers: t.members.noMembers,
              }}
            />
          </CardContent>
        </Card>

        {/* Zona periculoasă: doar owner-ul poate șterge evenimentul. */}
        {isOwner && (
          <Card className="border-rose-200">
            <CardHeader>
              <CardTitle className="text-rose-700">{t.settings.dangerZone}</CardTitle>
              <CardDescription>{t.settings.dangerDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <DeleteEventButton
                action={deleteAction}
                eventName={event.name}
                labels={{
                  trigger: t.settings.deleteBtn,
                  title: t.settings.deleteTitle,
                  confirm: t.settings.deleteConfirm,
                  cancel: t.common.cancel,
                  yes: t.settings.deleteYes,
                }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
