/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpRight, Loader2, Plus, Landmark } from "lucide-react";
import { walletService, IWalletTransfer } from "@/app/services/walletService";
import { restaurantService } from "@/app/services/restaurantService";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  FAILED: "bg-red-100 text-red-700",
};

const SOURCE_LABELS: Record<string, string> = {
  VOUCHER_EXPIRY: "Voucher Expiry",
  LOAN_APPROVAL: "Loan Approval",
  MANUAL: "Manual",
};

export default function WalletTransfersAdmin() {
  const [transfers, setTransfers] = useState<IWalletTransfer[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    restaurantId: "",
    amount: "",
    source: "VOUCHER_EXPIRY",
    voucherId: "",
    loanSessionId: "",
    notes: "",
  });

  const load = () => {
    setLoading(true);
    walletService
      .getAllWalletTransfers(statusFilter !== "all" ? { status: statusFilter } : undefined)
      .then((res) => setTransfers(res?.data ?? []))
      .catch(() => setTransfers([]))
      .finally(() => setLoading(false));
  };

  const loadRestaurants = () => {
    restaurantService
      .getAllRestaurants({ limit: 100 })
      .then((res) => setRestaurants(res?.data ?? []))
      .catch(() => setRestaurants([]));
  };

  useEffect(() => {
    load();
    loadRestaurants();
  }, []);

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleCreate = async () => {
    const amount = parseFloat(form.amount);
    if (!form.restaurantId || !amount || amount <= 0) {
      toast.error("Select a restaurant and enter a valid amount");
      return;
    }
    setSubmitting(true);
    try {
      await walletService.createWalletTransfer({
        restaurantId: form.restaurantId,
        amount,
        voucherId: form.voucherId || undefined,
        loanSessionId: form.loanSessionId || undefined,
        source: form.source,
        notes: form.notes || undefined,
      });
      toast.success("Wallet transfer created");
      setCreateOpen(false);
      setForm({ restaurantId: "", amount: "", source: "VOUCHER_EXPIRY", voucherId: "", loanSessionId: "", notes: "" });
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to create transfer");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnDef<IWalletTransfer>[] = [
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
          <p className="text-sm font-medium text-gray-800">
            {row.original.restaurant?.name ?? "—"}
          </p>
          <p className="text-xs text-gray-400">{row.original.restaurantId}</p>
        </div>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
          <ArrowUpRight className="w-4 h-4" />
          +{row.original.amount.toLocaleString()} RWF
        </div>
      ),
    },
    {
      id: "source",
      header: "Source",
      cell: ({ row }) => (
        <Badge className="bg-blue-100 text-blue-700 text-xs rounded">
          {SOURCE_LABELS[row.original.source] ?? row.original.source}
        </Badge>
      ),
    },
    {
      id: "references",
      header: "References",
      cell: ({ row }) => {
        const t = row.original;
        const refs: string[] = [];
        if (t.voucherId) refs.push(`Voucher: ${t.voucherId.slice(0, 8)}…`);
        if (t.loanSessionId) refs.push(`Loan: ${t.loanSessionId.slice(0, 8)}…`);
        return refs.length ? (
          <div className="text-xs space-y-0.5">
            {refs.map((r, i) => (
              <p key={i} className="font-mono text-gray-500">{r}</p>
            ))}
          </div>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        );
      },
    },
    {
      id: "notes",
      header: "Notes",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500 max-w-[180px] line-clamp-2">
          {row.original.notes ?? "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          className={`text-xs rounded ${STATUS_COLORS[row.original.status] ?? "bg-gray-100 text-gray-600"}`}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500">
          {new Date(row.original.transferredAt || row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="flex flex-col gap-4 p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-green-600" />
              Voucher Wallet Transfers
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Transfer unused voucher amounts (Kayko) into restaurant wallets
            </p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-1" />
            New Transfer
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Label className="text-xs text-gray-500">Status</Label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-3 border border-gray-300 rounded-md text-sm bg-white focus:border-green-500"
          >
            <option value="all">All</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>
      <div className="p-5">
        <DataTable
          columns={columns}
          data={transfers}
          title=""
          description=""
          showPagination
          showColumnVisibility
          showSearch={false}
          showRowSelection={false}
          showAddButton={false}
          isLoading={loading}
        />
      </div>

      {/* Create transfer modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-green-600" />
              New Wallet Transfer
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Restaurant *</Label>
              <Select value={form.restaurantId} onValueChange={(v) => setForm((p) => ({ ...p, restaurantId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((r: any) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Amount (RWF) *</Label>
              <Input
                type="number"
                min="1"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                placeholder="e.g. 50000"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Source</Label>
              <Select value={form.source} onValueChange={(v) => setForm((p) => ({ ...p, source: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VOUCHER_EXPIRY">Voucher Expiry</SelectItem>
                  <SelectItem value="LOAN_APPROVAL">Loan Approval</SelectItem>
                  <SelectItem value="MANUAL">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Voucher ID (optional)</Label>
                <Input
                  value={form.voucherId}
                  onChange={(e) => setForm((p) => ({ ...p, voucherId: e.target.value }))}
                  className="h-10 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Loan Session ID (optional)</Label>
                <Input
                  value={form.loanSessionId}
                  onChange={(e) => setForm((p) => ({ ...p, loanSessionId: e.target.value }))}
                  className="h-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Notes (optional)</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Reason for the transfer"
                rows={2}
                className="text-sm resize-none"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleCreate}
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {submitting ? "Creating..." : "Create Transfer"}
              </Button>
              <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}