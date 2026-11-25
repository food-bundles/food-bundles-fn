"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2, MapPin, Plus, Search, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { LocationFields, LocationValue } from "@/components/location-fields";
import { aggregationSiteService } from "@/app/services/aggregationSiteService";
import { RequestPlaceOptions, SupplyRequest, supplyRequestService } from "@/app/services/supplyRequestService";

const NO_AGGREGATOR = "__none__";

const formatKm = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`);
const EMPTY_PLACE: LocationValue = { province: "", district: "", sector: "", cell: "", village: "" };

const errorMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

interface CollapsibleSectionProps {
  icon: typeof MapPin;
  title: string;
  optional?: boolean;
  /** The current choice, shown in the header so it stays visible while the section is closed */
  summary: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

/** A dialog section that opens and closes from its header */
function CollapsibleSection({ icon: Icon, title, optional, summary, open, onToggle, children }: CollapsibleSectionProps) {
  return (
    <section className="rounded-lg border">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-50"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-gray-900">
            {title}
            {optional && <span className="font-normal text-gray-400"> (optional)</span>}
          </span>
          <span className="block truncate text-xs text-gray-500">{summary}</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-gray-500 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="space-y-3 border-t px-3 pb-3 pt-3">{children}</div>}
    </section>
  );
}

interface RequestPlaceDialogProps {
  request: SupplyRequest | null;
  /** May add a new aggregation site (markets.edit), not only pick one */
  canCreateSite: boolean;
  onClose: () => void;
  onSaved: (updated: SupplyRequest) => void;
}

/**
 * Where a supply request is served and who handles it: pick an aggregation site or add a new one, and
 * optionally the aggregator in charge. Used when no site could be found automatically, or to correct it.
 */
export function RequestPlaceDialog({ request, canCreateSite, onClose, onSaved }: RequestPlaceDialogProps) {
  const open = !!request;
  const [options, setOptions] = useState<RequestPlaceOptions | null>(null);
  const [mode, setMode] = useState<"pick" | "create">("pick");
  const [search, setSearch] = useState("");
  const [siteId, setSiteId] = useState<string | null>(null);
  // The aggregators in charge, the main one first; empty = the nearest one for each submission
  const [aggregatorIds, setAggregatorIds] = useState<string[]>([]);
  const [initialIds, setInitialIds] = useState<string[]>([]);
  const [newSite, setNewSite] = useState({ name: "", latitude: "", longitude: "" });
  const [newPlace, setNewPlace] = useState<LocationValue>(EMPTY_PLACE);
  const [saving, setSaving] = useState(false);
  // The site is the main choice, so it starts open; the optional aggregator starts closed
  const [siteOpen, setSiteOpen] = useState(true);
  const [aggregatorOpen, setAggregatorOpen] = useState(false);

  useEffect(() => {
    if (!request) return;
    setSiteOpen(true);
    setAggregatorOpen(false);
    setMode("pick");
    setSearch("");
    setSiteId(request.aggregationSite?.id ?? null);
    const current =
      request.assignedAggregators?.map((a) => a.id) ?? (request.assignedAggregator ? [request.assignedAggregator.id] : []);
    setAggregatorIds(current);
    setInitialIds(current);
    setNewSite({ name: "", latitude: "", longitude: "" });
    setNewPlace({ ...EMPTY_PLACE });
    setOptions(null);
    supplyRequestService
      .placeOptions(request.id)
      .then(setOptions)
      .catch((error) => toast.error(errorMessage(error, "Failed to load the sites and aggregators")));
  }, [request]);

  const sites = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const all = options?.sites ?? [];
    // The customer's district first: that is where the request is
    const district = request?.restaurant.district?.toLowerCase();
    const sorted = [...all].sort(
      (a, b) => Number(b.district?.toLowerCase() === district) - Number(a.district?.toLowerCase() === district)
    );
    return needle
      ? sorted.filter((s) => [s.name, s.district, s.province].some((v) => v?.toLowerCase().includes(needle)))
      : sorted;
  }, [options, search, request]);

  const chosenAggregators = aggregatorIds
    .map((id) => options?.aggregators.find((a) => a.id === id))
    .filter((a): a is RequestPlaceOptions["aggregators"][number] => !!a);
  // The first one ticked: their site serves a request that has none
  const chosenAggregator = chosenAggregators[0];
  const toggleAggregator = (id: string) =>
    setAggregatorIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const aggregatorsChanged = aggregatorIds.length !== initialIds.length || aggregatorIds.some((id, i) => id !== initialIds[i]);
  // Nearest the request's site: who usually ends up handling it when nobody is put in charge
  const nearestAggregator = options?.aggregators.find((a) => a.automatic);
  const chosenSite = options?.sites.find((s) => s.id === siteId);

  const siteSummary =
    mode === "create" ? (
      `New site: ${newSite.name.trim() || "not named yet"}${newPlace.district ? `, ${newPlace.district}` : ""}`
    ) : chosenSite ? (
      [chosenSite.name, chosenSite.district].filter(Boolean).join(" · ")
    ) : chosenAggregator ? (
      chosenAggregator.aggregationSite?.isActive
        ? `${chosenAggregator.aggregationSite.name} (the aggregator's site)`
        : "None: the aggregator in charge handles it"
    ) : (
      <span className="text-amber-700">No site chosen yet</span>
    );
  const aggregatorSummary =
    chosenAggregators.length > 1
      ? `${chosenAggregators.map((a) => a.username).join(", ")}: each submission goes to the one nearest the farmer`
      : chosenAggregator
        ? [chosenAggregator.username, chosenAggregator.aggregationSite?.name, chosenAggregator.phone].filter(Boolean).join(" · ")
        : "None chosen: each submission goes to the nearest aggregator";
  const coordsGiven = newSite.latitude.trim() !== "" || newSite.longitude.trim() !== "";
  const lat = Number(newSite.latitude);
  const lng = Number(newSite.longitude);
  const coordsValid =
    !coordsGiven ||
    (newSite.latitude.trim() !== "" &&
      newSite.longitude.trim() !== "" &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      Math.abs(lat) <= 90 &&
      Math.abs(lng) <= 180);
  const createValid = newSite.name.trim() !== "" && coordsValid && (coordsGiven || !!newPlace.district || !!newPlace.province);
  // Choosing only an aggregator is enough: they handle the request (through their site when they have one)
  const canSave = mode === "create" ? createValid : !!siteId || aggregatorIds.length > 0 || aggregatorsChanged;

  const save = async () => {
    if (!request || !canSave) return;
    setSaving(true);
    try {
      let aggregationSiteId = siteId;
      if (mode === "create") {
        const created = await aggregationSiteService.create({
          name: newSite.name.trim(),
          province: newPlace.province || null,
          district: newPlace.district || null,
          ...(coordsGiven ? { latitude: lat, longitude: lng } : {}),
        });
        aggregationSiteId = created.id;
        toast.success(`${created.name} added as an aggregation site`);
      }
      const updated = await supplyRequestService.setPlace(request.id, {
        ...(aggregationSiteId ? { aggregationSiteId } : {}),
        aggregatorIds,
      });
      toast.success("Request updated. Farmers and aggregators near the site are being told about it.");
      onSaved(updated);
      onClose();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to update the request"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !saving && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg gap-5 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Site and aggregator</DialogTitle>
          <DialogDescription>
            {request?.restaurant.name}
            {request?.restaurant.district ? ` · ${request.restaurant.district}` : ""}. Farmers bring the products to the
            site, and the people near it are told about the request.
          </DialogDescription>
        </DialogHeader>

        {!options ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : (
          <>
            {/* Site: an existing one, or a new one */}
            <CollapsibleSection
              icon={MapPin}
              title="Aggregation site"
              summary={siteSummary}
              open={siteOpen}
              onToggle={() => setSiteOpen((v) => !v)}
            >
              {canCreateSite && (
                <div className="flex">
                  <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs font-medium" role="tablist">
                    {(["pick", "create"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        role="tab"
                        aria-selected={mode === m}
                        onClick={() => setMode(m)}
                        className={cn("rounded-md px-3 py-1.5", mode === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500")}
                      >
                        {m === "pick" ? "Choose a site" : "Add a new site"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mode === "pick" ? (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search sites by name, district or province"
                      className="h-10 pl-9 text-sm"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto rounded-lg border" role="radiogroup">
                    {sites.length === 0 ? (
                      <p className="px-3 py-8 text-center text-sm text-gray-500">
                        No active site found.{canCreateSite ? " Add a new one instead." : ""}
                      </p>
                    ) : (
                      sites.map((s) => {
                        const selected = siteId === s.id;
                        const local = !!request?.restaurant.district && s.district?.toLowerCase() === request.restaurant.district.toLowerCase();
                        return (
                          <button
                            key={s.id}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => setSiteId(s.id)}
                            className={cn(
                              "flex w-full items-center gap-3 border-b px-3 py-2.5 text-left last:border-b-0 hover:bg-gray-50",
                              selected && "bg-green-50 hover:bg-green-50"
                            )}
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-gray-900">{s.name}</span>
                              <span className="block truncate text-xs text-gray-500">
                                {[s.district, s.province].filter(Boolean).join(", ") || "Place not recorded"}
                              </span>
                            </span>
                            {local && (
                              <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-800">
                                Customer&apos;s district
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-3 rounded-lg border p-3">
                  <div className="space-y-1">
                    <Label htmlFor="new-site-name">Site name</Label>
                    <Input
                      id="new-site-name"
                      value={newSite.name}
                      autoFocus
                      placeholder="e.g. Byimana collection point"
                      onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                    />
                  </div>
                  <LocationFields value={newPlace} onChange={setNewPlace} levels={2} disabled={saving} />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="new-site-lat">
                        Latitude <span className="font-normal text-gray-400">(optional)</span>
                      </Label>
                      <Input
                        id="new-site-lat"
                        inputMode="decimal"
                        placeholder="-2.0942"
                        value={newSite.latitude}
                        onChange={(e) => setNewSite({ ...newSite, latitude: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="new-site-lng">
                        Longitude <span className="font-normal text-gray-400">(optional)</span>
                      </Label>
                      <Input
                        id="new-site-lng"
                        inputMode="decimal"
                        placeholder="29.7420"
                        value={newSite.longitude}
                        onChange={(e) => setNewSite({ ...newSite, longitude: e.target.value })}
                      />
                    </div>
                  </div>
                  {!coordsValid ? (
                    <p className="text-xs text-red-600">Fill in both latitude and longitude, or leave both empty.</p>
                  ) : (
                    !coordsGiven && (
                      <p className="text-[11px] text-gray-500">
                        Without coordinates the site is placed at the centre of its district; you can set the exact point
                        later on the Aggregation Sites page.
                      </p>
                    )
                  )}
                </div>
              )}
            </CollapsibleSection>

            {/* Who handles it */}
            <CollapsibleSection
              icon={UserRound}
              title="Aggregators in charge"
              optional
              summary={aggregatorSummary}
              open={aggregatorOpen}
              onToggle={() => setAggregatorOpen((v) => !v)}
            >
              <p className="text-xs text-gray-500">
                Tick one or more aggregators, near or not; no site is needed. They are all told about the request, and
                each farmer&apos;s submission goes to the one whose site is nearest that farmer. Without any, each
                submission goes to the aggregator nearest the farmer.
              </p>
              <div className="max-h-48 overflow-y-auto rounded-lg border">
                {[{ id: NO_AGGREGATOR }, ...options.aggregators].map((a) => {
                  const selected = a.id === NO_AGGREGATOR ? aggregatorIds.length === 0 : aggregatorIds.includes(a.id);
                  const agg = a.id === NO_AGGREGATOR ? null : (a as RequestPlaceOptions["aggregators"][number]);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      role={a.id === NO_AGGREGATOR ? "radio" : "checkbox"}
                      aria-checked={selected}
                      onClick={() => (a.id === NO_AGGREGATOR ? setAggregatorIds([]) : toggleAggregator(a.id))}
                      className={cn(
                        "flex w-full items-center gap-3 border-b px-3 py-2 text-left last:border-b-0 hover:bg-gray-50",
                        selected && "bg-green-50 hover:bg-green-50"
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-gray-900">
                          {agg ? (
                            <span className="flex items-center gap-1.5">
                              {agg.username}
                              {agg.automatic && (
                                <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-800">
                                  Nearest the site
                                </span>
                              )}
                            </span>
                          ) : (
                            "No aggregator in charge (nearest one for each submission)"
                          )}
                        </span>
                        {agg ? (
                          <span className="block truncate text-xs text-gray-500">
                            {agg.aggregationSite?.name ?? "No site"}
                            {agg.phone ? ` · ${agg.phone}` : ""}
                          </span>
                        ) : (
                          nearestAggregator && (
                            <span className="block truncate text-xs text-gray-500">
                              Usually {nearestAggregator.username}
                              {nearestAggregator.distanceKm != null ? ` (${formatKm(nearestAggregator.distanceKm)} from the site)` : ""}.
                              Choose someone below to change it.
                            </span>
                          )
                        )}
                      </span>
                      {agg && (
                        <span className="flex shrink-0 flex-col items-end gap-0.5">
                          {agg.distanceKm != null && (
                            <span className="text-xs font-medium text-gray-900">{formatKm(agg.distanceKm)}</span>
                          )}
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                            {agg.openSubmissions} open
                          </span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </CollapsibleSection>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="green" onClick={save} disabled={!canSave || saving || !options}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : mode === "create" ? <Plus className="h-3.5 w-3.5" /> : null}
            {mode === "create" ? "Add site and save" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
