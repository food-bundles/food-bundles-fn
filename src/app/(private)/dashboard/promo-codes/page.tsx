"use client";

import { useState, useRef } from "react";
import { PromoProvider } from "@/app/contexts/PromoContext";
import { RestaurantProvider } from "@/app/contexts/RestaurantContext";
import PromoCodesTable from "./_components/PromoCodesTable";
import CreatePromoForm from "./_components/CreatePromoForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function PromoCodeManagementPage() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const createPromoRef = useRef<{ openModal: () => void }>(null);

    const handleCreatePromo = () => {
        createPromoRef.current?.openModal();
    };

    const handlePromoCreated = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <PromoProvider>
            <RestaurantProvider>
                <div className="p-6 max-w-7xl mx-auto">
                    <div className="mb-8 flex justify-between items-end">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Promo Code Management
                            </h1>
                            <p className="hidden lg:block text-gray-600 text-sm">
                                Create and manage promotional codes for your customers
                            </p>
                        </div>
                        <Button
                            onClick={handleCreatePromo}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Promo Code
                        </Button>
                    </div>

                    <div className="space-y-6">
                        <PromoCodesTable
                            onCreatePromo={handleCreatePromo}
                            key={refreshTrigger}
                        />
                    </div>

                    <CreatePromoForm ref={createPromoRef} onSuccess={handlePromoCreated} />
                </div>
            </RestaurantProvider>
        </PromoProvider>
    );
}
