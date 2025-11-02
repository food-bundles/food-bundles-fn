/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Calendar } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { useVouchers } from "@/app/contexts/VoucherContext";
import { ILoanApplication, LoanStatus } from "@/lib/types";
import ApproveLoanModal from "./ApproveLoanModal";

export default function LoanApplicationsTable() {
  const { allLoanApplications, loading, getAllLoanApplications, approveLoan, rejectLoan, disburseLoan } = useVouchers();
  const [selectedApp, setSelectedApp] = useState<ILoanApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getAllLoanApplications();
  }, [getAllLoanApplications]);

  const handleApprove = async (approvalData: any) => {
    if (!selectedApp) return;
    await approveLoan(selectedApp.id, approvalData);
    setSelectedApp(null);
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await rejectLoan(id, reason);
    } catch (error) {
      console.error("Failed to reject loan:", error);
    }
  };

  // don't remove this handler, might be needed later

  const handleDisburse = async (id: string) => {
    try {
      await disburseLoan(id);
    } catch (error) {
      console.error("Failed to disburse loan:", error);
    }
  };

  const getStatusBadge = (status: LoanStatus) => {
    switch (status) {
      case LoanStatus.PENDING:
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case LoanStatus.APPROVED:
        return <Badge className="bg-green-500">Approved</Badge>;
      case LoanStatus.DISBURSED:
        return <Badge className="bg-blue-500">Disbursed</Badge>;
      case LoanStatus.REJECTED:
        return <Badge className="bg-red-500">Rejected</Badge>;
      case LoanStatus.SETTLED:
        return <Badge className="bg-gray-500">Settled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const columns: ColumnDef<ILoanApplication>[] = [
    {
      accessorKey: "restaurantName",
      header: "Restaurant",
      cell: ({ row }) => (row.original as any).restaurant?.name || row.original.restaurantName || "N/A"
    },
    {
      accessorKey: "requestedAmount",
      header: "Amount",
      cell: ({ row }) => `${row.original.requestedAmount.toLocaleString()} RWF`
    },
    {
      accessorKey: "purpose",
      header: "Purpose",
      cell: ({ row }) => row.original.purpose || "N/A"
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original.status)
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Calendar className="h-3 w-3" />
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const app = row.original;
        return (
          <div className="flex gap-2">
            {app.status === LoanStatus.PENDING && (
              <>
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setSelectedApp(app);
                    setIsModalOpen(true);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => {
                    const reason = prompt("Reason for rejection:");
                    if (reason) handleReject(app.id, reason);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
            {/* {app.status === LoanStatus.APPROVED && (
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => handleDisburse(app.id)}
              >
                Disburse
              </Button>
            )} */}
          </div>
        );
      }
    }
  ];

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <>
      <DataTable
        columns={columns}
        data={allLoanApplications}
        title="Loan Applications"
        showColumnVisibility={true}
        showPagination={true}
      />
      <ApproveLoanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedApp={selectedApp}
        onApprove={handleApprove}
      />
    </>
  );
}