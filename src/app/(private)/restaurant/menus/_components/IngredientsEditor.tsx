"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { fullRwf } from "@/lib/menu-designer/costing";
import type { MenuIngredient, PricedProduct } from "@/lib/menu-designer/types";

/** Pick a Food Bundles product for one ingredient (searchable) */
function ProductPicker({ products, value, onPick }: { products: PricedProduct[]; value?: string; onPick: (p: PricedProduct) => void }) {
  const [open, setOpen] = useState(false);
  const current = products.find((p) => p.id === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="h-9 w-full justify-between font-normal">
          <span className={`truncate ${current ? "" : "text-red-600"}`}>{current ? current.name : "Not on Food Bundles: choose"}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search products…" />
          <CommandList>
            <CommandEmpty>No product found.</CommandEmpty>
            <CommandGroup>
              {products.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.name} ${p.id}`}
                  onSelect={() => {
                    onPick(p);
                    setOpen(false);
                  }}
                >
                  <Check className={`mr-2 h-4 w-4 ${p.id === value ? "opacity-100" : "opacity-0"}`} />
                  <span className="flex-1 truncate">{p.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {fullRwf(p.price)}/{p.unit}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/** What one plate uses: each line is a Food Bundles product and a quantity in its unit */
export function IngredientsEditor({
  value,
  onChange,
  products,
}: {
  value: MenuIngredient[];
  onChange: (next: MenuIngredient[]) => void;
  products: PricedProduct[];
}) {
  const set = (i: number, patch: Partial<MenuIngredient>) => onChange(value.map((g, j) => (j === i ? { ...g, ...patch } : g)));

  return (
    <div className="space-y-2">
      {value.length === 0 && <p className="text-sm text-muted-foreground">Add what goes on one plate to see its cost.</p>}
      {value.map((g, i) => {
        const product = products.find((p) => p.id === g.productId);
        return (
          <div key={i} className="grid grid-cols-[1fr_88px_90px_32px] items-center gap-2">
            <ProductPicker products={products} value={g.productId} onPick={(p) => set(i, { productId: p.id, name: p.name })} />
            <div className="relative">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={Number.isFinite(g.qty) ? g.qty : 0}
                onChange={(e) => set(i, { qty: Math.max(0, Number(e.target.value) || 0) })}
                className="h-9 pr-8"
                aria-label={`Quantity of ${g.name} per plate`}
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {product?.unit ?? ""}
              </span>
            </div>
            <span className="text-right text-sm tabular-nums">{product ? fullRwf(product.price * g.qty) : "—"}</span>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove ingredient">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...value, { name: "", qty: 0.1 }])}>
        <Plus className="mr-1 h-4 w-4" /> Add ingredient
      </Button>
    </div>
  );
}
