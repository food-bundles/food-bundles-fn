import { PurchaseSubmissionPayload } from "../contexts/submission-context";
import createAxiosClient from "../hooks/axiosClient";

export interface FarmerFeedbackPayload {
  feedbackStatus: "ACCEPTED" | "REJECTED" | "EXTENDED";
  notes?: string;
  counterOffer?: number;
  counterQty?: number;
}

export const submissionService = {
  // --- GET Routes ---
  getAllSubmissions: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/submissions");
    return response.data;
  },

  getSubmissionById: async (submissionId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/submissions/${submissionId}`);
    return response.data;
  },

  getVerifiedSubmissions: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/submissions/verified");
    return response.data;
  },

  getAwaitingFeedback: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/submissions/awaiting-feedback");
    return response.data;
  },

  getSubmissionsByStatus: async (status: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/submissions/status/${status}`);
    return response.data;
  },

  getMySubmissions: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/submissions/my-submissions");
    return response.data;
  },

  getSubmissionStats: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/submissions/stats");
    return response.data;
  },

  // --- POST/PATCH/PUT Routes ---
  createProductFromSubmission: async (
    submissionId: string,
    formData: FormData
  ) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(
      `/submissions/${submissionId}/create-product`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  approveSubmission: async (submissionId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(
      `/submissions/${submissionId}/approve`
    );
    return response.data;
  },

  updateProductQuantity: async (
    submissionId: string,
    productId: string,
    payload: { quantity: number }
  ) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(
      `/submissions/${submissionId}/products/${productId}/update-quantity`,
      payload
    );
    return response.data;
  },

  purchaseSubmission: async (
    submissionId: string,
    payload: PurchaseSubmissionPayload
  ) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(
      `/submissions/${submissionId}/purchase`,
      payload
    );
    return response.data;
  },

  clearSubmission: async (submissionId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.put(
      `/submissions/${submissionId}/clear`
    );
    return response.data;
  },

  // --- Farmer feedback (accept / reject / counter-offer a verified submission) ---
  getPendingFeedback: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/farmers/pending-feedback");
    return response.data;
  },

  getFeedbackHistory: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/farmers/feedback-history");
    return response.data;
  },

  submitFarmerFeedback: async (
    submissionId: string,
    payload: FarmerFeedbackPayload
  ) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(
      `/farmers/${submissionId}/feedback`,
      payload
    );
    return response.data;
  },

  updateFarmerFeedback: async (
    submissionId: string,
    payload: Partial<FarmerFeedbackPayload>
  ) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(
      `/farmers/${submissionId}/feedback`,
      payload
    );
    return response.data;
  },

  // --- Admin overrides, payouts, and reversal ---
  rejectSubmission: async (submissionId: string, reason?: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(
      `/submissions/${submissionId}/reject`,
      { reason }
    );
    return response.data;
  },

  deleteSubmission: async (submissionId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.delete(`/submissions/${submissionId}`);
    return response.data;
  },

  forceCompleteSubmission: async (submissionId: string, reason?: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(
      `/submissions/${submissionId}/force-complete`,
      { reason }
    );
    return response.data;
  },

  reverseSubmissionStatus: async (
    submissionId: string,
    payload: { toStatus: "PENDING" | "VERIFIED" | "APPROVED" | "PAID"; reason?: string }
  ) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(
      `/submissions/${submissionId}/reverse-status`,
      payload
    );
    return response.data;
  },

  getSubmissionStatusHistory: async (submissionId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(
      `/submissions/${submissionId}/status-history`
    );
    return response.data;
  },

  initiateSubmissionPayout: async (submissionId: string, phoneNumber: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(
      `/submissions/${submissionId}/payout`,
      { phoneNumber }
    );
    return response.data;
  },

  confirmSubmissionPayout: async (
    submissionId: string,
    payoutId: string,
    outcome: "COMPLETED" | "FAILED"
  ) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(
      `/submissions/${submissionId}/payout/${payoutId}/confirm`,
      { outcome }
    );
    return response.data;
  },

  getSubmissionPayouts: async (submissionId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(
      `/submissions/${submissionId}/payouts`
    );
    return response.data;
  },
};
