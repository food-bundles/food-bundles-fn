"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { voucherService } from "@/app/services/voucherService";
import { VoucherType } from "@/lib/types";

interface CreateVoucherFormProps {
  onSuccess: () => void;
}

export default function CreateVoucherForm({ onSuccess }: CreateVoucherFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    restaurantId: "",
    voucherType: "",
    creditLimit: "",
    minTransactionAmount: "",
    maxTransactionAmount: "",
    expiryDate: "",
    loanId: ""
  });

  const handleSubmit = async () => {
    if (!formData.restaurantId || !formData.voucherType || !formData.creditLimit) return;

    setLoading(true);
    try {
      await voucherService.createVoucher({
        restaurantId: formData.restaurantId,
        voucherType: formData.voucherType as VoucherType,
        creditLimit: parseFloat(formData.creditLimit),
        minTransactionAmount: formData.minTransactionAmount ? parseFloat(formData.minTransactionAmount) : undefined,
        maxTransactionAmount: formData.maxTransactionAmount ? parseFloat(formData.maxTransactionAmount) : undefined,
        expiryDate: formData.expiryDate || undefined,
        loanId: formData.loanId || undefined
      });

      setFormData({
        restaurantId: "",
        voucherType: "",
        creditLimit: "",
        minTransactionAmount: "",
        maxTransactionAmount: "",
        expiryDate: "",
        loanId: ""
      });
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to create voucher:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Voucher
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Voucher</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Restaurant ID *</label>
            <Input
              value={formData.restaurantId}
              onChange={(e) => setFormData(prev => ({ ...prev, restaurantId: e.target.value }))}
              placeholder="Enter restaurant ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Voucher Type *</label>
            <Select value={formData.voucherType} onValueChange={(value) => setFormData(prev => ({ ...prev, voucherType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select voucher type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={VoucherType.DISCOUNT_10}>10% Discount</SelectItem>
                <SelectItem value={VoucherType.DISCOUNT_20}>20% Discount</SelectItem>
                <SelectItem value={VoucherType.DISCOUNT_50}>50% Discount</SelectItem>
                <SelectItem value={VoucherType.DISCOUNT_80}>80% Discount</SelectItem>
                <SelectItem value={VoucherType.DISCOUNT_100}>100% Discount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Credit Limit (RWF) *</label>
            <Input
              type="number"
              value={formData.creditLimit}
              onChange={(e) => setFormData(prev => ({ ...prev, creditLimit: e.target.value }))}
              placeholder="Enter credit limit"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Min Transaction</label>
              <Input
                type="number"
                value={formData.minTransactionAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, minTransactionAmount: e.target.value }))}
                placeholder="Min amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Transaction</label>
              <Input
                type="number"
                value={formData.maxTransactionAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, maxTransactionAmount: e.target.value }))}
                placeholder="Max amount"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Expiry Date</label>
            <Input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Loan ID (Optional)</label>
            <Input
              value={formData.loanId}
              onChange={(e) => setFormData(prev => ({ ...prev, loanId: e.target.value }))}
              placeholder="Associated loan ID"
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={loading || !formData.restaurantId || !formData.voucherType || !formData.creditLimit}
            className="w-full"
          >
            {loading ? "Creating..." : "Create Voucher"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}