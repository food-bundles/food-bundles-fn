"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePromo } from "@/app/contexts/PromoContext";
import { IPromoCode, ICreatePromoData } from "@/app/services/promoService";

interface EditPromoModalProps {
    promo: IPromoCode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function EditPromoModal({ promo, open, onOpenChange, onSuccess }: EditPromoModalProps) {
    const { updatePromo } = usePromo();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<ICreatePromoData>({
        code: "",
        name: "",
        description: "",
        type: "PUBLIC",
        discountType: "PERCENTAGE",
        discountValue: 0,
        isReusable: true,
        maxUsageCount: 1000,
        maxUsagePerUser: 3,
        minOrderAmount: 0,
        minItemQuantity: 1,
        applyToAllProducts: true,
        applicableProductIds: [],
        applicableCategoryIds: [],
        startDate: "",
        expiryDate: "",
    });

    useEffect(() => {
        if (promo && open) {
            setFormData({
                code: promo.code,
                name: promo.name,
                description: promo.description,
                type: promo.type,
                discountType: promo.discountType,
                discountValue: promo.discountValue,
                isReusable: promo.isReusable,
                maxUsageCount: promo.maxUsageCount,
                maxUsagePerUser: promo.maxUsagePerUser,
                minOrderAmount: promo.minOrderAmount,
                minItemQuantity: promo.minItemQuantity,
                applyToAllProducts: promo.applyToAllProducts,
                applicableProductIds: promo.applicableProductIds || [],
                applicableCategoryIds: promo.applicableCategoryIds || [],
                startDate: new Date(promo.startDate).toISOString().split('T')[0],
                expiryDate: new Date(promo.expiryDate).toISOString().split('T')[0],
            });
        }
    }, [promo, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updatePromo(promo.id, {
                ...formData,
                discountValue: Number(formData.discountValue),
                maxUsageCount: Number(formData.maxUsageCount),
                maxUsagePerUser: Number(formData.maxUsagePerUser),
                minOrderAmount: Number(formData.minOrderAmount),
                minItemQuantity: Number(formData.minItemQuantity),
                startDate: new Date(formData.startDate).toISOString(),
                expiryDate: new Date(formData.expiryDate).toISOString(),
            });
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Promo Code: {promo.code}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-code">Promo Code *</Label>
                            <Input
                                id="edit-code"
                                required
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Campaign Name *</Label>
                            <Input
                                id="edit-name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                            id="edit-description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Discount Type *</Label>
                            <Select
                                value={formData.discountType}
                                onValueChange={(val: any) => setFormData({ ...formData, discountType: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                    <SelectItem value="FIXED">Fixed Amount (RWF)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-discountValue">Discount Value *</Label>
                            <Input
                                id="edit-discountValue"
                                type="number"
                                required
                                value={formData.discountValue}
                                onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Visibility Type *</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PUBLIC">Public</SelectItem>
                                    <SelectItem value="PRIVATE">Private</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                            <Switch
                                id="edit-isReusable"
                                checked={formData.isReusable}
                                onCheckedChange={(val) => setFormData({ ...formData, isReusable: val })}
                            />
                            <Label htmlFor="edit-isReusable">Reusable by same user?</Label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-maxUsageCount">Max Total Usage</Label>
                            <Input
                                id="edit-maxUsageCount"
                                type="number"
                                value={formData.maxUsageCount}
                                onChange={(e) => setFormData({ ...formData, maxUsageCount: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-maxUsagePerUser">Max Usage Per User</Label>
                            <Input
                                id="edit-maxUsagePerUser"
                                type="number"
                                value={formData.maxUsagePerUser}
                                onChange={(e) => setFormData({ ...formData, maxUsagePerUser: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-minOrderAmount">Min Order Amount (RWF)</Label>
                            <Input
                                id="edit-minOrderAmount"
                                type="number"
                                value={formData.minOrderAmount}
                                onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-minItemQuantity">Min Item Quantity</Label>
                            <Input
                                id="edit-minItemQuantity"
                                type="number"
                                value={formData.minItemQuantity}
                                onChange={(e) => setFormData({ ...formData, minItemQuantity: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-startDate">Start Date</Label>
                            <Input
                                id="edit-startDate"
                                type="date"
                                required
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-expiryDate">Expiry Date</Label>
                            <Input
                                id="edit-expiryDate"
                                type="date"
                                required
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="edit-applyToAllProducts"
                            checked={formData.applyToAllProducts}
                            onCheckedChange={(val) => setFormData({ ...formData, applyToAllProducts: val })}
                        />
                        <Label htmlFor="edit-applyToAllProducts">Apply to all products?</Label>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                        {loading ? "Updating..." : "Update Promo Code"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
