import createAxiosClient from "@/app/hooks/axiosClient";

/** Weekday numbers used by supply requests: 1 = Monday … 7 = Sunday */
export const WEEKDAYS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** When a request is needed: one date, every week on weekdays, or chosen dates */
export type ScheduleType = "ONCE" | "WEEKLY" | "DATES";
/** Who may supply it: farmers near it (automatic) or only farmers the creator chose */
export type Audience = "NEARBY" | "SELECTED";

export interface RequestCustomer {
  id: string;
  name: string;
  district?: string | null;
  customerType?: { id?: string; name: string } | null;
}

export interface SupplyRequestItemInput {
  id?: string;
  productId: string;
  /** WEEKLY: 1 = Monday … 7 = Sunday */
  weekday?: number | null;
  /** ONCE and DATES: YYYY-MM-DD */
  date?: string | null;
  quantity: number;
  price?: number;
}

/** A farmer who can be chosen for a request */
export interface ReachFarmer {
  id: string;
  name: string | null;
  /** Masked (••123) unless the person manages farmers */
  phone: string | null;
  province: string | null;
  district: string | null;
  sector: string | null;
  crops: { productId: string; productName: string }[];
  hasSold: boolean;
}

/** Farmers reachable by place and crop, for the "choose farmers" step */
export interface FarmerReach {
  total: number;
  soldBefore: number;
  /** Set when the person may only choose farmers in this district */
  limitedToDistrict: string | null;
  byPlace: { province: string | null; district: string | null; sector: string | null; count: number }[];
  byCrop: { productId: string; productName: string; count: number }[];
  allIds: string[];
  farmers: { items: ReachFarmer[]; total: number; page: number; pages: number };
}

export interface ChosenFarmer {
  id: string;
  name: string | null;
  phone: string | null;
  place: string | null;
  addedAt: string;
  submitted: boolean;
}

export interface SupplyRequestLine {
  itemId: string;
  productId: string;
  productName: string;
  unit: string;
  price: number;
  needed: number;
  submitted: number;
  received: number;
  missing: number;
  submissions: Array<{
    id: string;
    status: string;
    submittedQty: number | null;
    acceptedQty: number | null;
    farmer: { name: string | null; phone: string | null };
  }>;
}

export interface SupplyRequest {
  id: string;
  title: string | null;
  notes: string | null;
  status: "OPEN" | "CLOSED" | "CANCELLED";
  startDate: string;
  endDate: string;
  scheduleType?: ScheduleType;
  /** "HH:mm" the products are needed by */
  neededTime?: string | null;
  audience?: Audience;
  chosenFarmers?: ChosenFarmer[];
  createdAt: string;
  restaurant: { id: string; name: string; district?: string | null; customerType?: { name: string } | null };
  createdBy: { id: string; username: string };
  /** The aggregation site the request is served through (nearest the customer) */
  aggregationSite?: { id: string; name: string; district: string | null } | null;
  /** Aggregator an admin chose to handle the request (told about it, gets its farmers' submissions) */
  assignedAggregator?: { id: string; username: string; phone: string | null } | null;
  _count?: { items: number; orders: number };
  items?: Array<{
    id: string;
    productId: string;
    weekday: number | null;
    date: string | null;
    quantity: number;
    price: number;
    product: { id: string; productName: string; unit: string; purchasePrice: number };
  }>;
  orders?: Array<{
    id: string;
    orderNumber: string;
    supplyDate: string | null;
    totalAmount: number;
    status: string;
    paymentStatus: string;
  }>;
  schedule?: Array<{ date: string; weekday: string; lines: SupplyRequestLine[] }>;
}

export interface FarmerOpenRequest {
  id: string;
  title: string | null;
  customerType: string;
  district: string | null;
  startDate: string;
  endDate: string;
  scheduleType?: ScheduleType;
  neededTime?: string | null;
  /** The farmer was chosen for this request */
  chosen?: boolean;
  /** No sale to Food Bundles yet: the price is hidden and the farmer gives their own */
  priceHidden?: boolean;
  deliveryPoint?: string | null;
  lines: Array<{
    itemId: string;
    date: string;
    weekday: string;
    productName: string;
    unit: string;
    image: string | null;
    /** Null while the farmer's prices are locked */
    price: number | null;
    needed: number;
    missing: number;
  }>;
}

export const errorMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
  (error as Error)?.message ||
  fallback;

const data = <T>(response: { data?: { data?: T } }) => response.data?.data as T;

/** Sites and aggregators a request can be given (place dialog) */
export interface RequestPlaceOptions {
  sites: { id: string; name: string; district: string | null; province: string | null }[];
  aggregators: {
    id: string;
    username: string;
    phone: string | null;
    aggregationSite: { id: string; name: string; district: string | null; isActive: boolean } | null;
    openSubmissions: number;
    /** Straight-line km from the request's site; null when unknown */
    distanceKm?: number | null;
    /** Nearest the request's site */
    automatic?: boolean;
  }[];
}

export const supplyRequestService = {
  list: async (status?: string) =>
    data<SupplyRequest[]>(await createAxiosClient().get("/supply-requests", { params: status ? { status } : undefined })),

  get: async (id: string) => data<SupplyRequest>(await createAxiosClient().get(`/supply-requests/${id}`)),

  create: async (payload: {
    restaurantId: string;
    title?: string;
    notes?: string;
    startDate?: string;
    endDate?: string;
    scheduleType: ScheduleType;
    neededTime?: string | null;
    audience: Audience;
    farmerIds?: string[];
    /** The aggregator who handles it; left out = the nearest one, automatically */
    aggregatorId?: string;
    items: SupplyRequestItemInput[];
  }) => data<SupplyRequest>(await createAxiosClient().post("/supply-requests", payload)),

  // GET /supply-requests/farmer-reach: farmers by place and crop (counts + one page)
  farmerReach: async (params: {
    productIds: string[];
    province?: string;
    district?: string;
    sector?: string;
    search?: string;
    page?: number;
  }) =>
    data<FarmerReach>(
      await createAxiosClient().get("/supply-requests/farmer-reach", {
        params: { ...params, productIds: params.productIds.join(",") },
      })
    ),

  addFarmers: async (id: string, farmerIds: string[]) =>
    data<SupplyRequest>(await createAxiosClient().post(`/supply-requests/${id}/farmers`, { farmerIds })),

  removeFarmer: async (id: string, farmerId: string) =>
    data<SupplyRequest>(await createAxiosClient().delete(`/supply-requests/${id}/farmers/${farmerId}`)),

  update: async (
    id: string,
    payload: { title?: string; notes?: string; endDate?: string; neededTime?: string | null; items?: SupplyRequestItemInput[] },
  ) => data<SupplyRequest>(await createAxiosClient().patch(`/supply-requests/${id}`, payload)),

  // GET /supply-requests/place-options: active sites and aggregators
  // With restaurantId (a request being created): aggregators nearest the site that would serve that customer first
  placeOptions: async (requestId?: string, restaurantId?: string) =>
    data<RequestPlaceOptions>(
      await createAxiosClient().get("/supply-requests/place-options", {
        params: requestId ? { requestId } : restaurantId ? { restaurantId } : undefined,
      })
    ),

  // PATCH /supply-requests/:id/place: where the request is served and who handles it (null clears)
  setPlace: async (id: string, place: { aggregationSiteId?: string | null; aggregatorId?: string | null }) =>
    data<SupplyRequest>(await createAxiosClient().patch(`/supply-requests/${id}/place`, place)),

  setStatus: async (id: string, status: "OPEN" | "CLOSED" | "CANCELLED") =>
    data<SupplyRequest>(await createAxiosClient().patch(`/supply-requests/${id}/status`, { status })),

  /** Customers the user may create requests for */
  customers: async () => data<RequestCustomer[]>(await createAxiosClient().get("/supply-requests/customers")),

  /** Aggregators with their assigned customers */
  aggregators: async () =>
    data<Array<{ id: string; username: string; phone: string | null; customers: RequestCustomer[] }>>(
      await createAxiosClient().get("/supply-requests/aggregators"),
    ),

  assignCustomers: async (aggregatorId: string, restaurantIds: string[]) =>
    data<RequestCustomer[]>(
      await createAxiosClient().put(`/supply-requests/aggregators/${aggregatorId}/customers`, { restaurantIds }),
    ),

  // Farmers
  openForFarmers: async () => data<FarmerOpenRequest[]>(await createAxiosClient().get("/supply-requests/farmer/open")),

  submitAsFarmer: async (itemId: string, payload: { date: string; quantity: number; price?: number }) =>
    data(await createAxiosClient().post(`/supply-requests/farmer/items/${itemId}/submit`, payload)),
};
