"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminAccess } from "@/app/hooks/useAdminAccess";
import { errorMessage, SupplyRequest, supplyRequestService } from "@/app/services/supplyRequestService";
import { SupplyRequestForm } from "../_components/SupplyRequestForm";

const formatDay = (value: string) =>
  new Date(value.length === 10 ? `${value}T00:00:00Z` : value).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

const STAGE_LABELS: Record<string, string> = {
  PENDING: "Submitted",
  NEGOTIATING: "Counter-offer",
  APPROVED: "Approved",
  VERIFIED: "Verified",
  PAID: "Paid",
};

// One supply request: what each day needs, what farmers submitted, what is missing
export default function SupplyRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { can } = useAdminAccess();
  const [request, setRequest] = useState<SupplyRequest | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setRequest(await supplyRequestService.get(id));
    } catch (error) {
      toast.error(errorMessage(error, "Failed to load the request"));
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (status: "OPEN" | "CLOSED" | "CANCELLED") => {
    setBusy(true);
    try {
      setRequest(await supplyRequestService.setStatus(id, status));
      toast.success(status === "OPEN" ? "Request reopened" : status === "CLOSED" ? "Request closed" : "Request cancelled");
    } catch (error) {
      toast.error(errorMessage(error, "Failed to update the request"));
    } finally {
      setBusy(false);
    }
  };

  if (!request) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const open = request.status === "OPEN";
  const totalMissing = (request.schedule || []).reduce(
    (sum, day) => sum + day.lines.filter((l) => l.missing > 0).length,
    0,
  );

  return (
    <div className="p-4 space-y-4">
      <Link href="/dashboard/supply-requests" className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-3.5 w-3.5" /> All supply requests
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[16px] font-medium text-gray-900">
            {request.restaurant.name}
            {request.title ? ` · ${request.title}` : ""}
          </h1>
          <p className="flex items-center gap-1.5 text-xs text-gray-600">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDay(request.startDate)} – {formatDay(request.endDate)} · created by {request.createdBy.username} ·{" "}
            <span className="font-medium">{request.status.toLowerCase()}</span>
          </p>
          {request.notes && <p className="mt-1 text-xs text-gray-500">{request.notes}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {open && can("supply_requests", "edit") && (
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
            </Button>
          )}
          {can("supply_requests", "close") &&
            (open ? (
              <>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => changeStatus("CLOSED")}>
                  Close
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  disabled={busy}
                  onClick={() => changeStatus("CANCELLED")}
                >
                  Cancel request
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" disabled={busy} onClick={() => changeStatus("OPEN")}>
                Reopen
              </Button>
            ))}
        </div>
      </div>

      {open && (
        <p
          className={`rounded-lg px-3 py-2 text-xs ${
            totalMissing > 0 ? "bg-amber-50 text-amber-900 border border-amber-200" : "bg-green-50 text-green-800 border border-green-200"
          }`}
        >
          {totalMissing > 0
            ? `${totalMissing} product line${totalMissing === 1 ? "" : "s"} in the next two weeks still missing from farmers. Buy them elsewhere if farmers don't bring them.`
            : "Farmers have covered every product for the next two weeks."}
        </p>
      )}

      {(request.schedule || []).length === 0 ? (
        <div className="rounded-xl border bg-white p-6 text-center text-sm text-gray-500">
          No upcoming days in the next two weeks.
        </div>
      ) : (
        <div className="space-y-3">
          {request.schedule!.map((day) => (
            <div key={day.date} className="rounded-xl border bg-white">
              <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-2">
                <p className="text-sm font-semibold text-gray-900">{formatDay(day.date)}</p>
                {(() => {
                  const order = request.orders?.find((o) => o.supplyDate?.slice(0, 10) === day.date);
                  return order ? (
                    <span className="text-xs text-green-700">
                      Order {order.orderNumber} · {Math.round(order.totalAmount).toLocaleString()} RWF
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">No order yet</span>
                  );
                })()}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-500">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Product</th>
                      <th className="px-3 py-2 text-right font-medium">Needed</th>
                      <th className="px-3 py-2 text-right font-medium">Submitted</th>
                      <th className="px-3 py-2 text-right font-medium">Received</th>
                      <th className="px-3 py-2 text-right font-medium">Missing</th>
                      <th className="px-4 py-2 text-left font-medium">Farmers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {day.lines.map((line) => (
                      <tr key={line.itemId} className="border-t align-top">
                        <td className="px-4 py-2">
                          <span className="font-medium text-gray-900">{line.productName}</span>
                          <span className="block text-xs text-gray-500">{Math.round(line.price).toLocaleString()} RWF / {line.unit}</span>
                        </td>
                        <td className="px-3 py-2 text-right">{line.needed}</td>
                        <td className="px-3 py-2 text-right">{line.submitted}</td>
                        <td className="px-3 py-2 text-right text-green-700">{line.received}</td>
                        <td className={`px-3 py-2 text-right font-semibold ${line.missing > 0 ? "text-amber-700" : "text-green-700"}`}>
                          {line.missing > 0 ? line.missing : "✓"}
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-600">
                          {line.submissions.length === 0
                            ? "—"
                            : line.submissions.map((s) => (
                                <div key={s.id}>
                                  {s.farmer.name || s.farmer.phone || "Farmer"}: {s.acceptedQty ?? s.submittedQty} ·{" "}
                                  <span className="text-gray-500">{STAGE_LABELS[s.status] || s.status}</span>
                                </div>
                              ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Farmers&apos; submissions go through Farmer Submissions (approve → verify → pay). When one is paid, it is added
        to this customer&apos;s order for that day.
      </p>

      <SupplyRequestForm open={editOpen} request={request} onClose={() => setEditOpen(false)} onSaved={() => load()} />
    </div>
  );
}
