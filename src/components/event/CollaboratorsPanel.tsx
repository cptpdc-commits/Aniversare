"use client";

import { useState, useTransition } from "react";
import { Link2, Copy, Check, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createInvite, deleteInvite, removeMember } from "@/lib/actions/members";

type Member = { id: string; name: string; email: string; role: string; isYou: boolean };
type Invite = { id: string; code: string };

type Labels = {
  owner: string;
  editor: string;
  you: string;
  createInvite: string;
  inviteHint: string;
  pendingInvites: string;
  copy: string;
  copied: string;
  revoke: string;
  remove: string;
  removeConfirm: string;
  noMembers: string;
};

export function CollaboratorsPanel({
  eventId,
  isOwner,
  members,
  invites,
  labels,
}: {
  eventId: string;
  isOwner: boolean;
  members: Member[];
  invites: Invite[];
  labels: Labels;
}) {
  const [pending, startTransition] = useTransition();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  function inviteLink(code: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/invitatie/${code}`;
  }

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(inviteLink(code));
      setCopiedCode(code);
      setTimeout(() => setCopiedCode((c) => (c === code ? null : c)), 2000);
    } catch {
      // clipboard indisponibil (ex. context non-secure) — ignorăm tăcut
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Lista membrilor */}
      <ul className="flex flex-col gap-2">
        {members.map((m) => (
          <li
            key={m.id}
            className="flex flex-col gap-2 rounded-lg border border-slate-100 p-3 sm:flex-row sm:items-center sm:gap-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-medium text-slate-900">{m.name}</span>
                {m.isYou && <span className="text-xs text-slate-400">({labels.you})</span>}
                <Badge color={m.role === "owner" ? "indigo" : "slate"}>
                  {m.role === "owner" ? labels.owner : labels.editor}
                </Badge>
              </div>
              <p className="truncate text-xs text-slate-500">{m.email}</p>
            </div>
            {isOwner && m.role !== "owner" && (
              <Button
                size="icon"
                variant="ghost"
                aria-label={labels.remove}
                disabled={pending}
                onClick={() => {
                  if (confirm(labels.removeConfirm))
                    startTransition(() => removeMember(eventId, m.id));
                }}
                className="text-slate-400 hover:text-rose-600"
              >
                <Trash2 />
              </Button>
            )}
          </li>
        ))}
      </ul>

      {isOwner && (
        <>
          {/* Invitații active */}
          {invites.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">{labels.pendingInvites}</p>
              <ul className="flex flex-col gap-2">
                {invites.map((inv) => (
                  <li
                    key={inv.id}
                    className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2"
                  >
                    <Link2 className="size-4 shrink-0 text-slate-400" />
                    <code className="min-w-0 flex-1 truncate text-xs text-slate-600">
                      {inviteLink(inv.code)}
                    </code>
                    <Button
                      size="sm"
                      variant="subtle"
                      onClick={() => copy(inv.code)}
                      className="gap-1"
                    >
                      {copiedCode === inv.code ? (
                        <><Check className="size-3.5" /> {labels.copied}</>
                      ) : (
                        <><Copy className="size-3.5" /> {labels.copy}</>
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={labels.revoke}
                      disabled={pending}
                      onClick={() => startTransition(() => deleteInvite(eventId, inv.id))}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <Button
              variant="subtle"
              disabled={pending}
              onClick={() => startTransition(() => createInvite(eventId))}
              className="gap-2"
            >
              <UserPlus className="size-4" /> {labels.createInvite}
            </Button>
            <p className="mt-2 text-xs text-slate-400">{labels.inviteHint}</p>
          </div>
        </>
      )}
    </div>
  );
}
