/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { createVoucherColumns } from "./voucher-columns";
import { useVouchers } from "@/app/contexts/VoucherContext";

export default function AllVouchersList() {
  const { myVouchers, getMyVouchers, loading } = useVouchers();
  const [payingVoucherId, setPayingVoucherId] = useState<string | null>(null);

  useEffect(() => {
    getMyVouchers();
  }, [getMyVouchers]);

  const handlePayment = async (voucherId: string) => {
    setPayingVoucherId(voucherId);
    // Simulate payment process
    setTimeout(() => {
      setPayingVoucherId(null);
      // Refresh vouchers after payment
      getMyVouchers();
    }, 2000);
  };

  const columns = createVoucherColumns({
    onPayment: handlePayment,
    payingVoucherId,
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="animate-pulse h-16 bg-gray-100 rounded"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={myVouchers as any}
      title="Manage Vouchers"
      description={""}
      showPagination={true}
      showColumnVisibility={false}
      showRowSelection={false}
    />
  );
}
