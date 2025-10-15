"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PaymentModal from "./_components/PaySubscribtionModel";

export default function SubscribePage() {
  const [openModal, setOpenModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    plan: string;
    price: string;
  } | null>(null);
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-center mb-8">
          Choose Your Subscription Plan
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Basic Plan */}
          <Card className=" flex items-center p-6 border border-green-200 hover:border-green-400 transition-colors rounded shadow-none">
            <div className="text-center ">
              <Badge className="bg-green-100 text-green-800 mb-2 rounded">
                Basic Plan
              </Badge>
              <div className="text-xl font-bold text-black">20,000 Rwf</div>
              <div className="text-gray-800">per month</div>
            </div>
            <div className="space-y-3 mb-1">
              <div className="flex items-start space-x-2">
                <p className="text-green-500 text-[16px] mr-2">🗸</p>
                <span className="text-gray-800 text-[13px]">
                  Receive EBM Purchase Orders
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <p className="text-green-500 text-[16px] mr-2">🗸</p>
                <span className="text-gray-800 text-[13px]">Stable Price</span>
              </div>
              <div className="flex items-start space-x-2">
                <p className="text-green-500 text-[16px] mr-2">🗸</p>
                <span className="text-gray-800 text-[13px]">Free delivery</span>
              </div>
            </div>
            <button
              className="w-1/2 bg-green-600 hover:bg-green-700 text-white rounded p-1 text-[14px] mt-auto"
              onClick={() => {
                setSelectedPlan({ plan: "Basic Plan", price: "5,000 Rwf" });
                setOpenModal(true);
              }}
            >
              Choose Basic
            </button>
          </Card>

          {/* Premium Plan */}
          <Card className="flex items-center p-6 border border-yellow-300 hover:border-yellow-400 transition-colors relative rounded shadow-none">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-yellow-500 text-white rounded">
                Most Popular
              </Badge>
            </div>
            <div className="text-center ">
              <Badge className="bg-yellow-100 text-yellow-800 mb-2 rounded">
                Premium Plan
              </Badge>
              <div className="text-xl font-bold text-black">50,000 Rwf</div>
              <div className="text-gray-800">per month</div>
            </div>
            <div className="space-y-3 mb-1">
              <div className="flex items-start space-x-2">
                <p className="text-green-500 text-16px] mr-2">🗸</p>
                <span className="text-gray-800 text-[13px]">
                  Receive EBM Purchase Orders
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <p className="text-green-500 text-[16px] mr-2">🗸</p>
                <span className="text-gray-800 text-[13px]">
                  Stable Price & Free Delivery
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <p className="text-green-500 text-[16px] mr-2">🗸</p>
                <span className="text-gray-800 text-[13px]">
                  Advertising Connect your products to reach more guests.
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <p className="text-green-500 text-[16px] mr-2">🗸</p>
                <span className="text-gray-800 text-[13px]">
                  Make Orders on Credit,
                </span>
              </div>
            </div>
            <button
              className="w-1/2 bg-yellow-500 hover:bg-yellow-600 text-white text-[14px] rounded py-1 mt-auto"
              onClick={() => {
                setSelectedPlan({ plan: "Premium Plan", price: "10,000 Rwf" });
                setOpenModal(true);
              }}
            >
              Choose Premium
            </button>
          </Card>
        </div>
      </div>
      <PaymentModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        plan={selectedPlan?.plan || ""}
        price={selectedPlan?.price || ""}
      />
    </div>
  );
}
