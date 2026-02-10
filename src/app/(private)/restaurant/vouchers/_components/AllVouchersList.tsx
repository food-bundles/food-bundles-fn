/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { createVoucherColumns } from "./voucher-columns";
import { useVouchers } from "@/app/contexts/VoucherContext";
import VoucherPaymentModal from "./VoucherPaymentModal";

export default function AllVouchersList() {
  const { myVouchers, getMyVouchers, loading } = useVouchers();
  const [payingVoucherId] = useState<string | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    getMyVouchers();
  }, [getMyVouchers]);

  const handlePayment = async (voucherId: string) => {
    const voucher = myVouchers.find((v: any) => v.id === voucherId);
    if (voucher && voucher.usedCredit > 0) {
      setSelectedVoucher(voucher);
      setPaymentModalOpen(true);
    }
  };

  const handlePaymentSuccess = () => {
    getMyVouchers();
  };

  const columns = createVoucherColumns({
    onPayment: handlePayment,
    payingVoucherId,
  });

  return (
    <>
      <DataTable
        columns={columns}
        data={myVouchers as any}
        title="Manage Vouchers"
        description={""}
        showPagination={true}
        showColumnVisibility={false}
        showRowSelection={false}
        isLoading={loading}
      />
      
      <VoucherPaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        voucher={selectedVoucher}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}
