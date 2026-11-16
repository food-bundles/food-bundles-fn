/* eslint-disable @typescript-eslint/no-explicit-any */
import createAxiosClient from "@/app/hooks/axiosClient";

/** A role the signed-in person holds (one person can be customer, farmer, aggregator…) */
export interface PersonRole {
  role: string;
  label: string;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  userType: "farmer" | "restaurant" | "affiliator" | "admin";
  profileId: string | null;
}

export const roleService = {
  getMyRoles: async (): Promise<{ activeRole: string | null; roles: PersonRole[]; defaultRole?: string | null; defaultRoleAsked?: boolean }> => {
    const response = await createAxiosClient().get("/my-roles");
    return response.data?.data ?? { activeRole: null, roles: [] };
  },

  /** The account opened at every login (null = the one used last) */
  setDefaultRole: async (role: string | null) =>
    (await createAxiosClient().put("/my-default-role", { role })).data as { message: string },

  /** Answer the first-login question without choosing */
  skipDefaultRole: async () => (await createAxiosClient().put("/my-default-role", { skip: true })).data,

  /** Open another role: returns a new session for that role */
  switchRole: async (role: string) => {
    const response = await createAxiosClient().post("/switch-role", { role });
    return response.data as {
      success: boolean;
      token: string;
      data: { user: any; userType: string; activeRole: string; roles: PersonRole[] };
    };
  },
};

export interface RoleOption {
  role: string;
  label: string;
  requiresApproval?: boolean;
}

export interface RoleApplication {
  id: string;
  userId: string;
  fromRole: string | null;
  fromLabel?: string | null;
  targetRole: string;
  targetLabel: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  details: Record<string, unknown> | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  user?: { id: string; name: string | null; email: string | null; phone: string | null; roles: { role: string; label: string; status: string }[] };
}

export interface RoleRule {
  id: string;
  fromRole: string;
  targetRole: string;
  requiresApproval: boolean;
  enabled: boolean;
}

/** "Apply to be …" (rules set by a super admin) and opening other dashboards */
export const roleApplicationService = {
  /** From the active dashboard: roles to apply for, dashboards to open, my requests */
  getOptions: async (): Promise<{ apply: RoleOption[]; actAs: RoleOption[]; applications: RoleApplication[] }> => {
    const response = await createAxiosClient().get("/role-applications/options");
    return response.data?.data ?? { apply: [], actAs: [], applications: [] };
  },
  apply: async (targetRole: string, details: Record<string, unknown>) => {
    const response = await createAxiosClient().post("/role-applications/apply", { targetRole, details });
    return response.data as { message: string; data: { status: "ACTIVE" | "PENDING" } };
  },
  cancel: async (id: string) => (await createAxiosClient().post(`/role-applications/mine/${id}/cancel`)).data,

  // Dashboard
  list: async (status = "PENDING"): Promise<RoleApplication[]> =>
    (await createAxiosClient().get("/role-applications", { params: { status } })).data?.data ?? [],
  approve: async (id: string, body: { adminRoleId?: string | null; note?: string } = {}) =>
    (await createAxiosClient().post(`/role-applications/${id}/approve`, body)).data,
  reject: async (id: string, note?: string) => (await createAxiosClient().post(`/role-applications/${id}/reject`, { note })).data,
  getRules: async (): Promise<{ rules: RoleRule[]; dashboards: RoleOption[]; applicable: RoleOption[] }> =>
    (await createAxiosClient().get("/role-applications/rules")).data?.data,
  saveRule: async (rule: Omit<RoleRule, "id">) => (await createAxiosClient().put("/role-applications/rules", rule)).data,
  deleteRule: async (id: string) => (await createAxiosClient().delete(`/role-applications/rules/${id}`)).data,
};

export interface PersonRoleDetail {
  role: string;
  label: string;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  kind: "farmer" | "restaurant" | "affiliator" | "admin";
  dashboardRole: string | null;
  grantedBy: string | null;
  since: string;
  isThisAccount: boolean;
  account: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    createdAt: string;
    deletedAt: string | null;
    tin?: string;
    verified?: boolean;
    accountRole?: string;
  } | null;
}

export interface PersonOfProfile {
  person: { id: string; name: string | null; email: string | null; phone: string | null; lastActiveRole: string | null; createdAt: string } | null;
  roles: PersonRoleDetail[];
  applications: { id: string; targetRole: string; targetLabel: string; status: string; createdAt: string; reviewNote: string | null }[];
  mergeNotes: Record<string, any> | null;
  addable?: RoleOption[];
}

/** Admins managing a person's roles (User Lookup) */
export const personAdminService = {
  ofProfile: async (profileId: string): Promise<PersonOfProfile> =>
    (await createAxiosClient().get(`/people/of-profile/${profileId}`)).data?.data,
  addRole: async (userId: string, body: { role: string; details?: Record<string, unknown>; adminRoleId?: string | null }) =>
    (await createAxiosClient().post(`/people/${userId}/roles`, body)).data,
  setStatus: async (userId: string, role: string, status: "ACTIVE" | "SUSPENDED") =>
    (await createAxiosClient().patch(`/people/${userId}/roles/${role}`, { status })).data,
  removeRole: async (userId: string, role: string) => (await createAxiosClient().delete(`/people/${userId}/roles/${role}`)).data,
  /** Invite form: the account this email already belongs to */
  byEmail: async (
    email: string,
  ): Promise<{ name: string | null; roles: { role: string; label: string; status: string }[]; unlinked: boolean } | null> =>
    (await createAxiosClient().get("/people/by-email", { params: { email } })).data?.data ?? null,
};
