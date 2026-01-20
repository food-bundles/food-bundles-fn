"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { loanColumns } from "./_components/loan-columns";
import { traderService, type LoanApplication } from "@/app/services/traderService";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoansPage() {
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = async () => {
    try {
      const response = await traderService.getLoans();
      setLoans(response.data);
    } catch (error) {
      console.error("Failed to fetch loans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <DataTable
        columns={loanColumns}
        data={loans}
        title="Loan Applications"
        showExport={true}
        showSearch={true}
        showColumnVisibility={true}
        showPagination={true}
        showRowSelection={false}
        showAddButton={false}
      />
    </div>
  );
}