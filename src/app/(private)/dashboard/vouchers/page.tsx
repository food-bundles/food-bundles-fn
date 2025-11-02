"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoucherProvider } from "@/app/contexts/VoucherContext";
import { RestaurantProvider } from "@/app/contexts/RestaurantContext";
import VoucherStats from "./_components/VoucherStats";
import LoanApplicationsTable from "./_components/LoanApplicationsTable";
import VouchersTable from "./_components/VouchersTable";
import CreateVoucherForm from "./_components/CreateVoucherForm";

export default function VoucherManagementPage() {
  return (
    <VoucherProvider>
      <RestaurantProvider>
        <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Voucher Management</h1>
              <p className="text-gray-600">Manage loan applications, vouchers, and credit systems</p>
            </div>
            <CreateVoucherForm onSuccess={() => {}} />
          </div>
        </div>

        <VoucherStats />

        <Tabs defaultValue="loans" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="loans">Loan Applications</TabsTrigger>
            <TabsTrigger value="vouchers">All Vouchers</TabsTrigger>
          </TabsList>

          <TabsContent value="loans" className="space-y-6">
            <LoanApplicationsTable />
          </TabsContent>

          <TabsContent value="vouchers" className="space-y-6">
            <VouchersTable />
          </TabsContent>
        </Tabs>
        </div>
      </RestaurantProvider>
    </VoucherProvider>
  );
}