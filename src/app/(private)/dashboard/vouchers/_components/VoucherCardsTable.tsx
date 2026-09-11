/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreditCard, MoreHorizontal, Plus, Copy, Check, Percent } from "lucide-react";
import { voucherService } from "@/app/services/voucherService";
import { IVoucherCard, CardStatus } from "@/lib/types";
import IssueVoucherCardModal from "./IssueVoucherCardModal";
import { RestaurantProvider } from "@/app/contexts/RestaurantContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

const STATUS_COLORS: Record<CardStatus, string> = {
  [CardStatus.ACTIVE]: "text-green-600",
  [CardStatus.SUSPENDED]: "text-yellow-600",
  [CardStatus.BLOCKED]: "text-red-600",
  [CardStatus.DEACTIVATED]: "text-gray-400",
};

export default function VoucherCardsTable() {
  const [cards, setCards] = useState<IVoucherCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [preselected, setPreselected] = useState<{ id: string; name: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  // Unlock fee editor state
  const [feeCard, setFeeCard] = useState<IVoucherCard | null>(null);
  const [feeEnabled, setFeeEnabled] = useState(false);
  const [feePct, setFeePct] = useState("");
  const [savingFee, setSavingFee] = useState(false);

  const loadCards = () => {
    setLoading(true);
    voucherService
      .getAllVoucherCards()
      .then((res) => setCards(res?.data ?? []))
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCards();
  }, []);

  const copyPan = (pan: string, id: string) => {
    navigator.clipboard.writeText(pan);
    setCopiedId(id);
    toast.success("PAN copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatPan = (pan: string) => pan.replace(/(.{4})/g, "$1 ").trim();

  const openFeeEditor = (card: IVoucherCard) => {
    setFeeCard(card);
    setFeeEnabled(card.unlockFeeEnabled ?? false);
    setFeePct(card.unlockFeePercentage ? String(card.unlockFeePercentage) : "");
  };

  const handleSaveFee = async () => {
    if (!feeCard) return;
    setSavingFee(true);
    try {
      const pct = parseFloat(feePct);
      await voucherService.updateCardUnlockFee(feeCard.id, {
        unlockFeeEnabled: feeEnabled,
        unlockFeePercentage: feeEnabled && !isNaN(pct) && pct > 0 ? pct : null,
      });
      toast.success(feeEnabled ? "Card unlock fee configured" : "Card unlock fee disabled (no fee applies)");
      setFeeCard(null);
      loadCards();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to update unlock fee");
    } finally {
      setSavingFee(false);
    }
  };

  // ── Issued cards columns ─────────────────────────────────────────────────
  const cardColumns: ColumnDef<IVoucherCard>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => <span className="text-xs text-gray-500">{row.index + 1}</span>,
    },
    {
      id: "pan",
      header: "Card Number (PAN)",
      cell: ({ row }) => {
        const card = row.original;
        return (
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => copyPan(card.pan, card.id)}
          >
            <span className="font-mono text-xs bg-gray-100 border border-gray-200 rounded px-2 py-1 text-gray-700 tracking-wider">
              {formatPan(card.pan)}
            </span>
            {copiedId === card.id ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
            )}
          </div>
        );
      },
    },
    {
      id: "restaurant",
      header: "Restaurant",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-800">
          {(row.original as any).restaurant?.name ?? row.original.restaurantName}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`text-xs font-medium ${STATUS_COLORS[row.original.status] ?? "text-gray-500"}`}>
          {row.original.status}
        </span>
      ),
    },
    {
      id: "loanLimit",
      header: "Loan Limit",
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">
          {row.original.loanLimit.toLocaleString()} RWF
        </span>
      ),
    },
    {
      id: "outstanding",
      header: "Outstanding",
      cell: ({ row }) => {
        const amt = row.original.totalOutstandingLoans;
        return (
          <span className={`text-sm ${amt > 0 ? "text-orange-600 font-medium" : "text-gray-400"}`}>
            {amt.toLocaleString()} RWF
          </span>
        );
      },
    },
    {
      id: "unlockFee",
      header: "Unlock Fee",
      cell: ({ row }) => {
        const card = row.original;
        const enabled = card.unlockFeeEnabled && (card.unlockFeePercentage ?? 0) > 0;
        return enabled ? (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs rounded">
            {card.unlockFeePercentage}%
          </Badge>
        ) : (
          <span className="text-xs text-gray-400">None</span>
        );
      },
    },
    {
      id: "eligible",
      header: "Eligible",
      cell: ({ row }) => (
        <span className={`text-xs ${row.original.isEligible ? "text-green-600" : "text-gray-400"}`}>
          {row.original.isEligible ? "Yes" : (row.original.eligibilityReason ?? "No")}
        </span>
      ),
    },
    {
      id: "orders",
      header: "Orders",
      cell: ({ row }) => (
        <span className="text-xs text-gray-600">{row.original.qualifyingOrders}</span>
      ),
    },
    {
      id: "issued",
      header: "Issued",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500">
          {new Date(row.original.issuedDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const card = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => copyPan(card.pan, card.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy PAN
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openFeeEditor(card)}>
                <Percent className="mr-2 h-4 w-4" />
                Configure Unlock Fee
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <RestaurantProvider>
      <div className="space-y-6">

        {/* ── Issued Cards ──────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-green-600" />
              <h3 className="text-sm font-semibold text-gray-800">Issued Voucher Cards</h3>
            </div>
            <Button
              onClick={() => {
                setPreselected(null);
                setIssueModalOpen(true);
              }}
              className="bg-green-600 hover:bg-green-700 h-8 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Issue Card Manually
            </Button>
          </div>

          <DataTable
            columns={cardColumns}
            data={cards}
            title=""
            description=""
            showPagination
            showColumnVisibility
            isLoading={loading}
          />
        </div>
      </div>

      <IssueVoucherCardModal
        isOpen={issueModalOpen}
        onClose={() => {
          setIssueModalOpen(false);
          setPreselected(null);
        }}
        onSuccess={loadCards}
        preselectedRestaurant={preselected}
      />

      {/* ── Card Unlock Fee Config ─────────────────────────────────────── */}
      <Dialog open={feeCard !== null} onOpenChange={(open) => !open && setFeeCard(null)}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-green-600" />
              Unlock Fee — PAN {feeCard ? formatPan(feeCard.pan) : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={feeEnabled}
                onChange={(e) => setFeeEnabled(e.target.checked)}
                className="h-4 w-4 accent-green-600"
              />
              Apply unlock fee for this restaurant's loans
            </label>
            {feeEnabled && (
              <div>
                <label className="block text-sm font-medium mb-1">Fee percentage (%)</label>
                <Input
                  type="number"
                  min={0}
                  step="0.1"
                  value={feePct}
                  onChange={(e) => setFeePct(e.target.value)}
                  placeholder="e.g. 4"
                  className="h-10 text-sm"
                />
              </div>
            )}
            <p className="text-xs text-gray-400">
              No default fee — if disabled, this restaurant's loans are activated without an
              unlock fee (unless the linked loan provider sets one).
            </p>
            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleSaveFee}
                disabled={savingFee || (feeEnabled && !(parseFloat(feePct) > 0))}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {savingFee && <Check className="w-4 h-4 animate-pulse mr-2" />}
                {savingFee ? "Saving..." : "Save Fee Config"}
              </Button>
              <Button variant="outline" onClick={() => setFeeCard(null)} disabled={savingFee}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </RestaurantProvider>
  );
}
