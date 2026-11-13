"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ebmService } from "@/app/services/ebmService";
import { Receipt, RefreshCw, RotateCcw } from "lucide-react";

const PAYMENT_METHODS = ["CASH", "CREDIT", "MOBILE_MONEY", "CARD", "BANK_TRANSFER", "VOUCHER"];

interface EbmSalesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderNumber: string;
  paymentMethod?: string | null;
}

export function EbmSalesModal({ open, onOpenChange, orderId, orderNumber, paymentMethod }: EbmSalesModalProps) {
  const invoiceNo = parseInt(orderNumber.replace(/\D/g, ""), 10) || 0;

  const [payMethod, setPayMethod] = useState(paymentMethod ?? "CASH");
  const [resendInvoice, setResendInvoice] = useState(String(invoiceNo));
  const [refundInvoice, setRefundInvoice] = useState(String(invoiceNo + 1));
  const [originalInvoice, setOriginalInvoice] = useState(String(invoiceNo));
  const [refundReason, setRefundReason] = useState("REFUND");
  const [refundPayMethod, setRefundPayMethod] = useState(paymentMethod ?? "CASH");
  const [isLoading, setIsLoading] = useState(false);

  const run = async (action: () => Promise<any>, successMsg: string) => {
    try {
      setIsLoading(true);
      await action();
      toast.success(successMsg);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "EBM request failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-2 border-green-500">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <Receipt className="h-4 w-4 text-green-600" />
            EBM Sales — Order {orderNumber}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="create">
          <TabsList className="w-full">
            <TabsTrigger value="create" className="flex-1 text-xs">Create Sale</TabsTrigger>
            <TabsTrigger value="resend" className="flex-1 text-xs">Resend</TabsTrigger>
            <TabsTrigger value="refund" className="flex-1 text-xs">Refund</TabsTrigger>
          </TabsList>

          {/* CREATE */}
          <TabsContent value="create" className="space-y-4 pt-3">
            <p className="text-xs text-gray-500">
              Submits this order to EBM as a sale. Only works for paid or delivered orders with EBM-registered products.
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Payment Method</Label>
              <Select value={payMethod} onValueChange={setPayMethod}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button size="sm" disabled={isLoading} className="bg-green-600 hover:bg-green-700 w-full"
                onClick={() => run(() => ebmService.createSale(orderId, payMethod), "EBM sale created successfully")}>
                {isLoading ? "Submitting..." : "Submit to EBM"}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* RESEND */}
          <TabsContent value="resend" className="space-y-4 pt-3">
            <p className="text-xs text-gray-500">Resend a previously submitted sale by invoice number.</p>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Invoice No</Label>
              <Input className="text-xs" value={resendInvoice} onChange={e => setResendInvoice(e.target.value)} />
            </div>
            <DialogFooter>
              <Button size="sm" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 w-full"
                onClick={() => run(() => ebmService.resendSale(Number(resendInvoice)), "EBM sale resent successfully")}>
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                {isLoading ? "Resending..." : "Resend Sale"}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* REFUND */}
          <TabsContent value="refund" className="space-y-4 pt-3">
            <p className="text-xs text-gray-500">Issue a refund for a previously submitted sale.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Refund Invoice No</Label>
                <Input className="text-xs" value={refundInvoice} onChange={e => setRefundInvoice(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Original Invoice No</Label>
                <Input className="text-xs" value={originalInvoice} onChange={e => setOriginalInvoice(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Refund Reason</Label>
                <Input className="text-xs" value={refundReason} onChange={e => setRefundReason(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Payment Method</Label>
                <Select value={refundPayMethod} onValueChange={setRefundPayMethod}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button size="sm" disabled={isLoading} className="bg-orange-600 hover:bg-orange-700 w-full"
                onClick={() => run(() => ebmService.refundSale({
                  orderId,
                  invoice_no: Number(refundInvoice),
                  original_invoice_no: Number(originalInvoice),
                  refund_reason: refundReason,
                  payment_method: refundPayMethod,
                }), "EBM refund submitted successfully")}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                {isLoading ? "Submitting..." : "Submit Refund"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
