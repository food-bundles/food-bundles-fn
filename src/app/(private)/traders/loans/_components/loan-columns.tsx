"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Eye, CheckCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoanApplication } from "@/app/services/traderService";
import { useState } from "react";
import { ApproveLoanModal } from "./ApproveLoanModal";

const ActionsCell = ({ loan }: { loan: LoanApplication }) => {
  const [showApproveModal, setShowApproveModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          {loan.status === "PENDING" && (
            <DropdownMenuItem onClick={() => setShowApproveModal(true)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve Loan
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ApproveLoanModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        loan={loan}
        onSuccess={() => {
          setShowApproveModal(false);
          window.location.reload();
        }}
      />
    </>
  );
};

export const loanColumns: ColumnDef<LoanApplication>[] = [
  {
    accessorKey: "#",
    header: "#",
    cell: ({ row }) => {
      return (
        <span className="text-xs   text-gray-900">{row.index + 1}</span>
      );
    },
  },
  {
    accessorKey: "restaurant.name",
    header: "Restaurant",
    cell: ({ row }) => {
      const restaurant = row.original.restaurant;
      return (
        <div>
          <div className="font-medium">{restaurant.name}</div>
          <div className="text-sm text-gray-500">{restaurant.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "requestedAmount",
    header: "Requested Amount",
    cell: ({ row }) => {
      const amount = row.getValue("requestedAmount") as number;
      return <span className="font-medium">{amount.toLocaleString()} RWF</span>;
    },
  },
  {
    accessorKey: "purpose",
    header: "Purpose",
    cell: ({ row }) => {
      const purpose = row.getValue("purpose") as string;
      return (
        <div className="max-w-xs truncate" title={purpose}>
          {purpose}
        </div>
      );
    },
  },
  {
    accessorKey: "repaymentDays",
    header: "Repayment Days",
    cell: ({ row }) => {
      const days = row.getValue("repaymentDays") as number;
      return <span>{days} days</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const getStatusColor = (status: string) => {
        switch (status) {
          case "PENDING":
            return "bg-yellow-100 text-yellow-800";
          case "APPROVED":
            return "bg-green-100 text-green-800";
          case "REJECTED":
            return "bg-red-100 text-red-800";
          default:
            return "bg-gray-100 text-gray-800";
        }
      };

      return (
        <Badge className={getStatusColor(status)}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Applied Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ActionsCell loan={row.original} />,
  },
];