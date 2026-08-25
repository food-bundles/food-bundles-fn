"use client";

import { useState } from "react";
import VoucherCardDisplay from "./_components/VoucherCardDisplay";
import LoanRequestForm from "./_components/LoanRequestForm";
import LoanSessionCard from "./_components/LoanSessionCard";
import LoanSessionsTable from "./_components/LoanSessionsTable";

export default function VouchersPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const handleSuccess = () => setRefreshKey((prev) => prev + 1);

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900 mb-1">My Voucher</h1>
        <p className="text-gray-500 text-sm">
          Your permanent voucher card number, financing sessions, and repayment history
        </p>
      </div>

      <div className="space-y-6">
        {/* Top row: Card identity | Finance form | Active session */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* 1 — Permanent voucher card (PAN identity) */}
          <VoucherCardDisplay key={`card-${refreshKey}`} />

          {/* 2 — Finance on voucher (request a loan) */}
          <LoanRequestForm onSuccess={handleSuccess} />

          {/* 3 — Current active financing session */}
          <LoanSessionCard key={`session-${refreshKey}`} />
        </div>

        {/* Full history table */}
        <LoanSessionsTable key={`table-${refreshKey}`} />
      </div>
    </div>
  );
}
