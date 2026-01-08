/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { tableTronicService } from "@/app/services/tableTronicService";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { TableFilters, createCommonFilters } from "@/components/filters";

export default function FBReportsPage() {
  const [businessCode, setBusinessCode] = useState("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const generateReport = async () => {
    if (!businessCode.trim()) {
      setReportData([]);
      setHasSearched(false);
      return;
    }
    if (!dateRange.from || !dateRange.to) {
      setReportData([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    try {
      const response = await tableTronicService.getFBSalesReport({
        from: dateRange.from.toISOString().split('T')[0],
        to: dateRange.to.toISOString().split('T')[0],
        businessCode: businessCode.trim()
      });
      
      setReportData(response.data || []);
      setHasSearched(true);
      toast.success("Report generated successfully");
    } catch (error: any) {
      console.error("Report generation error:", error);
      toast.error(error.message || "Failed to generate report");
      setReportData([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate report when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateReport();
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [businessCode, dateRange]);

  const columns = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "amount",
      header: "Amount",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
  ];

  const filters = [
    createCommonFilters.dateRange(
      dateRange,
      setDateRange,
      "Date Range"
    )
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[16px] font-semibold text-gray-900 mb-2">
          FB Sales Reports
        </h1>
        <p className="text-gray-600 text-sm">
          Generate and view Food Bundle sales reports
        </p>
      </div>

      <Card className="mb-3 py-1 w-1/2 rounded">
        <CardContent className="p-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-xs font-medium">Filters:</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Input
                placeholder="Business Code"
                value={businessCode}
                onChange={(e) => setBusinessCode(e.target.value)}
                className="h-7 text-xs w-32"
              />
              <div className="w-48">
                <TableFilters filters={filters} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!hasSearched && !businessCode.trim() && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 text-sm mb-4">
              Please enter a business code and select date range to generate reports
            </p>
            <p className="text-gray-400 text-sm">
              Reports will be generated automatically as you type
            </p>
          </CardContent>
        </Card>
      )}

      {hasSearched && (
        <Card>
          <CardContent className="p-6">
            <DataTable
              columns={columns}
              data={reportData}
              title="Report Results"
              description={`Total: ${reportData.length} records`}
              showExport={true}
              showSearch={true}
              showColumnVisibility={true}
              showPagination={true}
              isLoading={loading}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}