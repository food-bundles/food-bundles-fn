/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { traderService } from "@/app/services/traderService";
import { Calendar, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface DelegationHistory {
  id: string;
  walletId: string;
  startedAt: string;
  endedAt: string | null;
  approvedBy: string;
  createdAt: string;
}

export function DelegationHistory() {
  const [history, setHistory] = useState<DelegationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchHistory();
  }, [pagination.page]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const response = await traderService.getMyDelegationHistory({
        page: pagination.page,
        limit: pagination.limit,
      });
      setHistory(response.data);
      if (response.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages,
        }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch delegation history");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (start: string, end: string | null) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h`;
    }
    return `${diffHours}h`;
  };

  const columns: ColumnDef<DelegationHistory>[] = useMemo(
    () => [
      {
        accessorKey: "startedAt",
        header: "Started",
        cell: ({ row }) => (
          <span className="text-xs">{formatDate(row.original.startedAt)}</span>
        ),
      },
      {
        accessorKey: "endedAt",
        header: "Ended",
        cell: ({ row }) => (
          <span className="text-xs">
            {row.original.endedAt ? (
              formatDate(row.original.endedAt)
            ) : (
              <span className="text-green-600 font-medium">Active</span>
            )}
          </span>
        ),
      },
      {
        id: "duration",
        header: "Duration",
        cell: ({ row }) => (
          <span className="text-xs">
            {calculateDuration(row.original.startedAt, row.original.endedAt)}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) =>
          row.original.endedAt ? (
            <div className="flex items-center gap-1 text-gray-600">
              <XCircle className="h-4 w-4" />
              <span className="text-xs">Ended</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs">Active</span>
            </div>
          ),
      },
    ],
    []
  );

  return (
     <div className="px-6 space-y-2">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Delegation History</h2>
          <p className="text-sm text-gray-600 mt-1">
            View all periods when Food Bundles had control of your wallet
          </p>
        </div>

        {!isLoading && history.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No delegation history found</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={history}
            showSearch={false}
            showExport={false}
            showColumnVisibility={false}
            showPagination={true}
            showRowSelection={false}
            showAddButton={false}
            pagination={pagination}
            isLoading={isLoading}
            onPaginationChange={(page, limit) => {
              setPagination((prev) => ({ ...prev, page, limit }));
            }}
            onPageSizeChange={(newPageSize) => {
              setPagination((prev) => ({
                ...prev,
                limit: newPageSize,
                page: 1,
              }));
            }}
          />
        )}
      </div>
    </div>
  );
}
