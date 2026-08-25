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
import { CreditCard, MoreHorizontal, Plus, Copy, Check, Clock, AlertCircle } from "lucide-react";
import { voucherService } from "@/app/services/voucherService";
import { IVoucherCard, CardStatus } from "@/lib/types";
import IssueVoucherCardModal from "./IssueVoucherCardModal";
import { RestaurantProvider } from "@/app/contexts/RestaurantContext";
import toast from "react-hot-toast";

const STATUS_COLORS: Record<CardStatus, string> = {
  [CardStatus.ACTIVE]: "text-green-600",
  [CardStatus.SUSPENDED]: "text-yellow-600",
  [CardStatus.BLOCKED]: "text-red-600",
  [CardStatus.DEACTIVATED]: "text-gray-400",
};

interface EnrollmentRequest {
  id: string;
  restaurantId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
  restaurant: { id: string; name: string; email: string; phone?: string };
}

export default function VoucherCardsTable() {
  const [cards, setCards] = useState<IVoucherCard[]>([]);
  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
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

  const loadRequests = () => {
    setRequestsLoading(true);
    voucherService
      .getCardEnrollmentRequests()
      .then((res) => setRequests(res?.data ?? []))
      .catch(() => setRequests([]))
      .finally(() => setRequestsLoading(false));
  };

  const loadAll = () => {
    loadCards();
    loadRequests();
  };

  useEffect(() => {
    loadAll();
  }, []);

  const copyPan = (pan: string, id: string) => {
    navigator.clipboard.writeText(pan);
    setCopiedId(id);
    toast.success("PAN copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatPan = (pan: string) => pan.replace(/(.{4})/g, "$1 ").trim();

  const pendingRequests = requests.filter((r) => r.status === "PENDING");

  // ── Enrollment requests columns ──────────────────────────────────────────
  const requestColumns: ColumnDef<EnrollmentRequest>[] = [
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
        </div>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-xs text-gray-600">{row.original.restaurant.phone ?? "—"}</span>
      ),
    },
    {
      id: "requestedAt",
      header: "Requested",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500">
          {new Date(row.original.requestedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: () => (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs rounded">
          Pending
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700 h-8 text-xs"
          onClick={() => {
            setPreselected({
              id: row.original.restaurant.id,
              name: row.original.restaurant.name,
            });
            setIssueModalOpen(true);
          }}
        >
          <CreditCard className="w-3.5 h-3.5 mr-1.5" />
          Issue Card
        </Button>
      ),
    },
  ];

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
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <RestaurantProvider>
      <div className="space-y-6">

        {/* ── Pending Card Requests ─────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-yellow-500" />
            <h3 className="text-sm font-semibold text-gray-800">
              Pending Card Requests
            </h3>
            {pendingRequests.length > 0 && (
              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs rounded-full px-2">
                {pendingRequests.length}
              </Badge>
            )}
          </div>

          {requestsLoading ? (
            <div className="text-xs text-gray-400 py-4 text-center">Loading requests...</div>
          ) : pendingRequests.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-4 py-3 border border-dashed border-gray-200">
              <AlertCircle className="w-4 h-4" />
              No pending card requests
            </div>
          ) : (
            <DataTable
              columns={requestColumns}
              data={pendingRequests}
              title=""
              description=""
              showPagination={false}
              showColumnVisibility={false}
              showRowSelection={false}
              isLoading={requestsLoading}
            />
          )}
        </div>

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
        onSuccess={loadAll}
        preselectedRestaurant={preselected}
      />
    </RestaurantProvider>
  );
}
