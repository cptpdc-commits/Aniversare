import { cookies } from "next/headers";
import { DICTIONARIES, type Dict } from "./dictionaries";
import { DEFAULT_LOCALE, LOCALE_COOKIE, normalizeLocale, type Locale } from "./config";

export type { Locale } from "./config";
export type { Dict } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return normalizeLocale(store.get(LOCALE_COOKIE)?.value ?? DEFAULT_LOCALE);
}

export async function getDict(): Promise<Dict> {
  const locale = await getLocale();
  return DICTIONARIES[locale];
}

export function dictFor(locale: Locale): Dict {
  return DICTIONARIES[locale];
}
