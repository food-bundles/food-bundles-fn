"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, DollarSign, Calendar } from "lucide-react";
import { useVoucherOperations, useVoucherUtils } from "@/hooks/useVoucher";
import { ILoanApplication, LoanStatus } from "@/lib/types";

export default function LoanApplicationsList() {
  const { getLoanApplications, loading, error } = useVoucherOperations();
  const { formatLoanStatus } = useVoucherUtils();
  const [applications, setApplications] = useState<ILoanApplication[]>([]);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    const apps = await getLoanApplications();
    setApplications(apps);
  };

  const getStatusBadge = (status: LoanStatus) => {
    switch (status) {
      case LoanStatus.PENDING:
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case LoanStatus.APPROVED:
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case LoanStatus.DISBURSED:
        return (
          <Badge className="bg-blue-500 text-white">
            <DollarSign className="h-3 w-3 mr-1" />
            Disbursed
          </Badge>
        );
      case LoanStatus.REJECTED:
        return (
          <Badge className="bg-red-500 text-white">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case LoanStatus.SETTLED:
        return (
          <Badge className="bg-gray-500 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Settled
          </Badge>
        );
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>;
    }
  };

  if (loading) return <div className="p-6">Loading applications...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Loan Applications History</CardTitle>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No loan applications yet</p>
            <p className="text-gray-500 text-sm">Apply for your first loan above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {application.requestedAmount.toLocaleString()} RWF
                    </h3>
                    {application.approvedAmount && (
                      <p className="text-sm text-green-600">
                        Approved: {application.approvedAmount.toLocaleString()} RWF
                      </p>
                    )}
                  </div>
                  {getStatusBadge(application.status)}
                </div>

                {application.purpose && (
                  <p className="text-gray-600 text-sm mb-2">{application.purpose}</p>
                )}

                {application.terms && (
                  <p className="text-gray-500 text-xs mb-2">Terms: {application.terms}</p>
                )}

                {application.notes && (
                  <p className="text-blue-600 text-xs mb-2">Admin Notes: {application.notes}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Applied: {new Date(application.createdAt).toLocaleDateString()}
                  </span>
                  {application.approvedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Approved: {new Date(application.approvedAt).toLocaleDateString()}
                    </span>
                  )}
                  {application.disbursementDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Disbursed: {new Date(application.disbursementDate).toLocaleDateString()}
                    </span>
                  )}
                  {application.repaymentDueDate && (
                    <span className="flex items-center gap-1 text-orange-600">
                      <Calendar className="h-3 w-3" />
                      Due: {new Date(application.repaymentDueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}