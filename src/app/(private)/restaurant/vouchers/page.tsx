"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Ticket, CreditCard, Clock, CheckCircle } from "lucide-react";

const voucherRequests = [
  {
    id: "1",
    amount: 50000,
    status: "pending",
    requestDate: "2024-01-15",
    reason: "Stock purchase for weekend rush",
  },
  {
    id: "2", 
    amount: 25000,
    status: "approved",
    requestDate: "2024-01-10",
    reason: "Emergency ingredient purchase",
  },
];

export default function VouchersPage() {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmitRequest = () => {
    console.log("Voucher request:", { amount, reason });
    setShowRequestForm(false);
    setAmount("");
    setReason("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 text-white"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">Unknown</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Voucher System</h1>
        <p className="text-gray-600">Request vouchers for ordering on loan</p>
      </div>

      {/* Credit Limit Card */}
      <Card className="mb-8 bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Available Credit Limit</h3>
                <p className="text-blue-700 text-sm">Based on your restaurant performance</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">150,000 RWF</div>
              <div className="text-sm text-blue-500">Used: 75,000 RWF</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request New Voucher */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Request New Voucher
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showRequestForm ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Need to order ingredients on credit?</p>
              <Button 
                onClick={() => setShowRequestForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                Request Voucher
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (RWF)
                </label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Request
                </label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why you need this voucher..."
                  className="w-full"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleSubmitRequest}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Submit Request
                </Button>
                <Button 
                  onClick={() => setShowRequestForm(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Voucher History */}
      <Card>
        <CardHeader>
          <CardTitle>Voucher History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {voucherRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-lg">
                    {request.amount.toLocaleString()} RWF
                  </div>
                  {getStatusBadge(request.status)}
                </div>
                <p className="text-gray-600 text-sm mb-2">{request.reason}</p>
                <p className="text-gray-500 text-xs">
                  Requested on {new Date(request.requestDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}