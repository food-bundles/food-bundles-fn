/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useCallback } from "react";
import { submissionService } from "../services/submissionServices";

// Types based on your backend response
export interface FarmerInfo {
  id: string;
  phone: string;
  email: string;
}

export interface FarmerSubmission {
  aggregator: any;
  id: string;
  farmerId: string;
  productName: string;
  submittedQty: number;
  acceptedQty: number | null;
  totalAmount: number | null;
  categoryId: string;
  status:
    | "PENDING"
    | "ACCEPTED"
    | "REJECTED"
    | "VERIFIED"
    | "APPROVED"
    | "PAID";
  farmerFeedbackStatus: "PENDING" | "ACCEPTED" | "REJECTED";
  farmerFeedbackAt: string | null;
  farmerFeedbackNotes: string | null;
  farmerCounterOffer: number | null;
  farmerCounterQty: number | null;
  feedbackDeadline: string | null;
  aggregatorId: string | null;
  submittedAt: string;
  verifiedAt: string | null;
  approvedAt: string | null;
  paidAt: string | null;
  acceptedPrice: number | null;
  approvedProductId: string | null;
  wishedPrice: number;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  farmer: FarmerInfo;
}

export interface SubmissionResponse {
  success: boolean;
  message: string;
  data: FarmerSubmission[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
  userContext: {
    role: "ADMIN" | "AGGREGATOR";
    canManage: boolean;
  };
}

export interface SubmissionStats {
  totalSubmissions: number;
  pendingSubmissions: number;
  acceptedSubmissions: number;
  rejectedSubmissions: number;
}

// Updated interface to match your backend API
export interface PurchaseSubmissionPayload {
  acceptedQty: number;
  unitPrice: number;
}

interface SubmissionContextType {
  // Submission operations
  getAllSubmissions: () => Promise<SubmissionResponse>;
  getSubmissionById: (
    submissionId: string
  ) => Promise<{ data: FarmerSubmission }>;
  getVerifiedSubmissions: () => Promise<SubmissionResponse>;
  getAwaitingFeedback: () => Promise<SubmissionResponse>;
  getSubmissionsByStatus: (status: string) => Promise<SubmissionResponse>;
  getMySubmissions: () => Promise<SubmissionResponse>;
  getSubmissionStats: () => Promise<{ data: SubmissionStats }>;

  // Submission management
  createProductFromSubmission: (
    submissionId: string,
    formData: FormData
  ) => Promise<any>;
  approveSubmission: (submissionId: string) => Promise<any>;
  updateProductQuantity: (
    submissionId: string,
    productId: string,
    payload: { quantity: number }
  ) => Promise<any>;
  purchaseSubmission: (
    submissionId: string,
    payload: PurchaseSubmissionPayload
  ) => Promise<any>;
  clearSubmission: (submissionId: string) => Promise<any>;
}

const SubmissionContext = createContext<SubmissionContextType | undefined>(
  undefined
);

export function SubmissionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const getAllSubmissions =
    useCallback(async (): Promise<SubmissionResponse> => {
      return await submissionService.getAllSubmissions();
    }, []);

  const getSubmissionById = useCallback(async (submissionId: string) => {
    return await submissionService.getSubmissionById(submissionId);
  }, []);

  const getVerifiedSubmissions =
    useCallback(async (): Promise<SubmissionResponse> => {
      return await submissionService.getVerifiedSubmissions();
    }, []);

  const getAwaitingFeedback =
    useCallback(async (): Promise<SubmissionResponse> => {
      return await submissionService.getAwaitingFeedback();
    }, []);

  const getSubmissionsByStatus = useCallback(
    async (status: string): Promise<SubmissionResponse> => {
      return await submissionService.getSubmissionsByStatus(status);
    },
    []
  );

  const getMySubmissions =
    useCallback(async (): Promise<SubmissionResponse> => {
      return await submissionService.getMySubmissions();
    }, []);

  const getSubmissionStats = useCallback(async () => {
    return await submissionService.getSubmissionStats();
  }, []);

  const createProductFromSubmission = useCallback(
    async (submissionId: string, formData: FormData) => {
      return await submissionService.createProductFromSubmission(
        submissionId,
        formData
      );
    },
    []
  );

  const approveSubmission = useCallback(async (submissionId: string) => {
    return await submissionService.approveSubmission(submissionId);
  }, []);

  const updateProductQuantity = useCallback(
    async (
      submissionId: string,
      productId: string,
      payload: { quantity: number }
    ) => {
      return await submissionService.updateProductQuantity(
        submissionId,
        productId,
        payload
      );
    },
    []
  );

  const purchaseSubmission = useCallback(
    async (submissionId: string, payload: PurchaseSubmissionPayload) => {
      return await submissionService.purchaseSubmission(submissionId, payload);
    },
    []
  );

  const clearSubmission = useCallback(async (submissionId: string) => {
    return await submissionService.clearSubmission(submissionId);
  }, []);

  const contextValue: SubmissionContextType = {
    getAllSubmissions,
    getSubmissionById,
    getVerifiedSubmissions,
    getAwaitingFeedback,
    getSubmissionsByStatus,
    getMySubmissions,
    getSubmissionStats,
    createProductFromSubmission,
    approveSubmission,
    updateProductQuantity,
    purchaseSubmission,
    clearSubmission,
  };

  return (
    <SubmissionContext.Provider value={contextValue}>
      {children}
    </SubmissionContext.Provider>
  );
}

export function useSubmissions() {
  const context = useContext(SubmissionContext);
  if (context === undefined) {
    throw new Error("useSubmissions must be used within a SubmissionProvider");
  }
  return context;
}
