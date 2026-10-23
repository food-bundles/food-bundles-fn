import createAxiosClient from "@/app/hooks/axiosClient";

export type TrashUserType = "farmer" | "restaurant" | "admin";

export interface TrashedUser {
  id: string;
  type: TrashUserType;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
  deletedAt: string;
  deletedByName: string | null;
}

const message = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

/** Super admin: trashed (soft-deleted) users — restore or delete forever. */
export const userTrashService = {
  list: async (type?: TrashUserType): Promise<TrashedUser[]> => {
    const response = await createAxiosClient().get("/user-admin/trash", {
      params: type ? { type } : undefined,
    });
    return response.data?.data || [];
  },

  restore: async (type: TrashUserType, id: string) => {
    try {
      await createAxiosClient().patch(`/user-admin/trash/${type}/${id}/restore`);
    } catch (error) {
      throw new Error(message(error, "Failed to restore user"));
    }
  },

  deleteForever: async (type: TrashUserType, id: string) => {
    try {
      await createAxiosClient().delete(`/user-admin/trash/${type}/${id}`);
    } catch (error) {
      throw new Error(message(error, "Failed to delete user"));
    }
  },
};
