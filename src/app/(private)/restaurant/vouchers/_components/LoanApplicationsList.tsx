/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, DollarSign, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useVoucherOperations} from "@/hooks/useVoucher";
import { ILoanApplication, LoanStatus } from "@/lib/types";

export default function LoanApplicationsList() {
  const { getLoanApplications, loading, error } = useVoucherOperations();
  const [applications, setApplications] = useState<ILoanApplication[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    const apps = await getLoanApplications();
    setApplications(apps);
    setHasLoaded(true);
  };

  const getStatusConfig = (status: LoanStatus) => {
    switch (status) {
      case LoanStatus.PENDING:
        return { bg: "bg-gradient-to-tr from-yellow-500 to-orange-500", icon: Clock, text: "Pending" };
      case LoanStatus.APPROVED:
        return { bg: "bg-gradient-to-tr from-green-500 to-lime-500", icon: CheckCircle, text: "Approved" };
      case LoanStatus.DISBURSED:
        return { bg: "bg-gradient-to-tr from-blue-500 to-indigo-500", icon: DollarSign, text: "Disbursed" };
      case LoanStatus.REJECTED:
        return { bg: "bg-gradient-to-tr from-red-500 to-rose-500", icon: XCircle, text: "Rejected" };
      case LoanStatus.SETTLED:
        return { bg: "bg-gradient-to-tr from-gray-500 to-gray-600", icon: CheckCircle, text: "Settled" };
      default:
        return { bg: "bg-gradient-to-tr from-gray-500 to-gray-600", icon: DollarSign, text: status };
    }
  };

  if (loading) return (
    <div className="mb-8 ">
      <h2 className="text-[16px] text-center font-medium mb-4">My Loan Application</h2>
      <div className="flex justify-center">
        <div className="w-[300px] h-[400px] flex flex-col p-6 border rounded relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Skeleton className=" h-6 w-20 rounded" />
          </div>
          <div className="text-center mt-4 space-y-3">
            <Skeleton className="h-6 w-24 mx-auto rounded" />
            <Skeleton className="h-8 w-32 mx-auto" />
            <Skeleton className="h-4 w-28 mx-auto" />
          </div>
          <div className="space-y-3 mt-6 flex-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24 mx-auto" />
            <Skeleton className="h-3 w-28 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="mb-8">
      <h2 className="text-[16px] text-center font-medium mb-4">My Loan Application</h2>
      {!loading && hasLoaded && applications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No loan applications yet</p>
          <p className="text-gray-500 text-sm">Apply for your first loan</p>
        </div>
      ) : (
        <div className="flex justify-center">
          {applications.slice(0, 1).map((application) => {
            const statusConfig = getStatusConfig(application.status);
            
            return (
              <Card
                key={application.id}
                className="w-[300px] h-[400px] flex flex-col p-6 border-green-400 hover:border-green-600 transition-colors relative rounded shadow-none"
              >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div
                    className={`px-2 rounded h-6 ${statusConfig.bg}  flex items-center justify-center`}
                  >
                    <p className="text-white text-[14px]">{statusConfig.text}</p>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <Badge className="bg-green-100 text-green-800 mb-2 rounded">
                    Loan Application
                  </Badge>
                  <div className="text-xl font-bold text-black">
                    {application.requestedAmount.toLocaleString()} RWF
                  </div>
                  {application.approvedAmount && (
                    <div className="text-green-600 text-sm">
                      Approved: {application.approvedAmount.toLocaleString()}{" "}
                      RWF
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-4 flex-1 mt-4">
                  {application.purpose && (
                    <div className="text-center">
                      <p className="text-gray-600 text-sm">
                        Reason: {application.purpose}
                      </p>
                    </div>
                  )}

                  {application.terms && (
                    <div className="text-center">
                      <p className="text-gray-500 text-xs">
                        Terms: {application.terms}
                      </p>
                    </div>
                  )}

                  {application.notes && (
                    <div className="text-center">
                      <p className="text-blue-600 text-xs">
                        Admin Notes: {application.notes}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 text-xs text-gray-500 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Applied:{" "}
                      {new Date(application.createdAt).toLocaleDateString()}
                    </div>
                    {application.approvedAt && (
                      <div className="flex items-center justify-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Approved:{" "}
                        {new Date(application.approvedAt).toLocaleDateString()}
                      </div>
                    )}
                    {application.disbursementDate && (
                      <div className="flex items-center justify-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Disbursed:{" "}
                        {new Date(
                          application.disbursementDate
                        ).toLocaleDateString()}
                      </div>
                    )}
                    {application.repaymentDueDate && (
                      <div className="flex items-center justify-center gap-1 text-orange-600">
                        <Calendar className="h-3 w-3" />
                        Due:{" "}
                        {new Date(
                          application.repaymentDueDate
                        ).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}