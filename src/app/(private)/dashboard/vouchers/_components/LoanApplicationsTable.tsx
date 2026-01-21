/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, XCircle, Trash2, MoreHorizontal, Search, Check } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { useVouchers } from "@/app/contexts/VoucherContext";
import { ILoanApplication, LoanStatus } from "@/lib/types";
import ApproveLoanModal from "./ApproveLoanModal";
import RejectLoanModal from "./RejectLoanModal";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoanApplicationsTable() {
  const {
    allLoanApplications,
    getAllLoanApplications,
    approveLoan,
    acceptLoan,
    rejectLoan,
    disburseLoan,
    deleteLoanApplication,
  } = useVouchers();
  const [selectedApp, setSelectedApp] = useState<ILoanApplication | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [restaurantFilter, setRestaurantFilter] = useState("");


  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (date: string | Date) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });


  useEffect(() => {
    getAllLoanApplications();
  }, [getAllLoanApplications]);

  const filteredApplications = useMemo(() => {
    if (!restaurantFilter) return allLoanApplications;
    return allLoanApplications.filter((app: any) => {
      const restaurantName = app.restaurant?.name || app.restaurantName || "";
      return restaurantName.toLowerCase().includes(restaurantFilter.toLowerCase());
    });
  }, [allLoanApplications, restaurantFilter]);

  const handleApprove = async (approvalData: any) => {
    if (!selectedApp) return;
    try {
      await approveLoan(selectedApp.id, approvalData);
      toast.success("Loan application approved successfully!");
      await getAllLoanApplications(); // Refresh data
      setSelectedApp(null);
    } catch (error) {
      toast.error("Failed to approve loan application");
      console.error("Failed to approve loan:", error);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await acceptLoan(id);
      toast.success("Loan application accepted successfully!");
      await getAllLoanApplications();
    } catch (error) {
      toast.error("Failed to accept loan application");
      console.error("Failed to accept loan:", error);
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedApp) return;
    try {
      await rejectLoan(selectedApp.id, reason);
      toast.success("Loan application rejected successfully!");
      await getAllLoanApplications(); // Refresh data
      setSelectedApp(null);
    } catch (error) {
      toast.error("Failed to reject loan application");
      console.error("Failed to reject loan:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedApp) return;
    try {
      await deleteLoanApplication(selectedApp.id);
      toast.success("Loan application deleted successfully!");
      await getAllLoanApplications();
      setIsDeleteModalOpen(false);
      setSelectedApp(null);
      setDeleteConfirmText("");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to delete loan application";
      toast.error(errorMessage);
      console.error("Failed to delete loan:", error);
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
        return <div className="text-yellow-500">Pending</div>;
      case LoanStatus.APPROVED:
        return <div className="text-green-500">Approved</div>;
      case LoanStatus.ACCEPTED:
        return <div className="text-teal-500">Accepted</div>;
      case LoanStatus.DISBURSED:
        return <div className="text-blue-500">Disbursed</div>;
      case LoanStatus.REJECTED:
        return <div className="text-red-500">Rejected</div>;
      case LoanStatus.SETTLED:
        return <div className="text-gray-500">Settled</div>;
      default:
        return <div>{status}</div>;
    }
  };

  const columns: ColumnDef<ILoanApplication>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => {
        const index =
          filteredApplications.findIndex(
            (app: any) => app.id === row.original.id
          ) + 1;
        return <div className="text-sm font-medium">{index}</div>;
      },
    },
    {
      accessorKey: "restaurantName",
      header: "Restaurant",
      cell: ({ row }) =>
        (row.original as any).restaurant?.name ||
        row.original.restaurantName ||
        "N/A",
    },
    {
      accessorKey: "requestedAmount",
      header: "Amount",
      cell: ({ row }) => `${row.original.requestedAmount.toLocaleString()} RWF`,
    },
    {
      accessorKey: "voucherDays",
      header: "Voucher Days",
      cell: ({ row }) => {
        const days = row.original.repaymentDays;
        return <div className="text-sm">{days ? `${days} days` : "N/A"}</div>;
      },
    },
    {
      id: "approvedVouchers",
      header: "Approved Vouchers",
      cell: ({ row }) => {
        const vouchers = (row.original as any).vouchers || [];
        const approvedVouchers = vouchers.filter(
          (v: any) =>
            v.status === "ACTIVE" ||
            v.status === "USED" ||
            v.status === "SETTLED"
        );

        if (approvedVouchers.length === 0) {
          return <div className="text-sm text-gray-500">No vouchers</div>;
        }

        return (
          <div className="text-sm space-y-1">
            {approvedVouchers.map((voucher: any, index: number) => (
              <div key={voucher.id} className="flex items-center gap-2">
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {voucher.voucherCode}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded ${voucher.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : voucher.status === "USED"
                        ? "bg-blue-100 text-blue-700"
                        : voucher.status === "SETTLED"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-red-100 text-red-700"
                    }`}
                >
                  {voucher.status}
                </span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const date = row.original.createdAt;
      
        return (
        
          <div className="flex items-center gap-1 text-sm text-gray-700" >
            {formatDate(date)}
            < p className="text-xs text-gray-500" > {formatTime(date)}</p>
          </div >
        );
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const app = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  disabled={app.status !== LoanStatus.PENDING}
                  onClick={() => handleAccept(app.id)}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Accept
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={
                    app.status !== LoanStatus.PENDING &&
                    app.status !== LoanStatus.ACCEPTED
                  }
                  onClick={() => {
                    setSelectedApp(app);
                    setIsApproveModalOpen(true);
                  }}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={app.status !== LoanStatus.PENDING}
                  onClick={() => {
                    setSelectedApp(app);
                    setIsRejectModalOpen(true);
                  }}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => {
                    setSelectedApp(app);
                    setIsDeleteModalOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Filter by restaurant name..."
              value={restaurantFilter}
              onChange={(e) => setRestaurantFilter(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-300 focus:border-green-500 focus:ring-green-500 text-sm"
            />
          </div>
          {restaurantFilter && (
            <Button
              variant="outline"
              onClick={() => setRestaurantFilter("")}
              className="text-sm"
            >
              Clear Filter
            </Button>
          )}
        </div>

        <DataTable
          columns={columns}
          data={filteredApplications}
          title={``}
          showColumnVisibility={true}
          showPagination={true}
        />
      </div>
      <ApproveLoanModal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setSelectedApp(null);
        }}
        selectedApp={selectedApp}
        onApprove={handleApprove}
      />
      <RejectLoanModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setSelectedApp(null);
        }}
        selectedApp={selectedApp}
        onReject={handleReject}
      />

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-106.25 bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              Delete Loan Application
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              This action cannot be undone. To confirm deletion, please type the{" "}
              <span className="font-semibold text-gray-900">
                restaurant name
              </span>{" "}
              below:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-red-600/10 flex items-center justify-center">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deleteConfirm" className="text-gray-900">
                <div className="flex items-center flex-wrap gap-1">
                  <span>Type restaurant name</span>
                  <span className="font-semibold text-red-500">
                    {(selectedApp as any)?.restaurant?.name ||
                      selectedApp?.restaurantName ||
                      "N/A"}
                  </span>
                  <span>to confirm</span>
                </div>
              </Label>

              <Input
                id="deleteConfirm"
                placeholder="Type restaurant name"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeleteConfirmText("");
                setSelectedApp(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={
                deleteConfirmText !==
                ((selectedApp as any)?.restaurant?.name ||
                  selectedApp?.restaurantName ||
                  "N/A")
              }
            >
              Delete Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
