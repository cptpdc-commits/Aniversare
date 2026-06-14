"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { AuthState } from "@/lib/actions/auth";

type Labels = {
  title: string;
  subtitle: string;
  name: string;
  email: string;
  password: string;
  submit: string;
  switchText: string;
  switchHref: string;
};

export function AuthForm({
  mode,
  action,
  labels,
  errorMessages,
  next,
}: {
  mode: "login" | "register";
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  labels: Labels;
  errorMessages: Record<string, string>;
  next?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const errorText = state.error ? errorMessages[state.error] ?? state.error : null;

  return (
    <form action={formAction} className="grid gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      {mode === "register" && (
        <div className="grid gap-1.5">
          <Label htmlFor="name">{labels.name}</Label>
          <Input id="name" name="name" autoComplete="name" required />
        </div>
      )}
      <div className="grid gap-1.5">
        <Label htmlFor="email">{labels.email}</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="password">{labels.password}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          required
        />
      </div>

      {errorText && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorText}</p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {labels.submit}
      </Button>

      <Link
        href={labels.switchHref}
        className="text-center text-sm text-indigo-600 hover:underline"
      >
        {labels.switchText}
      </Link>
    </form>
  );
}
