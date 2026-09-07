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
import { Check, ChevronsUpDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useRestaurants, Restaurant } from "@/app/contexts/RestaurantContext";
import { useProducts, Product } from "@/app/contexts/product-context";
import { usePaymentMethods } from "@/app/contexts/paymentMethodContext";
import { orderService } from "@/app/services/orderService";

interface CreateOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface LineItem {
  product: Product;
  quantity: number;
}

export default function CreateOrderModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateOrderModalProps) {
  const { getAllRestaurants } = useRestaurants();
  const { getAllProducts } = useProducts();
  const { paymentMethods } = usePaymentMethods();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(
    null
  );
  const [restaurantComboboxOpen, setRestaurantComboboxOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [productComboboxOpen, setProductComboboxOpen] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPaymentMethod = paymentMethods.find(
    (method) => method.id === selectedPaymentMethodId
  );

  useEffect(() => {
    if (!open) return;

    const fetchRestaurants = async () => {
      const response = await getAllRestaurants({ limit: 100 });
      if (response.success) {
        setRestaurants(response.data);
      }
    };

    const fetchProducts = async () => {
      const response = await getAllProducts();
      if (response.success) {
        setProducts(response.data);
      }
    };

    fetchRestaurants();
    fetchProducts();
  }, [open, getAllRestaurants, getAllProducts]);

  const resetState = () => {
    setSelectedRestaurant(null);
    setLineItems([]);
    setSelectedPaymentMethodId("");
  };

  const addProduct = (product: Product) => {
    setProductComboboxOpen(false);
    setLineItems((prev) => {
      if (prev.some((item) => item.product.id === product.id)) {
        return prev;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setLineItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setLineItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const total = lineItems.reduce(
    (sum, item) => sum + item.product.unitPrice * item.quantity,
    0
  );

  const handleSubmit = async () => {
    if (!selectedRestaurant) {
      toast.error("Please select a restaurant");
      return;
    }
    if (lineItems.length === 0) {
      toast.error("Please add at least one product");
      return;
    }
    if (!selectedPaymentMethodId) {
      toast.error("Please select a payment method");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await orderService.createDirectOrder({
        restaurantId: selectedRestaurant.id,
        items: lineItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.unitPrice,
        })),
        paymentMethod:
          (selectedPaymentMethod?.name as
            | "CASH"
            | "MOBILE_MONEY"
            | "CARD"
            | "BANK_TRANSFER") || "CASH",
      });

      if (response?.data) {
        toast.success(`Order created for ${selectedRestaurant.name}`);
        onOpenChange(false);
        resetState();
        onSuccess();
      }
    } catch (error) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(message || "Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Restaurant</Label>
            <Popover
              open={restaurantComboboxOpen}
              onOpenChange={setRestaurantComboboxOpen}
            >
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
                            setRestaurantComboboxOpen(false);
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
            <Label>Add Product</Label>
            <Popover
              open={productComboboxOpen}
              onOpenChange={setProductComboboxOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  Search products...
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[420px] p-0">
                <Command>
                  <CommandInput placeholder="Search products..." />
                  <CommandList>
                    <CommandEmpty>No product found.</CommandEmpty>
                    <CommandGroup>
                      {products.map((product) => (
                        <CommandItem
                          key={product.id}
                          onSelect={() => addProduct(product)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              lineItems.some(
                                (item) => item.product.id === product.id
                              )
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {product.productName} — {product.unitPrice.toLocaleString()} Rwf
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {lineItems.length > 0 && (
            <div className="space-y-2">
              {lineItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-2 border rounded p-2"
                >
                  <span className="flex-1 text-sm">
                    {item.product.productName}
                  </span>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.product.id, Number(e.target.value))
                    }
                    className="w-16 h-8"
                  />
                  <span className="text-sm text-gray-600 w-24 text-right">
                    {(item.product.unitPrice * item.quantity).toLocaleString()} Rwf
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.product.id)}
                    aria-label={`Remove ${item.product.productName}`}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <div className="text-right font-medium text-sm">
                Total: {total.toLocaleString()} Rwf
              </div>
            </div>
          )}

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

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
            variant="green"
          >
            {isSubmitting ? "Creating..." : "Create Order"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
