"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Eye, EyeOff, Loader2, MapPin, Search, Sparkles, UserPlus, Wand2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LocationFields, type LocationValue } from "@/components/location-fields";
import { cn } from "@/lib/utils";
import { adminsService } from "@/app/services/adminsService";
import { errorMessage, RequestPlaceOptions, supplyRequestService } from "@/app/services/supplyRequestService";

type Aggregator = RequestPlaceOptions["aggregators"][number];

/** The aggregator picked for a request; null = the nearest one, automatically */
export type AggregatorChoice = { id: string; name: string } | null;

interface ChooseAggregatorProps {
  /** The customer of the request: aggregators nearest the site serving them come first */
  restaurantId: string;
  /** The customer's district: the starting place of a new aggregator */
  customerDistrict?: string | null;
  value: AggregatorChoice;
  onChange: (next: AggregatorChoice) => void;
  /** May create dashboard users (admins.create) */
  canCreate: boolean;
  disabled?: boolean;
}

const EMPTY_FORM = { username: "", email: "", phone: "", password: "" };

/** A password the creator can pass on: 8+ characters with an uppercase letter and a number */
const makePassword = () => {
  const letters = "abcdefghjkmnpqrstuvwxyz";
  const pick = (from: string) => from[Math.floor(Math.random() * from.length)];
  const word = Array.from({ length: 6 }, () => pick(letters)).join("");
  return `${word[0].toUpperCase()}${word.slice(1)}${Math.floor(1000 + Math.random() * 9000)}`;
};

const passwordProblem = (password: string) =>
  password.length < 8
    ? "At least 8 characters"
    : !/[A-Z]/.test(password)
      ? "Add an uppercase letter"
      : !/[0-9]/.test(password)
        ? "Add a number"
        : null;

/**
 * Who handles a request: the nearest aggregator (automatic), an aggregator picked from the list, or a new
 * aggregator created here. The aggregator is told about the request and receives its farmers' submissions.
 */
export function ChooseAggregator({
  restaurantId,
  customerDistrict,
  value,
  onChange,
  canCreate,
  disabled,
}: ChooseAggregatorProps) {
  const [aggregators, setAggregators] = useState<Aggregator[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [place, setPlace] = useState<LocationValue>({ province: "", district: "", sector: "", cell: "", village: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);
  // The password of the aggregator just created, to pass on to them
  const [created, setCreated] = useState<{ name: string; login: string; password: string } | null>(null);

  useEffect(() => {
    let active = true;
    setError(null);
    supplyRequestService
      .placeOptions(undefined, restaurantId || undefined)
      .then((options) => active && setAggregators(options.aggregators))
      .catch((e) => active && setError(errorMessage(e, "Could not load the aggregators")));
    return () => {
      active = false;
    };
  }, [restaurantId]);

  // Nearest first (the automatic one on top), then by name
  const sorted = useMemo(
    () =>
      [...(aggregators ?? [])].sort(
        (a, b) =>
          Number(!!b.automatic) - Number(!!a.automatic) ||
          (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity) ||
          a.username.localeCompare(b.username)
      ),
    [aggregators]
  );
  const automatic = sorted.find((a) => a.automatic);
  const needle = search.trim().toLowerCase();
  const shown = needle
    ? sorted.filter((a) =>
        [a.username, a.phone, a.aggregationSite?.name, a.aggregationSite?.district]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(needle))
      )
    : sorted;

  const startCreating = () => {
    setCreating(true);
    setTried(false);
    setForm({ ...EMPTY_FORM, password: makePassword() });
    setPlace({ province: "", district: "", sector: "", cell: "", village: "" });
  };

  const formProblem =
    !form.username.trim()
      ? "Give the aggregator's name"
      : !/^\S+@\S+\.\S+$/.test(form.email.trim())
        ? "Give a valid email (they sign in with it)"
        : form.phone && !/^\+?\d{9,13}$/.test(form.phone.replace(/\s/g, ""))
          ? "Check the phone number"
          : passwordProblem(form.password)
            ? `Password: ${passwordProblem(form.password)}`
            : !place.district
              ? "Choose the district they work in (their aggregation site is the nearest one)"
              : null;

  const create = async () => {
    setTried(true);
    if (formProblem) return;
    setSaving(true);
    try {
      const result = await adminsService.createAdmin({
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.replace(/\s/g, "") || undefined,
        password: form.password,
        role: "AGGREGATOR",
        province: place.province,
        district: place.district,
      });
      const admin = result.data as { id: string; username: string; phone?: string | null };
      const fresh: Aggregator = {
        id: admin.id,
        username: admin.username,
        phone: admin.phone ?? null,
        aggregationSite: null,
        openSubmissions: 0,
      };
      setAggregators((prev) => [...(prev ?? []), fresh]);
      onChange({ id: admin.id, name: admin.username });
      setCreated({ name: admin.username, login: form.email.trim(), password: form.password });
      setCreating(false);
      toast.success(`${admin.username} is now an aggregator and handles this request`);
      // Their nearest aggregation site is set from the district in the background; show it once known
      supplyRequestService
        .placeOptions(undefined, restaurantId || undefined)
        .then((options) => setAggregators(options.aggregators))
        .catch(() => undefined);
    } catch (e) {
      toast.error(errorMessage(e, "Could not create the aggregator"));
    } finally {
      setSaving(false);
    }
  };

  const copyLogin = () => {
    if (!created) return;
    navigator.clipboard
      ?.writeText(`Food Bundles dashboard\nEmail: ${created.login}\nPassword: ${created.password}`)
      .then(() => toast.success("Sign-in details copied"))
      .catch(() => toast.error("Could not copy; write them down"));
  };

  const pick = (a: Aggregator) => {
    setCreated(null);
    onChange(value?.id === a.id ? null : { id: a.id, name: a.username });
  };

  return (
    <div className="space-y-3">
      {/* Automatic */}
      <button
        type="button"
        role="radio"
        aria-checked={value === null}
        disabled={disabled}
        onClick={() => {
          setCreated(null);
          onChange(null);
        }}
        className={cn(
          "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
          value === null ? "border-green-600 bg-green-50 ring-1 ring-green-600" : "hover:bg-gray-50"
        )}
      >
        <span className={cn("rounded-lg p-1.5", value === null ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500")}>
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-gray-900">Automatic: the nearest aggregator</span>
          <span className="block text-xs text-gray-500">
            {aggregators === null
              ? "Finding the nearest aggregator…"
              : automatic
                ? `Now ${automatic.username}${automatic.aggregationSite ? ` (${automatic.aggregationSite.name})` : ""}. Changes if someone nearer joins.`
                : "Whoever is nearest the customer's aggregation site when farmers submit."}
          </span>
        </span>
        {value === null && <Check className="h-4 w-4 text-green-600" />}
      </button>

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {/* Created just now: the sign-in details to pass on */}
      {created && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm">
          <p className="font-semibold text-green-900">{created.name} can sign in to the dashboard with:</p>
          <p className="mt-1 font-mono text-xs text-green-900">
            {created.login} · {created.password}
          </p>
          <p className="mt-1 text-xs text-green-800">Share these with them; this password is not shown again.</p>
          <Button type="button" size="sm" variant="outline" className="mt-2 bg-white" onClick={copyLogin}>
            <Copy className="mr-1 h-3.5 w-3.5" /> Copy sign-in details
          </Button>
        </div>
      )}

      {/* Pick one */}
      <div className="rounded-xl border">
        <div className="flex flex-col gap-2 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone or site"
              className="h-9 pl-9"
              disabled={disabled}
            />
          </div>
          {canCreate && !creating && (
            <Button type="button" size="sm" variant="outline" onClick={startCreating} disabled={disabled}>
              <UserPlus className="mr-1 h-4 w-4" /> New aggregator
            </Button>
          )}
        </div>

        {aggregators === null && !error ? (
          <div className="space-y-2 p-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : shown.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500">
            {needle ? `No aggregator matches "${search.trim()}".` : "There is no aggregator yet."}
            {canCreate && !creating && " Create one with New aggregator."}
          </p>
        ) : (
          <ul className="max-h-64 divide-y overflow-y-auto" role="radiogroup" aria-label="Aggregators">
            {shown.map((a) => {
              const on = value?.id === a.id;
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={on}
                    disabled={disabled}
                    onClick={() => pick(a)}
                    className={cn("flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50", on && "bg-green-50/70")}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                        on ? "border-green-600 bg-green-600 text-white" : "border-gray-300"
                      )}
                    >
                      {on && <Check className="h-3 w-3" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-medium text-gray-900">{a.username}</span>
                        {a.automatic && <Badge className="border-0 bg-green-100 text-[10px] text-green-800">Nearest</Badge>}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {[
                          a.aggregationSite
                            ? `${a.aggregationSite.name}${a.aggregationSite.district ? `, ${a.aggregationSite.district}` : ""}`
                            : "No site yet",
                          a.distanceKm != null ? `${Math.round(a.distanceKm)} km away` : null,
                          a.phone,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                    <span className="hidden shrink-0 text-xs text-gray-500 sm:block">
                      {a.openSubmissions} open submission{a.openSubmissions === 1 ? "" : "s"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Create one */}
      {creating && (
        <div className="space-y-3 rounded-xl border border-green-200 bg-green-50/40 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                <UserPlus className="h-4 w-4 text-green-600" /> New aggregator
              </p>
              <p className="text-xs text-gray-500">
                They get a dashboard account, handle this request and work from the aggregation site nearest their district.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Cancel new aggregator"
              disabled={saving}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="agg-name">Name</Label>
              <Input
                id="agg-name"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="e.g. Jean Bosco"
                disabled={saving}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agg-phone">
                Phone <span className="font-normal text-gray-400">(optional)</span>
              </Label>
              <Input
                id="agg-phone"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0788 123 456"
                disabled={saving}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agg-email">Email (to sign in)</Label>
              <Input
                id="agg-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@example.com"
                disabled={saving}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agg-password">Password</Label>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <Input
                    id="agg-password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="pr-9"
                    disabled={saving}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setForm({ ...form, password: makePassword() });
                    setShowPassword(true);
                  }}
                  disabled={saving}
                  aria-label="Make a new password"
                  title="Make a new password"
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Where they work</Label>
            <LocationFields
              value={place}
              onChange={(next) => setPlace({ ...next, sector: "", cell: "", village: "" })}
              levels={2}
              disabled={saving}
            />
            {customerDistrict && !place.district && (
              <p className="text-xs text-gray-500">The customer is in {customerDistrict}.</p>
            )}
          </div>
          {tried && formProblem && <p className="text-sm font-medium text-red-600">{formProblem}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setCreating(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" onClick={create} disabled={saving} className="bg-green-600 hover:bg-green-700">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create and assign
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
