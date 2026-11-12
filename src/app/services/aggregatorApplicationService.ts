import createAxiosClient from "@/app/hooks/axiosClient";

export type AggregatorApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AggregatorApplicationInput {
  fullName: string;
  phone: string;
  email: string;
  nationalId?: string;
  province?: string;
  district: string;
  sector: string;
  cell?: string;
  village?: string;
  collectionPoint?: string | null;
  hasStorage?: boolean;
  mainProduce?: string;
  farmersEstimate?: number;
  momoNumber?: string;
  experience?: string;
  agreed: boolean;
}

export interface AggregatorApplication extends Omit<AggregatorApplicationInput, "agreed"> {
  id: string;
  status: AggregatorApplicationStatus;
  agreementVersion: string;
  agreedAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
  adminId: string | null;
  createdAt: string;
}

export const aggregatorApplicationService = {
  /** Public: apply after accepting the preliminary agreement */
  submit: async (input: AggregatorApplicationInput) => {
    const response = await createAxiosClient().post("/aggregator-applications", input);
    return response.data;
  },

  /** Dashboard */
  list: async (status?: AggregatorApplicationStatus) => {
    const response = await createAxiosClient().get("/aggregator-applications", { params: status ? { status } : {} });
    return response.data as { data: AggregatorApplication[]; counts: Partial<Record<AggregatorApplicationStatus, number>> };
  },
  approve: async (id: string, note?: string) => {
    const response = await createAxiosClient().post(`/aggregator-applications/${id}/approve`, { note });
    return response.data as { message: string; inviteUrl?: string };
  },
  reject: async (id: string, note?: string) => {
    const response = await createAxiosClient().post(`/aggregator-applications/${id}/reject`, { note });
    return response.data as { message: string };
  },
};
