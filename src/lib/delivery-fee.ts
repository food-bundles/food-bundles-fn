/**
 * Delivery fee preview — mirrors the backend rules in
 * food-bundles-bn/src/services/delivery-fee.service.ts (the backend decides
 * the real fee; this only shows customers/admins what to expect).
 *
 * Fee is charged when the order is below `freeDeliveryMinOrder` OR delivery
 * is sooner than `freeDeliveryMinDaysAhead` days after ordering.
 */
import createAxiosClient from "@/app/hooks/axiosClient";

export interface DeliverySettings {
  enabled: boolean; // off = free delivery on every order
  deliveryFee: number;
  freeDeliveryMinOrder: number;
  freeDeliveryMinDaysAhead: number; // 0 same day, 1 next day, 2…
}

export const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  enabled: true,
  deliveryFee: 5000,
  freeDeliveryMinOrder: 150000,
  freeDeliveryMinDaysAhead: 1,
};

export const deliverySettingsService = {
  get: async (): Promise<DeliverySettings> => {
    try {
      const response = await createAxiosClient().get("/delivery-settings");
      return { ...DEFAULT_DELIVERY_SETTINGS, ...(response.data?.data ?? {}) };
    } catch {
      return DEFAULT_DELIVERY_SETTINGS;
    }
  },
  update: async (data: Partial<DeliverySettings>): Promise<DeliverySettings> => {
    const response = await createAxiosClient().put("/delivery-settings", data);
    return response.data?.data;
  },
  // Delete the saved settings: back to the defaults
  reset: async (): Promise<DeliverySettings> => {
    const response = await createAxiosClient().delete("/delivery-settings");
    return { ...DEFAULT_DELIVERY_SETTINGS, ...(response.data?.data ?? {}) };
  },
};

// Calendar day in Rwanda time (the business day the backend uses)
const businessDay = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Kigali",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

export const daysAhead = (placedAt: Date, requestedDelivery?: Date | null) => {
  if (!requestedDelivery || Number.isNaN(requestedDelivery.getTime())) return 0;
  const diff =
    (Date.parse(businessDay(requestedDelivery)) - Date.parse(businessDay(placedAt))) / 86_400_000;
  return Math.max(0, Math.round(diff));
};

export const calculateDeliveryFee = (params: {
  orderAmount: number;
  placedAt?: Date;
  requestedDelivery?: Date | null;
  hasFreeDeliveryPlan?: boolean;
  settings: DeliverySettings;
}) => {
  const { orderAmount, placedAt = new Date(), requestedDelivery, hasFreeDeliveryPlan, settings } = params;
  if (hasFreeDeliveryPlan || !settings.enabled) return 0;
  const tooSmall = orderAmount < settings.freeDeliveryMinOrder;
  const tooSoon = daysAhead(placedAt, requestedDelivery) < settings.freeDeliveryMinDaysAhead;
  return tooSmall || tooSoon ? settings.deliveryFee : 0;
};

/** "same day" / "next day" / "3 days later" */
export const timingLabel = (days: number) =>
  days <= 0 ? "same day" : days === 1 ? "next day" : `${days} days later`;

/** One-line explanation of when delivery is free, for customers. */
export const freeDeliveryHint = (settings: DeliverySettings) =>
  !settings.enabled
    ? "Delivery is free on all orders."
    : `Free delivery on orders of ${settings.freeDeliveryMinOrder.toLocaleString()} RWF or more delivered ${
    settings.freeDeliveryMinDaysAhead <= 0
      ? "any day"
      : `${timingLabel(settings.freeDeliveryMinDaysAhead)} or later`
  }. Otherwise delivery is ${settings.deliveryFee.toLocaleString()} RWF.`;

/** Value for <input type="datetime-local"> in the user's local time */
export const toDateTimeLocal = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

/** "Thu, Oct 16, 2026 · 10:00 AM" — for showing a requested delivery time */
export const formatDeliveryTime = (value?: string | Date | null) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return `${date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })} · ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
};
