export const LOCALES = ["ro", "en", "ru"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ro";
export const LOCALE_COOKIE = "locale";

export const LOCALE_NAMES: Record<Locale, string> = {
  ro: "Română",
  en: "English",
  ru: "Русский",
};

// Mapare către BCP47 pentru formatarea datelor/numerelor
export const BCP47: Record<Locale, string> = {
  ro: "ro-RO",
  en: "en-US",
  ru: "ru-RU",
};

// Valute sugerate (se poate introduce orice altă abreviere)
export const CURRENCY_SUGGESTIONS = ["MDL", "RON", "EUR", "USD", "GBP", "UAH", "RUB"];

export function normalizeLocale(value: string | undefined | null): Locale {
  return LOCALES.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE;
}
