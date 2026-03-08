"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Market,
  marketPricingService,
  ProductOption,
} from "@/app/services/marketPricingService";
import { productService } from "@/app/services/productService";
import { PriceRecord } from "@/types/market-pricing";
import {
  ModalShell,
  ModalHeader,
  AlertBox,
  Field,
  Input,
  ModalActions,
  Toggle,
  Select,
} from "./shared-atoms";
import { RW_DISTRICTS, RW_PROVINCES } from "./utils";

// ─────────────────────────────────────────────────────────────────────────────
// 1. CREATE MARKET MODAL
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateMarketModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the newly created market on success */
  onSuccess: (market: Market) => void;
}

/**
 * CreateMarketModal
 * Lets admins register a new external market for price comparison.
 */
export function CreateMarketModal({
  open,
  onClose,
  onSuccess,
}: CreateMarketModalProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setName("");
      setLocation("");
      setProvince("");
      setDistrict("");
      setErrors({});
      setApiError(null);
    }
  }, [open]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Market name is required";
    if (name.trim().length > 100) e.name = "Max 100 characters";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    setApiError(null);
    try {
      const res = await marketPricingService.createMarket({
        name: name.trim(),
        location: location.trim() || undefined,
        province: province || undefined,
        district: district || undefined,
      });
      if (res.success) {
        onSuccess(res.data);
        onClose();
      } else setApiError(res.message ?? "Failed to create market.");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setLoading(false);
    }
  };

  const districts = province ? (RW_DISTRICTS[province] ?? []) : [];

  return (
    <ModalShell open={open} onClose={onClose}>
      <ModalHeader
        icon={
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
        }
        title="Register New Market"
        subtitle="Add an external market for price tracking"
        onClose={onClose}
      />
      <div className="px-6 py-5 space-y-4">
        <AnimatePresence>
          {apiError && <AlertBox type="error" message={apiError} />}
        </AnimatePresence>

        <Field label="Market Name" required error={errors.name}>
          <Input
            value={name}
            onChange={(v) => {
              setName(v);
              setErrors((e) => ({ ...e, name: "" }));
            }}
            placeholder="e.g. Kimironko Market"
            hasError={!!errors.name}
            autoFocus
          />
        </Field>

        <Field
          label="Location"
          hint="Street address or GPS coordinates (e.g. -1.9441, 30.1056)"
        >
          <Input
            value={location}
            onChange={setLocation}
            placeholder="KK 15 Ave, Musanze or -1.44, 29.63"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Province">
            <Select
              value={province}
              onChange={(v) => {
                setProvince(v);
                setDistrict("");
              }}
            >
              <option value="">Select province</option>
              {RW_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="District">
            <Select
              value={district}
              onChange={setDistrict}
              disabled={!province}
            >
              <option value="">Select district</option>
              {districts.map((d) => (
                <option key={d} value={d.toUpperCase()}>
                  {d}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {/* Preview */}
        {name.trim() && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-1.5">
              Preview
            </p>
            <p className="text-sm font-bold text-stone-800">{name}</p>
            {(province || district) && (
              <p className="text-xs text-stone-500 mt-0.5">
                {[district, province].filter(Boolean).join(", ")}
              </p>
            )}
            {location && (
              <p className="text-xs text-stone-400 mt-0.5 font-mono">
                {location}
              </p>
            )}
          </motion.div>
        )}

        <ModalActions
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmLabel="Create Market"
          loading={loading}
        />
      </div>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. EDIT MARKET MODAL
// ─────────────────────────────────────────────────────────────────────────────

export interface EditMarketModalProps {
  open: boolean;
  market: Market | null;
  onClose: () => void;
  onSuccess: (market: Market) => void;
}

/**
 * EditMarketModal
 * Update market name, location, province, district, and active status.
 */
export function EditMarketModal({
  open,
  market,
  onClose,
  onSuccess,
}: EditMarketModalProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (open && market) {
      setName(market.name);
      setLocation(market.location ?? "");
      setProvince(market.province ?? "");
      setDistrict(market.district ?? "");
      setIsActive(market.isActive);
      setErrors({});
      setApiError(null);
    }
  }, [open, market]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Market name is required";
    return e;
  };

  const handleSubmit = async () => {
    if (!market) return;
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    setApiError(null);
    try {
      const res = await marketPricingService.updateMarket(market.id, {
        name: name.trim(),
        location: location.trim() || undefined,
        province: province || undefined,
        district: district || undefined,
        isActive,
      });
      if (res.success) {
        onSuccess(res.data);
        onClose();
      } else setApiError(res.message ?? "Failed to update market.");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setLoading(false);
    }
  };

  const districts = province ? (RW_DISTRICTS[province] ?? []) : [];

  return (
    <ModalShell open={open} onClose={onClose}>
      <ModalHeader
        icon={
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        }
        title="Edit Market"
        subtitle={market?.name ?? ""}
        onClose={onClose}
      />
      <div className="px-6 py-5 space-y-4">
        <AnimatePresence>
          {apiError && <AlertBox type="error" message={apiError} />}
        </AnimatePresence>

        <Field label="Market Name" required error={errors.name}>
          <Input
            value={name}
            onChange={(v) => {
              setName(v);
              setErrors((e) => ({ ...e, name: "" }));
            }}
            placeholder="Market name"
            hasError={!!errors.name}
            autoFocus
          />
        </Field>

        <Field label="Location" hint="Street address or GPS coordinates">
          <Input
            value={location}
            onChange={setLocation}
            placeholder="Address or coordinates"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Province">
            <Select
              value={province}
              onChange={(v) => {
                setProvince(v);
                setDistrict("");
              }}
            >
              <option value="">Select province</option>
              {RW_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="District">
            <Select
              value={district}
              onChange={setDistrict}
              disabled={!province}
            >
              <option value="">Select district</option>
              {districts.map((d) => (
                <option key={d} value={d.toUpperCase()}>
                  {d}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Toggle
          label="Market Active"
          checked={isActive}
          onChange={setIsActive}
          description={
            isActive
              ? "Visible in price tracking"
              : "Hidden from active tracking"
          }
        />

        <ModalActions
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmLabel="Save Changes"
          loading={loading}
        />
      </div>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DELETE MARKET MODAL
// ─────────────────────────────────────────────────────────────────────────────

export interface DeleteMarketModalProps {
  open: boolean;
  market: Market | null;
  onClose: () => void;
  onSuccess: (marketId: string) => void;
}

/**
 * DeleteMarketModal
 * Destructive confirmation — deletes the market and all its price history.
 * Requires typing the market name to enable the confirm button.
 */
export function DeleteMarketModal({
  open,
  market,
  onClose,
  onSuccess,
}: DeleteMarketModalProps) {
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setConfirmation("");
      setApiError(null);
    }
  }, [open]);

  const confirmed = confirmation === market?.name;

  const handleDelete = async () => {
    if (!market || !confirmed) return;
    setLoading(true);
    setApiError(null);
    try {
      const res = await marketPricingService.deleteMarket(market.id);
      if (res.success) {
        onSuccess(market.id);
        onClose();
      } else setApiError(res.message ?? "Failed to delete market.");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose}>
      <ModalHeader
        icon={
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        }
        title="Delete Market"
        subtitle="This action cannot be undone"
        onClose={onClose}
        danger
      />
      <div className="px-6 py-5 space-y-4">
        <AnimatePresence>
          {apiError && <AlertBox type="error" message={apiError} />}
        </AnimatePresence>

        {/* Warning box */}
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3.5 space-y-1.5">
          <p className="text-xs font-black text-red-700">
            ⚠️ Permanent deletion
          </p>
          <p className="text-xs text-red-600 leading-relaxed">
            Deleting <strong>{market?.name}</strong> will permanently remove the
            market and <strong>all associated price history records</strong>.
            This cannot be undone.
          </p>
        </div>

        {/* Confirmation input */}
        <Field
          label="Type market name to confirm"
          hint={`Type "${market?.name ?? ""}" to enable deletion`}
        >
          <Input
            value={confirmation}
            onChange={setConfirmation}
            placeholder={market?.name ?? ""}
            hasError={confirmation.length > 0 && !confirmed}
            autoFocus
          />
        </Field>

        <ModalActions
          onCancel={onClose}
          onConfirm={handleDelete}
          confirmLabel="Delete Market"
          loading={loading}
          danger
          disabled={!confirmed}
        />
      </div>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. RECORD PRICE MODAL
// ─────────────────────────────────────────────────────────────────────────────

export interface RecordPriceModalProps {
  open: boolean;
  /** Pre-select a product (e.g. from product card) */
  defaultProductId?: string;
  /** Pre-select a market */
  defaultMarketId?: string;
  markets: Market[];
  onClose: () => void;
  onSuccess: (record: PriceRecord) => void;
}

/**
 * RecordPriceModal
 * Record a product's price at an external market.
 * Fetches available products from the service.
 */
export function RecordPriceModal({
  open,
  defaultProductId,
  defaultMarketId,
  markets,
  onClose,
  onSuccess,
}: RecordPriceModalProps) {
  const [productId, setProductId] = useState(defaultProductId ?? "");
  const [marketId, setMarketId] = useState(defaultMarketId ?? "");
  const [marketPrice, setMarketPrice] = useState("");
  const [recordedDate, setRecordedDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // Load products
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await productService.getAllProducts({ limit: 1000 });
      setProducts(res.data ?? []);
    } catch {
      /* silent — products stay empty */
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setProductId(defaultProductId ?? "");
      setMarketId(defaultMarketId ?? "");
      setMarketPrice("");
      setRecordedDate(new Date().toISOString().split("T")[0]);
      setErrors({});
      setApiError(null);
      fetchProducts();
    }
  }, [open, defaultProductId, defaultMarketId, fetchProducts]);

  const selectedProduct = products.find((p) => p.id === productId);
  const activeMarkets = markets.filter((m) => m.isActive);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!productId) e.productId = "Select a product";
    if (!marketId) e.marketId = "Select a market";
    if (!marketPrice || isNaN(Number(marketPrice)) || Number(marketPrice) <= 0)
      e.marketPrice = "Enter a valid price (> 0)";
    if (!recordedDate) e.recordedDate = "Date is required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    setApiError(null);
    try {
      const res = await marketPricingService.recordMarketPrice({
        productId,
        marketId,
        marketPrice: parseFloat(marketPrice),
        recordedDate: `${recordedDate}T00:00:00Z`,
      });
      if (res.success) {
        const record: PriceRecord = {
          ...res.data,
          product: {
            id: res.data.product.id,
            name: res.data.product.productName,
          },
          difference: res.data.ourPrice - res.data.marketPrice,
        };
        onSuccess(record);
        onClose();
      } else setApiError(res.message ?? "Failed to record price.");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setLoading(false);
    }
  };

  // Price diff preview
  const priceDiffPreview =
    selectedProduct && marketPrice && Number(marketPrice) > 0
      ? (() => {
          const diff = selectedProduct.unitPrice - Number(marketPrice);
          const pct = Math.abs((diff / Number(marketPrice)) * 100).toFixed(1);
          const higher = diff > 0;
          return { diff, pct, higher };
        })()
      : null;

  return (
    <ModalShell open={open} onClose={onClose}>
      <ModalHeader
        icon={
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        }
        title="Record Market Price"
        subtitle="Log a product price from an external market"
        onClose={onClose}
      />
      <div className="px-6 py-5 space-y-4">
        <AnimatePresence>
          {apiError && <AlertBox type="error" message={apiError} />}
        </AnimatePresence>

        <Field label="Product" required error={errors.productId}>
          <Select
            value={productId}
            onChange={(v) => {
              setProductId(v);
              setErrors((e) => ({ ...e, productId: "" }));
            }}
            hasError={!!errors.productId}
            disabled={loadingProducts}
          >
            <option value="">
              {loadingProducts ? "Loading products…" : "Select product"}
            </option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.productName} — {Math.round(p.unitPrice).toLocaleString()} RWF
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Market" required error={errors.marketId}>
          <Select
            value={marketId}
            onChange={(v) => {
              setMarketId(v);
              setErrors((e) => ({ ...e, marketId: "" }));
            }}
            hasError={!!errors.marketId}
          >
            <option value="">Select market</option>
            {activeMarkets.length === 0 && (
              <option disabled value="">
                No active markets
              </option>
            )}
            {activeMarkets.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
                {m.district ? ` · ${m.district}` : ""}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Market Price (RWF)" required error={errors.marketPrice}>
            <Input
              type="number"
              value={marketPrice}
              onChange={(v) => {
                setMarketPrice(v);
                setErrors((e) => ({ ...e, marketPrice: "" }));
              }}
              placeholder="e.g. 1080"
              hasError={!!errors.marketPrice}
              min="0"
              step="1"
            />
          </Field>
          <Field label="Recorded Date" required error={errors.recordedDate}>
            <Input
              type="date"
              value={recordedDate}
              onChange={(v) => {
                setRecordedDate(v);
                setErrors((e) => ({ ...e, recordedDate: "" }));
              }}
              hasError={!!errors.recordedDate}
            />
          </Field>
        </div>

        {/* Live comparison preview */}
        <AnimatePresence>
          {priceDiffPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`rounded-xl px-4 py-3 border ${
                Math.abs(priceDiffPreview.diff) < 1
                  ? "bg-stone-50 border-stone-200"
                  : priceDiffPreview.higher
                    ? "bg-amber-50 border-amber-200"
                    : "bg-emerald-50 border-emerald-200"
              }`}
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">
                Price Comparison Preview
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-stone-500">Our Price</p>
                  <p className="text-sm font-black text-stone-800">
                    {Math.round(selectedProduct!.unitPrice).toLocaleString()}{" "}
                    RWF
                  </p>
                </div>
                <div className="text-center">
                  <span
                    className={`text-xs font-black px-2 py-1 rounded-lg ${
                      Math.abs(Number(priceDiffPreview.pct)) < 1
                        ? "bg-stone-100 text-stone-500"
                        : priceDiffPreview.higher
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {Math.abs(Number(priceDiffPreview.pct)) < 1
                      ? "≈ Equal"
                      : priceDiffPreview.higher
                        ? `▲ Ours ${priceDiffPreview.pct}% higher`
                        : `▼ Ours ${priceDiffPreview.pct}% lower`}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-stone-500">Market Price</p>
                  <p className="text-sm font-black text-stone-800">
                    {Number(marketPrice).toLocaleString()} RWF
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalActions
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmLabel="Record Price"
          loading={loading}
        />
      </div>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. EDIT PRICE HISTORY MODAL
// ─────────────────────────────────────────────────────────────────────────────

export interface EditPriceHistoryModalProps {
  open: boolean;
  record: PriceRecord | null;
  onClose: () => void;
  onSuccess: (updated: PriceRecord) => void;
}

/**
 * EditPriceHistoryModal
 * Allows correcting the marketPrice and/or recordedDate of an existing entry.
 */
export function EditPriceHistoryModal({
  open,
  record,
  onClose,
  onSuccess,
}: EditPriceHistoryModalProps) {
  const [marketPrice, setMarketPrice] = useState("");
  const [recordedDate, setRecordedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (open && record) {
      setMarketPrice(String(record.marketPrice));
      setRecordedDate(record.recordedDate.split("T")[0]);
      setErrors({});
      setApiError(null);
    }
  }, [open, record]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!marketPrice || isNaN(Number(marketPrice)) || Number(marketPrice) <= 0)
      e.marketPrice = "Enter a valid price (> 0)";
    if (!recordedDate) e.recordedDate = "Date is required";
    return e;
  };

  const handleSubmit = async () => {
    if (!record) return;
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    setApiError(null);
    try {
      const res = await marketPricingService.updatePriceHistory(record.id, {
        marketPrice: parseFloat(marketPrice),
        recordedDate: `${recordedDate}T00:00:00Z`,
      });
      if (res.success) {
        const updated: PriceRecord = {
          ...res.data,
          product: {
            id: res.data.product.id,
            name: res.data.product.productName,
          },
          difference: res.data.ourPrice - res.data.marketPrice,
        };
        onSuccess(updated);
        onClose();
      } else setApiError(res.message ?? "Failed to update record.");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setLoading(false);
    }
  };

  const priceChanged = record && parseFloat(marketPrice) !== record.marketPrice;
  const dateChanged =
    record && recordedDate !== record.recordedDate.split("T")[0];
  const hasChanges = priceChanged || dateChanged;

  return (
    <ModalShell open={open} onClose={onClose}>
      <ModalHeader
        icon={
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        }
        title="Edit Price Record"
        subtitle={
          record ? `${record.product.name} @ ${record.market.name}` : ""
        }
        onClose={onClose}
      />
      <div className="px-6 py-5 space-y-4">
        <AnimatePresence>
          {apiError && <AlertBox type="error" message={apiError} />}
        </AnimatePresence>

        {/* Context summary */}
        {record && (
          <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-stone-400 uppercase tracking-wide">
                Product
              </p>
              <p className="text-xs font-bold text-stone-700 mt-0.5 truncate">
                {record.product.name}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-stone-400 uppercase tracking-wide">
                Market
              </p>
              <p className="text-xs font-bold text-stone-700 mt-0.5 truncate">
                {record.market.name}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-stone-400 uppercase tracking-wide">
                Our Price
              </p>
              <p className="text-xs font-bold text-stone-700 mt-0.5">
                {Math.round(record.ourPrice).toLocaleString()} RWF
              </p>
            </div>
            <div>
              <p className="text-[10px] text-stone-400 uppercase tracking-wide">
                Current Market Price
              </p>
              <p className="text-xs font-bold text-amber-700 mt-0.5">
                {Math.round(record.marketPrice).toLocaleString()} RWF
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="New Market Price (RWF)"
            required
            error={errors.marketPrice}
          >
            <Input
              type="number"
              value={marketPrice}
              onChange={(v) => {
                setMarketPrice(v);
                setErrors((e) => ({ ...e, marketPrice: "" }));
              }}
              placeholder="e.g. 1100"
              hasError={!!errors.marketPrice}
              min="0"
              step="1"
              autoFocus
            />
          </Field>
          <Field label="Recorded Date" required error={errors.recordedDate}>
            <Input
              type="date"
              value={recordedDate}
              onChange={(v) => {
                setRecordedDate(v);
                setErrors((e) => ({ ...e, recordedDate: "" }));
              }}
              hasError={!!errors.recordedDate}
            />
          </Field>
        </div>

        {/* Change summary */}
        <AnimatePresence>
          {hasChanges && record && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-700 mb-1.5">
                Changes
              </p>
              {priceChanged && (
                <p className="text-xs text-blue-700">
                  Price:{" "}
                  <span className="line-through text-blue-400">
                    {Math.round(record.marketPrice).toLocaleString()} RWF
                  </span>{" "}
                  →{" "}
                  <span className="font-bold">
                    {Number(marketPrice).toLocaleString()} RWF
                  </span>
                </p>
              )}
              {dateChanged && (
                <p className="text-xs text-blue-700 mt-0.5">
                  Date:{" "}
                  <span className="line-through text-blue-400">
                    {record.recordedDate.split("T")[0]}
                  </span>{" "}
                  → <span className="font-bold">{recordedDate}</span>
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <ModalActions
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmLabel="Save Changes"
          loading={loading}
          disabled={!hasChanges}
        />
      </div>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. DELETE PRICE HISTORY MODAL
// ─────────────────────────────────────────────────────────────────────────────

export interface DeletePriceHistoryModalProps {
  open: boolean;
  record: PriceRecord | null;
  onClose: () => void;
  onSuccess: (recordId: string) => void;
}

/**
 * DeletePriceHistoryModal
 * Confirms removal of a single price history entry.
 */
export function DeletePriceHistoryModal({
  open,
  record,
  onClose,
  onSuccess,
}: DeletePriceHistoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setApiError(null);
  }, [open]);

  const handleDelete = async () => {
    if (!record) return;
    setLoading(true);
    setApiError(null);
    try {
      const res = await marketPricingService.deletePriceHistory(record.id);
      if (res.success) {
        onSuccess(record.id);
        onClose();
      } else setApiError(res.message ?? "Failed to delete record.");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} width="max-w-sm">
      <ModalHeader
        icon={
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        }
        title="Delete Price Record"
        subtitle="This action cannot be undone"
        onClose={onClose}
        danger
      />
      <div className="px-6 py-5 space-y-4">
        <AnimatePresence>
          {apiError && <AlertBox type="error" message={apiError} />}
        </AnimatePresence>

        {record && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3.5 space-y-2.5">
            <p className="text-xs font-black text-red-700">
              ⚠️ Confirm deletion
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-red-400">Product</p>
                <p className="font-bold text-red-700 truncate">
                  {record.product.name}
                </p>
              </div>
              <div>
                <p className="text-red-400">Market</p>
                <p className="font-bold text-red-700 truncate">
                  {record.market.name}
                </p>
              </div>
              <div>
                <p className="text-red-400">Market Price</p>
                <p className="font-bold text-red-700">
                  {Math.round(record.marketPrice).toLocaleString()} RWF
                </p>
              </div>
              <div>
                <p className="text-red-400">Date</p>
                <p className="font-bold text-red-700">
                  {record.recordedDate.split("T")[0]}
                </p>
              </div>
            </div>
          </div>
        )}

        <ModalActions
          onCancel={onClose}
          onConfirm={handleDelete}
          confirmLabel="Delete Record"
          loading={loading}
          danger
        />
      </div>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. MANAGE MARKETS PANEL (list + inline CRUD actions)
// ─────────────────────────────────────────────────────────────────────────────

export interface ManageMarketsPanelProps {
  open: boolean;
  onClose: () => void;
  /** Called whenever markets list changes so parent can refresh */
  onMarketsChange: () => void;
}

/**
 * ManageMarketsPanel
 * A slide-over / full modal listing all markets with Edit and Delete actions,
 * and a "+ New Market" shortcut button.
 */
export function ManageMarketsPanel({
  open,
  onClose,
  onMarketsChange,
}: ManageMarketsPanelProps) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Market | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Market | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");

  const fetchMarkets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await marketPricingService.getAllMarkets({ limit: 100 });
      if (res.success) setMarkets(res.data ?? []);
      else setError(res.message ?? "Failed to load markets.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchMarkets();
  }, [open, fetchMarkets]);

  const filtered = markets.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.district ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <ModalShell open={open} onClose={onClose} width="max-w-2xl">
        <ModalHeader
          icon={
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          }
          title="Manage Markets"
          subtitle={`${markets.length} markets registered`}
          onClose={onClose}
        />

        <div className="px-5 py-4 border-b border-stone-100 flex gap-2.5">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search markets…"
              aria-label="Search markets"
              className="w-full pl-8 pr-4 py-2 rounded-xl border border-stone-200 text-xs bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black shadow-sm hover:from-amber-600 hover:to-orange-600 transition-all"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Market
          </button>
        </div>

        <div className="px-5 py-3 max-h-[60vh] overflow-y-auto">
          <AnimatePresence>
            {error && <AlertBox type="error" message={error} />}
          </AnimatePresence>

          {loading ? (
            <div className="space-y-2 py-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-14 bg-stone-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm font-bold text-stone-500">
                {search
                  ? "No markets match your search"
                  : "No markets registered yet"}
              </p>
              <p className="text-xs text-stone-400 mt-1">
                {search
                  ? "Try different keywords"
                  : "Click New Market to add one"}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 py-1">
              {filtered.map((m) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-all group"
                >
                  {/* Status dot */}
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${m.isActive ? "bg-emerald-400" : "bg-stone-300"}`}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-stone-800 truncate">
                      {m.name}
                    </p>
                    <p className="text-[10px] text-stone-400 truncate">
                      {[m.district, m.province, m.location]
                        .filter(Boolean)
                        .join(" · ") || "No location set"}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                      m.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-stone-100 text-stone-500 border-stone-200"
                    }`}
                  >
                    {m.isActive ? "Active" : "Inactive"}
                  </span>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditTarget(m)}
                      aria-label={`Edit ${m.name}`}
                      className="w-7 h-7 rounded-lg border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-all"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(m)}
                      aria-label={`Delete ${m.name}`}
                      className="w-7 h-7 rounded-lg border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-stone-100 flex items-center justify-between">
          <p className="text-[11px] text-stone-400">
            {markets.filter((m) => m.isActive).length} active ·{" "}
            {markets.filter((m) => !m.isActive).length} inactive
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 transition-colors"
          >
            Done
          </button>
        </div>
      </ModalShell>

      {/* Nested modals */}
      <CreateMarketModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={(m) => {
          setMarkets((prev) => [m, ...prev]);
          onMarketsChange();
        }}
      />
      <EditMarketModal
        open={!!editTarget}
        market={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={(updated) => {
          setMarkets((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m)),
          );
          onMarketsChange();
          setEditTarget(null);
        }}
      />
      <DeleteMarketModal
        open={!!deleteTarget}
        market={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={(id) => {
          setMarkets((prev) => prev.filter((m) => m.id !== id));
          onMarketsChange();
          setDeleteTarget(null);
        }}
      />
    </>
  );
}
