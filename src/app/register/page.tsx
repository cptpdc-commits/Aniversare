import { redirect } from "next/navigation";
import { PartyPopper } from "lucide-react";
import { register } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/session";
import { AuthForm } from "@/components/auth/AuthForm";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getLocale } from "@/lib/i18n";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getCurrentUser()) redirect("/");
  const { next } = await searchParams;
  const locale = await getLocale();
  const t = DICTIONARIES[locale].auth;
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
          <PartyPopper className="size-4" /> Organizator Sărbători
        </div>
        <LanguageSwitcher current={locale} />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.registerTitle}</h1>
      <p className="mb-6 mt-1 text-slate-500">{t.registerSubtitle}</p>
      <Card>
        <CardContent className="p-6">
          <AuthForm
            mode="register"
            action={register}
            labels={{
              title: t.registerTitle,
              subtitle: t.registerSubtitle,
              name: t.name,
              email: t.email,
              password: t.password,
              submit: t.registerBtn,
              switchText: t.toLogin,
              switchHref: loginHref,
            }}
            errorMessages={{
              empty_name: t.errEmptyName,
              bad_email: t.errBadEmail,
              short_password: t.errShortPassword,
              email_taken: t.errEmailTaken,
            }}
            next={next}
          />
        </CardContent>
      </Card>
    </main>
  );
}
