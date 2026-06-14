"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

export function LogoutButton({ label, className }: { label: string; className?: string }) {
  return (
    <form action={logout}>
      <button
        type="submit"
        className={cn(
          "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900",
          className
        )}
      >
        <LogOut className="size-4" /> {label}
      </button>
    </form>
  );
}
