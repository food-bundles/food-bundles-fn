"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mvendService } from "@/app/services/mvendService";

const apiMessage = (e: unknown, fallback: string) => {
  const err = e as { response?: { status?: number; data?: { message?: string } }; message?: string };
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.status) return `${fallback} (HTTP ${err.response.status})`;
  return err?.message ? `${fallback}: ${err.message}` : fallback;
};

/**
 * Set the merchant wallet's PIN once MVend has created the wallet. MVend gets
 * it (kyc/set-pin) and the server keeps it encrypted to sign wallet calls.
 */
export default function SetPinDialog({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [busy, setBusy] = useState(false);
  const valid = /^\d{4,6}$/.test(pin) && pin === confirmPin;

  const close = () => {
    setPin("");
    setConfirmPin("");
    onClose();
  };

  const save = async () => {
    setBusy(true);
    try {
      const res = await mvendService.setPin(pin, confirmPin);
      if (res.data.verified) toast.success(res.message);
      else toast.warning(res.message);
      close();
      onDone();
    } catch (e) {
      toast.error(apiMessage(e, "Could not set the PIN"));
    } finally {
      setBusy(false);
    }
  };

  const digits = (v: string) => v.replace(/\D/g, "").slice(0, 6);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Set the wallet PIN</DialogTitle>
          <DialogDescription>
            4 to 6 digits. MVend uses it to approve every top-up and payment from this wallet. Food Bundles keeps it encrypted.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Input type="password" inputMode="numeric" autoComplete="new-password" placeholder="New PIN" value={pin} onChange={(e) => setPin(digits(e.target.value))} aria-label="New PIN" />
          <Input type="password" inputMode="numeric" autoComplete="new-password" placeholder="Repeat the PIN" value={confirmPin} onChange={(e) => setConfirmPin(digits(e.target.value))} aria-label="Repeat the PIN" />
          {confirmPin.length > 0 && pin !== confirmPin && <p className="m-0 text-[13px] text-red-600">The two PINs are different.</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={busy}>
            Cancel
          </Button>
          <Button className="bg-[#007A35] hover:bg-[#0F5C36]" onClick={save} disabled={!valid || busy}>
            {busy && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />} Set PIN
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
