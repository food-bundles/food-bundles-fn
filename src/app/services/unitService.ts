import createAxiosClient from "../hooks/axiosClient";

export interface UnitFormData {
  tableTronicId: string;
  name: string;
  description: string;
  isActive: boolean;
}

export const unitService = {
  createUnit: async (data: UnitFormData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/unit", data);
    return response.data;
  },

  getAllUnits: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/unit");
    return response.data;
  },

  getUnitById: async (unitId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/unit/${unitId}`);
    return response.data;
  },

  updateUnit: async (unitId: string, data: UnitFormData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(`/unit/${unitId}`, data);
    return response.data;
  },

  deleteUnit: async (unitId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.delete(`/unit/${unitId}`);
    return response.data;
  },

  getActiveUnits: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/unit/active");
    return response.data;
  },

  bulkUpdateStatus: async (unitIds: string[], isActive: boolean) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch("/unit/bulk-status", {
      unitIds,
      isActive
    });
    return response.data;
  },
};