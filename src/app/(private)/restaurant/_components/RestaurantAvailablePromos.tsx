"use client";

import { useEffect, useState } from "react";
import { promoService, IPromoCode } from "@/app/services/promoService";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, Clock, Info, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface RestaurantAvailablePromosProps {
    restaurantId?: string; // Optional, if provided, filters by restaurant exclusion
    onApply?: (code: string) => void;
    onPromoCodesLoad?: (hasPromos: boolean) => void;
}

export default function RestaurantAvailablePromos({ restaurantId, onApply, onPromoCodesLoad }: RestaurantAvailablePromosProps) {
    const [promos, setPromos] = useState<IPromoCode[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPromos = async () => {
            try {
                const response = await promoService.getActivePromos();
                if (response.success) {
                    setPromos(response.data);
                    onPromoCodesLoad?.(response.data.length > 0);
                }
            } catch (error) {
                console.error("Failed to fetch promos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPromos();
    }, [restaurantId]);

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success("Promo code copied to clipboard");
    };

    if (loading) return (
        <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
    );

    if (promos.length === 0) return (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed">
            <Ticket className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p className="text-gray-500">No active public promotions available right now.</p>
        </div>
    );

    return (
        <div className="space-y-4 mx-4">
            <div className="grid grid-cols-2 gap-3">
                {promos.map((promo) => (
                    <Card key={promo.id} className="relative overflow-hidden border border-green-100 hover:border-green-300 transition-all group mx-2">
                        <div className="absolute top-0 right-0 p-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {promo.discountType === "PERCENTAGE" ? `${promo.discountValue}% OFF` : `${promo.discountValue.toLocaleString()} RWF OFF`}
                            </Badge>
                        </div>
                        <CardContent className="p-4">
                            <div className="text-center space-y-1">
                                <h3 className="font-medium text-sm text-gray-900">
                                    {promo.name}
                                </h3>
                                <p className="text-xs text-green-700 uppercase font-bold">
                                    {promo.code}
                                </p>
                                {/* <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                    {promo.discountType === "PERCENTAGE" ? `${promo.discountValue}% OFF` : `${promo.discountValue.toLocaleString()} RWF OFF`}
                                </Badge> */}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
