"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Loader2, Mail, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { orderService, type PaymentLinkResponse } from "@/app/services/orderService";

type LinkData = PaymentLinkResponse["data"];

const apiMessage = (error: unknown) =>
  isAxiosError<{ message?: string }>(error) ? error.response?.data?.message : undefined;

const PAID = ["COMPLETED", "VOUCHER_CREDIT"];

/**
 * An order's payment link: email it to the customer, or copy it. Whoever opens
 * it pays the order with Mobile Money. The same link is kept until it expires
 * or you make a new one, so a link already sent keeps working.
 */
export default function PaymentLinkModal({
  open,
  onOpenChange,
  orderId,
  orderNumber,
  paymentStatus,
  onResendPaymentRequest,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
  orderNumber?: string;
  paymentStatus?: string;
  /** Admin: ask the payment provider again on the order's billing phone (failed payments) */
  onResendPaymentRequest?: () => Promise<void> | void;
}) {
  const [link, setLink] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");
  const [emailing, setEmailing] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const isPaid = !!paymentStatus && PAID.includes(paymentStatus);
  const url = link && typeof window !== "undefined" ? `${window.location.origin}/pay/${link.token}` : "";

  const load = useCallback(
    async (regenerate = false) => {
      if (!orderId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await orderService.generatePaymentLink(orderId, { regenerate });
        setLink(res.data);
        setEmail((current) => current || res.data.customerEmail || "");
        if (regenerate) toast.success("New link made. The previous link no longer works.");
      } catch (e) {
        setError(apiMessage(e) || "Couldn't make the payment link");
      } finally {
        setLoading(false);
      }
    },
    [orderId],
  );

  // The link is ready when the dialog opens
  useEffect(() => {
    if (open && orderId && !isPaid) load();
    if (!open) {
      setLink(null);
      setError(null);
      setCopied(false);
      setEmail("");
      setSentTo(null);
    }
  }, [open, orderId, isPaid, load]);

  const amount = link ? `${link.totalAmount.toLocaleString()} ${link.currency}` : "";

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Older browsers: select the text so it can be copied by hand
      (document.getElementById("payment-link-url") as HTMLInputElement | null)?.select();
      document.execCommand?.("copy");
    }
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const sendEmail = async () => {
    if (!orderId) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Enter a valid email address");
      return;
    }
    setEmailing(true);
    try {
      const res = await orderService.emailPaymentLink(orderId, email.trim());
      setSentTo(res.data.sentTo);
      toast.success(res.message);
    } catch (e) {
      toast.error(apiMessage(e) || "The email couldn't be sent");
    } finally {
      setEmailing(false);
    }
  };

  const resend = async () => {
    if (!onResendPaymentRequest) return;
    setResending(true);
    try {
      await onResendPaymentRequest();
    } finally {
      setResending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Payment link{orderNumber ? ` — ${orderNumber}` : ""}</DialogTitle>
          <DialogDescription>
            Email this link to the customer. They open it and pay with Mobile Money.
          </DialogDescription>
        </DialogHeader>

        {isPaid ? (
          <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            This order is already paid: no payment link is needed.
          </p>
        ) : loading && !link ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Making the link…
          </div>
        ) : error ? (
          <div className="space-y-3">
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
            <Button variant="outline" onClick={() => load()} className="w-full">
              Try again
            </Button>
          </div>
        ) : link ? (
          <div className="space-y-3">
            <div className="rounded-lg bg-gray-50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-semibold">{amount}</span>
              </div>
              {paymentStatus && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment</span>
                  <span>{paymentStatus.toLowerCase().replace(/_/g, " ")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Link works until</span>
                <span>{new Date(link.expiresAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Input id="payment-link-url" value={url} readOnly className="text-xs" onFocus={(e) => e.target.select()} />
              <Button variant="outline" onClick={copy} aria-label="Copy payment link" className="shrink-0">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="ml-1.5">{copied ? "Copied" : "Copy"}</span>
              </Button>
            </div>

            <div className="space-y-2 rounded-lg border border-gray-200 p-3">
              <label htmlFor="payment-link-email" className="block text-sm font-medium text-gray-800">
                Send by email
              </label>
              <div className="flex gap-2">
                <Input
                  id="payment-link-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSentTo(null);
                  }}
                  placeholder="customer@example.com"
                  className="text-sm"
                />
                <Button onClick={sendEmail} disabled={emailing || !email.trim()} className="shrink-0 bg-[#007A35] text-white hover:bg-[#0F5C36]">
                  {emailing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                  Send
                </Button>
              </div>
              {sentTo && <p className="text-xs text-green-700">Sent to {sentTo}</p>}
            </div>

            <Button variant="outline" onClick={() => load(true)} disabled={loading} title="The old link stops working" className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              New link
            </Button>

            {onResendPaymentRequest && paymentStatus === "FAILED" && (
              <Button variant="ghost" onClick={resend} disabled={resending} className="w-full text-sm">
                {resending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Send the payment request again to the billing phone
              </Button>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
