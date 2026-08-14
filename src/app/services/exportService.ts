/* eslint-disable @typescript-eslint/no-explicit-any */
import createAxiosClient from "../hooks/axiosClient";

export type ExportModuleType =
  | "users"
  | "orders"
  | "restaurants"
  | "payments"
  | "products"
  | "farmers"
  | "logistics"
  | "aggregators"
  | "subscriptions"
  | "wallets"
  | "loans"
  | "deposits"
  | "transactions";

export interface ExportFilterParams {
  startDate?: string;
  endDate?: string;
  status?: string;
  category?: string;
  role?: string;
  search?: string;
  restaurantId?: string;
  farmerId?: string;
  province?: string;
  district?: string;
  type?: string;
  columns?: string;
  ids?: string;
  [key: string]: any;
}

export const exportService = {
  async downloadExport(
    type: ExportModuleType,
    format: "excel" | "csv" | "pdf" = "excel",
    filters: ExportFilterParams = {}
  ): Promise<void> {
    const axiosClient = createAxiosClient();

    // Clean filters (remove empty strings, undefined, null, "ALL")
    const cleanedParams: Record<string, any> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "" && value !== "ALL") {
        cleanedParams[key] = value;
      }
    });

    const response = await axiosClient.get(`/export/${type}/${format}`, {
      params: cleanedParams,
      responseType: "blob",
    });

    // Extract filename from content-disposition header if available
    let filename = `${type}_export.${format === "excel" ? "xlsx" : format}`;
    const contentDisposition = response.headers["content-disposition"];
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    // Trigger browser download
    const blob = new Blob([response.data], {
      type:
        format === "excel"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : format === "csv"
          ? "text/csv"
          : "application/pdf",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
