"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePromo } from "@/app/contexts/PromoContext";
import { ICreatePromoData } from "@/app/services/promoService";

interface CreatePromoFormProps {
    onSuccess: () => void;
}

const CreatePromoForm = forwardRef<{ openModal: () => void }, CreatePromoFormProps>(({ onSuccess }, ref) => {
    const { createPromo } = usePromo();
    const [open, setOpen] = useState(false);
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
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createPromo({
                ...formData,
                discountValue: Number(formData.discountValue),
                maxUsageCount: Number(formData.maxUsageCount),
                maxUsagePerUser: Number(formData.maxUsagePerUser),
                minOrderAmount: Number(formData.minOrderAmount),
                minItemQuantity: Number(formData.minItemQuantity),
                startDate: new Date(formData.startDate).toISOString(),
                expiryDate: new Date(formData.expiryDate).toISOString(),
            });
            setOpen(false);
            onSuccess();
            // Reset form
            setFormData({
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
                startDate: new Date().toISOString().split('T')[0],
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        openModal: () => setOpen(true)
    }));

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Promo Code</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Promo Code (e.g. SAVE20) *</Label>
                            <Input
                                id="code"
                                required
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                placeholder="SAVE20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Campaign Name *</Label>
                            <Input
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="20% Off Summer Sale"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Get 20% off on all orders above 10,000 RWF"
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
                            <Label htmlFor="discountValue">Discount Value *</Label>
                            <Input
                                id="discountValue"
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
                                    <SelectItem value="PUBLIC">Public (Visible in shop)</SelectItem>
                                    <SelectItem value="PRIVATE">Private (Direct share only)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                            <Switch
                                id="isReusable"
                                checked={formData.isReusable}
                                onCheckedChange={(val) => setFormData({ ...formData, isReusable: val })}
                            />
                            <Label htmlFor="isReusable">Reusable by same user?</Label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="maxUsageCount">Max Total Usage</Label>
                            <Input
                                id="maxUsageCount"
                                type="number"
                                value={formData.maxUsageCount}
                                onChange={(e) => setFormData({ ...formData, maxUsageCount: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxUsagePerUser">Max Usage Per User</Label>
                            <Input
                                id="maxUsagePerUser"
                                type="number"
                                value={formData.maxUsagePerUser}
                                onChange={(e) => setFormData({ ...formData, maxUsagePerUser: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="minOrderAmount">Min Order Amount (RWF)</Label>
                            <Input
                                id="minOrderAmount"
                                type="number"
                                value={formData.minOrderAmount}
                                onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="minItemQuantity">Min Item Quantity</Label>
                            <Input
                                id="minItemQuantity"
                                type="number"
                                value={formData.minItemQuantity}
                                onChange={(e) => setFormData({ ...formData, minItemQuantity: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                required
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expiryDate">Expiry Date</Label>
                            <Input
                                id="expiryDate"
                                type="date"
                                required
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="applyToAllProducts"
                            checked={formData.applyToAllProducts}
                            onCheckedChange={(val) => setFormData({ ...formData, applyToAllProducts: val })}
                        />
                        <Label htmlFor="applyToAllProducts">Apply to all products?</Label>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                        {loading ? "Creating..." : "Create Promo Code"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
});

CreatePromoForm.displayName = "CreatePromoForm";

export default CreatePromoForm;
