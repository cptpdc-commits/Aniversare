"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleModule } from "@/lib/actions/events";

export function ModuleToggle({
  eventId,
  module,
  initial,
  label,
  description,
}: {
  eventId: string;
  module: "musicEnabled" | "videoEnabled";
  initial: boolean;
  label: string;
  description: string;
}) {
  const [on, setOn] = useState(initial);
  const [, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4">
      <div>
        <p className="font-medium text-slate-900">{label}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <Switch
        checked={on}
        onCheckedChange={(value) => {
          setOn(value);
          startTransition(() => toggleModule(eventId, module, value));
        }}
      />
    </div>
  );
}
