/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IVoucher } from "@/lib/types";

interface VoucherColumnsProps {
  onPayment: (voucherId: string) => void;
  payingVoucherId: string | null;
}

export const createVoucherColumns = ({
  onPayment,
  payingVoucherId,
}: VoucherColumnsProps): ColumnDef<IVoucher>[] => [
  {
    accessorKey: "voucherCode",
    header: "Voucher",
    cell: ({ row }) => {
      const voucher = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <div className="font-medium text-gray-900 text-sm truncate">
              {voucher.voucherCode}
            </div>
            <div className="text-xs text-gray-500">
              {voucher.voucherType.replace("DISCOUNT_", "")}% Discount
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "remainingCredit",
    header: "Credit",
    cell: ({ row }) => {
      const voucher = row.original;
      return (
        <div className="flex items-center gap-1.5">
          <div className="text-sm">
            <div className="font-semibold text-gray-900">
              {voucher.usedCredit.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">RWF</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "issuedDate",
    header: "Issued",
    cell: ({ row }) => {
      const voucher = row.original;
      const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      };
        const formatTime = (date: string | Date) => {
          return new Date(date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        };
      return (
        <div className="flex items-center gap-1.5">
          <div className="text-sm text-gray-600">
            {formatDate(voucher.issuedDate)}
            <p className="text-xs text-gray-500">
              {formatTime((voucher as any).issuedDate)}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "usedAt",
    header: "UsedAt",
    cell: ({ row }) => {
      const voucher = row.original;
      const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      };
      const formatTime = (date: string | Date) => {
        return new Date(date).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      };
      return (
        <div className="flex items-center gap-1.5">
          <div className="text-sm text-gray-600">
            {(voucher as any).usedAt ? (
              <>
                {formatDate((voucher as any).usedAt)}
                <p className="text-xs text-gray-500">{formatTime((voucher as any).usedAt)}</p>
              </>
            ) : "Not used"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "expiryDate",
    header: "Days",
    cell: ({ row }) => {
      const voucher = row.original;
      const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      };
      return (
        <div className="flex items-center gap-1.5">
          <div className="text-sm text-gray-600">
            {(voucher as any).loan?.voucherDays}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "expiryDate",
    header: "Expires",
    cell: ({ row }) => {
      const voucher = row.original;
      const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      };
      const formatTime = (date: string | Date) => {
        return new Date(date).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      };
      return (
        <div className="flex items-center gap-1.5">
          <div className="text-sm text-gray-600">
            {voucher.expiryDate ? (
              <>
                {formatDate(voucher.expiryDate)}
                <p className="text-xs text-gray-500">
                  {formatTime(voucher.expiryDate)}
                </p>
              </>
            ) : "Never"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const voucher = row.original;
      const getStatusColor = (status: string) => {
        const colors = {
          ACTIVE: "bg-green-100 text-green-700 border-green-200",
          USED: "bg-blue-100 text-blue-700 border-blue-200",
          EXPIRED: "bg-red-100 text-red-700 border-red-200",
          SUSPENDED: "bg-yellow-100 text-yellow-700 border-yellow-200",
          SETTLED: "bg-green-100 text-green-700 border-green-200",
        };
        return (
          colors[status as keyof typeof colors] ||
          "bg-gray-100 text-gray-700 border-gray-200"
        );
      };

      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(
            voucher.status
          )}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              voucher.status === "ACTIVE" ? "bg-green-500" : "bg-gray-400"
            }`}
          ></span>
          {voucher.status}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const voucher = row.original;
      const loan = (voucher as any).loan;

      // Check if payment is overdue based on voucherDays and usedAt date
      const isOverdue = () => {
        if (!loan || !(voucher as any).usedAt || !loan.voucherDays)
          return false;

        const usedDate = new Date((voucher as any).usedAt);
        const currentDate = new Date();
        const daysDifference = Math.floor(
          (currentDate.getTime() - usedDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        return daysDifference > loan.voucherDays;
      };

      const needsPayment =
        voucher.usedCredit > 0 && voucher.status !== "SETTLED";
      const paymentOverdue = isOverdue();

      return (
        <div className="flex items-center justify-start gap-2">
          {needsPayment && (
            <button
              onClick={() => onPayment(voucher.id)}
              disabled={payingVoucherId === voucher.id}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                payingVoucherId === voucher.id
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : paymentOverdue
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {payingVoucherId === voucher.id ? "Processing..." : "Pay"}
            </button>
          )}
        </div>
      );
    },
  },
];