/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreditCard, MoreHorizontal, Plus, Copy, Check, Printer } from "lucide-react";
import { voucherService } from "@/app/services/voucherService";
import { IVoucherCard, CardStatus } from "@/lib/types";
import IssueVoucherCardModal from "./IssueVoucherCardModal";
import { printVoucherCard } from "./cardPrint";
import { RestaurantProvider } from "@/app/contexts/RestaurantContext";
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
              <DropdownMenuItem onClick={() => printVoucherCard(card)}>
                <Printer className="mr-2 h-4 w-4" />
                Print Card
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
    </RestaurantProvider>
  );
}
