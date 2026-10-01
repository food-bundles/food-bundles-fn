"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { orderService } from "@/app/services/orderService";

interface PaymentLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
  orderNumber?: string;
}

export default function PaymentLinkModal({
  open,
  onOpenChange,
  orderId,
  orderNumber,
}: PaymentLinkModalProps) {
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateLink = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const response = await orderService.generatePaymentLink(orderId);
      const url = `${window.location.origin}/pay/${response.data.token}`;
      setLink(url);
    } catch (error) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(message || "Failed to generate payment link");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!link) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Pay this order",
          text: `Pay for order ${orderNumber || ""} on FoodBundles`,
          url: link,
        });
      } catch {
        // user cancelled the share sheet — no action needed
      }
    } else {
      handleCopy();
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setLink(null);
      setCopied(false);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Payment Link</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Generate a link anyone can open to pay for order{" "}
            <strong>{orderNumber}</strong> on your behalf. The link expires in
            7 days or once paid.
          </p>

          {!link ? (
            <Button
              onClick={generateLink}
              disabled={loading || !orderId}
              className="w-full"
              variant="green"
            >
              {loading ? "Generating..." : "Generate Link"}
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input value={link} readOnly className="text-xs" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  aria-label="Copy payment link"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                onClick={handleShare}
                variant="outline"
                className="w-full"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
