import { redirect } from "next/navigation";
import { UserPlus, PartyPopper } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { acceptInvite } from "@/lib/actions/members";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLocale } from "@/lib/i18n";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/invitatie/${code}`)}`);

  const locale = await getLocale();
  const t = DICTIONARIES[locale].members;

  const invite = await prisma.eventInvite.findUnique({
    where: { code },
    include: { event: { select: { name: true } } },
  });
  const invalid = !invite || (invite.expiresAt && invite.expiresAt < new Date());

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 inline-flex items-center gap-2 self-start rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
        <PartyPopper className="size-4" /> Organizator Sărbători
      </div>
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          {invalid ? (
            <p className="text-slate-600">{t.joinInvalid}</p>
          ) : (
            <>
              <div className="rounded-full bg-indigo-50 p-4">
                <UserPlus className="size-7 text-indigo-500" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">{t.joinTitle}</h1>
              <p className="text-slate-500">{t.joinDesc}</p>
              <p className="font-medium text-slate-900">{invite!.event.name}</p>
              <form action={acceptInvite.bind(null, code)} className="w-full">
                <Button type="submit" className="w-full">{t.joinBtn}</Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
