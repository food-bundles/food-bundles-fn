/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { X, ShoppingCart, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { orderService } from "@/app/services/orderService";
import { toast } from "react-toastify";

interface ReorderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export function ReorderDrawer({ isOpen, onClose, order }: ReorderDrawerProps) {
  const [isReordering, setIsReordering] = useState(false);
  const [showFlutterwaveInfo, setShowFlutterwaveInfo] = useState(false);
  const [flutterwaveRedirectUrl, setFlutterwaveRedirectUrl] = useState("");

  const handleReorder = async () => {
    try {
      setIsReordering(true);

      const response = await orderService.reorderOrder(order.id);

      if (response.success) {
        const responseData = response.data as any;
        const requiresRedirect = responseData?.requiresRedirect;
        const redirectUrl = responseData?.redirectUrl;
        const paymentProvider = responseData?.paymentProvider;

        if (requiresRedirect && redirectUrl && paymentProvider === "FLUTTERWAVE") {
          // Flutterwave requires redirect - show modal
          setFlutterwaveRedirectUrl(redirectUrl);
          setShowFlutterwaveInfo(true);
        } else if (paymentProvider === "PAYPACK") {
          // Paypack sends USSD to phone
          toast.success("USSD code sent to your phone. Please complete the payment.");
          onClose();
        } else {
          toast.success("Reorder completed successfully!");
          onClose();
        }
      } else {
        toast.error( "========= Reorder failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Reorder error:", error);
      toast.error("-------------Failed to reorder");
    } finally {
      setIsReordering(false);
    }
  };

  const handleFlutterwaveRedirect = () => {
    if (flutterwaveRedirectUrl) {
      window.location.href = flutterwaveRedirectUrl;
    }
  };

  if (!order) return null;

  const orderItems = order.originalData?.orderItems || [];
  const totalAmount = order.originalData?.totalAmount || order.totalAmount;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full bg-white text-gray-900 z-50 transform transition-all duration-300 ease-in-out overflow-y-auto shadow-2xl border-l border-gray-200 scrollbar-hide
          w-[90vw] sm:w-[400px] md:w-[500px]
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-green-700 border-b border-gray-200 flex justify-between items-center px-6 py-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-white" />
            <span className="text-[15px] text-white font-bold">
              Reorder Items
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors hover:rotate-90 transform duration-200"
          >
            <X className="w-5 h-5 text-white cursor-pointer" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-gray-100 space-y-6">
          {/* Order Info */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Order Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{order.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Original Date:</span>
                <span className="font-medium">{order.orderedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">{order.customerName}</span>
              </div>
            </div>
          </div>

          {/* Items to Reorder */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Items to Reorder
            </h3>
            <div className="space-y-3">
              {orderItems.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.productName}</p>
                    <p className="text-xs text-gray-600">
                      {item.quantity} {item.unit} × {item.unitPrice.toLocaleString()} RWF
                    </p>
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    {item.subtotal.toLocaleString()} RWF
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Payment Method
            </h3>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">Mobile Money (MoMo)</p>
              <p className="text-xs text-blue-600 mt-1">
                Payment will be processed via USSD
              </p>
            </div>
          </div>

          {/* Total */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
              <span className="text-lg font-bold text-green-600">
                {totalAmount.toLocaleString()} RWF
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 hover:bg-gray-50"
              disabled={isReordering}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReorder}
              disabled={isReordering}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isReordering && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isReordering ? "Processing..." : "Confirm Reorder"}
            </Button>
          </div>
        </div>
      </div>

      {/* Flutterwave Redirect Modal */}
      {showFlutterwaveInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-md w-full max-w-md flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-[16px] font-medium text-gray-900 flex items-center gap-2">
                Complete Payment
              </h3>
              <button
                onClick={() => setShowFlutterwaveInfo(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-700">
                You will be redirected to complete your payment. Choose your
                preferred payment method:
              </p>
              <div className="bg-gray-50 p-4 rounded-md">
                <ul className="text-[13px] text-gray-900 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                    Mobile Money (MTN/TIGO)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                    Card Payment
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowFlutterwaveInfo(false)}
                  className="flex-1 h-10 border border-gray-300 hover:border-gray-400 text-gray-900 text-[14px] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFlutterwaveRedirect}
                  className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-white text-[14px] font-medium cursor-pointer flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}