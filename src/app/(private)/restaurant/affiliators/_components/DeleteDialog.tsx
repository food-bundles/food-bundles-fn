"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OTPInput } from "@/components/ui/otp-input";
import { affiliatorManageService, apiMessage, type ManagedAffiliator } from "@/app/services/affiliatorManageService";

/** Delete for good, confirmed with a code sent to the owner's own phone */
export function DeleteDialog({
    affiliator,
    onClose,
    onDone,
}: {
    affiliator: ManagedAffiliator | null;
    onClose: () => void;
    onDone: () => void;
}) {
    const [sentTo, setSentTo] = useState<string | null>(null);
    const [otp, setOtp] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        setSentTo(null);
        setOtp("");
    }, [affiliator]);

    const sendCode = async () => {
        if (!affiliator) return;
        setBusy(true);
        try {
            const res = await affiliatorManageService.deleteCode(affiliator.id);
            setSentTo(res.sentTo);
            setOtp("");
        } catch (err) {
            toast.error(apiMessage(err, "Could not send the code"));
        } finally {
            setBusy(false);
        }
    };

    const remove = async () => {
        if (!affiliator) return;
        setBusy(true);
        try {
            await affiliatorManageService.deleteForGood(affiliator.id, otp);
            toast.success(`${affiliator.name} was deleted`);
            onClose();
            onDone();
        } catch (err) {
            toast.error(apiMessage(err, "Could not delete the affiliator"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={!!affiliator} onOpenChange={(o) => !o && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete {affiliator?.name} for good?</DialogTitle>
                    <DialogDescription>
                        {sentTo
                            ? `Enter the 6-digit code we sent to your phone (${sentTo}).`
                            : "This can't be undone. To be sure it's you, we'll send a code to the business owner's phone."}
                    </DialogDescription>
                </DialogHeader>
                {sentTo && <OTPInput value={otp} onChange={setOtp} disabled={busy} />}
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    {sentTo ? (
                        <>
                            <Button variant="ghost" onClick={sendCode} disabled={busy}>
                                Resend code
                            </Button>
                            <Button onClick={remove} disabled={busy || otp.length !== 6} className="bg-red-600 hover:bg-red-700 text-white">
                                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Delete for good
                            </Button>
                        </>
                    ) : (
                        <Button onClick={sendCode} disabled={busy} className="bg-red-600 hover:bg-red-700 text-white">
                            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send code
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
