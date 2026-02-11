"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { traderService } from "@/app/services/traderService";
import type { Admin } from "@/app/contexts/AdminsContext";
import { Loader2 } from "lucide-react";

interface UpdateCommissionModalProps {
    admin: Admin | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate?: () => void;
}

export function UpdateCommissionModal({
    admin,
    open,
    onOpenChange,
    onUpdate,
}: UpdateCommissionModalProps) {
    const [commission, setCommission] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isServing, setIsServing] = useState(false);

    useEffect(() => {
        if (open && admin && admin.role === "TRADER") {
            fetchTraderWallet();
        } else if (!open) {
            setCommission("");
        }
    }, [open, admin]);

    const fetchTraderWallet = async () => {
        if (!admin) return;
        setIsLoading(true);
        try {
            const response = await traderService.getTraderWalletById(admin.id);
            if (response.success && response.data) {
                setCommission(response.data.commission?.toString() || "");
            } else {
                setCommission("");
            }
        } catch (error) {
            console.error("Failed to fetch trader wallet:", error);
            setCommission("");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!admin || !commission) return;

        const commissionValue = parseFloat(commission);
        if (isNaN(commissionValue) || commissionValue < 0 || commissionValue > 100) {
            toast.error("Please enter a valid commission percentage (0-100)");
            return;
        }

        setIsServing(true);
        try {
            await traderService.setTraderCommission(admin.id, commissionValue);
            toast.success("Commission rate updated successfully");
            if (onUpdate) onUpdate();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Failed to update commission:", error);
            toast.error(error.response?.data?.message || "Failed to update commission");
        } finally {
            setIsServing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Commission</DialogTitle>
                    <DialogDescription>
                        Set the default commission percentage for all transactions.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="relative">
                        <Input
                            id="commission"
                            className="pr-8"
                            placeholder="e.g. 7.5"
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={commission}
                            onChange={(e) => setCommission(e.target.value)}
                            autoFocus
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                    </div>
                    <div className="text-[0.8rem] text-muted-foreground">
                        Trader: <span className="font-medium text-foreground">{admin?.username}</span>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleUpdate}
                        disabled={isServing || !commission}
                        className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        {isServing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Apply Rate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
