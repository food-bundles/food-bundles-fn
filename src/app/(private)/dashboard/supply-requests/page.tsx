"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, ClipboardList, Loader2, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminAccess } from "@/app/hooks/useAdminAccess";
import {
  errorMessage,
  RequestCustomer,
  SupplyRequest,
  supplyRequestService,
} from "@/app/services/supplyRequestService";
import { SupplyRequestForm } from "./_components/SupplyRequestForm";

const STATUS_FILTERS = [
  { value: "OPEN", label: "Open" },
  { value: "CLOSED", label: "Closed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "", label: "All" },
];

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const formatDay = (value: string) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

type Aggregator = { id: string; username: string; phone: string | null; customers: RequestCustomer[] };

// Supply requests: products customers (schools…) need from farmers
export default function SupplyRequestsPage() {
  const { can } = useAdminAccess();
  const canCreate = can("supply_requests", "create");
  const canAssign = can("supply_requests", "assign_customers");

  const [tab, setTab] = useState<"requests" | "aggregators">("requests");
  const [status, setStatus] = useState("OPEN");
  const [requests, setRequests] = useState<SupplyRequest[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const load = useCallback(async () => {
    setRequests(null);
    try {
      setRequests(await supplyRequestService.list(status || undefined));
    } catch (error) {
      toast.error(errorMessage(error, "Failed to load requests"));
      setRequests([]);
    }
  }, [status]);

  useEffect(() => {
    if (tab === "requests") load();
  }, [load, tab]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[16px] font-medium flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-green-600" />
            Supply Requests
          </h1>
          <p className="text-xs text-gray-600">
            Products a customer (e.g. a school) needs each week. Farmers submit to them; once paid, the products go
            into that customer&apos;s order for the day.
          </p>
        </div>
        {canCreate && tab === "requests" && (
          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setFormOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> New request
          </Button>
        )}
      </div>

      {canAssign && (
        <div className="flex gap-4 border-b text-sm">
          {[
            { key: "requests", label: "Requests" },
            { key: "aggregators", label: "Aggregators' customers" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as "requests" | "aggregators")}
              className={`pb-2 font-medium ${
                tab === t.key ? "border-b-2 border-gray-900 text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {tab === "aggregators" && canAssign ? (
        <AggregatorCustomers />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.label}
                onClick={() => setStatus(f.value)}
                className={`h-8 px-3 rounded-full border text-xs transition-colors cursor-pointer ${
                  status === f.value
                    ? "border-green-600 bg-green-50 text-green-700 font-medium"
                    : "border-gray-300 text-gray-700 hover:border-green-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {requests === null ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-xl border bg-white p-8 text-center text-sm text-gray-500">
              No {status ? status.toLowerCase() : ""} requests yet.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {requests.map((r) => (
                <Link
                  key={r.id}
                  href={`/dashboard/supply-requests/${r.id}`}
                  className="flex flex-col rounded-xl border bg-gradient-to-br from-white to-emerald-50/60 p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{r.restaurant.name}</p>
                      <p className="text-xs capitalize text-gray-500">
                        {r.restaurant.customerType?.name?.toLowerCase() || "customer"}
                        {r.title ? ` · ${r.title}` : ""}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[r.status]}`}>
                      {r.status.toLowerCase()}
                    </span>
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-600">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDay(r.startDate)} – {formatDay(r.endDate)}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-3 text-xs text-gray-600">
                    <span>
                      {r._count?.items ?? 0} product line{r._count?.items === 1 ? "" : "s"} · {r._count?.orders ?? 0} order
                      {r._count?.orders === 1 ? "" : "s"}
                    </span>
                    <span>by {r.createdBy.username}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      <SupplyRequestForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => load()} />
    </div>
  );
}

/** Admins assign customers (schools…) to each aggregator. */
function AggregatorCustomers() {
  const [aggregators, setAggregators] = useState<Aggregator[] | null>(null);
  const [allCustomers, setAllCustomers] = useState<RequestCustomer[]>([]);
  const [editing, setEditing] = useState<Aggregator | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [aggs, customers] = await Promise.all([supplyRequestService.aggregators(), supplyRequestService.customers()]);
      setAggregators(aggs || []);
      setAllCustomers(customers || []);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to load aggregators"));
      setAggregators([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await supplyRequestService.assignCustomers(editing.id, [...selected]);
      toast.success(`Customers assigned to ${editing.username}`);
      setEditing(null);
      load();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to assign customers"));
    } finally {
      setSaving(false);
    }
  };

  if (!aggregators) return <Skeleton className="h-40 w-full" />;

  return (
    <div className="rounded-xl border bg-white">
      {aggregators.length === 0 ? (
        <p className="p-6 text-center text-sm text-gray-500">No aggregator accounts yet.</p>
      ) : (
        aggregators.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 last:border-b-0">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">{a.username}</p>
              <p className="text-xs text-gray-600">
                {a.customers.length > 0 ? a.customers.map((c) => c.name).join(", ") : "No customers assigned"}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => {
                setSelected(new Set(a.customers.map((c) => c.id)));
                setEditing(a);
              }}
            >
              <Users className="mr-1 h-3.5 w-3.5" /> Assign customers
            </Button>
          </div>
        ))
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customers for {editing?.username}</DialogTitle>
            <DialogDescription>The aggregator can create supply requests only for these customers.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {allCustomers.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm text-gray-800">
                <Checkbox
                  checked={selected.has(c.id)}
                  onCheckedChange={(v) =>
                    setSelected((prev) => {
                      const next = new Set(prev);
                      if (v) next.add(c.id);
                      else next.delete(c.id);
                      return next;
                    })
                  }
                />
                {c.name}
                {c.customerType?.name && (
                  <span className="text-xs capitalize text-gray-500">({c.customerType.name.toLowerCase()})</span>
                )}
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving} className="bg-green-600 hover:bg-green-700">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
