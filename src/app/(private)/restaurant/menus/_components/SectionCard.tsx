"use client";

import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dishCost, fullRwf, sellingPrice } from "@/lib/menu-designer/costing";
import type { MenuDish, MenuSection, PricedProduct } from "@/lib/menu-designer/types";
import { CostChip } from "./CostChip";

/** One part of the menu (Starters, Lunch special…): its title, optional set price, and dishes */
export function SectionCard({
  section,
  products,
  onChange,
  onRemove,
  onMove,
  onEditDish,
  onAddDish,
}: {
  section: MenuSection;
  products: PricedProduct[];
  onChange: (section: MenuSection) => void;
  onRemove: () => void;
  onMove: (step: -1 | 1) => void;
  onEditDish: (dish: MenuDish) => void;
  onAddDish: () => void;
}) {
  const set = (patch: Partial<MenuSection>) => onChange({ ...section, ...patch });
  const moveDish = (i: number, step: -1 | 1) => {
    const j = i + step;
    if (j < 0 || j >= section.dishes.length) return;
    const dishes = [...section.dishes];
    [dishes[i], dishes[j]] = [dishes[j], dishes[i]];
    set({ dishes });
  };

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Input value={section.title} onChange={(e) => set({ title: e.target.value })} className="h-9 flex-1 min-w-40 font-semibold" placeholder="Section title" aria-label="Section title" />
        <Input
          type="number"
          min={0}
          step={500}
          value={section.price ?? ""}
          onChange={(e) => set({ price: e.target.value === "" ? undefined : Math.max(0, Number(e.target.value)) })}
          className="h-9 w-40"
          placeholder="Set price (optional)"
          aria-label="One price for the whole section"
        />
        <Button type="button" variant="ghost" size="icon" onClick={() => onMove(-1)} aria-label="Move section up">
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => onMove(1)} aria-label="Move section down">
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label="Delete section" className="text-red-600">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <Input value={section.note ?? ""} onChange={(e) => set({ note: e.target.value })} className="mt-2 h-9 text-sm" placeholder="Note under the title (optional)" aria-label="Section note" />

      <ul className="mt-3 divide-y">
        {section.dishes.map((d, i) => {
          const { cost, missing } = dishCost(d, products);
          const price = sellingPrice(d, section);
          return (
            <li key={d.id} className="flex items-center gap-3 py-2">
              {d.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={d.image} alt="" className="h-11 w-14 rounded-md object-cover" />
              ) : (
                <div className="h-11 w-14 rounded-md bg-muted" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{d.name || "Untitled dish"}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{price ? (d.price === undefined ? `Set price ${fullRwf(price)}` : fullRwf(price)) : "No price"}</span>
                  <CostChip cost={cost} price={price} missing={missing.length} />
                </div>
              </div>
              <div className="flex">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveDish(i, -1)} aria-label="Move dish up">
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveDish(i, 1)} aria-label="Move dish down">
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditDish(d)} aria-label={`Edit ${d.name}`}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600"
                  onClick={() => set({ dishes: section.dishes.filter((x) => x.id !== d.id) })}
                  aria-label={`Delete ${d.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
      <Button type="button" variant="outline" size="sm" className="mt-2" onClick={onAddDish}>
        <Plus className="mr-1 h-4 w-4" /> Add dish
      </Button>
    </div>
  );
}
