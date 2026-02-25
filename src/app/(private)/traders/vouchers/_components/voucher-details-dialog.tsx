"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Voucher } from "@/app/services/traderService";
import { formatDateTime } from "@/lib/reusableFunctions";

interface VoucherDetailsDialogProps {
  voucher: Voucher | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VoucherDetailsDialog({ voucher, open, onOpenChange }: VoucherDetailsDialogProps) {
  if (!voucher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Voucher Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Voucher Code</p>
            <p className="text-sm font-bold text-blue-600">{voucher.voucherCode}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Approved Amount</p>
            <p className="text-sm">{voucher.creditLimit.toLocaleString()} {voucher.currency}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Used Amount</p>
            <p className="text-sm font-bold text-green-600">{voucher.usedCredit}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Restaurant</p>
            <p className="text-sm">{voucher.restaurant.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Repayment Days</p>
            <p className="text-sm">{voucher.repaymentDays} days</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Repayment Date</p>
            <p className="text-sm">{voucher.loan.repaymentDueDate ? formatDateTime(voucher.loan.repaymentDueDate) : "N/A"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Commission</p>
            <p className="text-sm">{voucher.commission.toLocaleString()} {voucher.currency}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Date Created</p>
            <p className="text-sm">{formatDateTime(voucher.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Date Matured</p>
            <p className="text-sm">{voucher.loan.repaymentDueDate ? formatDateTime(voucher.loan.repaymentDueDate) : "N/A"}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
