/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { TableFilters, createCommonFilters } from "@/components/filters";
import {
  createSubscriptionPlansColumns,
  createRestaurantSubscriptionsColumns,
  type SubscriptionPlan,
  type RestaurantSubscription,
} from "./_components/subscription-columns";
import { subscriptionService } from "@/app/services/subscriptionService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ActiveTab = "plans" | "subscriptions";

const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "ACTIVE" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "Pending", value: "PENDING" },
];

const paymentStatusOptions = [
  { label: "All Payment Status", value: "all" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Pending", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Failed", value: "FAILED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Refunded", value: "REFUNDED" },
];

export default function AdminSubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("subscriptions");
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >([]);
  const [restaurantSubscriptions, setRestaurantSubscriptions] = useState<
    RestaurantSubscription[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Filter states for subscriptions
  const [searchValue, setSearchValue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");

  // Filter states for plans
  const [planSearchValue, setPlanSearchValue] = useState("");
  const [planStatusFilter, setPlanStatusFilter] = useState("all");

  // Create plan modal
  const [createPlanOpen, setCreatePlanOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    features: [] as string[],
  });
  const [currentFeature, setCurrentFeature] = useState("");

  // Load data
  const loadSubscriptionPlans = async () => {
    try {
      const params: any = {};
      if (planStatusFilter !== "all") {
        params.isActive = planStatusFilter === "active";
      }

      const response = await subscriptionService.getAllSubscriptionPlans(
        params
      );

      if (response.data && Array.isArray(response.data)) {
        setSubscriptionPlans(response.data);
      }
    } catch (error) {
      console.error("Failed to load subscription plans:", error);
      toast.error("Failed to load subscription plans");
    }
  };

  const loadRestaurantSubscriptions = async () => {
    try {
      const params: any = {};
      if (selectedStatus !== "all") params.status = selectedStatus;
      if (selectedPaymentStatus !== "all")
        params.paymentStatus = selectedPaymentStatus;

      const response = await subscriptionService.getAllSubscriptions(params);
      if (response.data && Array.isArray(response.data)) {
        setRestaurantSubscriptions(response.data);
      }
    } catch (error) {
      console.error("Failed to load subscriptions:", error);
      toast.error("Failed to load subscriptions");
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSubscriptionPlans(),
        loadRestaurantSubscriptions(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filter data
  const filteredSubscriptionPlans = useMemo(() => {
    let filtered = subscriptionPlans;

    if (planSearchValue) {
      const searchLower = planSearchValue.toLowerCase();
      filtered = filtered.filter(
        (plan) =>
          plan.name.toLowerCase().includes(searchLower) ||
          plan.description?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [subscriptionPlans, planSearchValue]);

  const filteredRestaurantSubscriptions = useMemo(() => {
    let filtered = restaurantSubscriptions;

    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(
        (subscription) =>
          subscription.restaurant.name.toLowerCase().includes(searchLower) ||
          subscription.restaurant.email.toLowerCase().includes(searchLower) ||
          subscription.plan.name.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [restaurantSubscriptions, searchValue]);

  // Create new plan
  const handleCreatePlan = async () => {
    try {
      if (!newPlan.name || !newPlan.price || !newPlan.duration) {
        toast.error("Please fill in all required fields");
        return;
      }

      const planData = {
        name: newPlan.name,
        description: newPlan.description,
        price: Number.parseFloat(newPlan.price),
        duration: Number.parseInt(newPlan.duration),
        features: newPlan.features,
      };

      const response = await subscriptionService.createSubscriptionPlan(
        planData
      );

      if (response?.success) {
        toast.success("Subscription plan created successfully");
        setCreatePlanOpen(false);
        setNewPlan({
          name: "",
          description: "",
          price: "",
          duration: "",
          features: [],
        });
        setCurrentFeature("");
        await loadSubscriptionPlans();
      }
    } catch (error: any) {
      console.error("Failed to create plan:", error);
      toast.error(
        error.response?.data?.message || "Failed to create subscription plan"
      );
    }
  };

  const addFeature = () => {
    if (currentFeature.trim()) {
      setNewPlan((prev) => ({
        ...prev,
        features: [...prev.features, currentFeature.trim()],
      }));
      setCurrentFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setNewPlan((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleExport = async () => {
    try {
      // Implement export functionality based on active tab
      if (activeTab === "plans") {
        toast.success("Exporting subscription plans data...");
      } else {
        toast.success("Exporting subscriptions data...");
      }
    } catch (error) {
      toast.error("Export failed");
    }
  };

  const handleRefresh = async () => {
    await loadAllData();
    toast.success("Data refreshed successfully");
  };

  const planFilters = [
    createCommonFilters.search(
      planSearchValue,
      setPlanSearchValue,
      "Search plans..."
    ),
    createCommonFilters.status(planStatusFilter, setPlanStatusFilter, [
      { label: "All Status", value: "all" },
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ]),
  ];

  const subscriptionFilters = [
    createCommonFilters.search(
      searchValue,
      setSearchValue,
      "Search by restaurant or plan..."
    ),
    createCommonFilters.status(
      selectedStatus,
      setSelectedStatus,
      statusOptions
    ),
    createCommonFilters.status(
      selectedPaymentStatus,
      setSelectedPaymentStatus,
      paymentStatusOptions
    ),
  ];

  const subscriptionPlansColumns = useMemo(
    () => createSubscriptionPlansColumns(loadSubscriptionPlans),
    []
  );

  const restaurantSubscriptionsColumns = useMemo(
    () => createRestaurantSubscriptionsColumns(loadRestaurantSubscriptions),
    []
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Subscription Management
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === "plans" && (
            <Dialog open={createPlanOpen} onOpenChange={setCreatePlanOpen}>
              <DialogTrigger asChild>
                <Button variant="green">
                  <Plus className="h-4 w-4" />
                  Create Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Subscription Plan</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Plan Name *</Label>
                    <Input
                      id="name"
                      value={newPlan.name}
                      onChange={(e) =>
                        setNewPlan((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="e.g., Premium Plan"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newPlan.description}
                      onChange={(e) =>
                        setNewPlan((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Plan description..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">
                        Price{" "}
                        <span className="text-[12px] text-gray-600">/ FRW</span>
                        *
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={newPlan.price}
                        onChange={(e) =>
                          setNewPlan((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                        placeholder="50000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">
                        Duration{" "}
                        <span className="text-[12px] text-gray-600">
                          / days
                        </span>
                        *
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        value={newPlan.duration}
                        onChange={(e) =>
                          setNewPlan((prev) => ({
                            ...prev,
                            duration: e.target.value,
                          }))
                        }
                        placeholder="30"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="features">Features</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={currentFeature}
                          onChange={(e) => setCurrentFeature(e.target.value)}
                          placeholder="Add a feature..."
                          onKeyPress={(e) => e.key === "Enter" && addFeature()}
                        />
                        <Button
                          variant="green"
                          type="button"
                          onClick={addFeature}
                          size="sm"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {newPlan.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-50 px-3 rounded "
                          >
                            <span className="text-[12px]">
                              {" "}
                              <span className="font-medium">
                                {index + 1}.
                              </span>{" "}
                              {feature}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFeature(index)}
                              className="text-green-700 text-[12px]"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="green"
                    onClick={handleCreatePlan}
                    className="w-full"
                  >
                    Create Plan
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("subscriptions")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "subscriptions"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Restaurant Subscriptions
            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
              {restaurantSubscriptions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("plans")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "plans"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Subscription Plans
            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
              {subscriptionPlans.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === "subscriptions" ? (
        <DataTable
          columns={restaurantSubscriptionsColumns}
          data={filteredRestaurantSubscriptions}
          title="Restaurant Subscriptions"
          description={""}
          showExport={true}
          onExport={handleExport}
          showAddButton={false}
          customFilters={<TableFilters filters={subscriptionFilters} />}
          showSearch={false}
          showColumnVisibility={true}
          showPagination={true}
          showRowSelection={true}
        />
      ) : (
        <DataTable
          columns={subscriptionPlansColumns}
          data={filteredSubscriptionPlans}
          title="Subscription Plans"
          description={""}
          showExport={true}
          onExport={handleExport}
          showAddButton={false}
          customFilters={<TableFilters filters={planFilters} />}
          showSearch={false}
          showColumnVisibility={true}
          showPagination={true}
          showRowSelection={true}
        />
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
        </div>
      )}
    </div>
  );
}
