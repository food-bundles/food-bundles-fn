"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mvendMerchantService } from "@/app/services/mvendService";

const apiMessage = (e: unknown, fallback: string) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;

/**
 * Register the merchant wallet again (e.g. MVend asks for another phone number):
 * Food Bundles forgets the member it saved (kept in history), then the
 * registration form opens. Nothing is deleted at MVend.
 */
export default function RegisterAgainDialog({
  open,
  memberId,
  onClose,
  onCleared,
}: {
  open: boolean;
  memberId: string;
  onClose: () => void;
  /** canRegister: false while the server's .env still names a member */
  onCleared: (canRegister: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      const res = await mvendMerchantService.reset();
      const blocked = !!res.data.serverEnvMemberId;
      if (blocked) toast.warning(res.message, { duration: 12000 });
      else toast.success(res.message);
      onCleared(!blocked);
      onClose();
    } catch (e) {
      toast.error(apiMessage(e, "Couldn't clear the registration"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !busy && onClose()}>
      <DialogContent className="bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register the merchant wallet again?</DialogTitle>
          <DialogDescription>
            Food Bundles will stop using member <b>{memberId}</b> and you can register again (for example with the new phone
            number MVend asked for). Nothing is deleted at MVend, and the old registration stays in the history.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={confirm} disabled={busy} className="bg-[#007A35] hover:bg-[#0F5C36]">
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Register again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
