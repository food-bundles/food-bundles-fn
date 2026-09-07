"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  const { getAllProducts } = useProducts();
  const { paymentMethods } = usePaymentMethods();

  const [products, setProducts] = useState<Product[]>([]);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPaymentMethod = paymentMethods.find(
    (method) => method.id === selectedPaymentMethodId
  );

  useEffect(() => {
    if (!open) return;

    const fetchProducts = async () => {
      const response = await getAllProducts();
      if (response.success) {
        setProducts(response.data);
      }
    };

    fetchProducts();
  }, [open, getAllProducts]);

  const resetState = () => {
    setLineItems([]);
    setSelectedPaymentMethodId("");
  };

  const addProduct = (product: Product) => {
    setComboboxOpen(false);
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
        toast.success("Order created successfully");
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
          <p className="text-xs text-gray-500">
            For a quick order with a few items. Need the full catalog with
            categories and search?{" "}
            <Link
              href="/restaurant"
              className="text-green-600 underline"
              onClick={() => onOpenChange(false)}
            >
              Use the Shop instead
            </Link>
            .
          </p>

          <div className="space-y-2">
            <Label>Add Product</Label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
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
