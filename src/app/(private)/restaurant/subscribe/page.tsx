"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PaymentModal from "./_components/PaySubscribtionModel";
import {
  subscriptionService,
  SubscriptionPlan,
} from "@/app/services/subscriptionService";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

export default function SubscribePage() {
  const [openModal, setOpenModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const response = await subscriptionService.getAllSubscriptionPlans({
        isActive: true,
      });
      console.log("response+++++++++++++", response);
      if (response.data && Array.isArray(response.data)) {
        const orderedPlans = [...response.data].sort(
          (a, b) => a.price - b.price
        );
        setPlans(orderedPlans);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner variant="ring" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-center mb-8">
          Choose Your Subscription Plan
        </h1>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {plans.map((plan) => {
            const isPopular = plan.name.toLowerCase().includes("premium");
            const borderColor = isPopular
              ? "border-yellow-300 hover:border-yellow-400"
              : "border-green-200 hover:border-green-400";
            const buttonColor = isPopular
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-green-600 hover:bg-green-700";

            return (
              <Card
                key={plan.id}
                className={`w-[250px] h-[450px] flex flex-col items-center p-6 ${borderColor} transition-colors relative rounded shadow-none`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-yellow-500 text-white rounded">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <div className="text-center">
                  <Badge
                    className={`${
                      isPopular
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    } mb-2 rounded`}
                  >
                    {plan.name}
                  </Badge>
                  <div className="text-xl font-bold text-black">
                    {plan.price.toLocaleString()} Rwf
                  </div>
                  <div className="text-gray-800">per {plan.duration} days</div>
                </div>
                <div className="space-y-3 mb-1 flex-1">
                  {plan.features &&
                    Array.isArray(plan.features) &&
                    plan.features.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <p className="text-green-500 text-[16px] mr-2">🗸</p>
                        <span className="text-gray-800 text-[13px]">
                          {feature}
                        </span>
                      </div>
                    ))}
                </div>
                <button
                  className={`${buttonColor} text-white text-[14px] rounded py-1 px-2 mt-auto`}
                  onClick={() => {
                    setSelectedPlan(plan);
                    setOpenModal(true);
                  }}
                >
                  Choose {plan.name}
                </button>
              </Card>
            );
          })}
        </div>
      </div>
      <PaymentModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        plan={selectedPlan}
      />
    </div>
  );
}
