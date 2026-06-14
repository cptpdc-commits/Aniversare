"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { EVENT_TYPES } from "@/lib/constants";
import { createEvent } from "@/lib/actions/events";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";
import { CURRENCY_SUGGESTIONS, type Locale } from "@/lib/i18n/config";

export function CreateEventDialog({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const t = DICTIONARIES[locale];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> {t.home.newEvent}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.createEvent.title}</DialogTitle>
          <DialogDescription>{t.createEvent.desc}</DialogDescription>
        </DialogHeader>
        <form action={createEvent} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="name">{t.createEvent.name} *</Label>
            <Input id="name" name="name" required placeholder={t.createEvent.namePlaceholder} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="type">{t.createEvent.type}</Label>
              <Select id="type" name="type" defaultValue="aniversare">
                {EVENT_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.labels[locale]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="date">{t.createEvent.date}</Label>
              <Input id="date" name="date" type="datetime-local" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="currency">{t.currency.label}</Label>
              <Input
                id="currency"
                name="currency"
                list="currency-list"
                defaultValue="MDL"
                maxLength={6}
                className="uppercase"
              />
              <datalist id="currency-list">
                {CURRENCY_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="totalBudget">{t.createEvent.budget}</Label>
              <Input id="totalBudget" name="totalBudget" type="number" min="0" step="100" placeholder="0" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="description">{t.createEvent.description}</Label>
            <Textarea id="description" name="description" placeholder={t.createEvent.descriptionPlaceholder} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit">{t.createEvent.submit}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
