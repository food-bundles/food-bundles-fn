"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Loader2, MessageCircle, RefreshCw, Send, Share2 } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { orderService, type PaymentLinkResponse } from "@/app/services/orderService";

type LinkData = PaymentLinkResponse["data"];

const apiMessage = (error: unknown) =>
  isAxiosError<{ message?: string }>(error) ? error.response?.data?.message : undefined;

/** Rwandan number for wa.me (2507XXXXXXXX), or null */
const whatsappNumber = (phone?: string | null) => {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (/^07\d{8}$/.test(digits)) return `25${digits}`;
  if (/^2507\d{8}$/.test(digits)) return digits;
  if (/^7\d{8}$/.test(digits)) return `250${digits}`;
  return null;
};

const PAID = ["COMPLETED", "VOUCHER_CREDIT"];

/**
 * An order's payment link: copy it, or send it on WhatsApp. Whoever opens it
 * pays the order on their phone (MoMo, card…). The same link is kept until it
 * expires or you make a new one, so a link already sent keeps working.
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
    }
  }, [open, orderId, isPaid, load]);

  const amount = link ? `${link.totalAmount.toLocaleString()} ${link.currency}` : "";
  const message = link
    ? `Hello${link.customerName ? ` ${link.customerName}` : ""}, please pay ${amount} for your Food Bundles order ${link.orderNumber}. Tap to pay: ${url}`
    : "";

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
    toast.success("Link copied. Paste it in WhatsApp or SMS.");
    setTimeout(() => setCopied(false), 2000);
  };

  const sendWhatsApp = () => {
    if (!link) return;
    const to = whatsappNumber(link.customerPhone);
    const wa = `https://wa.me/${to ?? ""}?text=${encodeURIComponent(message)}`;
    window.open(wa, "_blank", "noopener,noreferrer");
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Pay order ${link?.orderNumber ?? ""}`, text: message, url });
      } catch {
        // share sheet closed
      }
    } else copy();
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
            Send this link on WhatsApp or SMS. Whoever opens it pays the order on their phone.
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

            <Button onClick={sendWhatsApp} className="w-full bg-[#25D366] text-white hover:bg-[#1EBE5A]">
              <MessageCircle className="mr-2 h-4 w-4" />
              Send on WhatsApp{whatsappNumber(link.customerPhone) ? ` to ${link.customerPhone}` : ""}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={share}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" onClick={() => load(true)} disabled={loading} title="The old link stops working">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                New link
              </Button>
            </div>

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
