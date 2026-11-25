"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { productService } from "@/app/services/productService";
import { useAuth } from "@/app/contexts/auth-context";
import type { PricedProduct } from "@/lib/menu-designer/types";

const ROLE_TO_TYPE: Record<string, string> = { HOTEL: "Hotel", RESTAURANT: "Restaurant", AFFILIATOR: "Restaurant" };

/** The price this customer pays, same rule as the shop */
const customerPrice = (product: any, role: string, customerTypeId?: string | null): number => {
  const prices: any[] = product.customerTypePrices || [];
  const base = Number(product.unitPrice) || 0;
  if (customerTypeId) return Number(prices.find((p) => p.customerType?.id === customerTypeId)?.price ?? base);
  const target = ROLE_TO_TYPE[role]?.toLowerCase();
  const match = target ? prices.find((p) => p.customerType?.name?.toLowerCase() === target) : undefined;
  return Number(match?.price ?? base);
};

/** Food Bundles products at this customer's prices, to cost each dish */
export function useMenuProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<PricedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    productService
      .getAllProducts({ limit: 500 })
      .then((res: any) => {
        const list: any[] = res?.data?.products ?? res?.data ?? [];
        if (!alive) return;
        setProducts(
          list.map((p) => ({
            id: p.id,
            name: p.productName,
            unit: p.unit || "kg",
            price: customerPrice(p, user?.role || "RESTAURANT", (user as any)?.customerTypeId),
          })),
        );
      })
      .catch(() => alive && setProducts([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [user]);

  return { products, loading };
}
