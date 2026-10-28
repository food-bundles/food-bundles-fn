"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Search, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AggregationSite,
  SiteCandidate,
  SiteMembers,
  aggregationSiteService,
} from "@/app/services/aggregationSiteService";

type Kind = "farmer" | "aggregator";

const errorMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

const formatMoment = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : "No day chosen";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

interface Person {
  id: string;
  name: string;
  detail: string;
  chosenByAdmin: boolean;
}

interface PeopleTabProps {
  kind: Kind;
  siteId: string;
  people: Person[];
  canEdit: boolean;
  emptyText: string;
  /** Runs after people were added or removed, so the lists and the counts behind reload */
  onChanged: () => void;
}

/** One list of people at the site, with removing and (for admins) adding more from everyone not on it. */
function PeopleTab({ kind, siteId, people, canEdit, emptyText, onChanged }: PeopleTabProps) {
  const label = kind === "farmer" ? "farmer" : "aggregator";
  const [adding, setAdding] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState<SiteCandidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [toAdd, setToAdd] = useState<Set<string>>(new Set());

  const toggle = (set: Set<string>, id: string) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  };

  // Look people up as the admin types, a moment after they stop
  useEffect(() => {
    if (!adding) return;
    let active = true;
    setSearching(true);
    const timer = setTimeout(() => {
      aggregationSiteService
        .candidates(siteId, kind, search)
        .then((rows) => active && setCandidates(rows))
        .catch((error) => active && toast.error(errorMessage(error, `Failed to load ${label}s`)))
        .finally(() => active && setSearching(false));
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [adding, search, siteId, kind, label]);

  const ids = (set: Set<string>) => {
    const list = [...set];
    return kind === "farmer" ? { farmerIds: list } : { aggregatorIds: list };
  };

  const removePicked = async () => {
    setBusy(true);
    try {
      const result = await aggregationSiteService.removeMembers(siteId, ids(picked));
      const parts = [`${plural(result.released, label)} taken off this site`];
      if (result.stillHere) parts.push(`${result.stillHere} stay here because it is their nearest site`);
      toast.success(parts.join(". "));
      setPicked(new Set());
      onChanged();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to remove them"));
    } finally {
      setBusy(false);
    }
  };

  const addPicked = async () => {
    setBusy(true);
    try {
      const result = await aggregationSiteService.addMembers(siteId, ids(toAdd));
      toast.success(`${plural(kind === "farmer" ? result.farmers : result.aggregators, label)} added to this site`);
      setToAdd(new Set());
      setAdding(false);
      setSearch("");
      onChanged();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to add them"));
    } finally {
      setBusy(false);
    }
  };

  if (adding) {
    return (
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${label}s by name, phone or place`}
            className="pl-7 h-8 text-xs"
            autoFocus
          />
        </div>
        <div className="max-h-64 overflow-y-auto">
          {searching && candidates.length === 0 ? (
            <div className="flex items-center gap-2 py-6 text-xs text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching...
            </div>
          ) : candidates.length === 0 ? (
            <p className="py-6 text-xs text-gray-500">No {label} found who is not already on this site.</p>
          ) : (
            <ul className="divide-y">
              {candidates.map((c) => (
                <li key={c.id}>
                  <label className="flex cursor-pointer items-center gap-3 py-2 text-xs">
                    <Checkbox
                      checked={toAdd.has(c.id)}
                      onCheckedChange={() => setToAdd((current) => toggle(current, c.id))}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{c.name || c.phone || label}</p>
                      <p className="text-gray-500 truncate">{[c.place, c.phone].filter(Boolean).join(" · ")}</p>
                    </div>
                    <span className="shrink-0 text-gray-500">
                      {c.currentSite ? `Now: ${c.currentSite.name}` : "No site yet"}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => {
              setAdding(false);
              setToAdd(new Set());
              setSearch("");
            }}
          >
            Cancel
          </Button>
          <Button variant="green" size="sm" disabled={busy || toAdd.size === 0} onClick={addPicked}>
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Add {toAdd.size ? plural(toAdd.size, label) : "selected"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {canEdit && (
        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add {label}s
          </Button>
          {picked.size > 0 && (
            <Button variant="outline" size="sm" disabled={busy} onClick={removePicked}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserMinus className="h-3.5 w-3.5" />}
              Remove {plural(picked.size, label)}
            </Button>
          )}
        </div>
      )}
      <div className="max-h-72 overflow-y-auto">
        {people.length === 0 ? (
          <p className="py-6 text-xs text-gray-500">{emptyText}</p>
        ) : (
          <ul className="divide-y">
            {people.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-2 text-xs">
                {canEdit && (
                  <Checkbox
                    checked={picked.has(p.id)}
                    onCheckedChange={() => setPicked((current) => toggle(current, p.id))}
                    aria-label={`Select ${p.name}`}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{p.name}</p>
                  <p className="text-gray-500 truncate">{p.detail}</p>
                </div>
                {p.chosenByAdmin && (
                  <Badge variant="outline" className="text-[10px]">
                    chosen by an admin
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {canEdit && people.length > 0 && (
        <p className="text-[11px] text-gray-500">
          Removing someone puts them back on their nearest site, so they leave this one unless it is their nearest.
        </p>
      )}
    </div>
  );
}

interface SiteMembersDialogProps {
  site: AggregationSite | null;
  onClose: () => void;
  /** Admins who can edit sites may add and remove people */
  canEdit?: boolean;
  /** Runs after people were added or removed, so the site list can refresh its counts */
  onChanged?: () => void;
}

/** Who works from a site, who delivers to it, and who is coming on which day and time. */
export function SiteMembersDialog({ site, onClose, canEdit = false, onChanged }: SiteMembersDialogProps) {
  const [data, setData] = useState<SiteMembers | null>(null);
  const [loading, setLoading] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!site) return;
    let active = true;
    setLoading(true);
    aggregationSiteService
      .members(site.id)
      .then((result) => active && setData(result))
      .catch((error) => {
        if (!active) return;
        toast.error(errorMessage(error, "Failed to load the site"));
        onClose();
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site?.id, version]);

  // A different site starts from a clean slate
  useEffect(() => {
    setData(null);
  }, [site?.id]);

  const changed = useCallback(() => {
    setVersion((v) => v + 1);
    onChanged?.();
  }, [onChanged]);

  return (
    <Dialog open={!!site} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{site?.name}</DialogTitle>
          <DialogDescription>
            The meeting point of its aggregators and farmers. {site?.district ? `${site.district} district.` : ""}
          </DialogDescription>
        </DialogHeader>

        {!data ? (
          <div className="flex items-center gap-2 py-8 text-xs text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : (
          <Tabs defaultValue="deliveries">
            <TabsList>
              <TabsTrigger value="deliveries">Coming ({data.deliveries.length})</TabsTrigger>
              <TabsTrigger value="aggregators">Aggregators ({data.aggregators.length})</TabsTrigger>
              <TabsTrigger value="farmers">Farmers ({data.farmers.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="deliveries" className="max-h-80 overflow-y-auto">
              {data.deliveries.length === 0 ? (
                <p className="py-6 text-xs text-gray-500">No harvests are on their way to this site.</p>
              ) : (
                <ul className="divide-y">
                  {data.deliveries.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-3 py-2 text-xs">
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {d.farmer.name || d.farmer.phone || "Farmer"}
                          <span className="font-normal text-gray-500">
                            {" "}
                            · {d.productName}
                            {d.submittedQty ? `, ${d.submittedQty}` : ""}
                          </span>
                        </p>
                        {d.farmer.phone && <p className="text-gray-500">{d.farmer.phone}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-medium">{formatMoment(d.deliveryDate)}</p>
                        <Badge variant="outline" className="text-[10px]">
                          {d.status.toLowerCase()}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="aggregators">
              <PeopleTab
                kind="aggregator"
                siteId={data.site.id}
                canEdit={canEdit}
                onChanged={changed}
                emptyText="No aggregator works from this site yet. Aggregators are given the nearest site to their district, or add them here."
                people={data.aggregators.map((a) => ({
                  id: a.id,
                  name: a.username,
                  detail: a.phone || a.email,
                  chosenByAdmin: a.siteAssignedByAdmin,
                }))}
              />
            </TabsContent>

            <TabsContent value="farmers">
              <PeopleTab
                kind="farmer"
                siteId={data.site.id}
                canEdit={canEdit}
                onChanged={changed}
                emptyText="No farmer delivers to this site yet."
                people={data.farmers.map((f) => ({
                  id: f.id,
                  name: f.name || f.phone || "Farmer",
                  detail: [f.sector, f.district].filter(Boolean).join(", ") || f.phone || "",
                  chosenByAdmin: f.siteAssignedByAdmin,
                }))}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
