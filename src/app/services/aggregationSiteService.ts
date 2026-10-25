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
  list: async (filters?: { active?: boolean; district?: string }): Promise<AggregationSite[]> => {
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
};
