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
