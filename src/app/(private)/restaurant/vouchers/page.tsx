"use client";

import { useState } from "react";
import VoucherDashboard from "./_components/VoucherDashboard";
import LoanApplicationForm from "./_components/LoanApplicationForm";
import LoanApplicationsList from "./_components/LoanApplicationsList";
import VouchersList from "./_components/VouchersList";
import VoucherCheckout from "./_components/VoucherCheckout";

export default function VouchersPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLoanSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Voucher System</h1>
        <p className="text-gray-600">Manage loans, vouchers, and credit payments</p>
      </div>

      <VoucherDashboard key={refreshKey} />
      
      <LoanApplicationForm onSuccess={handleLoanSuccess} />
      
      <LoanApplicationsList key={refreshKey} />
      
      <VouchersList key={refreshKey} />
      
      <VoucherCheckout />
    </div>
  );
}