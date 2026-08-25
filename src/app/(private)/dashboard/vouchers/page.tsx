"use client";

import { useState, useRef } from "react";
import { VoucherProvider } from "@/app/contexts/VoucherContext";
import { RestaurantProvider } from "@/app/contexts/RestaurantContext";
import VoucherStats from "./_components/VoucherStats";
import LoanApplicationsTable from "./_components/LoanApplicationsTable";
import LoanSessionsAdminTable from "./_components/LoanSessionsAdminTable";
import VouchersTable from "./_components/VouchersTable";
import VoucherCardsTable from "./_components/VoucherCardsTable";
import CreateVoucherForm from "./_components/CreateVoucherForm";
import { ExportButton } from "@/components/ExportButton";

type ActiveTab = "cards" | "loan-sessions" | "loans" | "vouchers";

export default function VoucherManagementPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("cards");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const createVoucherRef = useRef<{ openModal: () => void }>(null);

  const tabs: { key: ActiveTab; label: string }[] = [
    { key: "cards", label: "Voucher Cards" },
    { key: "loan-sessions", label: "Loan Requests" },
    { key: "loans", label: "Old Loan Applications" },
    { key: "vouchers", label: "All Vouchers" },
  ];

  return (
    <VoucherProvider>
      <RestaurantProvider>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-sm font-medium text-gray-900 mb-2">
                Voucher Management
              </h1>
              <p className="hidden lg:block text-gray-800 text-xs">
                Issue voucher cards, approve loan requests, and manage credit
              </p>
            </div>
            <ExportButton module="loans" label="Export Loans" />
          </div>

          <VoucherStats />

          <div className="border-b border-gray-400">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-6 mt-6">
            {activeTab === "cards" && <VoucherCardsTable key={refreshTrigger} />}
            {activeTab === "loan-sessions" && <LoanSessionsAdminTable key={refreshTrigger} />}
            {activeTab === "loans" && <LoanApplicationsTable />}
            {activeTab === "vouchers" && (
              <VouchersTable
                onCreateVoucher={() => createVoucherRef.current?.openModal()}
                key={refreshTrigger}
              />
            )}
          </div>

          <CreateVoucherForm
            ref={createVoucherRef}
            onSuccess={() => setRefreshTrigger((p) => p + 1)}
          />
        </div>
      </RestaurantProvider>
    </VoucherProvider>
  );
}
