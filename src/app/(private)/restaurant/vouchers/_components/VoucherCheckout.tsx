"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, CreditCard, Calculator } from "lucide-react";
import { useVoucherOperations, useVoucherUtils } from "@/hooks/useVoucher";
import { IVoucher } from "@/lib/types";

export default function VoucherCheckout() {
  const [orderAmount, setOrderAmount] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState<IVoucher | null>(null);
  const [availableVouchers, setAvailableVouchers] = useState<IVoucher[]>([]);
  const [showVouchers, setShowVouchers] = useState(false);
  
  const { getAvailableVouchers, processVoucherPayment, loading, error } = useVoucherOperations();
  const { calculateDiscount, calculateFinalAmount, isVoucherEligible, formatVoucherType } = useVoucherUtils();

  const handleCheckVouchers = async () => {
    if (!orderAmount) return;
    
    const vouchers = await getAvailableVouchers(parseFloat(orderAmount));
    setAvailableVouchers(vouchers);
    setShowVouchers(true);
  };

  const handleSelectVoucher = (voucher: IVoucher) => {
    setSelectedVoucher(voucher);
  };

  const handleProcessPayment = async () => {
    if (!selectedVoucher || !orderAmount) return;

    try {
      const result = await processVoucherPayment({
        voucherId: selectedVoucher.id,
        orderId: `ORDER_${Date.now()}`, // Generate order ID
        originalAmount: parseFloat(orderAmount)
      });

      if (result) {
        alert("Payment processed successfully!");
        setOrderAmount("");
        setSelectedVoucher(null);
        setShowVouchers(false);
        setAvailableVouchers([]);
      }
    } catch (err) {
      console.error("Payment failed:", err);
    }
  };

  const discount = selectedVoucher ? calculateDiscount(parseFloat(orderAmount || "0"), selectedVoucher.voucherType) : 0;
  const finalAmount = selectedVoucher ? calculateFinalAmount(parseFloat(orderAmount || "0"), selectedVoucher.voucherType) : parseFloat(orderAmount || "0");

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Voucher Checkout
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Amount (RWF)
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={orderAmount}
                onChange={(e) => setOrderAmount(e.target.value)}
                placeholder="Enter order amount"
                className="flex-1"
              />
              <Button 
                onClick={handleCheckVouchers}
                disabled={!orderAmount || loading}
                variant="outline"
              >
                Check Vouchers
              </Button>
            </div>
          </div>

          {showVouchers && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-3">Available Vouchers</h4>
              {availableVouchers.length === 0 ? (
                <p className="text-gray-600 text-sm">No vouchers available for this amount</p>
              ) : (
                <div className="space-y-2">
                  {availableVouchers.map((voucher) => {
                    const eligible = isVoucherEligible(voucher, parseFloat(orderAmount));
                    const voucherDiscount = calculateDiscount(parseFloat(orderAmount), voucher.voucherType);
                    
                    return (
                      <div 
                        key={voucher.id}
                        className={`border rounded p-3 cursor-pointer transition-colors ${
                          selectedVoucher?.id === voucher.id 
                            ? "border-blue-500 bg-blue-50" 
                            : eligible 
                              ? "border-gray-200 hover:border-gray-300" 
                              : "border-red-200 bg-red-50 opacity-60"
                        }`}
                        onClick={() => eligible && handleSelectVoucher(voucher)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{voucher.voucherCode}</p>
                            <p className="text-sm text-gray-600">{formatVoucherType(voucher.voucherType)}</p>
                            <p className="text-xs text-gray-500">
                              Available: {voucher.remainingCredit.toLocaleString()} RWF
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              -{voucherDiscount.toLocaleString()} RWF
                            </p>
                            {!eligible && (
                              <Badge className="bg-red-500 text-white text-xs">
                                Not Eligible
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {selectedVoucher && (
            <div className="border rounded-lg p-4 bg-green-50 border-green-200">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Payment Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Original Amount:</span>
                  <span>{parseFloat(orderAmount).toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount ({formatVoucherType(selectedVoucher.voucherType)}):</span>
                  <span>-{discount.toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Final Amount:</span>
                  <span>{finalAmount.toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Service Fee (10%):</span>
                  <span>{(finalAmount * 0.1).toLocaleString()} RWF</span>
                </div>
              </div>
              
              <Button 
                onClick={handleProcessPayment}
                disabled={loading}
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {loading ? "Processing..." : "Process Payment"}
              </Button>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}