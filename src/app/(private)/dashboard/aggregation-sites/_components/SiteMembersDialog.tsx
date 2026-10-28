"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  Loader2,
  MapPin,
  Plus,
  Search,
  Sprout,
  Truck,
  UserMinus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
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
import { cn } from "@/lib/utils";
import {
  AggregationSite,
  SiteCandidate,
  SiteMembers,
  aggregationSiteService,
} from "@/app/services/aggregationSiteService";

type Kind = "farmer" | "aggregator";
type Section = "deliveries" | "aggregators" | "farmers";

const errorMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

const formatMoment = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : "No day chosen";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// The WFP market list fills unknown places with this text instead of leaving them empty
const realPlace = (value: string | null | undefined) =>
  value && !/not available/i.test(value) ? value : null;

/** "Rubavu, Western Province", or whichever part is known */
const sitePlace = (site: AggregationSite | null | undefined) =>
  [realPlace(site?.district), realPlace(site?.province)].filter(Boolean).join(", ");

const initials = (name: string) => {
  const words = name.trim().split(/\s+/).filter((w) => /[a-z]/i.test(w));
  if (words.length === 0) return "#";
  return (words[0][0] + (words[1]?.[0] ?? "")).toUpperCase();
};

/** Name and second line without repeating the phone when a person has no name yet */
const nameAndDetail = (name: string | null, phone: string | null, place: string | null) => {
  const title = name?.trim() || phone || "No name";
  const detail = [place, name?.trim() ? phone : null].filter(Boolean).join(" · ");
  return { title, detail };
};

// Delivery status words and colours, closest to how farmers see them
const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-800 ring-amber-200",
  NEGOTIATING: "bg-orange-50 text-orange-800 ring-orange-200",
  APPROVED: "bg-green-50 text-green-800 ring-green-200",
};

function Avatar({ name, tone = "green" }: { name: string; tone?: "green" | "gray" }) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
        tone === "green" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

function EmptyState({ icon: Icon, text }: { icon: typeof Users; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <Icon className="h-5 w-5" />
      </span>
      <p className="max-w-sm text-sm text-gray-500">{text}</p>
    </div>
  );
}

interface Person {
  id: string;
  title: string;
  detail: string;
  chosenByAdmin: boolean;
}

interface PeopleTabProps {
  kind: Kind;
  site: AggregationSite;
  people: Person[];
  canEdit: boolean;
  emptyText: string;
  /** Runs after people were added or removed, so the lists and the counts behind reload */
  onChanged: () => void;
}

/** One list of people at the site, with removing and (for admins) adding more from everyone not on it. */
function PeopleTab({ kind, site, people, canEdit, emptyText, onChanged }: PeopleTabProps) {
  const siteId = site.id;
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

  const stopAdding = () => {
    setAdding(false);
    setToAdd(new Set());
    setSearch("");
  };

  if (adding) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={stopAdding} disabled={busy}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <p className="text-sm font-semibold text-gray-900">
            Add {label}s to {site.name}
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${label}s by name, phone or place`}
            className="h-10 pl-9 text-sm"
            autoFocus
          />
        </div>

        <div className="max-h-80 overflow-y-auto rounded-lg border">
          {searching && candidates.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching...
            </div>
          ) : candidates.length === 0 ? (
            <EmptyState icon={Search} text={`No ${label} found who is not already on this site.`} />
          ) : (
            <ul className="divide-y">
              {candidates.map((c) => {
                const { title, detail } = nameAndDetail(c.name, c.phone, c.place || null);
                const selected = toAdd.has(c.id);
                return (
                  <li key={c.id}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-gray-50",
                        selected && "bg-green-50 hover:bg-green-50"
                      )}
                    >
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => setToAdd((current) => toggle(current, c.id))}
                        aria-label={`Select ${title}`}
                      />
                      <Avatar name={title} tone={c.name ? "green" : "gray"} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{title}</p>
                        {detail && <p className="truncate text-xs text-gray-500">{detail}</p>}
                      </div>
                      {/* Someone already on another site is moved here: say so before the admin adds them */}
                      {c.currentSite ? (
                        <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200">
                          Moves from {c.currentSite.name}
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                          No site yet
                        </span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t pt-3">
          <p className="text-xs text-gray-500">
            {toAdd.size ? `${plural(toAdd.size, label)} selected` : `Tick the ${label}s to add`}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={busy} onClick={stopAdding}>
              Cancel
            </Button>
            <Button variant="green" size="sm" disabled={busy || toAdd.size === 0} onClick={addPicked}>
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Add {toAdd.size ? plural(toAdd.size, label) : "selected"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {canEdit && (
        <div className="flex items-center justify-between gap-2">
          {picked.size > 0 ? (
            <Button variant="outline" size="sm" disabled={busy} onClick={removePicked} className="text-red-700 hover:text-red-800">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserMinus className="h-3.5 w-3.5" />}
              Remove {plural(picked.size, label)}
            </Button>
          ) : (
            <p className="text-xs text-gray-500">{people.length ? `Tick people to remove them from this site.` : ""}</p>
          )}
          <Button variant="green" size="sm" onClick={() => setAdding(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add {label}s
          </Button>
        </div>
      )}

      <div className="max-h-80 overflow-y-auto rounded-lg border">
        {people.length === 0 ? (
          <EmptyState icon={kind === "farmer" ? Sprout : Users} text={emptyText} />
        ) : (
          <ul className="divide-y">
            {people.map((p) => {
              const selected = picked.has(p.id);
              const row = (
                <>
                  {canEdit && (
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => setPicked((current) => toggle(current, p.id))}
                      aria-label={`Select ${p.title}`}
                    />
                  )}
                  <Avatar name={p.title} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{p.title}</p>
                    {p.detail && <p className="truncate text-xs text-gray-500">{p.detail}</p>}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium",
                      p.chosenByAdmin ? "bg-green-50 text-green-800 ring-1 ring-green-200" : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {p.chosenByAdmin ? "Chosen by admin" : "Nearest site"}
                  </span>
                </>
              );
              return (
                <li key={p.id}>
                  {canEdit ? (
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-gray-50",
                        selected && "bg-red-50 hover:bg-red-50"
                      )}
                    >
                      {row}
                    </label>
                  ) : (
                    <div className="flex items-center gap-3 px-3 py-2.5">{row}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {canEdit && people.length > 0 && (
        <p className="text-xs text-gray-500">
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
  const [version, setVersion] = useState(0);
  const [section, setSection] = useState<Section>("deliveries");

  useEffect(() => {
    if (!site) return;
    let active = true;
    aggregationSiteService
      .members(site.id)
      .then((result) => active && setData(result))
      .catch((error) => {
        if (!active) return;
        toast.error(errorMessage(error, "Failed to load the site"));
        onClose();
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site?.id, version]);

  // A different site starts from a clean slate, on its deliveries
  useEffect(() => {
    setData(null);
    setSection("deliveries");
  }, [site?.id]);

  const changed = useCallback(() => {
    setVersion((v) => v + 1);
    onChanged?.();
  }, [onChanged]);

  const place = sitePlace(site);
  const sections: { key: Section; label: string; icon: typeof Users; count: number }[] = data
    ? [
        { key: "deliveries", label: "Coming", icon: Truck, count: data.deliveries.length },
        { key: "aggregators", label: "Aggregators", icon: Users, count: data.aggregators.length },
        { key: "farmers", label: "Farmers", icon: Sprout, count: data.farmers.length },
      ]
    : [];

  return (
    <Dialog open={!!site} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl gap-5">
        <DialogHeader className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 pr-6">
            <DialogTitle className="text-xl">{site?.name}</DialogTitle>
            {site && (
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                  site.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                )}
              >
                {site.isActive ? "Active" : "Switched off"}
              </span>
            )}
          </div>
          <DialogDescription className="flex items-center gap-1.5 text-sm">
            <MapPin className="h-4 w-4 shrink-0 text-green-700" />
            {place || "District not recorded"}
            <span className="text-gray-300">·</span>
            Where its aggregators and farmers meet
          </DialogDescription>
        </DialogHeader>

        {!data ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : (
          <>
            {/* The three counts double as the tabs, so the numbers read at a glance */}
            <div className="grid grid-cols-3 gap-2" role="tablist">
              {sections.map(({ key, label, icon: Icon, count }) => {
                const on = section === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => setSection(key)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                      on ? "border-green-600 bg-green-50 ring-1 ring-green-600" : "border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        on ? "bg-green-700 text-white" : "bg-gray-100 text-gray-500"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-lg font-bold leading-none text-gray-900">{count}</span>
                      <span className="mt-1 block truncate text-xs text-gray-500">{label}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {section === "deliveries" && (
              <div className="max-h-80 overflow-y-auto rounded-lg border">
                {data.deliveries.length === 0 ? (
                  <EmptyState icon={Truck} text="No harvests are on their way to this site." />
                ) : (
                  <ul className="divide-y">
                    {data.deliveries.map((d) => {
                      const farmer = d.farmer.name || d.farmer.phone || "Farmer";
                      return (
                        <li key={d.id} className="flex items-center gap-3 px-3 py-2.5">
                          <Avatar name={farmer} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {d.productName}
                              {d.submittedQty ? <span className="font-normal text-gray-500"> · {d.submittedQty.toLocaleString("en-US")}</span> : null}
                            </p>
                            <p className="truncate text-xs text-gray-500">
                              {farmer}
                              {d.farmer.name && d.farmer.phone ? ` · ${d.farmer.phone}` : ""}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <span className="flex items-center gap-1 text-xs font-medium text-gray-900">
                              <CalendarClock className="h-3.5 w-3.5 text-green-700" />
                              {formatMoment(d.deliveryDate)}
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ring-1",
                                STATUS_STYLE[d.status] ?? "bg-gray-50 text-gray-600 ring-gray-200"
                              )}
                            >
                              {d.status.toLowerCase()}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {section === "aggregators" && (
              <PeopleTab
                kind="aggregator"
                site={data.site}
                canEdit={canEdit}
                onChanged={changed}
                emptyText="No aggregator works from this site yet. Aggregators get the site nearest their district, or add them here."
                people={data.aggregators.map((a) => ({
                  id: a.id,
                  title: a.username,
                  detail: a.phone || a.email,
                  chosenByAdmin: a.siteAssignedByAdmin,
                }))}
              />
            )}

            {section === "farmers" && (
              <PeopleTab
                kind="farmer"
                site={data.site}
                canEdit={canEdit}
                onChanged={changed}
                emptyText="No farmer delivers to this site yet. Farmers get their nearest site, or add them here."
                people={data.farmers.map((f) => {
                  const { title, detail } = nameAndDetail(
                    f.name,
                    f.phone,
                    [f.sector, f.district].filter(Boolean).join(", ") || null
                  );
                  return { id: f.id, title, detail, chosenByAdmin: f.siteAssignedByAdmin };
                })}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
