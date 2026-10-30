"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2, MapPin, Pencil, Plus, RefreshCw, Search, Users, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { locationService } from "@/app/services/locationService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table";
import { useAdminAccess } from "@/app/hooks/useAdminAccess";
import {
  AggregationSiteUpdate,
  AggregationSiteWithCounts as AggregationSite,
  aggregationSiteService,
  isManualSite,
} from "@/app/services/aggregationSiteService";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { SiteMembersDialog } from "./_components/SiteMembersDialog";
import { AssignedFarmersDialog } from "./_components/AssignedFarmersDialog";

// Leaflet needs the browser, so the map is only loaded on the client
const MapComponent = dynamic(() => import("@/app/(private)/restaurant/checkout/_components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded border border-gray-300 bg-gray-100">
      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
    </div>
  ),
});

type StatusFilter ="all" | "active" | "inactive";

const errorMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "-";

export default function AggregationSitesPage() {
  const { user, isSuperAdmin } = useAdminAccess();
  // The backend guards the update and sync routes with "markets.edit"
  const canEdit = isSuperAdmin || !!user?.permissions?.includes("markets.edit");

  const [sites, setSites] = useState<AggregationSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [syncing, setSyncing] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [viewing, setViewing] = useState<AggregationSite | null>(null);
  const [showAssigned, setShowAssigned] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // "new" while the admin adds a site by hand, a site while they edit one
  const [editing, setEditing] = useState<AggregationSite | "new" | null>(null);
  const [form, setForm] = useState({ name: "", district: "", province: "", latitude: "", longitude: "" });
  const isNew = editing === "new";

  // Rwanda's provinces and the districts of the chosen one, the same list farmers pick from, so a site's
  // district matches theirs exactly (nearest-site matching and supply requests compare them)
  const [provinces, setProvinces] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  useEffect(() => {
    if (!editing || provinces.length > 0) return;
    locationService
      .fetchLocationHierarchy([])
      .then((result: unknown) => {
        const list = Array.isArray(result)
          ? result
          : ((result as { provinces?: unknown[] })?.provinces ?? []);
        setProvinces(list.map((p) => (typeof p === "string" ? p : (p as { name: string }).name)).filter(Boolean));
      })
      .catch(() => toast.error("Failed to load the provinces"));
  }, [editing, provinces.length]);

  useEffect(() => {
    if (!editing || !form.province) {
      setDistricts([]);
      return;
    }
    let active = true;
    setLoadingDistricts(true);
    locationService
      .getDistrictsByProvince(form.province)
      .then((list) => active && setDistricts(list))
      .finally(() => active && setLoadingDistricts(false));
    return () => {
      active = false;
    };
  }, [editing, form.province]);

  // A site from the WFP list may spell its place differently: keep its current value as a choice
  const withCurrent = (list: string[], current: string) =>
    current && !list.some((v) => v.toLowerCase() === current.toLowerCase()) ? [current, ...list] : list;
  const provinceOptions = withCurrent(provinces, form.province);
  const districtOptions = withCurrent(districts, form.district);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      setSites(await aggregationSiteService.list());
    } catch (error) {
      setLoadError(true);
      toast.error(errorMessage(error, "Failed to load aggregation sites"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // The update endpoint returns the site without its counts, so keep the ones already loaded
  const replaceSite = (updated: Partial<AggregationSite> & { id: string }) =>
    setSites((current) => current.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));

  const toggleActive = useCallback(async (site: AggregationSite, isActive: boolean) => {
    setTogglingId(site.id);
    try {
      replaceSite(await aggregationSiteService.update(site.id, { isActive }));
      toast.success(`${site.name} ${isActive ? "is now an active site" : "was switched off"}`);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to update the site"));
    } finally {
      setTogglingId(null);
    }
  }, []);

  const sync = async () => {
    setSyncing(true);
    try {
      const result = await aggregationSiteService.syncFromWfp();
      await load();
      toast.success(
        result.created
          ? `${result.created} new market${result.created === 1 ? "" : "s"} added from the WFP price list`
          : "No new markets in the WFP price list"
      );
    } catch (error) {
      toast.error(errorMessage(error, "Failed to sync from the WFP price list"));
    } finally {
      setSyncing(false);
    }
  };

  const assignAll = async () => {
    setAssigning(true);
    try {
      const result = await aggregationSiteService.assignAll();
      await load();
      toast.success(
        result.farmersAssigned + result.aggregatorsAssigned
          ? `Sites assigned: ${result.farmersAssigned} farmer${result.farmersAssigned === 1 ? "" : "s"} and ${result.aggregatorsAssigned} aggregator${result.aggregatorsAssigned === 1 ? "" : "s"}`
          : "Everyone who can be placed already has a site"
      );
    } catch (error) {
      toast.error(errorMessage(error, "Failed to assign the sites"));
    } finally {
      setAssigning(false);
    }
  };

  const openCreate = () => {
    setEditing("new");
    setForm({ name: "", district: "", province: "", latitude: "", longitude: "" });
  };

  const openEdit = useCallback((site: AggregationSite) => {
    setEditing(site);
    setForm({
      name: site.name,
      district: site.district ?? "",
      province: site.province ?? "",
      latitude: String(site.latitude),
      longitude: String(site.longitude),
    });
  }, []);

  const latitude = Number(form.latitude);
  const longitude = Number(form.longitude);
  // A new site may leave both coordinates empty (it is then placed at its district's centre); an edit keeps them
  const noCoordinates = form.latitude.trim() === "" && form.longitude.trim() === "";
  const coordinatesValid =
    (isNew && noCoordinates) ||
    (form.latitude.trim() !== "" &&
      form.longitude.trim() !== "" &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      Math.abs(latitude) <= 90 &&
      Math.abs(longitude) <= 180);
  // Without coordinates the backend needs a place to work the position out from
  const placeGiven = form.district.trim() !== "" || form.province.trim() !== "";
  const formValid = form.name.trim().length > 0 && coordinatesValid && (!isNew || !noCoordinates || placeGiven);

  // The pin on the map, only once both fields hold a usable point
  const pin =
    !noCoordinates && coordinatesValid ? { lat: latitude, lng: longitude } : null;
  // Fly the map to the chosen district (or province) so the admin starts near the place. A pin already
  // on the map is never moved by this.
  const [focus, setFocus] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  const hasPin = useRef(false);
  hasPin.current = !!pin;
  useEffect(() => {
    if (!editing) {
      setFocus(null);
      return;
    }
    const place = form.district || form.province;
    if (!place || hasPin.current) return;
    const controller = new AbortController();
    const query = `${place}${form.district ? " District" : " Province"}, Rwanda`;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=rw&q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((results: { lat: string; lon: string }[]) => {
        if (results[0] && !hasPin.current) {
          setFocus({ lat: Number(results[0].lat), lng: Number(results[0].lon), zoom: form.district ? 13 : 10 });
        }
      })
      .catch(() => {}); // the map simply stays where it is
    return () => controller.abort();
  }, [editing, form.district, form.province]);

  const pinLocation =({ lat, lng }: { lat: number; lng: number }) =>
    setForm((current) => ({ ...current, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));

  const saveEdit = async () => {
    if (!editing || !formValid) return;
    const changes: AggregationSiteUpdate = {
      name: form.name.trim(),
      district: form.district.trim() || null,
      province: form.province.trim() || null,
      latitude,
      longitude,
    };
    setSaving(true);
    try {
      if (editing === "new") {
        const created = await aggregationSiteService.create({
          ...changes,
          name: changes.name!,
          ...(noCoordinates ? {} : { latitude, longitude }),
        });
        const { approximate, ...site } = created;
        setSites((current) => [...current, site]);
        setSearch("");
        toast.success(
          `${site.name} added${approximate ? ` at the centre of ${site.district || site.province}. Edit it to set the exact point` : ""}. Use "Assign nearest sites" to give it the people who have no site yet, or add them from the site.`
        );
      } else {
        replaceSite(await aggregationSiteService.update(editing.id, changes));
        toast.success("Site updated. New harvests use the new details right away.");
      }
      setEditing(null);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to save the site"));
    } finally {
      setSaving(false);
    }
  };

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return sites.filter((s) => {
      if (status === "active" && !s.isActive) return false;
      if (status === "inactive" && s.isActive) return false;
      if (!needle) return true;
      return [s.name, s.district, s.province].some((v) => v?.toLowerCase().includes(needle));
    });
  }, [sites, search, status]);

  const activeCount = sites.filter((s) => s.isActive).length;
  const farmersAssigned = sites.reduce((sum, s) => sum + s.farmerCount, 0);
  const aggregatorsAssigned = sites.reduce((sum, s) => sum + s.aggregatorCount, 0);
  const sitesWithFarmers = sites.filter((s) => s.farmerCount > 0).length;

  const columns = useMemo<ColumnDef<AggregationSite>[]>(
    () => [
      {
        id: "number",
        header: "#",
        // Continues across pages: row.index is the position in the filtered list, not in the page
        cell: ({ row }) => <div className="text-xs">{row.index + 1}</div>,
      },
      {
        accessorKey: "name",
        header: "Site",
        cell: ({ row }) => <div className="text-xs font-medium">{row.original.name}</div>,
      },
      {
        accessorKey: "district",
        header: "District",
        cell: ({ row }) => <div className="text-xs">{row.original.district ?? "-"}</div>,
      },
      {
        accessorKey: "province",
        header: "Province",
        cell: ({ row }) => <div className="text-xs">{row.original.province ?? "-"}</div>,
      },
      {
        id: "coordinates",
        header: "Coordinates",
        cell: ({ row }) => (
          <div className="text-xs tabular-nums">
            {row.original.latitude.toFixed(3)}, {row.original.longitude.toFixed(3)}
          </div>
        ),
      },
      {
        id: "aggregators",
        header: "Aggregators",
        cell: ({ row }) => <div className="text-xs tabular-nums">{row.original.aggregatorCount}</div>,
      },
      {
        id: "farmers",
        header: "Farmers",
        cell: ({ row }) => <div className="text-xs tabular-nums">{row.original.farmerCount}</div>,
      },
      {
        accessorKey: "lastPriceDate",
        header: "Last WFP price",
        cell: ({ row }) =>
          isManualSite(row.original) ? (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">Added by admin</span>
          ) : (
            <div className="text-xs">{formatDate(row.original.lastPriceDate)}</div>
          ),
      },
      {
        id: "active",
        header: "Active",
        cell: ({ row }) => (
          <Switch
            checked={row.original.isActive}
            disabled={!canEdit || togglingId === row.original.id}
            onCheckedChange={(checked) => toggleActive(row.original, checked)}
            aria-label={`${row.original.name} active`}
          />
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewing(row.original)}
              aria-label={`People at ${row.original.name}`}
            >
              <Users className="h-3.5 w-3.5" />
            </Button>
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEdit(row.original)}
                aria-label={`Edit ${row.original.name}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [canEdit, togglingId, toggleActive, openEdit]
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[16px] font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-600" />
            Aggregation Sites
          </h1>
          <p className="text-xs text-gray-600 max-w-xl">
            Where farmers and aggregators meet. Each farmer and each aggregator is given the active site nearest to them
            automatically, and an admin can choose another one from Users. Sites come from the markets in the WFP price
            list, and you can add your own collection points; switch off the ones that are not real collection points.
          </p>
        </div>
        {canEdit && (
          <div className="flex flex-wrap gap-2">
            <Button variant="green" size="sm" onClick={openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Add site
            </Button>
            <Button variant="outline" size="sm" onClick={assignAll} disabled={assigning}>
              {assigning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
              Assign nearest sites
            </Button>
            <Button variant="outline" size="sm" onClick={sync} disabled={syncing}>
              {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Sync from WFP markets
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-lg border bg-green-50 transition-all duration-200 hover:shadow-md">
          <div className="space-y-1">
            <p className="text-xs text-gray-600 font-medium">Active Sites</p>
            <p className="text-sm font-bold text-green-600">{activeCount}</p>
          </div>
        </div>
        <div className="p-4 rounded-lg border bg-yellow-50 transition-all duration-200 hover:shadow-md">
          <div className="space-y-1">
            <p className="text-xs text-gray-600 font-medium">Switched Off</p>
            <p className="text-sm font-bold text-yellow-600">{sites.length - activeCount}</p>
          </div>
        </div>
        <div className="p-4 rounded-lg border bg-blue-50 transition-all duration-200 hover:shadow-md">
          <div className="space-y-1">
            <p className="text-xs text-gray-600 font-medium">Total Sites</p>
            <p className="text-sm font-bold text-blue-600">{sites.length}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAssigned(true)}
          className="p-4 rounded-lg border bg-purple-50 text-left transition-all duration-200 hover:shadow-md cursor-pointer"
          aria-label="Show the farmers assigned to a site"
        >
          <div className="space-y-1">
            <p className="text-xs text-gray-600 font-medium">Farmers Assigned</p>
            <p className="text-sm font-bold text-purple-600">{farmersAssigned}</p>
            <p className="text-[11px] text-gray-500">
              across {sitesWithFarmers} site{sitesWithFarmers === 1 ? "" : "s"} · click to see them
            </p>
          </div>
        </button>
        <div className="p-4 rounded-lg border bg-orange-50 transition-all duration-200 hover:shadow-md">
          <div className="space-y-1">
            <p className="text-xs text-gray-600 font-medium">Aggregators Assigned</p>
            <p className="text-sm font-bold text-orange-600">{aggregatorsAssigned}</p>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          Could not load the sites.{" "}
          <button className="underline" onClick={load}>
            Try again
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={visible}
        isLoading={isLoading}
        showPagination
        showColumnVisibility={false}
        showRowSelection={false}
        customFilters={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, district or province"
                className="pl-7 h-8 text-xs"
              />
            </div>
            {(["all", "active", "inactive"] as StatusFilter[]).map((key) => (
              <Button
                key={key}
                size="sm"
                variant={status === key ? "green" : "outline"}
                onClick={() => setStatus(key)}
                className="capitalize"
              >
                {key === "inactive" ? "Switched off" : key}
              </Button>
            ))}
          </div>
        }
      />

      <AssignedFarmersDialog open={showAssigned} onClose={() => setShowAssigned(false)} />
      <SiteMembersDialog site={viewing} onClose={() => setViewing(null)} canEdit={canEdit} onChanged={load} />

      <Dialog open={!!editing} onOpenChange={(open) => !open && !saving && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? "Add aggregation site" : "Edit site"}</DialogTitle>
            <DialogDescription>
              {isNew
                ? "A collection point where farmers bring their harvest and aggregators collect it. Use the exact place: farmers are matched to the site nearest to them."
                : "Correct the name or the exact location. WFP coordinates are only accurate to about 1 km, so use the real collection point."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="site-name">Name</Label>
              <Input
                id="site-name"
                value={form.name}
                placeholder={isNew ? "e.g. Kimironko collection point" : undefined}
                autoFocus={isNew}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            {/* Province first: it decides which districts can be picked */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="site-province">Province</Label>
                <Select
                  value={form.province || undefined}
                  onValueChange={(province) =>
                    setForm((current) => ({
                      ...current,
                      province,
                      // A district belongs to one province: changing the province clears it
                      district: province === current.province ? current.district : "",
                    }))
                  }
                >
                  <SelectTrigger id="site-province" className="w-full">
                    <SelectValue placeholder={provinces.length ? "Choose a province" : "Loading..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {provinceOptions.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="site-district">District</Label>
                <Select
                  value={form.district || undefined}
                  onValueChange={(district) => setForm((current) => ({ ...current, district }))}
                  disabled={!form.province}
                >
                  <SelectTrigger id="site-district" className="w-full">
                    <SelectValue
                      placeholder={
                        !form.province ? "Choose a province first" : loadingDistricts ? "Loading..." : "Choose a district"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {districtOptions.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Pin the collection point on the map</Label>
              <div className="h-64">
                <MapComponent tempLocation={pin} onLocationSelect={pinLocation} showLocateButton focus={focus} />
              </div>
              <p className="text-[11px] text-gray-500">
                Click the map to drop the pin; the latitude and longitude below are filled in for you.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="site-lat">
                  Latitude{isNew && <span className="font-normal text-gray-400"> (optional)</span>}
                </Label>
                <Input
                  id="site-lat"
                  inputMode="decimal"
                  placeholder={isNew ? "-1.9441" : undefined}
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="site-lng">
                  Longitude{isNew && <span className="font-normal text-gray-400"> (optional)</span>}
                </Label>
                <Input
                  id="site-lng"
                  inputMode="decimal"
                  placeholder={isNew ? "30.0619" : undefined}
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                />
              </div>
            </div>
            {!coordinatesValid && (
              <p className="text-xs text-red-600">
                {isNew
                  ? "Fill in both latitude and longitude, or leave both empty."
                  : "Latitude must be between -90 and 90, longitude between -180 and 180."}
              </p>
            )}
            {isNew && coordinatesValid && noCoordinates && !placeGiven && (
              <p className="text-xs text-amber-700">Without coordinates, add the district or province so farmers can be matched to this site.</p>
            )}
            {isNew && (
              <p className="text-[11px] text-gray-500">
                Without coordinates the site is placed at the centre of its district, and you can set the exact point
                later by pinning it on the map.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="green" onClick={saveEdit} disabled={!formValid || saving}>
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isNew ? "Add site" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
