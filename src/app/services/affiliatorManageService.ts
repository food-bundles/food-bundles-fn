import createAxiosClient from "@/app/hooks/axiosClient";

/**
 * A customer's own affiliators: create (login details sent by SMS), permissions,
 * pause, trash, delete with a code
 */

export interface AffiliatorPermissionOption {
  key: string;
  label: string;
}

export interface ManagedAffiliator {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: "ACTIVE" | "INACTIVE";
  permissions: string[];
  deletedAt: string | null;
  createdAt: string;
  _count?: { orders: number };
}

const api = () => createAxiosClient();
const data = <T,>(p: Promise<{ data: { data: T; message?: string } }>) => p.then((r) => r.data.data);

export const affiliatorManageService = {
  permissions: () => data<AffiliatorPermissionOption[]>(api().get("/affiliators/manage/permissions")),
  list: (trash = false) =>
    data<{ affiliators: ManagedAffiliator[] }>(api().get("/affiliators/manage", { params: trash ? { trash: 1 } : {} })),
  /** Creates the affiliator; their phone gets an SMS with the phone number and a password to log in */
  create: (body: { name: string; phone: string; email?: string; permissions: string[] }) =>
    data<{ affiliator: ManagedAffiliator; sentTo: string; smsSent: boolean; existingAccount: boolean }>(
      api().post("/affiliators/manage", body),
    ),
  /** Lost SMS: a new login code replaces the affiliator's password */
  resendLogin: (id: string) => data<{ sentTo: string }>(api().post(`/affiliators/manage/${id}/resend-login`)),
  setPermissions: (id: string, permissions: string[]) => data(api().patch(`/affiliators/manage/${id}/permissions`, { permissions })),
  setStatus: (id: string, status: "ACTIVE" | "INACTIVE") => data(api().patch(`/affiliators/manage/${id}/status`, { status })),
  trash: (id: string) => data(api().post(`/affiliators/manage/${id}/trash`)),
  restore: (id: string) => data(api().post(`/affiliators/manage/${id}/restore`)),
  /** Delete for good: a code goes to the owner's phone first */
  deleteCode: (id: string) => data<{ sentTo: string }>(api().post(`/affiliators/manage/${id}/delete-code`)),
  deleteForGood: (id: string, otp: string) => data(api().post(`/affiliators/manage/${id}/delete`, { otp })),
};

export const apiMessage = (e: unknown, fallback: string) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;
