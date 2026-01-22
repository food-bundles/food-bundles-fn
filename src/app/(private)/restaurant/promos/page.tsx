"use client";

import RestaurantAvailablePromos from "../_components/RestaurantAvailablePromos";
import { Ticket, Gift } from "lucide-react";

export default function PromotionsPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8" style={{ fontFamily: 'inherit' }}>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Gift className="h-6 w-6 text-green-600" />
                        Available Promotions
                    </h1>
                    <p className="text-gray-500 text-sm italic">
                        Explore active offers and campaign promo codes you can apply to your orders.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="mb-6 flex items-center gap-2 pb-4 border-b border-gray-50">
                    <div className="h-4 w-1 bg-green-500 rounded-full" />
                    <h2 className="text-lg font-semibold text-gray-800">Public Campaign Offers</h2>
                </div>

                <RestaurantAvailablePromos />
            </div>

            <div className="bg-green-50 rounded-xl p-8 border border-green-100 flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-white rounded-full text-green-600 shadow-sm border border-green-100">
                    <Ticket className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-green-900">How to use promo codes?</h3>
                <p className="text-green-800 text-sm max-w-md">
                    Copy the promo code of your choice and paste it into the "Promo Code" field during checkout.
                    The discount will be automatically applied to your order total.
                </p>
            </div>
        </div>
    );
}
