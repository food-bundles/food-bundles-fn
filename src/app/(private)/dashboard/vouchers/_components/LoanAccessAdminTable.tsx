/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Clock,
  PauseCircle,
  PlayCircle,
  AlertCircle,
  Loader2,
  Building2,
} from "lucide-react";
import {
  subscriptionService,
  RestaurantSubscription,
  LoanProvider,
} from "@/app/services/subscriptionService";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACTIVE: "bg-green-100 text-green-700",
  SUSPENDED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending Approval",
  ACTIVE: "Active",
  SUSPENDED: "Disabled",
  CANCELLED: "Rejected",
  EXPIRED: "Expired",
};

const USER_TYPE_OPTIONS = [
  { label: "All User Types", value: "all" },
  { label: "Restaurant", value: "RESTAURANT" },
  { label: "Hotel", value: "HOTEL" },
  { label: "Affiliator", value: "AFFILIATOR" },
];

export default function LoanAccessAdminTable() {
  const [subscriptions, setSubscriptions] = useState<RestaurantSubscription[]>([]);
  const [providers, setProviders] = useState<LoanProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [selected, setSelected] = useState<RestaurantSubscription | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const filters: any = {};
    if (statusFilter !== "all") filters.status = statusFilter;
    if (userTypeFilter !== "all") filters.userType = userTypeFilter;
    if (providerFilter !== "all") filters.loanProviderId = providerFilter;

    try {
      const [subRes, provRes] = await Promise.all([
        subscriptionService.getAllLoanAccess(filters),
        subscriptionService.getAllLoanProviders(),
      ]);
      setSubscriptions(subRes?.data ?? []);
      setProviders(provRes?.data ?? []);
    } catch {
      setSubscriptions([]);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Reload when filters change
  useEffect(() => {
    load();
  }, [statusFilter, userTypeFilter, providerFilter]);

  const pendingCount = subscriptions.filter((s) => s.status === "PENDING").length;

  const handleApprove = async (sub: RestaurantSubscription) => {
    setSubmitting(true);
    try {
      await subscriptionService.approveLoanAccess(sub.id);
      toast.success(`Loan access approved for ${sub.restaurant.name}`);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to approve loan access");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await subscriptionService.rejectLoanAccess(selected.id, rejectReason || undefined);
      toast.success("Loan access request rejected");
      setRejectOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to reject loan access");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisable = async (sub: RestaurantSubscription) => {
    setSubmitting(true);
    try {
      await subscriptionService.disableLoanAccess(sub.id);
      toast.success(`Loan access disabled for ${sub.restaurant.name}`);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to disable loan access");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnable = async (sub: RestaurantSubscription) => {
    setSubmitting(true);
    try {
      await subscriptionService.enableLoanAccess(sub.id);
      toast.success(`Loan access enabled for ${sub.restaurant.name}`);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to enable loan access");
    } finally {
      setSubmitting(false);
    }
  };

  const filterControls = useMemo(
    () => (
      <div className="flex flex-wrap items-end gap-3 pb-2">
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Status</Label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 border border-gray-300 rounded-md text-sm bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Disabled</option>
            <option value="CANCELLED">Rejected</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">User Type</Label>
          <select
            value={userTypeFilter}
            onChange={(e) => setUserTypeFilter(e.target.value)}
            className="h-9 px-3 border border-gray-300 rounded-md text-sm bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
          >
            {USER_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Loan Provider</Label>
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="h-9 px-3 border border-gray-300 rounded-md text-sm bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
          >
            <option value="all">All Providers</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    ),
    [statusFilter, userTypeFilter, providerFilter, providers]
  );

  const columns: ColumnDef<RestaurantSubscription>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => <span className="text-xs text-gray-500">{row.index + 1}</span>,
    },
    {
      id: "restaurant",
      header: "Restaurant",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-gray-800">{row.original.restaurant.name}</p>
          <p className="text-xs text-gray-400">{row.original.restaurant.email}</p>
          {row.original.restaurant.role && (
            <Badge className="mt-1 bg-gray-100 text-gray-600 text-[10px] rounded">
              {row.original.restaurant.role}
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "plan",
      header: "Plan / Provider",
      cell: ({ row }) => {
        const plan = row.original.plan;
        const provider = plan?.loanProvider;
        return (
          <div className="text-xs">
            <p className="font-semibold text-gray-800">{plan?.name ?? "—"}</p>
            <p className="text-gray-500 flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3" />
              {provider?.name ?? "—"}
            </p>
            {provider && !provider.isActive && (
              <Badge className="mt-1 bg-red-100 text-red-600 text-[10px] rounded">
                provider inactive
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <Badge className={`text-xs rounded ${STATUS_COLORS[s] ?? "bg-gray-100 text-gray-600"}`}>
            {STATUS_LABELS[s] ?? s}
          </Badge>
        );
      },
    },
    {
      id: "period",
      header: "Period",
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="text-xs text-gray-500">
            <p>{new Date(s.startDate).toLocaleDateString()}</p>
            <p>→ {new Date(s.endDate).toLocaleDateString()}</p>
          </div>
        );
      },
    },
    {
      id: "approvedAt",
      header: "Approved",
      cell: ({ row }) => {
        const d = row.original.loanAccessApprovedAt;
        return d ? (
          <span className="text-xs text-gray-500">{new Date(d).toLocaleDateString()}</span>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        );
      },
    },
    {
      id: "notes",
      header: "Notes",
      cell: ({ row }) => {
        const n = row.original.loanAccessNotes;
        return n ? (
          <span className="text-xs text-blue-600 line-clamp-2 max-w-[180px]">{n}</span>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const s = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" disabled={submitting}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {s.status === "PENDING" && (
                <>
                  <DropdownMenuItem onClick={() => handleApprove(s)}>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => {
                      setSelected(s);
                      setRejectReason("");
                      setRejectOpen(true);
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </DropdownMenuItem>
                </>
              )}
              {s.status === "ACTIVE" && (
                <DropdownMenuItem
                  className="text-gray-600"
                  onClick={() => handleDisable(s)}
                >
                  <PauseCircle className="mr-2 h-4 w-4" />
                  Disable (Suspend)
                </DropdownMenuItem>
              )}
              {s.status === "SUSPENDED" && (
                <DropdownMenuItem onClick={() => handleEnable(s)}>
                  <PlayCircle className="mr-2 h-4 w-4 text-green-600" />
                  Enable (Reactivate)
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Pending summary */}
      {!loading && (
        <div className="flex items-center gap-2 text-xs">
          <Clock className="w-4 h-4 text-yellow-500" />
          <span className="text-gray-600">
            {pendingCount} pending loan access request{pendingCount === 1 ? "" : "s"}
          </span>
        </div>
      )}

      {!loading && subscriptions.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 rounded-lg px-4 py-6 border border-dashed border-gray-200">
          <AlertCircle className="w-4 h-4" />
          No loan access subscriptions match the current filters
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={subscriptions}
          title="Loan Access Subscriptions"
          description="Subscription-based loan access requests — approve, reject, enable or disable"
          customFilters={filterControls}
          showPagination
          showColumnVisibility
          showRowSelection={false}
          isLoading={loading}
        />
      )}

      {/* Reject modal */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              Reject Loan Access — {selected?.restaurant.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Reason (optional)</label>
              <Input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Restaurant does not qualify yet"
                className="h-10 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleReject}
                disabled={submitting}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {submitting ? "Rejecting..." : "Reject"}
              </Button>
              <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={submitting}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}