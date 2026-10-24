"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { productService } from "@/app/services/productService";
import {
  errorMessage,
  RequestCustomer,
  SupplyRequest,
  supplyRequestService,
  WEEKDAYS,
} from "@/app/services/supplyRequestService";

type ProductOption = { id: string; productName: string; unit: string; purchasePrice: number };
type Row = { key: string; id?: string; productId: string; weekday: number; quantity: string; price: string };

const newRow = (weekday = 1): Row => ({
  key: Math.random().toString(36).slice(2),
  productId: "",
  weekday,
  quantity: "",
  price: "",
});

const today = () => new Date().toISOString().slice(0, 10);

interface SupplyRequestFormProps {
  open: boolean;
  request?: SupplyRequest | null; // edit when given
  onClose: () => void;
  onSaved: (request: SupplyRequest) => void;
}

/** Create or edit a supply request: customer, dates and products per weekday. */
export function SupplyRequestForm({ open, request, onClose, onSaved }: SupplyRequestFormProps) {
  const editing = !!request;
  const [customers, setCustomers] = useState<RequestCustomer[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [restaurantId, setRestaurantId] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState("");
  const [rows, setRows] = useState<Row[]>([newRow()]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    supplyRequestService
      .customers()
      .then((list) => setCustomers(list || []))
      .catch(() => setCustomers([]));
    productService
      .getAllProducts({ limit: 500 })
      .then((res: { data?: unknown }) => {
        const raw = res?.data as { products?: ProductOption[] } | ProductOption[] | undefined;
        const list = Array.isArray(raw) ? raw : raw?.products || [];
        setProducts(list.map((p) => ({ id: p.id, productName: p.productName, unit: p.unit, purchasePrice: p.purchasePrice })));
      })
      .catch(() => setProducts([]));

    if (request) {
      setRestaurantId(request.restaurant.id);
      setTitle(request.title || "");
      setNotes(request.notes || "");
      setStartDate(request.startDate.slice(0, 10));
      setEndDate(request.endDate.slice(0, 10));
      setRows(
        (request.items || []).map((item) => ({
          key: item.id,
          id: item.id,
          productId: item.productId,
          weekday: item.weekday,
          quantity: String(item.quantity),
          price: String(item.price),
        })),
      );
    } else {
      setRestaurantId("");
      setTitle("");
      setNotes("");
      setStartDate(today());
      setEndDate("");
      setRows([newRow()]);
    }
  }, [open, request]);

  const updateRow = (key: string, changes: Partial<Row>) =>
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...changes } : row)));

  // Picking a product fills in its Food Bundles purchase price (editable)
  const pickProduct = (key: string, productId: string) => {
    const product = products.find((p) => p.id === productId);
    updateRow(key, { productId, price: product ? String(product.purchasePrice || "") : "" });
  };

  const save = async () => {
    if (!restaurantId) return toast.error("Choose the customer this list is for");
    if (!endDate) return toast.error("Choose until when the list is used");
    const items = rows
      .filter((row) => row.productId)
      .map((row) => ({
        id: row.id,
        productId: row.productId,
        weekday: row.weekday,
        quantity: Number(row.quantity),
        price: Number(row.price),
      }));
    if (items.length === 0) return toast.error("Add at least one product");

    setSaving(true);
    try {
      const saved = editing
        ? await supplyRequestService.update(request!.id, { title, notes, endDate, items })
        : await supplyRequestService.create({ restaurantId, title, notes, startDate, endDate, items });
      toast.success(editing ? "Request updated" : "Request created. Farmers can now submit to it.");
      onSaved(saved);
      onClose();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to save the request"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit supply request" : "New supply request"}</DialogTitle>
          <DialogDescription>
            Products a customer needs each week. Farmers see the list and submit what they have.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Customer</Label>
              <select
                className="h-9 w-full rounded-md border border-gray-300 bg-white px-2 text-sm disabled:bg-gray-100"
                value={restaurantId}
                onChange={(e) => setRestaurantId(e.target.value)}
                disabled={editing || saving}
              >
                <option value="">Choose a customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.customerType?.name ? ` (${c.customerType.name.toLowerCase()})` : ""}
                  </option>
                ))}
              </select>
              {!editing && customers.length === 0 && (
                <p className="text-xs text-amber-700">No customers are assigned to you yet. Ask an admin to assign schools.</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Title (optional)</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Term 1 menu" disabled={saving} />
            </div>
            <div className="space-y-1.5">
              <Label>From</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={editing || saving} />
            </div>
            <div className="space-y-1.5">
              <Label>Until</Label>
              <Input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} disabled={saving} />
            </div>
          </div>

          <div className="rounded-lg border">
            <div className="grid grid-cols-[110px_1fr_90px_110px_32px] gap-2 border-b bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">
              <span>Day</span>
              <span>Product</span>
              <span>Quantity</span>
              <span>Price / unit</span>
              <span />
            </div>
            {rows.map((row) => {
              const product = products.find((p) => p.id === row.productId);
              return (
                <div key={row.key} className="grid grid-cols-[110px_1fr_90px_110px_32px] items-center gap-2 border-b px-3 py-2 last:border-b-0">
                  <select
                    className="h-9 rounded-md border border-gray-300 bg-white px-1.5 text-sm"
                    value={row.weekday}
                    onChange={(e) => updateRow(row.key, { weekday: Number(e.target.value) })}
                    disabled={saving}
                  >
                    {WEEKDAYS.slice(1).map((day, i) => (
                      <option key={day} value={i + 1}>
                        {day}
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-9 rounded-md border border-gray-300 bg-white px-1.5 text-sm"
                    value={row.productId}
                    onChange={(e) => pickProduct(row.key, e.target.value)}
                    disabled={saving}
                  >
                    <option value="">Choose a product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.productName}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    min={0}
                    placeholder={product?.unit || "qty"}
                    value={row.quantity}
                    onChange={(e) => updateRow(row.key, { quantity: e.target.value })}
                    disabled={saving}
                  />
                  <div>
                    <Input
                      type="number"
                      min={0}
                      value={row.price}
                      onChange={(e) => updateRow(row.key, { price: e.target.value })}
                      disabled={saving}
                    />
                    {product && Number(row.price) !== product.purchasePrice && (
                      <p className="mt-0.5 text-[10px] text-gray-500">FB price {product.purchasePrice.toLocaleString()}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                    className="flex h-8 w-8 items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove product"
                    disabled={saving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
            <div className="px-3 py-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setRows((prev) => [...prev, newRow(prev[prev.length - 1]?.weekday ?? 1)])}
                disabled={saving}
              >
                <Plus className="mr-1 h-4 w-4" /> Add product
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes for the team (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} disabled={saving} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving} className="bg-green-600 hover:bg-green-700">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editing ? "Save changes" : "Create request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
