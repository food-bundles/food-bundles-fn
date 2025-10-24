"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Ticket } from "lucide-react";
import { useVoucherOperations } from "@/hooks/useVoucher";

interface LoanApplicationFormProps {
  onSuccess: () => void;
}

export default function LoanApplicationForm({ onSuccess }: LoanApplicationFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    requestedAmount: "",
    purpose: "",
    terms: ""
  });
  const { applyForLoan, loading, error } = useVoucherOperations();

  const handleSubmit = async () => {
    if (!formData.requestedAmount) return;

    const result = await applyForLoan({
      requestedAmount: parseFloat(formData.requestedAmount),
      purpose: formData.purpose,
      terms: formData.terms
    });

    if (result) {
      setShowForm(false);
      setFormData({ requestedAmount: "", purpose: "", terms: "" });
      onSuccess();
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Apply for Loan
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!showForm ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Need credit to purchase ingredients?</p>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Apply for Loan
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requested Amount (RWF) *
              </label>
              <Input
                type="number"
                value={formData.requestedAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, requestedAmount: e.target.value }))}
                placeholder="Enter amount"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose
              </label>
              <Textarea
                value={formData.purpose}
                onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                placeholder="What will you use this loan for?"
                className="w-full"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Terms
              </label>
              <Textarea
                value={formData.terms}
                onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                placeholder="Any specific repayment preferences?"
                className="w-full"
                rows={2}
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            <div className="flex gap-3">
              <Button 
                onClick={handleSubmit}
                disabled={loading || !formData.requestedAmount}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
              <Button 
                onClick={() => setShowForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}