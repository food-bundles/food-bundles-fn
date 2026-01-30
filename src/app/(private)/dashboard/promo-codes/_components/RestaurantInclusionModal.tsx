"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Trash2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRestaurants, Restaurant } from "@/app/contexts/RestaurantContext";
import { usePromo } from "@/app/contexts/PromoContext";
import { IPromoCode } from "@/app/services/promoService";

interface RestaurantInclusionModalProps {
    promo: IPromoCode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function RestaurantInclusionModal({ promo, open, onOpenChange }: RestaurantInclusionModalProps) {
    const { getAllRestaurants } = useRestaurants();
    const { includeRestaurant, removeInclusion } = usePromo();

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
    const [comboboxOpen, setComboboxOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            const fetchRestaurants = async () => {
                const response = await getAllRestaurants({ limit: 100 });
                if (response.success) {
                    setRestaurants(response.data);
                }
            };
            fetchRestaurants();
        }
    }, [open, getAllRestaurants]);

    const handleInclude = async () => {
        if (!selectedRestaurant || !reason) return;
        setLoading(true);
        try {
            await includeRestaurant(promo.id, selectedRestaurant.id, reason);
            setSelectedRestaurant(null);
            setReason("");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveInclusion = async (restaurantId: string) => {
        setLoading(true);
        try {
            await removeInclusion(promo.id, restaurantId);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Include Specific Restaurant: {promo.code}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-start gap-3">
                        <Info className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-green-800">About Inclusions</p>
                            <p className="text-xs text-green-700">Included restaurants will be specifically allowed to use this promo code, overriding global settings if applicable.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end border-b pb-6">
                        <div className="space-y-2">
                            <Label>Select Restaurant</Label>
                            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-between"
                                    >
                                        {selectedRestaurant ? selectedRestaurant.name : "Select restaurant..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search restaurants..." />
                                        <CommandList>
                                            <CommandEmpty>No restaurant found.</CommandEmpty>
                                            <CommandGroup>
                                                {restaurants.map((restaurant) => (
                                                    <CommandItem
                                                        key={restaurant.id}
                                                        onSelect={() => {
                                                            setSelectedRestaurant(restaurant);
                                                            setComboboxOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedRestaurant?.id === restaurant.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {restaurant.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label>Reason</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Reason for inclusion (e.g. VIP customer)"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                                <Button
                                    onClick={handleInclude}
                                    disabled={loading || !selectedRestaurant || !reason}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    Include
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-base">Currently Included ({promo.includedRestaurants?.length || 0})</Label>
                        <div className="max-h-[300px] overflow-y-auto space-y-2">
                            {promo.includedRestaurants && promo.includedRestaurants.length > 0 ? (
                                promo.includedRestaurants.map((inclusion) => {
                                    const restaurant = restaurants.find(r => r.id === inclusion.restaurantId);
                                    return (
                                        <div key={inclusion.restaurantId} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                                            <div>
                                                <p className="font-medium text-sm text-green-800">{restaurant?.name || "Loading..."}</p>
                                                <p className="text-xs text-green-600 italic">Reason: {inclusion.reason}</p>
                                                <p className="text-[10px] text-green-500 mt-1">Included on {new Date(inclusion.includedAt).toLocaleDateString()}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveInclusion(inclusion.restaurantId)}
                                                disabled={loading}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-gray-500 text-sm">
                                    No restaurants are specifically included for this promo code.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
