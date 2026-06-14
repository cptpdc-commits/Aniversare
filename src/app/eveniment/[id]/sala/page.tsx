import { notFound } from "next/navigation";
import { Building2, MapPin, Users, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { saveVenue } from "@/lib/actions/venue";
import { PageHeader } from "@/components/event/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { formatMoney } from "@/lib/utils";
import { getLocale } from "@/lib/i18n";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";

export default async function VenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, locale] = await Promise.all([
    prisma.event.findUnique({ where: { id }, include: { venue: true } }),
    getLocale(),
  ]);
  if (!event) notFound();
  const t = DICTIONARIES[locale];
  const cur = event.currency;

  const v = event.venue;
  const action = saveVenue.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t.venue.title} description={t.venue.desc} />

      {v && (
        <Card className="mb-6 border-indigo-200 bg-indigo-50/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-4 text-indigo-500" /> {v.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-slate-700">
            {v.address && <p className="flex items-center gap-2"><MapPin className="size-4 text-slate-400" /> {v.address}</p>}
            {v.capacity != null && <p className="flex items-center gap-2"><Users className="size-4 text-slate-400" /> {t.venue.capacity}: {v.capacity} {t.venue.capacityPeople}</p>}
            {v.contact && <p className="flex items-center gap-2"><Phone className="size-4 text-slate-400" /> {v.contact}</p>}
            <p className="font-medium">{t.venue.cost}: {formatMoney(v.cost, cur)}</p>
            {v.notes && <p className="text-slate-500">{v.notes}</p>}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{v ? t.venue.editTitle : t.venue.addTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="grid grid-cols-2 gap-4">
            <div className="col-span-2 grid gap-1.5">
              <Label htmlFor="name">{t.venue.fName} <span className="text-rose-500">*</span></Label>
              <Input id="name" name="name" required defaultValue={v?.name ?? ""} placeholder={t.venue.namePlaceholder} />
            </div>
            <div className="col-span-2 grid gap-1.5">
              <Label htmlFor="address">{t.venue.fAddress}</Label>
              <Input id="address" name="address" defaultValue={v?.address ?? ""} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="capacity">{t.venue.fCapacity}</Label>
              <Input id="capacity" name="capacity" type="number" min="0" defaultValue={v?.capacity ?? ""} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cost">{t.venue.fCost}</Label>
              <Input id="cost" name="cost" type="number" min="0" step="100" defaultValue={v?.cost ?? ""} />
            </div>
            <div className="col-span-2 grid gap-1.5">
              <Label htmlFor="contact">{t.venue.fContact}</Label>
              <Input id="contact" name="contact" defaultValue={v?.contact ?? ""} placeholder={t.venue.contactPlaceholder} />
            </div>
            <div className="col-span-2 grid gap-1.5">
              <Label htmlFor="notes">{t.venue.fNotes}</Label>
              <Textarea id="notes" name="notes" defaultValue={v?.notes ?? ""} />
            </div>
            <div className="col-span-2 flex justify-end">
              <Button type="submit">{t.common.save}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
