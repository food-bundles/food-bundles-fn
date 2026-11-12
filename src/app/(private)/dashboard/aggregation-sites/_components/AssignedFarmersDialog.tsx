"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, MapPin, Search, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AssignedFarmers, aggregationSiteService } from "@/app/services/aggregationSiteService";

type Farmer = AssignedFarmers["farmers"][number];

const errorMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

const initialsOf = (farmer: Farmer) => {
  const source = (farmer.name || farmer.phone || "?").trim();
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

interface SiteGroup {
  id: string;
  name: string;
  district: string | null;
  farmers: Farmer[];
}

interface AssignedFarmersDialogProps {
  open: boolean;
  onClose: () => void;
}

/** Only the farmers who are assigned to an aggregation site, grouped under the site they deliver to. */
export function AssignedFarmersDialog({ open, onClose }: AssignedFarmersDialogProps) {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<AssignedFarmers | null>(null);
  const [loading, setLoading] = useState(false);

  // Start fresh each time it opens
  useEffect(() => {
    if (open) {
      setSearch("");
      setData(null);
    }
  }, [open]);

  // Load, and search as the admin types (after a short pause)
  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    const timer = setTimeout(() => {
      aggregationSiteService
        .assignedFarmers({ search })
        .then((result) => active && setData(result))
        .catch((error) => active && toast.error(errorMessage(error, "Failed to load the farmers")))
        .finally(() => active && setLoading(false));
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [open, search]);

  // The list arrives ordered by site, so farmers of one site are already next to each other
  const groups = useMemo<SiteGroup[]>(() => {
    const bySite = new Map<string, SiteGroup>();
    for (const farmer of data?.farmers ?? []) {
      const site = farmer.aggregationSite;
      if (!site) continue;
      const group = bySite.get(site.id) ?? { id: site.id, name: site.name, district: site.district, farmers: [] };
      group.farmers.push(farmer);
      bySite.set(site.id, group);
    }
    return [...bySite.values()];
  }, [data]);

  const chosenByAdmin = (data?.farmers ?? []).filter((f) => f.siteAssignedByAdmin).length;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-2xl gap-0 p-0 overflow-hidden">
        <DialogHeader className="space-y-1 border-b bg-purple-50/60 px-5 py-4">
          <DialogTitle className="flex items-center gap-2 text-[15px]">
            <Users className="h-4 w-4 text-purple-600" />
            Farmers assigned to a site
          </DialogTitle>
          <DialogDescription className="text-xs">
            Only farmers who have an aggregation site, grouped by the site they deliver to.
          </DialogDescription>

          {data && (
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="rounded-full border bg-white px-2.5 py-0.5 text-[11px] font-medium text-purple-700">
                {data.total} farmer{data.total === 1 ? "" : "s"}
              </span>
              <span className="rounded-full border bg-white px-2.5 py-0.5 text-[11px] font-medium text-gray-700">
                {groups.length} site{groups.length === 1 ? "" : "s"}
              </span>
              {chosenByAdmin > 0 && (
                <span className="rounded-full border bg-white px-2.5 py-0.5 text-[11px] font-medium text-gray-700">
                  {chosenByAdmin} chosen by an admin
                </span>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="border-b px-5 py-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, place or site"
              className="h-9 pl-8 text-xs"
            />
            {loading && data && (
              <Loader2 className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-gray-400" />
            )}
          </div>
        </div>

        <div className="max-h-[26rem] overflow-y-auto px-5 py-3">
          {!data ? (
            <div className="flex items-center justify-center gap-2 py-12 text-xs text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : groups.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Users className="h-8 w-8 text-gray-300" />
              <p className="text-xs text-gray-500">
                {search.trim() ? "No assigned farmer matches your search." : "No farmer is assigned to a site yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <section key={group.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <h3 className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-gray-800">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-green-600" />
                      <span className="truncate">{group.name}</span>
                      {group.district && group.district !== group.name && (
                        <span className="truncate font-normal text-gray-500">· {group.district}</span>
                      )}
                    </h3>
                    <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
                      {group.farmers.length} farmer{group.farmers.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <ul className="divide-y rounded-lg border bg-white">
                    {group.farmers.map((farmer) => (
                      <li key={farmer.id} className="flex items-center gap-3 px-3 py-2.5">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[11px] font-semibold text-purple-700"
                          aria-hidden
                        >
                          {initialsOf(farmer)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-gray-900">
                            {farmer.name || farmer.phone || "Farmer"}
                          </p>
                          <p className="truncate text-[11px] text-gray-500">
                            {[[farmer.sector, farmer.district].filter(Boolean).join(", "), farmer.name ? farmer.phone : null]
                              .filter(Boolean)
                              .join(" · ") || "No place on file"}
                          </p>
                        </div>
                        {farmer.siteAssignedByAdmin ? (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                            <ShieldCheck className="h-3 w-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                            Nearest
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}

              {data.total > data.farmers.length && (
                <p className="text-center text-[11px] text-gray-500">
                  Showing the first {data.farmers.length} of {data.total}. Search to narrow the list.
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
