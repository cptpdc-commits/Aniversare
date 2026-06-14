import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatează o sumă în valuta dată. Acceptă orice abreviere; dacă nu e un cod
 * ISO valid, afișează numărul urmat de codul introdus de utilizator.
 */
export function formatMoney(amount: number, currency = "MDL"): string {
  const value = amount || 0;
  try {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    const num = new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 0 }).format(value);
    return `${num} ${currency}`;
  }
}

export function formatDate(date: Date | string | null | undefined, locale = "ro-RO"): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatDateShort(date: Date | string | null | undefined, locale = "ro-RO"): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}
