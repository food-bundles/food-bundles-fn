"use client";

import { useEffect, useMemo, useState } from "react";
import { DollarSign, Clock3, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/data-table";
import { TableFilters, createCommonFilters, type FilterConfig } from "@/components/filters";
import { submissionService } from "@/app/services/submissionServices";
import type { FarmerSubmission } from "@/app/contexts/submission-context";
import { salesColumns } from "./_components/sales-columns";
import { formatRwf } from "@/lib/currency";

type SalesTab = "all" | "paid" | "unpaid";

const isPaid = (submission: FarmerSubmission) =>
  submission.status === "PAID" || submission.paidAt !== null;

/**
 * Farmer-facing page for tracking submission sales: which submissions have
 * been paid out, which are still pending payment, and overall status.
 * Reuses the same `/submissions/my-submissions` data the admin submissions
 * table is built on, scoped to the authenticated farmer.
 */
export default function FarmerSalesPage() {
  const [submissions, setSubmissions] = useState<FarmerSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SalesTab>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    let isMounted = true;

    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await submissionService.getMySubmissions();
        if (isMounted) {
          setSubmissions(response?.data ?? []);
        }
      } catch (err) {
        console.error("Failed to fetch sales:", err);
        if (isMounted) {
          setError("Failed to load your sales. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSubmissions();
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const paid = submissions.filter(isPaid);
    const unpaid = submissions.filter((s) => !isPaid(s));
    const totalPaid = paid.reduce((sum, s) => sum + (s.totalAmount ?? 0), 0);
    const pendingPayout = unpaid.reduce((sum, s) => {
      if (s.acceptedPrice && s.acceptedQty) {
        return sum + s.acceptedPrice * s.acceptedQty;
      }
      return sum;
    }, 0);

    return {
      paidCount: paid.length,
      unpaidCount: unpaid.length,
      totalPaid,
      pendingPayout,
    };
  }, [submissions]);

  const statusOptions = [
    { label: "All", value: "All" },
    { label: "PENDING", value: "PENDING" },
    { label: "VERIFIED", value: "VERIFIED" },
    { label: "APPROVED", value: "APPROVED" },
    { label: "REJECTED", value: "REJECTED" },
    { label: "PAID", value: "PAID" },
  ];

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "paid" && isPaid(submission)) ||
        (activeTab === "unpaid" && !isPaid(submission));

      const matchesStatus =
        statusFilter === "All" || submission.status === statusFilter;

      const matchesSearch =
        !searchTerm ||
        submission.productName.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesTab && matchesStatus && matchesSearch;
    });
  }, [submissions, activeTab, statusFilter, searchTerm]);

  const filters: FilterConfig[] = [
    createCommonFilters.search(searchTerm, setSearchTerm, "Search by product name..."),
    createCommonFilters.status(statusFilter, setStatusFilter, statusOptions),
  ];

  const summaryTiles = [
    {
      title: "Total Paid",
      value: formatRwf(stats.totalPaid),
      subtitle: `${stats.paidCount} paid submission${stats.paidCount === 1 ? "" : "s"}`,
      icon: DollarSign,
    },
    {
      title: "Pending Payout",
      value: formatRwf(stats.pendingPayout),
      subtitle: `${stats.unpaidCount} awaiting payment`,
      icon: Clock3,
    },
    {
      title: "Total Submissions",
      value: submissions.length.toString(),
      subtitle: "All-time",
      icon: Wallet,
    },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 md:py-6 lg:py-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-[16px] font-bold text-gray-900 mb-6">My Sales</h1>

        {/* Summary tiles */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {summaryTiles.map((tile) => (
              <Card key={tile.title} className="border border-gray-200 shadow-sm">
                <CardContent className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{tile.title}</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{tile.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{tile.subtitle}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                    <tile.icon className="w-5 h-5 text-green-700" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Paid / Non-paid tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SalesTab)} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All ({submissions.length})</TabsTrigger>
            <TabsTrigger value="paid">Paid ({stats.paidCount})</TabsTrigger>
            <TabsTrigger value="unpaid">Non-paid ({stats.unpaidCount})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <div className="mb-6">
          <TableFilters filters={filters} className="flex-col sm:flex-row items-stretch sm:items-center" />
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <>
            <DataTable
              columns={salesColumns}
              data={filteredSubmissions}
              title=""
              showExport={false}
              showSearch={false}
              showColumnVisibility
              showPagination
              showRowSelection={false}
            />

            {filteredSubmissions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  {submissions.length === 0
                    ? "You have no submissions yet. Submit a product to see your sales here."
                    : "No sales match your current filters."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
