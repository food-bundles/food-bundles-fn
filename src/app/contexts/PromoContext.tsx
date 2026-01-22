"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { IPromoCode, promoService, ICreatePromoData } from "../services/promoService";
import { toast } from "sonner";

interface PromoContextType {
    promos: IPromoCode[];
    loading: boolean;
    error: string | null;
    fetchPromos: () => Promise<void>;
    createPromo: (data: ICreatePromoData) => Promise<void>;
    updatePromo: (id: string, data: Partial<ICreatePromoData>) => Promise<void>;
    deletePromo: (id: string) => Promise<void>;
    excludeRestaurant: (promoId: string, restaurantId: string, reason: string) => Promise<void>;
    removeExclusion: (promoId: string, restaurantId: string) => Promise<void>;
}

const PromoContext = createContext<PromoContextType | undefined>(undefined);

export const PromoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [promos, setPromos] = useState<IPromoCode[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPromos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await promoService.getAllPromos();
            setPromos(response.data);
        } catch (err: any) {
            setError(err.message || "Failed to fetch promo codes");
            toast.error("Failed to fetch promo codes");
        } finally {
            setLoading(false);
        }
    }, []);

    const createPromo = async (data: ICreatePromoData) => {
        try {
            await promoService.createPromo(data);
            toast.success("Promo code created successfully");
            await fetchPromos();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to create promo code");
            throw err;
        }
    };

    const updatePromo = async (id: string, data: Partial<ICreatePromoData>) => {
        try {
            await promoService.updatePromo(id, data);
            toast.success("Promo code updated successfully");
            await fetchPromos();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update promo code");
            throw err;
        }
    };

    const deletePromo = async (id: string) => {
        try {
            await promoService.deletePromo(id);
            toast.success("Promo code deleted successfully");
            await fetchPromos();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to delete promo code");
            throw err;
        }
    };

    const excludeRestaurant = async (promoId: string, restaurantId: string, reason: string) => {
        try {
            await promoService.excludeRestaurant(promoId, { restaurantId, reason });
            toast.success("Restaurant excluded successfully");
            await fetchPromos();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to exclude restaurant");
            throw err;
        }
    };

    const removeExclusion = async (promoId: string, restaurantId: string) => {
        try {
            await promoService.removeExclusion(promoId, restaurantId);
            toast.success("Restaurant exclusion removed successfully");
            await fetchPromos();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to remove exclusion");
            throw err;
        }
    };

    useEffect(() => {
        fetchPromos();
    }, [fetchPromos]);

    return (
        <PromoContext.Provider
            value={{
                promos,
                loading,
                error,
                fetchPromos,
                createPromo,
                updatePromo,
                deletePromo,
                excludeRestaurant,
                removeExclusion,
            }}
        >
            {children}
        </PromoContext.Provider>
    );
};

export const usePromo = () => {
    const context = useContext(PromoContext);
    if (context === undefined) {
        throw new Error("usePromo must be used within a PromoProvider");
    }
    return context;
};
