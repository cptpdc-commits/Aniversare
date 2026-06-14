import type { Metadata } from "next";
import "./globals.css";
import { getLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Organizator Sărbători în Familie",
  description:
    "Organizează sărbătorile în familie: invitați, cadouri, meniu, sala, buget, checklist și furnizori — într-un singur loc.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
