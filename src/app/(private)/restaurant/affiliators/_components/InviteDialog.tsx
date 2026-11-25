"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OTPInput } from "@/components/ui/otp-input";
import {
    affiliatorManageService,
    apiMessage,
    type AffiliatorInvitation,
    type AffiliatorPermissionOption,
} from "@/app/services/affiliatorManageService";
import { PermissionChecklist } from "./PermissionChecklist";

/**
 * Invite in two steps: (1) name, phone and permissions → a code goes to the
 * affiliator's phone; (2) the owner types that code → the affiliator is created.
 * Opened with `pending` to finish an invitation started earlier.
 */
export function InviteDialog({
    open,
    onOpenChange,
    options,
    pending,
    onDone,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    options: AffiliatorPermissionOption[];
    pending: AffiliatorInvitation | null;
    onDone: () => void;
}) {
    const [form, setForm] = useState({ name: "", phone: "", email: "" });
    const [permissions, setPermissions] = useState<string[]>([]);
    const [invite, setInvite] = useState<{ id: string; phone: string } | null>(null);
    const [otp, setOtp] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!open) return;
        setForm({ name: "", phone: "", email: "" });
        setPermissions(options.map((p) => p.key));
        setInvite(pending ? { id: pending.id, phone: pending.phone } : null);
        setOtp("");
    }, [open, pending, options]);

    const sendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        try {
            const res = await affiliatorManageService.invite({
                name: form.name,
                phone: form.phone,
                email: form.email || undefined,
                permissions,
            });
            setInvite({ id: res.invitationId, phone: res.phone });
            toast.success(`Code sent to ${res.phone}`);
            onDone();
        } catch (err) {
            toast.error(apiMessage(err, "Could not send the code"));
        } finally {
            setBusy(false);
        }
    };

    const confirm = async () => {
        if (!invite) return;
        setBusy(true);
        try {
            const a = await affiliatorManageService.confirm(invite.id, otp);
            toast.success(`${a.name} is now your affiliator`);
            onOpenChange(false);
            onDone();
        } catch (err) {
            toast.error(apiMessage(err, "Wrong or expired code"));
        } finally {
            setBusy(false);
        }
    };

    const resend = async () => {
        if (!invite) return;
        setBusy(true);
        try {
            await affiliatorManageService.resend(invite.id);
            setOtp("");
            toast.success(`New code sent to ${invite.phone}`);
        } catch (err) {
            toast.error(apiMessage(err, "Could not resend the code"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{invite ? "Enter the code" : "Invite an affiliator"}</DialogTitle>
                    <DialogDescription>
                        {invite
                            ? `We sent a 6-digit code to ${invite.phone}. Ask the affiliator for it and type it here.`
                            : "A code is sent to the affiliator's phone. They give it to you to confirm they agree."}
                    </DialogDescription>
                </DialogHeader>

                {invite ? (
                    <div className="space-y-4 pt-2">
                        <OTPInput value={otp} onChange={setOtp} disabled={busy} />
                        <DialogFooter className="gap-2 sm:justify-between">
                            <Button type="button" variant="ghost" onClick={resend} disabled={busy}>
                                Resend code
                            </Button>
                            <Button onClick={confirm} disabled={busy || otp.length !== 6} className="bg-green-700 hover:bg-green-600">
                                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirm
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <form onSubmit={sendCode} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="aff-name">Name</Label>
                            <Input id="aff-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="aff-phone">Phone number</Label>
                            <Input id="aff-phone" required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="078 000 0000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="aff-email">Email (optional)</Label>
                            <Input id="aff-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>What they can do</Label>
                            <PermissionChecklist options={options} value={permissions} onChange={setPermissions} disabled={busy} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={busy} className="bg-green-700 hover:bg-green-600">
                                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send code
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
