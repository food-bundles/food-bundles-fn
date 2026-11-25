import createAxiosClient from "../hooks/axiosClient";

/** Food Bundles' MVend (Gwiza) merchant wallet */

export interface MvendStep {
  key: string;
  label: string;
  ok: boolean;
  detail?: string;
}

export interface MvendOverview {
  status: { connected: boolean; steps: MvendStep[]; baseUrl: string };
  merchant: MvendMerchant | null;
  wallet: { walletId: string | null; msisdn: string | null };
  balance: { account: number; available: number } | null;
  balanceError: string | null;
}

export interface MvendTransaction {
  id: string;
  type: "TOPUP" | "PAYOUT" | "COLLECTION";
  amount: number;
  fee: number | null;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
  mvendTransactionId: string | null;
  counterpartyMsisdn: string | null;
  counterpartyName: string | null;
  narration: string | null;
  initiatedByName: string | null;
  createdAt: string;
}

export const mvendService = {
  overview: async (): Promise<MvendOverview> => {
    const res = await createAxiosClient().get("/mvend/wallet");
    return res.data.data;
  },

  transactions: async (params: { page?: number; limit?: number; type?: string }) => {
    const res = await createAxiosClient().get("/mvend/transactions", { params });
    return res.data.data as {
      transactions: MvendTransaction[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    };
  },

  topUp: async (amount: number, payerPhone: string) => {
    const res = await createAxiosClient().post("/mvend/topup", { amount, payerPhone });
    return res.data as { message: string; data: MvendTransaction };
  },
};

/** Food Bundles' registration as an MVend merchant (saved once registered) */
export interface MvendMerchant {
  memberId?: string | null;
  msisdn?: string | null;
  walletId?: string | null;
  walletStatus?: string | null;
  businessName?: string | null;
  registeredAt?: string | null;
}

export const mvendMerchantService = {
  /** Business + representative details, with ID photos, selfie and RDB document (form data) */
  register: async (form: FormData) => {
    const res = await createAxiosClient().post("/mvend/merchant/register", form, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data as { message: string; data: MvendMerchant };
  },
  /** Register again: forget our saved member (kept in history); nothing is deleted at MVend */
  reset: async () => {
    const res = await createAxiosClient().post("/mvend/merchant/reset");
    return res.data as { message: string; data: { clearedMemberId: string | null; serverEnvMemberId: string | null } };
  },
  /** MVend's Rwanda locations: provinces, then districts / sectors / cells / villages of the one above */
  locations: async (level: "provinces" | "districts" | "sectors" | "cells" | "villages", parentId?: string) => {
    const res = await createAxiosClient().get(`/mvend/locations/${level}${parentId ? `/${encodeURIComponent(parentId)}` : ""}`);
    return (res.data.data ?? []) as Record<string, unknown>[];
  },
};
