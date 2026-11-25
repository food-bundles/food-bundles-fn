"use client";

import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { dishCost, fullRwf, margin, suggestedPrice, TARGET_FOOD_COST } from "@/lib/menu-designer/costing";
import type { MenuDish, PricedProduct } from "@/lib/menu-designer/types";
import { CostChip } from "./CostChip";
import { IngredientsEditor } from "./IngredientsEditor";
import { PhotoPicker } from "./PhotoPicker";

/** Everything about one dish: name, description, price, photo, and what one plate costs at Food Bundles prices */
export function DishDialog({
  dish,
  sectionPrice,
  products,
  onClose,
  onSave,
}: {
  dish: MenuDish | null;
  sectionPrice?: number;
  products: PricedProduct[];
  onClose: () => void;
  onSave: (dish: MenuDish) => void;
}) {
  const [draft, setDraft] = useState<MenuDish | null>(dish);
  useEffect(() => setDraft(dish), [dish]);
  if (!draft) return null;

  const { cost, missing } = dishCost(draft, products);
  const price = draft.price ?? sectionPrice;
  const m = margin(price, cost);
  const suggested = suggestedPrice(cost);
  const set = (patch: Partial<MenuDish>) => setDraft({ ...draft, ...patch });

  return (
    <Dialog open={!!dish} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dish?.name ? `Edit ${dish.name}` : "New dish"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="dish-name">Dish name</Label>
            <Input id="dish-name" value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="Beef stew" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dish-desc">Description (optional)</Label>
            <Textarea id="dish-desc" rows={2} value={draft.description ?? ""} onChange={(e) => set({ description: e.target.value })} placeholder="Served with fries, rice or potatoes" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dish-price">Selling price (RWF)</Label>
            <Input
              id="dish-price"
              type="number"
              min={0}
              step={100}
              value={draft.price ?? ""}
              onChange={(e) => set({ price: e.target.value === "" ? undefined : Math.max(0, Number(e.target.value)) })}
              placeholder={sectionPrice ? `Section price: ${fullRwf(sectionPrice)}` : "e.g. 8500"}
            />
            {sectionPrice && draft.price === undefined && (
              <p className="text-xs text-muted-foreground">Empty: this dish sells at the section price ({fullRwf(sectionPrice)}).</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label>Photo</Label>
            <PhotoPicker value={draft.image} onChange={(image) => set({ image })} />
          </div>

          <div className="grid gap-2 rounded-xl border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label>Ingredients for one plate (Food Bundles prices)</Label>
              <CostChip cost={cost} price={price} missing={missing.length} />
            </div>
            <IngredientsEditor value={draft.ingredients} onChange={(ingredients) => set({ ingredients })} products={products} />
            {cost > 0 && (
              <div className="mt-1 flex flex-wrap items-center gap-3 rounded-lg bg-green-50 p-3 text-sm text-green-900">
                <Lightbulb className="h-4 w-4 shrink-0" />
                <span className="flex-1">
                  One plate costs <b>{fullRwf(cost)}</b>.{" "}
                  {m !== null && (
                    <>
                      At {fullRwf(price!)} you keep <b>{Math.round(m * 100)}%</b>.{" "}
                    </>
                  )}
                  For food to be {Math.round(TARGET_FOOD_COST * 100)}% of the price, sell at about <b>{fullRwf(suggested)}</b>.
                </span>
                {suggested !== draft.price && (
                  <Button type="button" size="sm" variant="outline" onClick={() => set({ price: suggested })}>
                    Use {fullRwf(suggested)}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave({ ...draft, name: draft.name.trim() })} disabled={!draft.name.trim()} className="bg-green-700 hover:bg-green-600">
            Save dish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
