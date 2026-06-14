import * as React from "react";
import { cn } from "@/lib/utils";

const COLORS: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700",
  amber: "bg-amber-100 text-amber-800",
  emerald: "bg-emerald-100 text-emerald-800",
  rose: "bg-rose-100 text-rose-800",
  indigo: "bg-indigo-100 text-indigo-800",
};

export function Badge({
  color = "slate",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { color?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        COLORS[color] ?? COLORS.slate,
        className
      )}
      {...props}
    />
  );
}
