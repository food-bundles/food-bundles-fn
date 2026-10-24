"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardList, Loader2, MapPin, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  errorMessage,
  FarmerOpenRequest,
  supplyRequestService,
} from "@/app/services/supplyRequestService";

type Line = FarmerOpenRequest["lines"][number] & { customerType: string };

const formatDay = (day: string) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

/**
 * Products customers (schools, hotels…) need, posted by Food Bundles
 * aggregators. The farmer supplies one, several or all of them.
 */
export function RequestedProducts({
  onSubmitted,
  showEmpty = false,
}: {
  onSubmitted?: () => void;
  /** Show a message when nothing is needed (the dedicated page) instead of hiding */
  showEmpty?: boolean;
}) {
  const [requests, setRequests] = useState<FarmerOpenRequest[] | null>(null);
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState<Line | null>(null);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setRequests((await supplyRequestService.openForFarmers()) || []);
    } catch {
      setRequests([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openSupply = (line: Line) => {
    setTarget(line);
    setQuantity(String(line.missing));
    setPrice(String(line.price));
  };

  const submit = async () => {
    if (!target) return;
    setSaving(true);
    try {
      await supplyRequestService.submitAsFarmer(target.itemId, {
        date: target.date,
        quantity: Number(quantity),
        price: Number(price),
      });
      toast.success(
        Number(price) > target.price
          ? "Submitted. You asked more than offered, so Food Bundles will reply with an offer."
          : "Submitted. Food Bundles will confirm soon.",
      );
      setTarget(null);
      await load();
      onSubmitted?.();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to submit"));
    } finally {
      setSaving(false);
    }
  };

  if (requests === null) return <Skeleton className="h-40 w-full rounded-xl" />;
  if (requests.length === 0 && !showEmpty) return null;

  // Search by product, customer type (schools…), district or list title
  const term = search.trim().toLowerCase();
  const visible = requests
    .map((request) => ({
      ...request,
      lines: request.lines.filter(
        (line) =>
          !term ||
          line.productName.toLowerCase().includes(term) ||
          request.customerType.toLowerCase().includes(term) ||
          (request.district || "").toLowerCase().includes(term) ||
          (request.title || "").toLowerCase().includes(term),
      ),
    }))
    .filter((request) => request.lines.length > 0);
  const lineCount = requests.reduce((sum, r) => sum + r.lines.length, 0);

  return (
    <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/70 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 px-5 py-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <ClipboardList className="h-4 w-4 text-green-600" />
            Products needed
            {lineCount > 0 && (
              <span className="rounded-full bg-green-600 px-2 py-0.5 text-[11px] font-semibold text-white">{lineCount}</span>
            )}
          </p>
          <p className="text-xs text-gray-500">
            Customers need these products. Supply one or as many as you have.
          </p>
        </div>
        {lineCount > 0 && (
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, school, district…"
              className="h-9 pl-8 text-sm bg-white"
            />
          </div>
        )}
      </div>
      {requests.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-gray-500">
          No products are needed right now. Check back soon.
        </p>
      ) : visible.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-gray-500">Nothing matches “{search}”.</p>
      ) : (
      <div className="divide-y divide-emerald-100">
        {visible.map((request) => (
          <div key={request.id} className="px-5 py-3">
            <p className="mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <span className="rounded-full bg-green-100 px-2 py-0.5 font-medium capitalize text-green-800">
                {request.customerType.toLowerCase()}
              </span>
              {request.district && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {request.district}
                </span>
              )}
              {request.title && <span>· {request.title}</span>}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {request.lines.map((line) => (
                <div
                  key={`${line.itemId}-${line.date}`}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{line.productName}</p>
                    <p className="text-xs text-gray-600">
                      {formatDay(line.date)} · needs <span className="font-semibold">{line.missing}</span> {line.unit} ·{" "}
                      {Math.round(line.price).toLocaleString()} RWF/{line.unit}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="h-8 shrink-0 bg-green-600 text-xs hover:bg-green-700"
                    onClick={() => openSupply({ ...line, customerType: request.customerType })}
                  >
                    Supply
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      )}

      <Dialog open={!!target} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Supply {target?.productName}</DialogTitle>
            <DialogDescription>
              For {target ? formatDay(target.date) : ""}. Still needed: {target?.missing} {target?.unit}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="supply-qty">How much can you bring? ({target?.unit})</Label>
              <Input id="supply-qty" type="number" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="supply-price">Your price per {target?.unit} (RWF)</Label>
              <Input id="supply-price" type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
              <p className="text-xs text-gray-500">
                Offered: {Math.round(target?.price ?? 0).toLocaleString()} RWF. Asking more starts a negotiation.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={saving || !(Number(quantity) > 0) || !(Number(price) > 0)}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
