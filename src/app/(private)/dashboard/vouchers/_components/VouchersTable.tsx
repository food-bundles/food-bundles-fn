/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
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
import { Eye, Trash2,  MoreHorizontal, Plus } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { useVouchers } from "@/app/contexts/VoucherContext";
import { IVoucher, VoucherStatus, VoucherType } from "@/lib/types";
import { VoucherManagementModal } from "./VoucherManagementModal";
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
        return <Badge className="bg-green-500">Active</Badge>;
      case VoucherStatus.USED:
        return <Badge className="bg-yellow-500">Used</Badge>;
      case VoucherStatus.EXPIRED:
        return <Badge className="bg-red-300">Expired</Badge>;
      case VoucherStatus.MATURED:
        return <Badge className="bg-red-500">Matured</Badge>;
      case VoucherStatus.SUSPENDED:
        return <Badge className="bg-red-300">Suspended</Badge>;
      case VoucherStatus.SETTLED:
        return <Badge className="bg-orange-400">Settled</Badge>;
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
      accessorKey: "No",
      header: "No",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{row.index + 1}</span>
        </div>
      )
    },
    {
      accessorKey: "voucherCode",
      header: "Code",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{row.original.voucherCode}</span>
        </div>
      )
    },
    {
      accessorKey: "voucherType",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline">{getVoucherTypeLabel(row.original.voucherType)}</Badge>
      )
    },
    {
      accessorKey: "creditLimit",
      header: "Credit Limit",
      cell: ({ row }) => `${row.original.creditLimit.toLocaleString()} RWF`
    },
    {
      id: "usage",
      header: "Used Credit",
      cell: ({ row }) => (
        <div className="text-sm">
          <div ><span className="font-medium text-green-600">{row.original.usedCredit.toLocaleString()}</span> RWF</div>
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original.status)
    },
    {
      accessorKey: "issuedDate",
      header: "Issued",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-gray-800">
          {new Date(row.original.issuedDate).toLocaleDateString()}
        </div>
      )
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
      }
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-800">All Vouchers</h2>
        <div className="flex items-center gap-2">
          <Button 
            onClick={onCreateVoucher}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Voucher
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={allVouchers}
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