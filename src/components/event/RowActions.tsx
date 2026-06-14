"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DeleteButton({
  action,
  confirmMessage = "Sigur ștergi acest element?",
}: {
  action: () => Promise<void>;
  confirmMessage?: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="icon"
      variant="ghost"
      aria-label="Șterge"
      disabled={pending}
      onClick={() => {
        if (confirm(confirmMessage)) startTransition(() => action());
      }}
      className="text-slate-400 hover:text-rose-600"
    >
      <Trash2 />
    </Button>
  );
}

export function StatusSelect({
  value,
  options,
  action,
  className,
}: {
  value: string;
  options: readonly { value: string; label: string }[];
  action: (status: string) => Promise<void>;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => {
        const v = e.target.value;
        startTransition(() => action(v));
      }}
      className={cn(
        "h-9 rounded-md border border-slate-300 bg-white px-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-50 sm:h-8",
        className
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
