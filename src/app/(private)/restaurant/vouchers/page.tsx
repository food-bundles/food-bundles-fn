"use client";

import { useState } from "react";
import LoanApplicationForm from "./_components/LoanApplicationForm";
import LoanApplicationsList from "./_components/LoanApplicationsList";
import VouchersList from "./_components/VouchersList";

export default function VouchersPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLoanSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-100">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Voucher System</h1>
        <p className="text-gray-700 text-[14px]">Manage loans, vouchers, and credit payments</p>
      </div>
      <div className="grid grid-cols-3 gap-4 ">
      <LoanApplicationForm onSuccess={handleLoanSuccess} />
      <LoanApplicationsList key={refreshKey} />
      <VouchersList key={refreshKey} />
    </div>
    </div>
  );
}