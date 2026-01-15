/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Trash2, MoreHorizontal, Plus, Search } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { useVouchers } from "@/app/contexts/VoucherContext";
import { IVoucher, VoucherStatus, VoucherType } from "@/lib/types";
import { VoucherManagementModal } from "./VoucherManagementModal";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface VouchersTableProps {
  onCreateVoucher?: () => void;
}

export default function VouchersTable({ onCreateVoucher }: VouchersTableProps) {
  const { allVouchers, getAllVouchers, updateVoucher, deactivateVoucher } = useVouchers();
  const [selectedVoucher, setSelectedVoucher] = useState<IVoucher | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [restaurantFilter, setRestaurantFilter] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchVouchers = async (page = 1, limit = 10, isPagination = false) => {
    try {
      if (isPagination) {
        setPaginationLoading(true);
      } else {
        setLoading(true);
      }
      const response = await getAllVouchers({ page, limit });
      
      if (response?.pagination) {
        setPagination({
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages,
        });
      }
    } catch (error) {
      console.error('Failed to fetch vouchers:', error);
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  };

  const handlePaginationChange = (page: number, limit: number) => {
    fetchVouchers(page, limit, true);
  };

  useEffect(() => {
    fetchVouchers(1, 10);
  }, []);

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

  const calculateRemainingDays = (voucher: any) => {
    // For vouchers that haven't been used yet, show repayment days from voucher or loan
    if (!voucher.usedAt) {
      const repaymentDays = voucher.repaymentDays || voucher.loan?.repaymentDays;
      return repaymentDays ? `${repaymentDays} days given` : "N/A";
    }

    // For used vouchers, calculate remaining days based on loan repayment due date
    if (voucher.loan?.repaymentDueDate) {
      const dueDate = new Date(voucher.loan.repaymentDueDate);
      const today = new Date();
      const remainingTime = dueDate.getTime() - today.getTime();
      const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));

      if (remainingDays < 0) {
        return `Overdue by ${Math.abs(remainingDays)} days`;
      } else if (remainingDays === 0) {
        return "Due today";
      } else {
        return `${remainingDays} days left`;
      }
    }

    return "N/A";
  };

  const filteredVouchers = useMemo(() => {
    if (!restaurantFilter) return allVouchers;
    return allVouchers.filter((voucher: any) => {
      const restaurantName = voucher.restaurant?.name || "";
      return restaurantName.toLowerCase().includes(restaurantFilter.toLowerCase());
    });
  }, [allVouchers, restaurantFilter]);

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateVoucher(id, "Deactivated by admin");
      toast.success("Voucher deactivated successfully");
      await fetchVouchers(pagination.page, pagination.limit);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to deactivate voucher";
      toast.error(errorMessage);
      console.error("Failed to deactivate voucher:", error);
    }
  };

  const handleEdit = async (voucherId: string, updateData: any) => {
    await updateVoucher(voucherId, updateData);
    await fetchVouchers(pagination.page, pagination.limit);
  };

  const getStatusBadge = (status: VoucherStatus) => {
    switch (status) {
      case VoucherStatus.ACTIVE:
        return (
          <p className="text-green-500 text-xs font-normal">Active</p>
        );
      case VoucherStatus.USED:
        return (
          <p className="text-yellow-500 text-xs font-normal">Used</p>
        );
      case VoucherStatus.EXPIRED:
        return (
          <p className="text-red-300 text-xs font-normal">Expired</p>
        );
      case VoucherStatus.MATURED:
        return <p className="text-red-500 text-xs font-normal">Matured</p>;
      case VoucherStatus.SUSPENDED:
        return (
          <p className="text-red-300 text-xs font-normal">Suspended</p>
        );
      case VoucherStatus.SETTLED:
        return <p className="text-orange-400 text-xs font-normal">Settled</p>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getVoucherTypeLabel = (type: VoucherType) => {
    switch (type) {
      case VoucherType.DISCOUNT_10:
        return "10% Discount";
      case VoucherType.DISCOUNT_20:
        return "20% Discount";
      case VoucherType.DISCOUNT_50:
        return "50% Discount";
      case VoucherType.DISCOUNT_80:
        return "80% Discount";
      case VoucherType.DISCOUNT_100:
        return "100% Discount";
      default:
        return type;
    }
  };

  const columns: ColumnDef<IVoucher>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => {
        const index =
          filteredVouchers.findIndex(
            (voucher: any) => voucher.id === row.original.id
          ) + 1;
        return <div className="text-xs">{index}</div>;
      },
    },
    {
      accessorKey: "voucherCode",
      header: "Code",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className=" text-xs">{row.original.voucherCode}</span>
        </div>
      ),
    },
    {
      id: "restaurant",
      header: "Restaurant",
      cell: ({ row }) => {
        const restaurantName = (row.original as any).restaurant?.name || "N/A";
        return <div className="text-xs">{restaurantName}</div>;
      },
    },
    {
      accessorKey: "ApprovedBy",
      header: "Approved By",
      cell: ({ row }) => {
        const approver = (row.original as any).approver?.username || "N/A";
        return <div className="text-xs">{approver}</div>;
      },
    },
    {
      accessorKey: "creditLimit",
      header: "Credit Limit",
      cell: ({ row }) => (
        <div>
          <p className="text-xs">
            {row.original.creditLimit.toLocaleString()} RWF
          </p>
          <p className="text-xs text-gray-500">
            {getVoucherTypeLabel(row.original.voucherType)}
          </p>
        </div>
      ),
    },
    {
      id: "usage",
      header: "Used Credit",
      cell: ({ row }) => (
        <div className="text-xs">
          <div>
            <span className=" text-green-600">
              {row.original.usedCredit.toLocaleString()}
            </span>{" "}
            RWF
          </div>
        </div>
      ),
    },
    {
      id: "remainingDays",
      header: "Days",
      cell: ({ row }) => {
        const voucher = row.original as any;
        const repaymentDays =
          voucher.repaymentDays || voucher.loan?.repaymentDays || 0;
        const status = voucher.status;

        let remainingInfo = "N/A";
        let remainingColor = "text-gray-500";

        // Handle different voucher statuses
        if (status === "USED" || status === "MATURED") {
          // Only show remaining days for USED or MATURED vouchers
          if (voucher.loan?.repaymentDueDate) {
            const dueDate = new Date(voucher.loan.repaymentDueDate);
            const today = new Date();
            const remainingTime = dueDate.getTime() - today.getTime();
            const remainingDays = Math.ceil(
              remainingTime / (24 * 60 * 60 * 1000)
            );

            if (remainingDays < 0) {
              remainingInfo = `Overdue by ${Math.abs(remainingDays)} days`;
              remainingColor = "text-red-600";
            } else if (remainingDays === 0) {
              remainingInfo = "Due today";
              remainingColor = "text-orange-600";
            } else {
              remainingInfo = `${remainingDays} days left`;
              remainingColor = "text-blue-600";
            }
          } else {
            remainingInfo = "No due date";
          }
        } else if (status === "ACTIVE") {
          // For ACTIVE vouchers, show expiry time (48 hours from issued)
          const issuedDate = new Date(voucher.issuedDate);
          const expiryDate = new Date(voucher.expiryDate);
          const today = new Date();
          const timeToExpiry = expiryDate.getTime() - today.getTime();
          const hoursToExpiry = Math.ceil(timeToExpiry / (1000 * 60 * 60));

          if (hoursToExpiry < 0) {
            remainingInfo = "Expired";
            remainingColor = "text-red-600";
          } else {
            const totalMinutes = Math.floor(timeToExpiry / (1000 * 60));
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;

            if (hours > 0) {
              remainingInfo = `${hours}h ${minutes}m to expire`;
            } else {
              remainingInfo = `${minutes}m to expire`;
            }

            remainingColor =
              hours < 1
                ? "text-red-600"
                : hours < 12
                ? "text-orange-600"
                : "text-blue-600";
          }
        } else if (status === "EXPIRED") {
          remainingInfo = "Expired";
          remainingColor = "text-red-600";
        } else if (status === "SUSPENDED") {
          remainingInfo = "Suspended";
          remainingColor = "text-red-600";
        } else if (status === "SETTLED") {
          remainingInfo = "Paid";
          remainingColor = "text-green-600";
        }

        return (
          <div className="text-xs">
            <div className=" text-gray-700">Given: {repaymentDays} days</div>
            <div className={`text-xs ${remainingColor}`}>{remainingInfo}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div>
          <p className="text-xs">{getStatusBadge(row.original.status)}</p>
        </div>
      ),
    },
    {
      accessorKey: "issuedDate",
      header: "Issued Date",
      cell: ({ row }) => (
        <div className="text-xs">
          <div className=" text-gray-800">
            {formatDate(row.original.issuedDate)}
          </div>
          <div className="text-xs text-gray-500">
            {formatTime(row.original.issuedDate)}
          </div>
        </div>
      ),
    },
    {
      id: "usedAt",
      header: "Used At/Repay Date",
      cell: ({ row }) => {
        const usedAt = (row.original as any).usedAt;
        const loan = (row.original as any).loan;
        if (!usedAt) {
          return <div className="text-sm text-gray-400">Not used</div>;
        }
        if (!loan?.repaymentDueDate) {
          return <div className="text-sm text-gray-400">N/A</div>;
        }
        return (
          <>
            <div className="flex items-center gap-2 text-xs">
              <div className=" text-gray-800">{formatDate(usedAt)}</div>
              <div className="text-xs text-gray-500">{formatTime(usedAt)}</div>
            </div>
            <div className="flex items-center gap-2 text-xs ">
              <div className=" text-green-600">
                {formatDate(loan.repaymentDueDate)}
              </div>
              <div className="text-xs text-green-500">
                {formatTime(loan.repaymentDueDate)}
              </div>
            </div>
          </>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const voucher = row.original;
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
                  onClick={() => {
                    setSelectedVoucher(voucher);
                    setIsModalOpen(true);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                {voucher.status === VoucherStatus.ACTIVE && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDeactivate(voucher.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Deactivate
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Filter by restaurant name..."
            value={restaurantFilter}
            onChange={(e) => setRestaurantFilter(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-300 focus:border-green-500 focus:ring-green-500 text-sm"
          />
        </div>
        <Button
          onClick={onCreateVoucher}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Voucher
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filteredVouchers}
        showColumnVisibility={true}
        showPagination={true}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        isLoading={paginationLoading}
      />
      <VoucherManagementModal
        voucher={selectedVoucher}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onUpdate={() => fetchVouchers(pagination.page, pagination.limit)}
        onEdit={handleEdit}
      />
    </div>
  );
}