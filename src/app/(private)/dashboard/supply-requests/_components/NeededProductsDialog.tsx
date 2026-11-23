"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Sprout, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { productService } from "@/app/services/productService";
import { errorMessage, supplyRequestService } from "@/app/services/supplyRequestService";

type ProductOption = { id: string; productName: string; unit: string };

interface NeededProductsDialogProps {
  open: boolean;
  canEdit: boolean;
  onClose: () => void;
}

/**
 * The products Food Bundles needs from farmers now. On the app's Sell screen farmers can only find their own
 * crops and these; picking one of these registers it as one of their crops.
 */
export function NeededProductsDialog({ open, canEdit, onClose }: NeededProductsDialogProps) {
  const [products, setProducts] = useState<ProductOption[] | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setProducts(null);
    setSearch("");
    Promise.all([productService.getAllProducts({ limit: 500 }), supplyRequestService.neededProducts()])
      .then(([res, needed]: [{ data?: unknown }, { products: ProductOption[] }]) => {
        if (!active) return;
        const raw = res?.data as { products?: ProductOption[] } | ProductOption[] | undefined;
        const list = (Array.isArray(raw) ? raw : raw?.products || [])
          .map((p) => ({ id: p.id, productName: p.productName, unit: p.unit }))
          .sort((a, b) => a.productName.localeCompare(b.productName));
        const ids = needed.products.map((p) => p.id);
        setProducts(list);
        setPicked(ids);
        setSaved(ids);
      })
      .catch((e) => {
        if (!active) return;
        toast.error(errorMessage(e, "Could not load the products"));
        setProducts([]);
      });
    return () => {
      active = false;
    };
  }, [open]);

  const byId = useMemo(() => new Map((products ?? []).map((p) => [p.id, p])), [products]);
  const needle = search.trim().toLowerCase();
  const shown = (products ?? []).filter((p) => !needle || p.productName.toLowerCase().includes(needle));
  const changed = picked.length !== saved.length || picked.some((id, i) => id !== saved[i]);

  const toggle = (id: string) =>
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const save = async () => {
    setSaving(true);
    try {
      const result = await supplyRequestService.setNeededProducts(picked);
      const ids = result.products.map((p) => p.id);
      setPicked(ids);
      setSaved(ids);
      toast.success(
        ids.length
          ? `Farmers now see ${ids.length} needed product${ids.length === 1 ? "" : "s"} on the Sell screen`
          : "No product is marked as needed"
      );
      onClose();
    } catch (e) {
      toast.error(errorMessage(e, "Could not save the needed products"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !saving && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-green-600" /> Needed from farmers
          </DialogTitle>
          <DialogDescription>
            On the app&apos;s Sell screen, farmers can search only their own crops and these products (shown first, marked
            &quot;Needed&quot;). When a farmer picks one, it is added to their registered crops.
          </DialogDescription>
        </DialogHeader>

        {/* Chosen */}
        <div className="flex min-h-[40px] flex-wrap gap-1.5 rounded-lg border bg-gray-50 p-2">
          {picked.length === 0 ? (
            <span className="px-1 py-1 text-sm text-gray-500">No product chosen. Farmers then find and sell only their own crops.</span>
          ) : (
            picked.map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full bg-green-100 py-1 pl-2.5 pr-1 text-xs font-medium text-green-800"
              >
                {byId.get(id)?.productName ?? "…"}
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => toggle(id)}
                    className="rounded-full p-0.5 hover:bg-green-200"
                    aria-label={`Remove ${byId.get(id)?.productName ?? "product"}`}
                    disabled={saving}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" className="pl-9" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border">
          {products === null ? (
            <div className="space-y-2 p-3">
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
            </div>
          ) : shown.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-500">No product matches.</p>
          ) : (
            <ul className="divide-y">
              {shown.map((p) => {
                const on = picked.includes(p.id);
                return (
                  <li key={p.id}>
                    <label
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm",
                        canEdit ? "cursor-pointer hover:bg-gray-50" : "cursor-default",
                        on && "bg-green-50/60"
                      )}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-green-600"
                        checked={on}
                        disabled={!canEdit || saving}
                        onChange={() => toggle(p.id)}
                      />
                      <span className="flex-1 font-medium text-gray-900">{p.productName}</span>
                      <span className="text-xs text-gray-500">{p.unit}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {canEdit ? "Cancel" : "Close"}
          </Button>
          {canEdit && (
            <Button onClick={save} disabled={saving || !changed} className="bg-green-600 hover:bg-green-700">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save {picked.length} product{picked.length === 1 ? "" : "s"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
