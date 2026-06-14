import { redirect } from "next/navigation";
import { PartyPopper } from "lucide-react";
import { login } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/session";
import { AuthForm } from "@/components/auth/AuthForm";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getLocale } from "@/lib/i18n";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getCurrentUser()) redirect("/");
  const { next } = await searchParams;
  const locale = await getLocale();
  const t = DICTIONARIES[locale].auth;
  const registerHref = next ? `/register?next=${encodeURIComponent(next)}` : "/register";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
          <PartyPopper className="size-4" /> Organizator Sărbători
        </div>
        <LanguageSwitcher current={locale} />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.loginTitle}</h1>
      <p className="mb-6 mt-1 text-slate-500">{t.loginSubtitle}</p>
      <Card>
        <CardContent className="p-6">
          <AuthForm
            mode="login"
            action={login}
            labels={{
              title: t.loginTitle,
              subtitle: t.loginSubtitle,
              name: t.name,
              email: t.email,
              password: t.password,
              submit: t.loginBtn,
              switchText: t.toRegister,
              switchHref: registerHref,
            }}
            errorMessages={{
              bad_credentials: t.errBadCredentials,
              bad_email: t.errBadEmail,
            }}
            next={next}
          />
        </CardContent>
      </Card>
    </main>
  );
}
