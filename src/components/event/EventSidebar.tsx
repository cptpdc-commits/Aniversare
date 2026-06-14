"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Gift,
  UtensilsCrossed,
  Building2,
  ListChecks,
  Wallet,
  Handshake,
  Music,
  Video,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LogoutButton } from "@/components/auth/LogoutButton";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function EventSidebar({
  eventId,
  eventName,
  musicEnabled,
  videoEnabled,
  locale,
  userName,
}: {
  eventId: string;
  eventName: string;
  musicEnabled: boolean;
  videoEnabled: boolean;
  locale: Locale;
  userName: string;
}) {
  const pathname = usePathname();
  const base = `/eveniment/${eventId}`;
  const nav = DICTIONARIES[locale].nav;
  const t = DICTIONARIES[locale];

  const items: NavItem[] = [
    { label: nav.ansamblu, href: base, icon: LayoutDashboard },
    { label: nav.invitati, href: `${base}/invitati`, icon: Users },
    { label: nav.cadouri, href: `${base}/cadouri`, icon: Gift },
    { label: nav.meniu, href: `${base}/meniu`, icon: UtensilsCrossed },
    { label: nav.sala, href: `${base}/sala`, icon: Building2 },
    { label: nav.checklist, href: `${base}/checklist`, icon: ListChecks },
    { label: nav.buget, href: `${base}/buget`, icon: Wallet },
    { label: nav.furnizori, href: `${base}/furnizori`, icon: Handshake },
    ...(musicEnabled ? [{ label: nav.muzica, href: `${base}/muzica`, icon: Music }] : []),
    ...(videoEnabled ? [{ label: nav.video, href: `${base}/video`, icon: Video }] : []),
    { label: nav.setari, href: `${base}/setari`, icon: Settings },
  ];

  return (
    <aside className="flex w-full shrink-0 flex-col gap-1 border-b border-slate-200 bg-white p-3 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r lg:sticky lg:top-0">
      <Link
        href="/"
        className="mb-2 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ChevronLeft className="size-4" /> {nav.allEvents}
      </Link>
      <div className="mb-3 flex items-center justify-between gap-2 px-3">
        <p className="truncate text-sm font-semibold text-slate-900">{eventName}</p>
        <LanguageSwitcher current={locale} />
      </div>
      <nav className="flex flex-row flex-wrap gap-1 lg:flex-col">
        {items.map((item) => {
          const active =
            item.href === base
              ? pathname === base
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-2 hidden border-t border-slate-100 pt-2 lg:mt-auto lg:block">
        <p className="truncate px-3 pb-1 text-xs text-slate-400">{userName}</p>
        <LogoutButton label={t.auth.logout} className="w-full justify-start" />
      </div>
    </aside>
  );
}
