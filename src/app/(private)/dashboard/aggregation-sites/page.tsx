"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2, MapPin, Pencil, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  AggregationSite,
  AggregationSiteUpdate,
  aggregationSiteService,
} from "@/app/services/aggregationSiteService";

type StatusFilter = "all" | "active" | "inactive";

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
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [editing, setEditing] = useState<AggregationSite | null>(null);
  const [form, setForm] = useState({ name: "", district: "", province: "", latitude: "", longitude: "" });
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

  const replaceSite = (updated: AggregationSite) =>
    setSites((current) => current.map((s) => (s.id === updated.id ? updated : s)));

  const toggleActive = useCallback(async (site: AggregationSite, isActive: boolean) => {
    setTogglingId(site.id);
    try {
      const updated = await aggregationSiteService.update(site.id, { isActive });
      setSites((current) => current.map((s) => (s.id === updated.id ? updated : s)));
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
  const coordinatesValid =
    form.latitude.trim() !== "" &&
    form.longitude.trim() !== "" &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180;
  const formValid = form.name.trim().length > 0 && coordinatesValid;

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
      replaceSite(await aggregationSiteService.update(editing.id, changes));
      toast.success("Site updated. New harvests use the new details right away.");
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
        accessorKey: "lastPriceDate",
        header: "Last WFP price",
        cell: ({ row }) => <div className="text-xs">{formatDate(row.original.lastPriceDate)}</div>,
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
      ...(canEdit
        ? [
            {
              id: "actions",
              header: "",
              cell: ({ row }) => (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(row.original)}
                  aria-label={`Edit ${row.original.name}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              ),
            } as ColumnDef<AggregationSite>,
          ]
        : []),
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
            Where farmers bring their harvest. Each farmer is sent to the active site nearest to them. Sites come from the
            markets in the WFP price list; switch off the ones that are not real collection points.
          </p>
        </div>
        {canEdit && (
          <Button variant="outline" size="sm" onClick={sync} disabled={syncing}>
            {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Sync from WFP markets
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      <Dialog open={!!editing} onOpenChange={(open) => !open && !saving && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit site</DialogTitle>
            <DialogDescription>
              Correct the name or the exact location. WFP coordinates are only accurate to about 1 km, so use the real
              collection point.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="site-name">Name</Label>
              <Input id="site-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="site-district">District</Label>
                <Input
                  id="site-district"
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="site-province">Province</Label>
                <Input
                  id="site-province"
                  value={form.province}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="site-lat">Latitude</Label>
                <Input
                  id="site-lat"
                  inputMode="decimal"
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="site-lng">Longitude</Label>
                <Input
                  id="site-lng"
                  inputMode="decimal"
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                />
              </div>
            </div>
            {!coordinatesValid && (
              <p className="text-xs text-red-600">Latitude must be between -90 and 90, longitude between -180 and 180.</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="green" onClick={saveEdit} disabled={!formValid || saving}>
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
