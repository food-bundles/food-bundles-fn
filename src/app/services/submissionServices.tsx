import { PurchaseSubmissionPayload } from "../contexts/submission-context";
import createAxiosClient from "../hooks/axiosClient";


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
};
