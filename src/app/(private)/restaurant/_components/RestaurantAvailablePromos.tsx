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
}

export default function RestaurantAvailablePromos({ restaurantId, onApply }: RestaurantAvailablePromosProps) {
    const [promos, setPromos] = useState<IPromoCode[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPromos = async () => {
            try {
                const response = await promoService.getActivePromos();
                if (response.success) {
                    setPromos(response.data);
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
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {promos.map((promo) => (
                    <Card key={promo.id} className="relative overflow-hidden border-2 border-green-100 hover:border-green-300 transition-all group">
                        <div className="absolute top-0 right-0 p-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {promo.discountType === "PERCENTAGE" ? `${promo.discountValue}% OFF` : `${promo.discountValue.toLocaleString()} RWF OFF`}
                            </Badge>
                        </div>
                        <CardContent className="p-5">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="p-2 bg-green-100 rounded-lg text-green-700">
                                    <Ticket className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors uppercase tracking-tight">
                                        {promo.code}
                                    </h3>
                                    <p className="text-xs font-medium text-gray-500">{promo.name}</p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                                {promo.description}
                            </p>

                            <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
                                <div className="flex items-center justify-between text-[11px] text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>Expires {new Date(promo.expiryDate).toLocaleDateString()}</span>
                                    </div>
                                    {promo.minOrderAmount > 0 && (
                                        <div className="flex items-center gap-1 font-medium text-green-600">
                                            <Info className="h-3 w-3" />
                                            <span>Min: {promo.minOrderAmount.toLocaleString()} RWF</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 mt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 h-8 text-xs gap-1.5"
                                        onClick={() => copyToClipboard(promo.code)}
                                    >
                                        <Copy className="h-3 w-3" />
                                        Copy Code
                                    </Button>
                                    {onApply && (
                                        <Button
                                            size="sm"
                                            className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700 gap-1.5"
                                            onClick={() => onApply(promo.code)}
                                        >
                                            <CheckCircle2 className="h-3 w-3" />
                                            Apply
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
