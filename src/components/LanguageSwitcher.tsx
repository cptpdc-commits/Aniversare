"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { setLocale } from "@/lib/actions/locale";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/i18n/config";

export function LanguageSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="inline-flex items-center gap-1.5 text-slate-500">
      <Languages className="size-4" />
      <select
        value={current}
        disabled={pending}
        onChange={(e) => {
          const value = e.target.value;
          startTransition(async () => {
            await setLocale(value);
            router.refresh();
          });
        }}
        aria-label="Language"
        className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-50"
      >
        {LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {LOCALE_NAMES[loc as Locale]}
          </option>
        ))}
      </select>
    </div>
  );
}
