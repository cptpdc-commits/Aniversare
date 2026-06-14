"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

export type Field = {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "datetime-local" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  step?: string;
  min?: string;
  options?: readonly { value: string; label: string }[];
  /** Lățime pe grilă: "full" (implicit) sau "half" */
  width?: "full" | "half";
};

export function EntityDialog({
  title,
  fields,
  action,
  values,
  mode = "create",
  triggerLabel,
  saveLabel = "Salvează",
}: {
  title: string;
  fields: Field[];
  action: (formData: FormData) => Promise<void>;
  values?: Record<string, unknown>;
  mode?: "create" | "edit";
  triggerLabel?: string;
  saveLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  async function handle(formData: FormData) {
    await action(formData);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button size="sm">
            <Plus /> {triggerLabel ?? "Adaugă"}
          </Button>
        ) : (
          <Button size="icon" variant="ghost" aria-label="Editează">
            <Pencil />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form action={handle} className="grid grid-cols-2 gap-4">
          {fields.map((f) => {
            const val = values?.[f.name];
            const defaultValue = val === null || val === undefined ? "" : String(val);
            return (
              <div
                key={f.name}
                className={`grid gap-1.5 ${f.width === "half" ? "col-span-1" : "col-span-2"}`}
              >
                <Label htmlFor={f.name}>
                  {f.label} {f.required && <span className="text-rose-500">*</span>}
                </Label>
                {f.type === "textarea" ? (
                  <Textarea id={f.name} name={f.name} defaultValue={defaultValue} placeholder={f.placeholder} />
                ) : f.type === "select" ? (
                  <Select id={f.name} name={f.name} defaultValue={defaultValue || f.options?.[0]?.value}>
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    id={f.name}
                    name={f.name}
                    type={f.type}
                    required={f.required}
                    placeholder={f.placeholder}
                    step={f.step}
                    min={f.min}
                    defaultValue={defaultValue}
                  />
                )}
              </div>
            );
          })}
          <div className="col-span-2 flex justify-end pt-2">
            <Button type="submit">{saveLabel}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
