"use client";

import { useState, useEffect } from "react";
import { X, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { subscriptionService, SubscriptionPlan, RestaurantSubscription } from "@/app/services/subscriptionService";
import { toast } from "sonner";
import UpgradeDrawer from "./UpgradeDrawer";

interface PlanSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubscription: RestaurantSubscription;
}

export default function PlanSelectionDrawer({ 
  isOpen, 
  onClose, 
  currentSubscription 
}: PlanSelectionDrawerProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [upgradeDrawerOpen, setUpgradeDrawerOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await subscriptionService.getAllSubscriptionPlans({
        isActive: true,
      });
      if (response.data && Array.isArray(response.data)) {
        // Filter out current plan and sort by price
        const availablePlans = response.data
          .filter(plan => plan.id !== currentSubscription.plan.id)
          .sort((a, b) => a.price - b.price);
        setPlans(availablePlans);
      }
    } catch (error) {
      toast.error("Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setUpgradeDrawerOpen(true);
  };

  const handleUpgradeSuccess = () => {
    onClose();
    // Refresh parent component if needed
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full bg-white text-gray-900 z-50 transform transition-all duration-300 ease-in-out overflow-y-auto shadow-2xl border-l border-gray-200 scrollbar-hide
          w-[90vw] sm:w-[500px] md:w-[600px]
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-green-700 border-b border-gray-200 flex justify-between items-center px-6 py-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-white" />
            <span className="text-[15px] text-white font-bold">
              Select New Plan
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors hover:rotate-90 transform duration-200"
          >
            <X className="w-5 h-5 text-white cursor-pointer" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-gray-100 space-y-6">
          {/* Current Plan Info */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Current Plan
            </h3>
            <div className="flex justify-between items-center">
              <div>
                <Badge className="bg-blue-100 text-blue-800 mb-2">
                  {currentSubscription.plan.name}
                </Badge>
                <p className="text-sm text-gray-600">
                  {currentSubscription.plan.price.toLocaleString()} RWF / {currentSubscription.plan.duration} days
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Remaining</p>
                <p className="font-semibold text-green-600">
                  {currentSubscription.daysRemaining || 0} days
                </p>
              </div>
            </div>
          </div>

          {/* Available Plans */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Available Plans
            </h3>
            
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {plans.map((plan) => {
                  const isUpgrade = plan.price > currentSubscription.plan.price;
                  const isPopular = plan.name.toLowerCase().includes("premium");
                  
                  return (
                    <Card
                      key={plan.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md border-2 ${
                        isPopular ? "border-yellow-200 bg-yellow-50" : "border-gray-200 hover:border-green-300"
                      }`}
                      onClick={() => handlePlanSelect(plan)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${
                              isPopular ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                            }`}>
                              {plan.name}
                            </Badge>
                            {isPopular && (
                              <Badge className="bg-yellow-500 text-white text-xs">
                                Popular
                              </Badge>
                            )}
                            <Badge variant={isUpgrade ? "default" : "secondary"} className="text-xs">
                              {isUpgrade ? "Upgrade" : "Downgrade"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {plan.price.toLocaleString()} RWF / {plan.duration} days
                          </p>
                          <p className="text-xs text-gray-500">
                            {isUpgrade ? "+" : "-"}{Math.abs(plan.price - currentSubscription.plan.price).toLocaleString()} RWF difference
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          Select
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Drawer */}
      {selectedPlan && (
        <UpgradeDrawer
          isOpen={upgradeDrawerOpen}
          onClose={() => setUpgradeDrawerOpen(false)}
          currentSubscription={currentSubscription}
          selectedPlan={selectedPlan}
          onSuccess={handleUpgradeSuccess}
        />
      )}
    </>
  );
}