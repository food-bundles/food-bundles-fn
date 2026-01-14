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
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>(() => {
    const now = new Date();
    return {
      from: new Date(now.getFullYear(), 0, 1),
      to: new Date(now.getFullYear(), 11, 31)
    };
  });
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
      return;
    }

    setLoading(true);
    try {
      const response = await tableTronicService.getFBSalesReport({
        from: dateRange.from.toISOString().split('T')[0],
        to: dateRange.to.toISOString().split('T')[0],
        businessCode: businessCode.trim()
      });
      
      console.log('Raw response:', response);
      
      let items = [];
      if (typeof response === 'string') {
        const parsed = JSON.parse(response);
        items = parsed.items || [];
      } else if (response?.data) {
        if (typeof response.data === 'string') {
          const parsed = JSON.parse(response.data);
          items = parsed.items || [];
        } else {
          items = response.data.items || response.data || [];
        }
      } else if (response?.items) {
        items = response.items;
      }
      
      console.log('Parsed items:', items);
      setReportData(items);
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
    accessorKey: "category",
    header: "Category",
    size: 180,
    cell: ({ row }: any) => (
      <span className="whitespace-nowrap">{row.original.category}</span>
    ),
  },
  {
    accessorKey: "menu",
    header: "Menu Item",
    size: 260,
    cell: ({ row }: any) => (
      <span className="whitespace-nowrap">{row.original.menu}</span>
    ),
  },
  {
    accessorKey: "quantitySold",
    header: "Qty Sold",
    size: 100,
    cell: ({ row }: any) => (
      <span className="text-right block">{row.original.quantitySold}</span>
    ),
  },
  {
    accessorKey: "totalSales",
    header: "Total Sales",
    size: 140,
    cell: ({ row }: any) => (
      <span className="text-right block font-medium">
        {Number(row.original.totalSales).toLocaleString()} RWF
      </span>
    ),
  },
  {
    accessorKey: "avgSalePrice",
    header: "Avg Price",
    size: 140,
    cell: ({ row }: any) => (
      <span className="text-right block">
        {Number(row.original.avgSalePrice).toLocaleString()} RWF
      </span>
    ),
  },
  {
    accessorKey: "listprice",
    header: "List Price",
    size: 140,
    cell: ({ row }: any) => (
      <span className="text-right block">
        {Number(row.original.listprice).toLocaleString()} RWF
      </span>
    ),
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
        <h1 className="text-[18px] font-semibold text-gray-900 mb-2">
          FB Sales Reports
        </h1>
        <p className="text-gray-700 text-sm">
          Generate and view Food Bundle sales reports
        </p>
      </div>

       <Card className="mb-3 py-1 rounded inline-block max-w-max">
        <CardContent className="p-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-xs font-medium">Filters:</span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full">
              <Input
                placeholder="Business Code"
                value={businessCode}
                onChange={(e) => setBusinessCode(e.target.value)}
                className="h-7 text-xs w-full sm:w-32"
              />

              <div className="w-full sm:w-48">
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
              Please enter a business code and select date range to generate
              reports
            </p>
            <p className="text-gray-400 text-sm">
              Reports will be generated automatically as you type
            </p>
          </CardContent>
        </Card>
      )}

      {hasSearched && (
            <DataTable
              columns={columns}
              data={reportData}
              title="Report Results"
              description={``}
              showExport={true}
              showSearch={true}
              showColumnVisibility={true}
              showPagination={true}
              isLoading={loading}
            />
      )}
    </div>
  );
}