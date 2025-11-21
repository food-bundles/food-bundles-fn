"use client";

import { useEffect } from "react";
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
import { Eye, Trash2, Edit, CreditCard, MoreHorizontal, Plus } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { useVouchers } from "@/app/contexts/VoucherContext";
import { IVoucher, VoucherStatus, VoucherType } from "@/lib/types";

interface VouchersTableProps {
  onCreateVoucher?: () => void;
}

export default function VouchersTable({ onCreateVoucher }: VouchersTableProps) {
  const { allVouchers, getAllVouchers } = useVouchers();

  useEffect(() => {
    getAllVouchers();
  }, [getAllVouchers]);

  const handleDeactivate = async (id: string) => {
    console.log("Deactivate voucher:", id);
  };

  const getStatusBadge = (status: VoucherStatus) => {
    switch (status) {
      case VoucherStatus.ACTIVE:
        return <Badge className="bg-green-500">Active</Badge>;
      case VoucherStatus.USED:
        return <Badge className="bg-blue-500">Used</Badge>;
      case VoucherStatus.EXPIRED:
        return <Badge className="bg-red-500">Expired</Badge>;
      case VoucherStatus.SUSPENDED:
        return <Badge className="bg-yellow-500">Suspended</Badge>;
      case VoucherStatus.SETTLED:
        return <Badge className="bg-gray-500">Settled</Badge>;
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
      accessorKey: "voucherCode",
      header: "Code",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-blue-600" />
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
      header: "Used/Remaining",
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="text-orange-600">Ud: {row.original.usedCredit.toLocaleString()} RWF</div>
          <div className="text-green-600">Rm: {row.original.remainingCredit.toLocaleString()} RWF</div>
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
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
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
      />
    </div>
  );
}