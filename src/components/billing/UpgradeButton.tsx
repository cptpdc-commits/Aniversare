"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { activatePremium } from "@/lib/actions/billing";

declare global {
  interface Window {
    // Capacitor In-App Purchases plugin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    InAppPurchase2?: any;
    // mesaj de la WebView nativ Android
    AndroidBilling?: {
      purchase: (productId: string) => void;
    };
  }
}

const PRODUCT_ID = "premium_monthly";

export function UpgradeButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePurchase() {
    setLoading(true);
    setError(null);

    try {
      // cordova-plugin-purchase (CdvPurchase) injectat de Capacitor în WebView
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const CdvPurchase = (window as any).CdvPurchase;
      if (!CdvPurchase) {
        setError("Billing disponibil doar în aplicația Android.");
        setLoading(false);
        return;
      }

      const store = CdvPurchase.store;
      store.register([{ id: PRODUCT_ID, type: CdvPurchase.ProductType.PAID_SUBSCRIPTION, platform: CdvPurchase.Platform.GOOGLE_PLAY }]);

      await new Promise<void>((resolve, reject) => {
        store.when().approved(async (transaction: any) => {
          try {
            const result = await activatePremium(transaction.purchaseId, PRODUCT_ID);
            if (result?.error) {
              setError(result.error);
              reject(new Error(result.error));
            } else {
              await transaction.verify();
              await transaction.finish();
              setOpen(false);
              window.location.reload();
              resolve();
            }
          } catch (e) {
            reject(e);
          }
        });
        store.order(PRODUCT_ID).catch(reject);
        store.initialize([CdvPurchase.Platform.GOOGLE_PLAY]).catch(reject);
      });
    } catch (e) {
      setError("A apărut o eroare. Încearcă din nou.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
      >
        <Sparkles className="size-4" />
        Upgrade Premium
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-indigo-500" />
              Premium — Evenimente nelimitate
            </DialogTitle>
            <DialogDescription>
              Planul gratuit îți permite 3 evenimente. Upgrade la Premium pentru a crea oricâte evenimente dorești.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">
            <div className="text-3xl font-bold text-indigo-700">
              ~2 USD <span className="text-base font-normal text-indigo-500">/ lună</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>✅ Evenimente nelimitate</li>
              <li>✅ Toți invitații, sarcini, buget</li>
              <li>✅ Anulare oricând din Google Play</li>
            </ul>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
              Anulează
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={loading}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {loading ? "Se procesează..." : "Abonează-te prin Google Play"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
