"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, XCircle, DollarSign, Eye, Calendar } from "lucide-react";
import { voucherService } from "@/app/services/voucherService";
import { ILoanApplication, LoanStatus, VoucherType } from "@/lib/types";

export default function LoanApplicationsTable() {
  const [applications, setApplications] = useState<ILoanApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ILoanApplication | null>(null);
  const [approvalData, setApprovalData] = useState({
    approvedAmount: "",
    repaymentDays: "30",
    voucherType: "",
    notes: ""
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await voucherService.getAllLoanApplications();
      setApplications(response.data || []);
    } catch (error) {
      console.error("Failed to load applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApp || !approvalData.approvedAmount || !approvalData.voucherType) return;

    try {
      await voucherService.approveLoan(selectedApp.id, {
        approvedAmount: parseFloat(approvalData.approvedAmount),
        repaymentDays: parseInt(approvalData.repaymentDays),
        voucherType: approvalData.voucherType,
        notes: approvalData.notes
      });
      setSelectedApp(null);
      setApprovalData({ approvedAmount: "", repaymentDays: "30", voucherType: "", notes: "" });
      loadApplications();
    } catch (error) {
      console.error("Failed to approve loan:", error);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await voucherService.rejectLoan(id, reason);
      loadApplications();
    } catch (error) {
      console.error("Failed to reject loan:", error);
    }
  };

  const handleDisburse = async (id: string) => {
    try {
      await voucherService.disburseLoan(id);
      loadApplications();
    } catch (error) {
      console.error("Failed to disburse loan:", error);
    }
  };

  const getStatusBadge = (status: LoanStatus) => {
    switch (status) {
      case LoanStatus.PENDING:
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case LoanStatus.APPROVED:
        return <Badge className="bg-green-500">Approved</Badge>;
      case LoanStatus.DISBURSED:
        return <Badge className="bg-blue-500">Disbursed</Badge>;
      case LoanStatus.REJECTED:
        return <Badge className="bg-red-500">Rejected</Badge>;
      case LoanStatus.SETTLED:
        return <Badge className="bg-gray-500">Settled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Restaurant</th>
                <th className="text-left p-3">Amount</th>
                <th className="text-left p-3">Purpose</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{app.restaurantId}</td>
                  <td className="p-3">{app.requestedAmount.toLocaleString()} RWF</td>
                  <td className="p-3">{app.purpose || "N/A"}</td>
                  <td className="p-3">{getStatusBadge(app.status)}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {app.status === LoanStatus.PENDING && (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  setSelectedApp(app);
                                  setApprovalData(prev => ({ 
                                    ...prev, 
                                    approvedAmount: app.requestedAmount.toString() 
                                  }));
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Approve Loan Application</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">Approved Amount (RWF)</label>
                                  <Input
                                    type="number"
                                    value={approvalData.approvedAmount}
                                    onChange={(e) => setApprovalData(prev => ({ ...prev, approvedAmount: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">Voucher Type</label>
                                  <Select value={approvalData.voucherType} onValueChange={(value) => setApprovalData(prev => ({ ...prev, voucherType: value }))}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select voucher type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value={VoucherType.DISCOUNT_10}>10% Discount</SelectItem>
                                      <SelectItem value={VoucherType.DISCOUNT_20}>20% Discount</SelectItem>
                                      <SelectItem value={VoucherType.DISCOUNT_50}>50% Discount</SelectItem>
                                      <SelectItem value={VoucherType.DISCOUNT_80}>80% Discount</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">Repayment Days</label>
                                  <Input
                                    type="number"
                                    value={approvalData.repaymentDays}
                                    onChange={(e) => setApprovalData(prev => ({ ...prev, repaymentDays: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">Notes</label>
                                  <Textarea
                                    value={approvalData.notes}
                                    onChange={(e) => setApprovalData(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Add any notes..."
                                  />
                                </div>
                                <Button onClick={handleApprove} className="w-full">
                                  Approve Loan
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleReject(app.id, "Rejected by admin")}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {app.status === LoanStatus.APPROVED && (
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleDisburse(app.id)}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Disburse
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}