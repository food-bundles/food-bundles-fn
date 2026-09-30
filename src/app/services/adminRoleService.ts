/* eslint-disable @typescript-eslint/no-explicit-any */
import createAxiosClient from "@/app/hooks/axiosClient";

const axiosClient = createAxiosClient();

export interface PermissionModuleInfo {
  key: string;
  label: string;
  group: string;
}

export interface AdminRole {
  id: string;
  name: string;
  description?: string | null;
  permissions: string[];
  isSystem: boolean;
  locked: boolean; // Administrator: always full access, not editable
  adminCount: number;
}

type Result<T> = { success: true; data: T; message?: string } | { success: false; message: string };

const run = async <T>(request: () => Promise<any>, fallback: string): Promise<Result<T>> => {
  try {
    const response = await request();
    return { success: true, data: response.data.data, message: response.data.message };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || fallback };
  }
};

// Roles & permissions management — super admins only (backend enforces)
export const adminRoleService = {
  getPermissionCatalog: () =>
    run<PermissionModuleInfo[]>(() => axiosClient.get("/admin-roles/permissions"), "Failed to load permissions"),

  getRoles: () => run<AdminRole[]>(() => axiosClient.get("/admin-roles"), "Failed to load roles"),

  createRole: (data: { name: string; description?: string; permissions: string[] }) =>
    run<AdminRole>(() => axiosClient.post("/admin-roles", data), "Failed to create role"),

  updateRole: (id: string, data: { name?: string; description?: string; permissions?: string[] }) =>
    run<AdminRole>(() => axiosClient.patch(`/admin-roles/${id}`, data), "Failed to update role"),

  deleteRole: (id: string) =>
    run<null>(() => axiosClient.delete(`/admin-roles/${id}`), "Failed to delete role"),

  assignRole: (adminId: string, adminRoleId: string) =>
    run<any>(() => axiosClient.patch(`/admin-roles/assign/${adminId}`, { adminRoleId }), "Failed to assign role"),
};
