"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { IPromoCode } from "@/app/services/promoService";

interface PromoDetailsModalProps {
    promo: IPromoCode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function PromoDetailsModal({ promo, open, onOpenChange }: PromoDetailsModalProps) {
    const formatDate = (date: string | Date) =>
        new Date(date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Promo Code Details: {promo.code}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-gray-500">Name</Label>
                            <p className="font-medium">{promo.name}</p>
                        </div>
                        <div>
                            <Label className="text-gray-500">Status</Label>
                            <div>
                                <Badge variant={promo.isActive ? "default" : "destructive"} className={promo.isActive ? "bg-green-100 text-green-800" : ""}>
                                    {promo.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label className="text-gray-500">Description</Label>
                        <p className="text-sm">{promo.description || "No description provided."}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-gray-500">Discount</Label>
                            <p className="font-bold text-lg text-green-700">
                                {promo.discountValue}{promo.discountType === "PERCENTAGE" ? "%" : " RWF"}
                            </p>
                        </div>
                        <div>
                            <Label className="text-gray-500">Type</Label>
                            <p>{promo.type}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                            <Label className="text-xs text-gray-500">Usage Limit</Label>
                            <p className="text-sm font-medium">{promo.maxUsageCount}</p>
                        </div>
                        <div>
                            <Label className="text-xs text-gray-500">Current Usage</Label>
                            <p className="text-sm font-medium">{promo.currentUsageCount}</p>
                        </div>
                        <div>
                            <Label className="text-xs text-gray-500">Per User Limit</Label>
                            <p className="text-sm font-medium">{promo.maxUsagePerUser}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-gray-500">Min Order Amount</Label>
                            <p className="text-sm">{promo.minOrderAmount.toLocaleString()} RWF</p>
                        </div>
                        <div>
                            <Label className="text-gray-500">Min Item Quantity</Label>
                            <p className="text-sm">{promo.minItemQuantity}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-gray-500">Start Date</Label>
                            <p className="text-sm">{formatDate(promo.startDate)}</p>
                        </div>
                        <div>
                            <Label className="text-gray-500">Expiry Date</Label>
                            <p className="text-sm">{formatDate(promo.expiryDate)}</p>
                        </div>
                    </div>

                    <div>
                        <Label className="text-gray-500">Created By</Label>
                        <p className="text-sm">{promo.admin?.username} ({promo.admin?.email})</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
