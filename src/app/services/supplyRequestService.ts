import createAxiosClient from "@/app/hooks/axiosClient";

/** Weekday numbers used by supply requests: 1 = Monday … 7 = Sunday */
export const WEEKDAYS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export interface RequestCustomer {
  id: string;
  name: string;
  district?: string | null;
  customerType?: { id?: string; name: string } | null;
}

export interface SupplyRequestItemInput {
  id?: string;
  productId: string;
  weekday: number;
  quantity: number;
  price?: number;
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
  createdAt: string;
  restaurant: { id: string; name: string; district?: string | null; customerType?: { name: string } | null };
  createdBy: { id: string; username: string };
  _count?: { items: number; orders: number };
  items?: Array<{
    id: string;
    productId: string;
    weekday: number;
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
  lines: Array<{
    itemId: string;
    date: string;
    weekday: string;
    productName: string;
    unit: string;
    image: string | null;
    price: number;
    needed: number;
    missing: number;
  }>;
}

export const errorMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
  (error as Error)?.message ||
  fallback;

const data = <T>(response: { data?: { data?: T } }) => response.data?.data as T;

export const supplyRequestService = {
  list: async (status?: string) =>
    data<SupplyRequest[]>(await createAxiosClient().get("/supply-requests", { params: status ? { status } : undefined })),

  get: async (id: string) => data<SupplyRequest>(await createAxiosClient().get(`/supply-requests/${id}`)),

  create: async (payload: {
    restaurantId: string;
    title?: string;
    notes?: string;
    startDate: string;
    endDate: string;
    items: SupplyRequestItemInput[];
  }) => data<SupplyRequest>(await createAxiosClient().post("/supply-requests", payload)),

  update: async (
    id: string,
    payload: { title?: string; notes?: string; endDate?: string; items?: SupplyRequestItemInput[] },
  ) => data<SupplyRequest>(await createAxiosClient().patch(`/supply-requests/${id}`, payload)),

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
