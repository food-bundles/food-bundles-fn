/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
    const [otp, setOtp] = useState<string>("");
    const [sessionId, setSessionId] = useState<string>("");
    const [otpSent, setOtpSent] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open && admin) {
            fetchCurrentCommission();
        } else if (!open) {
            setCommission("");
            setOtp("");
            setSessionId("");
            setOtpSent(false);
        }
    }, [open, admin]);

    useEffect(() => {
        if (otp.length === 6 && sessionId && !isVerifying) {
            handleVerifyOTP();
        }
    }, [otp]);

    const fetchCurrentCommission = async () => {
        if (!admin) return;
        setIsLoading(true);
        try {
            const response = await traderService.getTraderWalletById(admin.id);
            if (response.success && response.data) {
                setCommission(response.data.commission?.toString() || "0");
            }
        } catch (error) {
            setCommission("0");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOTP = async () => {
        if (!admin || !commission) return;

        const commissionValue = parseFloat(commission);
        if (isNaN(commissionValue) || commissionValue < 0 || commissionValue > 3) {
            toast.error("Please enter a valid commission percentage (0-3)");
            return;
        }

        setIsSending(true);
        try {
            const response = await traderService.sendCommissionOTP(admin.id, commissionValue);
            setSessionId(response.sessionId);
            setOtpSent(true);
            toast.success("OTP sent to admin phone");
        } catch (error: any) {
            console.error("Failed to send OTP:", error);
            toast.error(error.response?.data?.message || "Failed to send OTP");
        } finally {
            setIsSending(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!admin || !sessionId || otp.length !== 6) return;

        setIsVerifying(true);
        try {
            await traderService.setTraderCommission(admin.id, sessionId, otp);
            toast.success("Commission rate updated successfully");
            if (onUpdate) onUpdate();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Failed to verify OTP:", error);
            toast.error(error.response?.data?.message || "Invalid OTP");
            setOtp("");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>Update Commission</DialogTitle>
                    <DialogDescription>
                        Set the commission percentage for this trader.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="text-[0.8rem] text-muted-foreground mb-2">
                        Trader: <span className="font-medium text-foreground">{admin?.username}</span>
                    </div>
                    <div className="relative">
                        <Input
                            id="commission"
                            className="pr-8"
                            type="number"
                            step="0.1"
                            min="0"
                            max="3"
                            value={commission}
                            onChange={(e) => setCommission(e.target.value)}
                            autoFocus
                            disabled={isSending || isLoading || otpSent}
                        />
                    </div>
                    {!otpSent && (
                        <button
                            onClick={handleSendOTP}
                            disabled={isSending || !commission || isLoading}
                            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {(isSending || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Set Commission
                        </button>
                    )}
                    {otpSent && (
                        <>
                            <div className="text-sm text-muted-foreground">
                                OTP has been sent to CEO, please contact him
                            </div>
                            <Input
                                id="otp"
                                placeholder="Enter 6-digit"
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                autoFocus
                                disabled={isVerifying}
                                className="text-center text-sm"
                            />
                            {isVerifying && (
                                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Verifying OTP...
                                </div>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
