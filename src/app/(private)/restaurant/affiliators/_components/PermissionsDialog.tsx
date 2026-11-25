"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    affiliatorManageService,
    apiMessage,
    type AffiliatorPermissionOption,
    type ManagedAffiliator,
} from "@/app/services/affiliatorManageService";
import { PermissionChecklist } from "./PermissionChecklist";

export function PermissionsDialog({
    affiliator,
    options,
    onClose,
    onDone,
}: {
    affiliator: ManagedAffiliator | null;
    options: AffiliatorPermissionOption[];
    onClose: () => void;
    onDone: () => void;
}) {
    const [value, setValue] = useState<string[]>([]);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (affiliator) setValue(affiliator.permissions);
    }, [affiliator]);

    const save = async () => {
        if (!affiliator) return;
        setBusy(true);
        try {
            await affiliatorManageService.setPermissions(affiliator.id, value);
            toast.success("Permissions saved");
            onClose();
            onDone();
        } catch (err) {
            toast.error(apiMessage(err, "Could not save the permissions"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={!!affiliator} onOpenChange={(o) => !o && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Permissions: {affiliator?.name}</DialogTitle>
                    <DialogDescription>Choose what this affiliator can do for your business. Changes apply right away.</DialogDescription>
                </DialogHeader>
                <PermissionChecklist options={options} value={value} onChange={setValue} disabled={busy} />
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={save} disabled={busy} className="bg-green-700 hover:bg-green-600">
                        {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
