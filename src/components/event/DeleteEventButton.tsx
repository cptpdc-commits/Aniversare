"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

export function DeleteEventButton({
  action,
  eventName,
  labels,
}: {
  action: () => Promise<void>;
  eventName: string;
  labels: { trigger: string; title: string; confirm: string; cancel: string; yes: string };
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 /> {labels.trigger}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{labels.title}: „{eventName}"?</DialogTitle>
          <DialogDescription>{labels.confirm}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">{labels.cancel}</Button>
          </DialogClose>
          <form action={action}>
            <Button type="submit" variant="destructive">
              {labels.yes}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
