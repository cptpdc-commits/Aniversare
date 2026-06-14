import { notFound } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { saveTask, setTaskStatus, deleteTask } from "@/lib/actions/tasks";
import { saveOrganizer, deleteOrganizer } from "@/lib/actions/organizers";
import { PageHeader, EmptyState } from "@/components/event/PageHeader";
import { EntityDialog, type Field } from "@/components/event/EntityDialog";
import { DeleteButton, StatusSelect } from "@/components/event/RowActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TASK_STAGES, TASK_STATUS, labelOf, colorOf, localizeOptions } from "@/lib/constants";
import { formatDateShort } from "@/lib/utils";
import { getLocale } from "@/lib/i18n";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";
import { BCP47 } from "@/lib/i18n/config";

export default async function ChecklistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, locale] = await Promise.all([
    prisma.event.findUnique({ where: { id }, include: { tasks: { include: { organizer: true } }, organizers: { orderBy: { name: "asc" } } } }),
    getLocale(),
  ]);
  if (!event) notFound();
  const t = DICTIONARIES[locale];
  const statusOptions = localizeOptions(TASK_STATUS, locale);

  const ORG_FIELDS: Field[] = [
    { name: "name", label: t.checklist.fOrgName, type: "text", required: true, placeholder: t.checklist.orgNamePlaceholder },
    { name: "role", label: t.checklist.fOrgRole, type: "text", placeholder: t.checklist.orgRolePlaceholder },
  ];

  const organizerOptions = [
    { value: "", label: t.checklist.unassigned },
    ...event.organizers.map((o) => ({ value: o.id, label: o.name })),
  ];

  const TASK_FIELDS: Field[] = [
    { name: "title", label: t.checklist.fTask, type: "text", required: true, placeholder: t.checklist.taskPlaceholder },
    { name: "stage", label: t.checklist.fStage, type: "select", width: "half", options: localizeOptions(TASK_STAGES, locale) },
    { name: "status", label: t.checklist.fStatus, type: "select", width: "half", options: statusOptions },
    { name: "organizerId", label: t.checklist.fResponsible, type: "select", width: "half", options: organizerOptions },
    { name: "dueDate", label: t.checklist.fDueDate, type: "date", width: "half" },
  ];

  const done = event.tasks.filter((t) => t.status === "finalizat").length;
  const pct = event.tasks.length ? Math.round((done / event.tasks.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={t.checklist.title}
        description={t.checklist.desc}
        action={
          <EntityDialog title={t.checklist.new} triggerLabel={t.checklist.add} saveLabel={t.common.save} fields={TASK_FIELDS} action={saveTask.bind(null, id, null)} />
        }
      />

      <Card className="mb-6">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{t.checklist.organizers}</CardTitle>
          <EntityDialog title={t.checklist.newOrg} triggerLabel={t.checklist.addOrg} saveLabel={t.common.save} fields={ORG_FIELDS} action={saveOrganizer.bind(null, id, null)} />
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {event.organizers.length === 0 && (
            <p className="text-sm text-slate-500">{t.checklist.noOrganizers}</p>
          )}
          {event.organizers.map((o) => (
            <div key={o.id} className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-3 pr-1 text-sm">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: o.color }} />
              <span className="font-medium text-slate-800">{o.name}</span>
              {o.role && <span className="text-xs text-slate-400">{o.role}</span>}
              <EntityDialog title={t.checklist.editOrg} mode="edit" saveLabel={t.common.save} fields={ORG_FIELDS} values={o} action={saveOrganizer.bind(null, id, o.id)} />
              <DeleteButton action={deleteOrganizer.bind(null, id, o.id)} confirmMessage={`${t.common.delete}: ${o.name}?`} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mb-6">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="text-slate-600">{t.checklist.generalProgress}</span>
          <span className="font-medium text-slate-900">{done} / {event.tasks.length} ({pct}%)</span>
        </div>
        <Progress value={pct} barClassName="bg-emerald-500" />
      </div>

      {event.tasks.length === 0 ? (
        <EmptyState message={t.checklist.empty} />
      ) : (
        <div className="grid gap-6">
          {TASK_STAGES.map((stage) => {
            const tasks = event.tasks.filter((tk) => tk.stage === stage.value);
            if (tasks.length === 0) return null;
            return (
              <div key={stage.value}>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
                  {stage.labels[locale]}
                </h3>
                <div className="grid gap-2">
                  {tasks.map((tk) => (
                    <Card key={tk.id} className={tk.status === "finalizat" ? "opacity-70" : ""}>
                      <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className={`font-medium text-slate-900 ${tk.status === "finalizat" ? "line-through" : ""}`}>
                              {tk.title}
                            </span>
                            <Badge color={colorOf(TASK_STATUS, tk.status)} className="sm:hidden">
                              {labelOf(TASK_STATUS, tk.status, locale)}
                            </Badge>
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                            {tk.organizer && (
                              <span className="inline-flex items-center gap-1">
                                <span className="size-2 rounded-full" style={{ backgroundColor: tk.organizer.color }} />
                                {tk.organizer.name}
                              </span>
                            )}
                            {tk.dueDate && (
                              <span className="inline-flex items-center gap-1">
                                <CalendarClock className="size-3" /> {formatDateShort(tk.dueDate, BCP47[locale])}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Badge color={colorOf(TASK_STATUS, tk.status)} className="hidden sm:inline-flex">
                            {labelOf(TASK_STATUS, tk.status, locale)}
                          </Badge>
                          <StatusSelect value={tk.status} options={statusOptions} action={setTaskStatus.bind(null, id, tk.id)} className="flex-1 sm:flex-none" />
                          <EntityDialog title={t.checklist.edit} mode="edit" saveLabel={t.common.save} fields={TASK_FIELDS} values={{ title: tk.title, stage: tk.stage, status: tk.status, organizerId: tk.organizerId ?? "", dueDate: tk.dueDate ? new Date(tk.dueDate).toISOString().slice(0, 10) : "" }} action={saveTask.bind(null, id, tk.id)} />
                          <DeleteButton action={deleteTask.bind(null, id, tk.id)} confirmMessage={`${t.common.delete}: ${tk.title}?`} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
