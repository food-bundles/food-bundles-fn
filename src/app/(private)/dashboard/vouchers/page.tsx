"use client";

import { useState, useRef } from "react";
import { VoucherProvider } from "@/app/contexts/VoucherContext";
import { RestaurantProvider } from "@/app/contexts/RestaurantContext";
import VoucherStats from "./_components/VoucherStats";
import LoanApplicationsTable from "./_components/LoanApplicationsTable";
import VouchersTable from "./_components/VouchersTable";
import CreateVoucherForm from "./_components/CreateVoucherForm";

type ActiveTab = "loans" | "vouchers";

export default function VoucherManagementPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("loans");
  const createVoucherRef = useRef<{ openModal: () => void }>(null);

  const handleCreateVoucher = () => {
    createVoucherRef.current?.openModal();
  };

  return (
    <VoucherProvider>
      <RestaurantProvider>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-8">
            <div>
              <h1 className="text-sm lg:text-[16px] font-medium text-gray-900 mb-2">
                Voucher Management 
              </h1>
              <p className="hidden lg:block text-gray-800 text-[13px]">
                Manage loan applications, vouchers, and credit systems
              </p>
            </div>
          </div>

          <VoucherStats />

          {/* Tabs */}
          <div className="border-b">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("loans")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "loans"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Loan Applications
              </button>
              <button
                onClick={() => setActiveTab("vouchers")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "vouchers"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                All Vouchers
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="space-y-6 mt-6">
            {activeTab === "loans" ? (
              <LoanApplicationsTable />
            ) : (
              <VouchersTable onCreateVoucher={handleCreateVoucher} />
            )}
          </div>
          
          {/* Hidden Create Voucher Form */}
          <CreateVoucherForm ref={createVoucherRef} onSuccess={() => {}} />
        </div>
      </RestaurantProvider>
    </VoucherProvider>
  );
}
