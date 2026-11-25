"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { affiliatorManageService, apiMessage, type AffiliatorPermissionOption } from "@/app/services/affiliatorManageService";
import { PermissionChecklist } from "./PermissionChecklist";

/**
 * The owner creates the affiliator. The affiliator's phone gets an SMS:
 * log in with this phone number and this password (it doesn't expire;
 * they can change it in Settings).
 */
export function InviteDialog({
    open,
    onOpenChange,
    options,
    onDone,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    options: AffiliatorPermissionOption[];
    onDone: () => void;
}) {
    const [form, setForm] = useState({ name: "", phone: "", email: "" });
    const [permissions, setPermissions] = useState<string[]>([]);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!open) return;
        setForm({ name: "", phone: "", email: "" });
        setPermissions(options.map((p) => p.key));
    }, [open, options]);

    const create = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        try {
            const res = await affiliatorManageService.create({
                name: form.name,
                phone: form.phone,
                email: form.email || undefined,
                permissions,
            });
            if (!res.smsSent) {
                toast.warning(`${res.affiliator.name} was created, but the SMS to ${res.sentTo} failed. Use "Send new login code".`);
            } else if (res.existingAccount) {
                toast.success(`${res.affiliator.name} already has a Food Bundles account: they log in with their own password.`);
            } else {
                toast.success(`${res.affiliator.name} was created. Login details sent by SMS to ${res.sentTo}.`);
            }
            onOpenChange(false);
            onDone();
        } catch (err) {
            toast.error(apiMessage(err, "Could not create the affiliator"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add an affiliator</DialogTitle>
                    <DialogDescription>
                        We send an SMS to their phone with the login details: their phone number and a password. They can
                        change the password after logging in.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={create} className="space-y-4 pt-2">
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
                            Create affiliator
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
