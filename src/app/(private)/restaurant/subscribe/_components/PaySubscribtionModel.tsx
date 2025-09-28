"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PaymentMethod = "wallet" | "momo" | "card";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  plan: string;
  price: string;
}

export default function PaymentModal({
  open,
  onClose,
  plan,
  price,
}: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>("momo");

  const renderForm = () => {
    switch (method) {
      case "wallet":
        return (
          <div className="space-y-3">
            <p className="text-gray-900 text-[13px] text-center">
              Pay using your wallet balance.
            </p>
            <Button className="w-full bg-green-600 text-white hover:bg-green-700 rounded-none text-[13px] font-normal">
              Pay {price}
            </Button>
          </div>
        );
      case "momo":
        return (
          <div className="space-y-3">
            <Input placeholder="Enter MoMo Phone Number" type="tel" className="text-[13px] text-gray-900 rounded"/>
            <Button className="w-full bg-green-600 text-white hover:bg-green-700 rounded-none text-[13px] font-normal">
              Pay {price}
            </Button>
          </div>
        );
      case "card":
        return (
          <div className="space-y-3">
            <Input placeholder="Card Number" type="text" className="text-[13px] text-gray-900 rounded"/>
            <Input placeholder="Expiry Date (MM/YY)" type="text" className="text-[13px] text-gray-900 rounded" />
            <Input placeholder="CVV" type="password" className="text-[13px] text-gray-900 rounded"/>
            <Button className="w-full bg-green-600 text-white hover:bg-green-700 rounded-none text-[13px] font-normal">
              Pay {price}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-none">
        <DialogHeader>
          <DialogTitle className="text-[14px] font-normal">
            Pay for {plan}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <Button
            variant={method === "wallet" ? "default" : "outline"}
            onClick={() => setMethod("wallet")}
            className="rounded flex-1 sm:flex-initial h-7 text-[13px] font-normal"
          >
            Wallet
          </Button>
          <Button
            variant={method === "momo" ? "default" : "outline"}
            onClick={() => setMethod("momo")}
            className="rounded flex-1 sm:flex-initial h-7 text-[13px] font-normal"
          >
            MoMo
          </Button>
          <Button
            variant={method === "card" ? "default" : "outline"}
            onClick={() => setMethod("card")}
            className="rounded flex-1 sm:flex-initial h-7 text-[13px] font-normal"
          >
            Card
          </Button>
        </div>

        {renderForm()}
      </DialogContent>
    </Dialog>
  );
}
