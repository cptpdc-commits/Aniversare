"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileUp, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input, Label, Textarea } from "@/components/ui/input";
import { importGuests } from "@/lib/actions/guests";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Row = { name: string; contact: string; companions: number };

/** Împarte textul în rânduri și deduce nume / contact / însoțitori. */
function parseList(text: string): Row[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line
        .split(/[,;\t]+/)
        .map((p) => p.trim())
        .filter(Boolean);
      const name = parts[0] ?? "";
      let contact = "";
      let companions = 0;
      for (const p of parts.slice(1)) {
        if (/^\d{1,3}$/.test(p)) companions = parseInt(p, 10);
        else if (!contact) contact = p;
      }
      return { name, contact, companions };
    })
    .filter((r) => r.name);
}

export function ImportGuestsDialog({ eventId, locale }: { eventId: string; locale: Locale }) {
  const t = DICTIONARIES[locale].guests;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setText("");
    setRows([]);
  }

  function handleParse(source?: string) {
    setRows(parseList(source ?? text));
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    setText(content);
    handleParse(content);
  }

  function updateRow(i: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleImport() {
    startTransition(async () => {
      await importGuests(eventId, rows);
      reset();
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload /> {t.importBtn}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.importTitle}</DialogTitle>
          <DialogDescription>{t.importDesc}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="import-text">{t.pasteLabel}</Label>
            <Textarea
              id="import-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.pastePlaceholder}
              className="min-h-28 font-mono text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="subtle" size="sm" onClick={() => handleParse()}>
              <Wand2 /> {t.parseBtn}
            </Button>
            <span className="text-xs text-slate-400">{t.uploadLabel}</span>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.csv,text/plain,text/csv"
              onChange={handleFile}
              className="hidden"
            />
            <Button type="button" variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
              <FileUp /> .txt / .csv
            </Button>
          </div>

          {/* Previzualizare editabilă */}
          <div className="rounded-lg border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
              <span className="text-sm font-medium text-slate-700">
                {t.previewTitle} {rows.length > 0 && <span className="text-slate-400">({rows.length})</span>}
              </span>
            </div>
            {rows.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-slate-400">{t.nothingParsed}</p>
            ) : (
              <>
                <p className="px-3 pt-2 text-xs text-slate-400">{t.previewHint}</p>
                <div className="max-h-64 overflow-y-auto p-2">
                  <div className="mb-1 hidden grid-cols-[1fr_1fr_4rem_2rem] gap-2 px-1 text-xs font-medium text-slate-400 sm:grid">
                    <span>{t.fName}</span>
                    <span>{t.fContact}</span>
                    <span>{t.fCompanions}</span>
                    <span />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {rows.map((r, i) => (
                      <div key={i} className="grid grid-cols-[1fr_1fr_4rem_2rem] items-center gap-2">
                        <Input
                          value={r.name}
                          onChange={(e) => updateRow(i, { name: e.target.value })}
                          className="h-9"
                        />
                        <Input
                          value={r.contact}
                          onChange={(e) => updateRow(i, { contact: e.target.value })}
                          className="h-9"
                        />
                        <Input
                          type="number"
                          min="0"
                          value={r.companions}
                          onChange={(e) => updateRow(i, { companions: parseInt(e.target.value) || 0 })}
                          className="h-9 px-2"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeRow(i)}
                          className="text-slate-400 hover:text-rose-600"
                          aria-label="remove"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={handleImport} disabled={pending || rows.length === 0}>
              {pending ? t.importing : `${t.importConfirm} ${rows.length > 0 ? `(${rows.length})` : ""}`.trim()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
