"use client";

import { useEffect, useState } from "react";
import { promoService, IPromoCode } from "@/app/services/promoService";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, Clock, Info } from "lucide-react";

interface RestaurantPromosProps {
    restaurantId: string;
}

export default function RestaurantPromos({ restaurantId }: RestaurantPromosProps) {
    const [promos, setPromos] = useState<IPromoCode[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPromos = async () => {
            try {
                const response = await promoService.getAllPromos();
                const now = new Date();

                const activePromos = response.data.filter((promo: IPromoCode) => {
                    const isStarted = new Date(promo.startDate) <= now;
                    const isNotExpired = new Date(promo.expiryDate) >= now;
                    const isPublic = promo.type === "PUBLIC";
                    const isActive = promo.isActive;
                    const isNotExcluded = !promo.excludedRestaurants?.some(
                        (exclusion) => exclusion.restaurantId === restaurantId
                    );

                    return isActive && isPublic && isStarted && isNotExpired && isNotExcluded;
                });

                setPromos(activePromos);
            } catch (error) {
                console.error("Failed to fetch promos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPromos();
    }, [restaurantId]);

    if (loading || promos.length === 0) return null;

    return (
        <div className="space-y-4 mb-8">
            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                <Ticket className="h-5 w-5 text-green-600" />
                Available Offers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promos.map((promo) => (
                    <Card key={promo.id} className="border-dashed border-2 border-green-200 bg-green-50/30 overflow-hidden group hover:border-green-400 transition-colors">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-black text-green-700">
                                            {promo.discountValue}{promo.discountType === "PERCENTAGE" ? "%" : " RWF"} OFF
                                        </span>
                                        <Badge variant="outline" className="bg-white text-green-700 border-green-200 font-mono font-bold">
                                            {promo.code}
                                        </Badge>
                                    </div>
                                    <h3 className="font-bold text-gray-900">{promo.name}</h3>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                {promo.description}
                            </p>
                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-green-100">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>Expires {new Date(promo.expiryDate).toLocaleDateString()}</span>
                                </div>
                                {promo.minOrderAmount > 0 && (
                                    <div className="flex items-center gap-1 text-[10px] text-green-700 bg-green-100/50 px-2 py-0.5 rounded-full font-medium">
                                        <Info className="h-3 w-3" />
                                        Min order: {promo.minOrderAmount.toLocaleString()} RWF
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
