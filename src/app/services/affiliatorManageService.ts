import createAxiosClient from "@/app/hooks/axiosClient";

/** A customer's own affiliators: invite with a code, permissions, pause, trash, delete with a code */

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

export interface AffiliatorInvitation {
  id: string;
  name: string;
  phone: string;
  permissions: string[];
  expiresAt: string;
}

const api = () => createAxiosClient();
const data = <T,>(p: Promise<{ data: { data: T; message?: string } }>) => p.then((r) => r.data.data);

export const affiliatorManageService = {
  permissions: () => data<AffiliatorPermissionOption[]>(api().get("/affiliators/manage/permissions")),
  list: (trash = false) =>
    data<{ affiliators: ManagedAffiliator[]; invitations: AffiliatorInvitation[] }>(
      api().get("/affiliators/manage", { params: trash ? { trash: 1 } : {} }),
    ),
  /** Step 1: a code is sent to the affiliator's phone */
  invite: (body: { name: string; phone: string; email?: string; permissions: string[] }) =>
    data<{ invitationId: string; phone: string; expiresAt: string }>(api().post("/affiliators/manage/invite", body)),
  resend: (invitationId: string) => data(api().post(`/affiliators/manage/invite/${invitationId}/resend`)),
  /** Step 2: the code the affiliator received; only then the affiliator exists */
  confirm: (invitationId: string, otp: string) =>
    data<ManagedAffiliator>(api().post(`/affiliators/manage/invite/${invitationId}/confirm`, { otp })),
  cancelInvite: (invitationId: string) => data(api().delete(`/affiliators/manage/invite/${invitationId}`)),
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
