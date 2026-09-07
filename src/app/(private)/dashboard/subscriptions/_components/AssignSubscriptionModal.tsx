"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isAxiosError } from "axios";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRestaurants, Restaurant } from "@/app/contexts/RestaurantContext";
import { usePaymentMethods } from "@/app/contexts/paymentMethodContext";
import {
  subscriptionService,
  SubscriptionPlan,
} from "@/app/services/subscriptionService";

interface AssignSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AssignSubscriptionModal({
  open,
  onOpenChange,
  onSuccess,
}: AssignSubscriptionModalProps) {
  const { getAllRestaurants } = useRestaurants();
  const { paymentMethods } = usePaymentMethods();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPaymentMethod = paymentMethods.find(
    (method) => method.id === selectedPaymentMethodId
  );
  const requiresPhoneNumber = selectedPaymentMethod?.name === "MOBILE_MONEY";

  useEffect(() => {
    if (!open) return;

    const fetchRestaurants = async () => {
      const response = await getAllRestaurants({ limit: 100 });
      if (response.success) {
        setRestaurants(response.data);
      }
    };

    const fetchPlans = async () => {
      try {
        const response = await subscriptionService.getAllSubscriptionPlans({
          isActive: true,
        });
        if (response.data) {
          setPlans(response.data);
        }
      } catch {
        toast.error("Failed to load subscription plans");
      }
    };

    fetchRestaurants();
    fetchPlans();
  }, [open, getAllRestaurants]);

  const resetState = () => {
    setSelectedRestaurant(null);
    setSelectedPlanId("");
    setSelectedPaymentMethodId("");
    setPhoneNumber("");
  };

  const handleSubmit = async () => {
    if (!selectedRestaurant) {
      toast.error("Please select a restaurant");
      return;
    }
    if (!selectedPlanId) {
      toast.error("Please select a subscription plan");
      return;
    }
    if (!selectedPaymentMethodId) {
      toast.error("Please select a payment method");
      return;
    }
    if (requiresPhoneNumber && !phoneNumber) {
      toast.error("Please enter a phone number for mobile money payment");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await subscriptionService.adminCreateSubscription({
        restaurantId: selectedRestaurant.id,
        planId: selectedPlanId,
        paymentMethodId: selectedPaymentMethodId,
        ...(requiresPhoneNumber ? { phoneNumber } : {}),
      });

      if (response?.data) {
        toast.success(`Subscription created for ${selectedRestaurant.name}`);
        onOpenChange(false);
        resetState();
        onSuccess();
      }
    } catch (error) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(message || "Failed to create subscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Subscription</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Restaurant</Label>
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
              <PopoverContent className="w-[420px] p-0">
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
                              selectedRestaurant?.id === restaurant.id
                                ? "opacity-100"
                                : "opacity-0"
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
            <Label>Subscription Plan</Label>
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select plan..." />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} — {plan.price.toLocaleString()} Rwf / {plan.duration} days
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select
              value={selectedPaymentMethodId}
              onValueChange={setSelectedPaymentMethodId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select payment method..." />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {requiresPhoneNumber && (
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                placeholder="e.g. 0788123456"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
            variant="green"
          >
            {isSubmitting ? "Creating..." : "Create Subscription"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
