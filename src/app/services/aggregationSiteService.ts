import createAxiosClient from "../hooks/axiosClient";

export interface AggregationSite {
  id: string;
  name: string;
  /** WfpMarketPrice market this site came from */
  marketName: string;
  province: string | null;
  district: string | null;
  latitude: number;
  longitude: number;
  isActive: boolean;
  lastPriceDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AggregationSiteWithCounts extends AggregationSite {
  /** Farmers who deliver to this site */
  farmerCount: number;
  /** Aggregators who work from this site */
  aggregatorCount: number;
}

export interface SiteMembers {
  site: AggregationSite;
  aggregators: { id: string; username: string; phone: string | null; email: string; siteAssignedByAdmin: boolean }[];
  farmers: {
    id: string;
    name: string | null;
    phone: string | null;
    district: string | null;
    sector: string | null;
    siteAssignedByAdmin: boolean;
  }[];
  /** Harvests on their way to this site (pending, offered or approved) with the day and time the farmer chose */
  deliveries: {
    id: string;
    productName: string;
    submittedQty: number | null;
    status: string;
    deliveryDate: string | null;
    farmer: { id: string; name: string | null; phone: string | null };
  }[];
}

export interface SiteAssignment {
  site: AggregationSite | null;
  /** true when an admin chose the site; false when it is the automatic nearest one */
  assignedByAdmin: boolean;
}

export interface SiteCandidate {
  id: string;
  name: string | null;
  phone: string | null;
  /** Sector and district for a farmer, district for an aggregator */
  place: string;
  /** The site they are on now, if any */
  currentSite: { id: string; name: string } | null;
}

export interface AssignedFarmers {
  /** All matching farmers; `farmers` holds the first 500 */
  total: number;
  farmers: {
    id: string;
    name: string | null;
    phone: string | null;
    district: string | null;
    sector: string | null;
    siteAssignedByAdmin: boolean;
    aggregationSite: { id: string; name: string; district: string | null } | null;
  }[];
}

export interface AddMembersResult {
  farmers: number;
  aggregators: number;
}

export interface RemoveMembersResult {
  released: number;
  /** Now on another site (their nearest) */
  moved: number;
  /** Their nearest site is this one, so they are still here, but no longer pinned by an admin */
  stillHere: number;
}

export interface AssignAllResult {
  farmers: number;
  farmersAssigned: number;
  aggregators: number;
  aggregatorsAssigned: number;
}

export interface AggregationSiteUpdate {
  name?: string;
  province?: string | null;
  district?: string | null;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
}

export interface SyncResult {
  markets: number;
  created: number;
}

export const aggregationSiteService = {
  // GET /aggregation-sites: every site, optionally only active/inactive ones or one district
  list: async (filters?: { active?: boolean; district?: string }): Promise<AggregationSiteWithCounts[]> => {
    const params: Record<string, string> = {};
    if (filters?.active !== undefined) params.active = String(filters.active);
    if (filters?.district) params.district = filters.district;
    const response = await createAxiosClient().get("/aggregation-sites", { params });
    return response.data.data;
  },

  // PATCH /aggregation-sites/:id: rename, correct coordinates or switch a site on/off
  update: async (id: string, changes: AggregationSiteUpdate): Promise<AggregationSite> => {
    const response = await createAxiosClient().patch(`/aggregation-sites/${id}`, changes);
    return response.data.data;
  },

  // POST /aggregation-sites/sync-wfp: adds only the markets that are new in the WFP price list; existing sites are not changed
  syncFromWfp: async (): Promise<SyncResult> => {
    const response = await createAxiosClient().post("/aggregation-sites/sync-wfp");
    return response.data.data;
  },

  // GET /aggregation-sites/:id/members: the aggregators, farmers and expected deliveries of one site
  members: async (id: string): Promise<SiteMembers> => {
    const response = await createAxiosClient().get(`/aggregation-sites/${id}/members`);
    return response.data.data;
  },

  // GET /aggregation-sites/farmers/:id and /aggregators/:id: the site a person is on now
  getAssignment: async (kind: "farmer" | "aggregator", id: string): Promise<SiteAssignment> => {
    const response = await createAxiosClient().get(`/aggregation-sites/${kind}s/${id}`);
    return response.data.data;
  },

  // PATCH /aggregation-sites/farmers/:id and /aggregators/:id: pick a site, or null for the nearest one again
  assign: async (kind: "farmer" | "aggregator", id: string, siteId: string | null): Promise<void> => {
    await createAxiosClient().patch(`/aggregation-sites/${kind}s/${id}`, { siteId });
  },

  // GET /aggregation-sites/:id/candidates: farmers or aggregators not on this site yet
  candidates: async (id: string, kind: "farmer" | "aggregator", search?: string): Promise<SiteCandidate[]> => {
    const response = await createAxiosClient().get(`/aggregation-sites/${id}/candidates`, {
      params: { kind, ...(search?.trim() ? { search: search.trim() } : {}) },
    });
    return response.data.data;
  },

  // POST /aggregation-sites/:id/members: put many people on this site; an admin choice that the nearest-site rule keeps
  addMembers: async (id: string, people: { farmerIds?: string[]; aggregatorIds?: string[] }): Promise<AddMembersResult> => {
    const response = await createAxiosClient().post(`/aggregation-sites/${id}/members`, people);
    return response.data.data;
  },

  // POST /aggregation-sites/:id/members/remove: hand people back to the nearest-site rule
  removeMembers: async (
    id: string,
    people: { farmerIds?: string[]; aggregatorIds?: string[] }
  ): Promise<RemoveMembersResult> => {
    const response = await createAxiosClient().post(`/aggregation-sites/${id}/members/remove`, people);
    return response.data.data;
  },

  // GET /aggregation-sites/assigned-farmers: only the farmers who are on a site, each with their site
  assignedFarmers: async (filters?: { search?: string; siteId?: string }): Promise<AssignedFarmers> => {
    const params: Record<string, string> = {};
    if (filters?.search?.trim()) params.search = filters.search.trim();
    if (filters?.siteId) params.siteId = filters.siteId;
    const response = await createAxiosClient().get("/aggregation-sites/assigned-farmers", { params });
    return response.data.data;
  },

  // POST /aggregation-sites/assign-all: give everyone without a site their nearest one
  assignAll: async (force = false): Promise<AssignAllResult> => {
    const response = await createAxiosClient().post("/aggregation-sites/assign-all", { force });
    return response.data.data;
  },
};
