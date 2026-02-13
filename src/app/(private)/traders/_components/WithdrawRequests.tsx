"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { traderService, type WithdrawalRequest } from "@/app/services/traderService";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/reusableFunctions";
import { ArrowDownRight, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function WithdrawRequests() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const fetchRequests = async (page = 1) => {
    setLoading(true);
    try {
      const response = await traderService.getMyWithdrawRequests({ page, limit: pagination.limit });
      setRequests(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Failed to fetch withdrawal requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "text-green-600 bg-green-50";
      case "PENDING": return "text-yellow-600 bg-yellow-50";
      case "FAILED": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const handleCancel = async (withdrawId: string) => {
    setCancellingId(withdrawId);
    try {
      const response = await traderService.cancelWithdrawal(withdrawId);
      toast.success(response.message || "Withdrawal request cancelled");
      fetchRequests(pagination.page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel withdrawal");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <Card className="h-96">
        <CardHeader className="py-3">
          <CardTitle>Withdrawal Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-96">
      <CardHeader className="py-3">
        <CardTitle>Withdrawal Requests</CardTitle>
      </CardHeader>
      <CardContent className="h-full flex flex-col pt-0">
        <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: '280px' }}>
        {requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-orange-100">
                    <ArrowDownRight className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{Math.abs(req.amount).toLocaleString()} RWF</p>
                    <p className="text-xs text-gray-500">{req.withdrawType} • {req.paymentMethod}</p>
                    <p className="text-xs text-gray-500">{req.accountNumber} - {req.accountName}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(req.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(req.status)}`}>
                    {req.status}
                  </span>
                  {req.status === "PENDING" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(req.id)}
                      disabled={cancellingId === req.id}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {cancellingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No withdrawal requests yet</p>
          </div>
        )}
        </div>
        
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchRequests(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
            >
              Previous
            </Button>
            <span className="text-sm">{pagination.page} of {pagination.totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchRequests(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
