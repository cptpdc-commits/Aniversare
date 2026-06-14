// Opțiuni pentru valorile din baza de date, cu etichete pe limbi.
import type { Locale } from "@/lib/i18n/config";

type L = Record<Locale, string>;
export type Option = { value: string; labels: L; color?: string };

export const EVENT_TYPES: Option[] = [
  { value: "aniversare", labels: { ro: "Aniversare", en: "Birthday", ru: "День рождения" } },
  { value: "nunta", labels: { ro: "Nuntă", en: "Wedding", ru: "Свадьба" } },
  { value: "botez", labels: { ro: "Botez", en: "Christening", ru: "Крестины" } },
  { value: "cumetrie", labels: { ro: "Cumetrie", en: "Godparents party", ru: "Кумэтрия" } },
  { value: "revelion", labels: { ro: "Revelion", en: "New Year's Eve", ru: "Новый год" } },
  { value: "altul", labels: { ro: "Altul", en: "Other", ru: "Другое" } },
];

export const GUEST_STATUS: Option[] = [
  { value: "in_asteptare", labels: { ro: "În așteptare", en: "Pending", ru: "Ожидание" }, color: "amber" },
  { value: "confirmat", labels: { ro: "Confirmat", en: "Confirmed", ru: "Подтвердил" }, color: "emerald" },
  { value: "refuzat", labels: { ro: "Refuzat", en: "Declined", ru: "Отказался" }, color: "rose" },
];

export const GIFT_STATUS: Option[] = [
  { value: "idee", labels: { ro: "Idee", en: "Idea", ru: "Идея" }, color: "slate" },
  { value: "rezervat", labels: { ro: "Rezervat", en: "Reserved", ru: "Забронирован" }, color: "amber" },
  { value: "cumparat", labels: { ro: "Cumpărat", en: "Purchased", ru: "Куплен" }, color: "emerald" },
];

export const MENU_CATEGORIES: Option[] = [
  { value: "aperitiv", labels: { ro: "Aperitiv", en: "Appetizer", ru: "Закуска" } },
  { value: "fel_principal", labels: { ro: "Fel principal", en: "Main course", ru: "Основное блюдо" } },
  { value: "desert", labels: { ro: "Desert", en: "Dessert", ru: "Десерт" } },
  { value: "bautura", labels: { ro: "Băuturi", en: "Drinks", ru: "Напитки" } },
  { value: "altul", labels: { ro: "Altul", en: "Other", ru: "Другое" } },
];

export const TASK_STAGES: Option[] = [
  { value: "planificare", labels: { ro: "Planificare", en: "Planning", ru: "Планирование" } },
  { value: "pregatire", labels: { ro: "Pregătire", en: "Preparation", ru: "Подготовка" } },
  { value: "ziua_evenimentului", labels: { ro: "Ziua evenimentului", en: "Event day", ru: "День события" } },
  { value: "dupa_eveniment", labels: { ro: "După eveniment", en: "After event", ru: "После события" } },
];

export const TASK_STATUS: Option[] = [
  { value: "de_facut", labels: { ro: "De făcut", en: "To do", ru: "К выполнению" }, color: "slate" },
  { value: "in_lucru", labels: { ro: "În lucru", en: "In progress", ru: "В работе" }, color: "amber" },
  { value: "finalizat", labels: { ro: "Finalizat", en: "Done", ru: "Выполнено" }, color: "emerald" },
];

export const BUDGET_STAGES: Option[] = [
  { value: "sala", labels: { ro: "Sala", en: "Venue", ru: "Зал" } },
  { value: "meniu", labels: { ro: "Meniu", en: "Menu", ru: "Меню" } },
  { value: "muzica", labels: { ro: "Muzică", en: "Music", ru: "Музыка" } },
  { value: "video", labels: { ro: "Video", en: "Video", ru: "Видео" } },
  { value: "cadouri", labels: { ro: "Cadouri", en: "Gifts", ru: "Подарки" } },
  { value: "decor", labels: { ro: "Decor", en: "Decor", ru: "Декор" } },
  { value: "furnizori", labels: { ro: "Furnizori", en: "Vendors", ru: "Подрядчики" } },
  { value: "altul", labels: { ro: "Altul", en: "Other", ru: "Другое" } },
];

export const VENDOR_SERVICES: Option[] = [
  { value: "catering", labels: { ro: "Catering", en: "Catering", ru: "Кейтеринг" } },
  { value: "muzica", labels: { ro: "Muzică", en: "Music", ru: "Музыка" } },
  { value: "video", labels: { ro: "Video", en: "Video", ru: "Видео" } },
  { value: "foto", labels: { ro: "Foto", en: "Photo", ru: "Фото" } },
  { value: "decor", labels: { ro: "Decor", en: "Decor", ru: "Декор" } },
  { value: "transport", labels: { ro: "Transport", en: "Transport", ru: "Транспорт" } },
  { value: "altul", labels: { ro: "Altul", en: "Other", ru: "Другое" } },
];

export const VENDOR_STATUS: Option[] = [
  { value: "de_contactat", labels: { ro: "De contactat", en: "To contact", ru: "Связаться" }, color: "slate" },
  { value: "in_negociere", labels: { ro: "În negociere", en: "Negotiating", ru: "Переговоры" }, color: "amber" },
  { value: "confirmat", labels: { ro: "Confirmat", en: "Confirmed", ru: "Подтверждён" }, color: "indigo" },
  { value: "platit", labels: { ro: "Plătit", en: "Paid", ru: "Оплачен" }, color: "emerald" },
];

export function labelOf(options: Option[], value: string, locale: Locale): string {
  return options.find((o) => o.value === value)?.labels[locale] ?? value;
}

export function colorOf(options: Option[], value: string): string {
  return options.find((o) => o.value === value)?.color ?? "slate";
}

/** Transformă opțiunile în formatul {value,label} pentru un <select>, în limba dată. */
export function localizeOptions(
  options: Option[],
  locale: Locale
): { value: string; label: string }[] {
  return options.map((o) => ({ value: o.value, label: o.labels[locale] }));
}
