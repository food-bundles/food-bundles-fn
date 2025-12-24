/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CreditCard, Download, Printer } from "lucide-react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { OptimizedImage } from "@/components/OptimizedImage";

interface ViewOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
}

export function ViewOrderModal({ open, onOpenChange, order }: ViewOrderModalProps) {

  const handlePrint = () => {
    if (!order) return;

    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Please allow popups to print");
        return;
      }

     printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${
            order.originalData?.billingName || order.customerName
          }-Order Invoice-${
       order.originalData?.orderNumber || order.orderId
     }</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; }
            .invoice { max-width: 700px; margin: 0 auto; border: 2px solid #22c55e; border-radius: 8px; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #22c55e; padding-bottom: 15px; }
            .logo { width: 50px; height: 50px; margin: 0 auto 10px; background: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; }
            .header h1 { color: #22c55e; margin-bottom: 5px; }
            .info-section { margin: 20px 0; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
            .info-item { background: #f8fafc; padding: 10px; border-radius: 5px; border-left: 3px solid #22c55e; }
            .info-label { font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 3px; }
            .info-value { font-weight: 600; color: #1f2937; }
            .items { margin: 20px 0; }
            .items table { width: 100%; border-collapse: collapse; }
            .items th, .items td { padding: 8px; border: 1px solid #e5e7eb; text-align: left; }
            .items th { background: #22c55e; color: white; }
            .total { background: #f0fdf4; font-weight: bold; color: #22c55e; text-align: right; padding: 15px; margin-top: 10px; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="header">
              <img src="https://res.cloudinary.com/dzxyelclu/image/upload/v1760111270/Food_bundle_logo_cfsnsw.png" alt="Logo" style="width: 50px; height: 50px; margin: 0 auto 10px; border-radius: 50%;">
              <h1>Food Bundles Ltd</h1>
              <p>Order Invoice</p>
            </div>
            <div class="info-section">
              <h3>Order Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Order Number</div>
                  <div class="info-value">${
                    order.originalData?.orderNumber || order.orderId
                  }</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Order Date</div>
                  <div class="info-value">${
                    order.originalData?.createdAt
                      ? new Date(
                          order.originalData.createdAt
                        ).toLocaleDateString()
                      : order.orderedDate
                  }</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Restaurant</div>
                  <div class="info-value">${
                    order.originalData?.restaurant?.name || "N/A"
                  }</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Status</div>
                  <div class="info-value">${
                    order.originalData?.status || order.status
                  }</div>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">Customer</div>
                <div class="info-value">${
                  order.originalData?.billingName || order.customerName
                } - ${order.originalData?.billingPhone || "N/A"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Delivery Address</div>
                <div class="info-value">${
                  order.originalData?.billingAddress || order.deliveryAddress
                }</div>
              </div>
            </div>
            <div class="items">
              <h3>Order Items</h3>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    order.originalData?.orderItems
                      ?.map(
                        (item: any) => `
                    <tr>
                      <td>${item.productName}</td>
                      <td>${item.quantity} ${item.unit}</td>
                      <td>${item.unitPrice.toLocaleString()} RWF</td>
                      <td>${item.subtotal.toLocaleString()} RWF</td>
                    </tr>
                  `
                      )
                      .join("") ||
                    `
                    <tr>
                      <td colspan="3">${order.items}</td>
                      <td>${order.totalAmount} RWF</td>
                    </tr>
                  `
                  }
                </tbody>
              </table>
            </div>
            <div class="total">
              <strong>Total Amount: ${
                order.originalData?.totalAmount?.toLocaleString() ||
                order.totalAmount
              } RWF</strong>
            </div>
            <div class="footer">
              <p>Thank you for your order!</p>
              <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);

      toast.success("Print dialog opened");
    } catch (error) {
      console.error("Failed to print:", error);
      toast.error("Failed to print");
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-10xl  max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Order Details - {order.originalData?.orderNumber || order.orderId}</DialogTitle>
        </DialogHeader>
        
        <div className="px-6 pb-6">
          <Card className="bg-white border-none shadow-none">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              {/* Platform Logo Header */}
              <div className="flex justify-center mb-6 sm:mb-8">
                <div className="flex items-center gap-3">
                  <OptimizedImage
                    src="https://res.cloudinary.com/dzxyelclu/image/upload/v1760111270/Food_bundle_logo_cfsnsw.png"
                    alt=""
                    width={40}
                    height={40}
                    className="rounded-full object-cover w-10 h-10"
                  />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      FoodBundles
                    </h1>
                    <p className="text-sm text-gray-600">Order Receipt</p>
                  </div>
                </div>
              </div>

              {/* Order Information Header */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Order Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order Number</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      {order.originalData?.orderNumber || order.orderId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order Date</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      {order.originalData?.createdAt ? new Date(order.originalData.createdAt).toLocaleDateString() : order.orderedDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Customer Name</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      {order.originalData?.billingName || order.customerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      {order.originalData?.billingPhone || order.phoneNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.originalData?.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        order.originalData?.status === 'PREPARING' ? 'bg-yellow-100 text-yellow-800' :
                        order.originalData?.status === 'DELIVERED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.originalData?.status || order.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Restaurant</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      {order.originalData?.restaurant?.name || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
                  Order Items
                </h3>
                <div className="bg-white rounded-lg border border-green-100">
                  <div className="space-y-3 p-3 sm:p-4">
                    {order.originalData?.orderItems?.map((item: any, index: number) => (
                      <div key={item.id || index} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                        {/* Product Image */}
                        <div className="shrink-0">
                          <OptimizedImage
                            src={item.images?.[0] || "/placeholder-product.jpg"}
                            alt={item.productName}
                            width={60}
                            height={60}
                            className="rounded-lg object-cover w-15 h-15"
                          />
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                            {item.productName}
                          </h4>
                          <p className="text-xs text-gray-500 mb-1">
                            Category: {item.category || "N/A"}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Qty: {item.quantity} {item.unit}</span>
                            <span>Unit Price: {item.unitPrice?.toLocaleString()} RWF</span>
                          </div>
                        </div>
                        
                        {/* Subtotal */}
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">
                            {item.subtotal?.toLocaleString()} RWF
                          </p>
                        </div>
                      </div>
                    )) || (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-900 text-sm sm:text-base">
                          {order.items}
                        </span>
                        <span className="font-semibold text-gray-900 text-sm sm:text-base">
                          {order.totalAmount} Rwf
                        </span>
                      </div>
                    )}
                    
                    {/* Total Section */}
                    <div className="border-t border-gray-300 pt-3 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-base sm:text-lg font-bold text-gray-900">
                          Total Amount
                        </span>
                        <span className="text-base sm:text-lg font-bold text-green-600">
                          {order.originalData?.totalAmount?.toLocaleString() || order.totalAmount} RWF
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment & Delivery Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 sm:mb-8">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full shrink-0">
                    <CreditCard className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                      Payment Method
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {order.originalData?.paymentMethod || order.paymentMethod || "N/A"}
                    </p>
                    {order.originalData?.voucherCode && (
                      <p className="text-xs text-blue-600 mt-1">
                        Voucher: {order.originalData.voucherCode}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full shrink-0">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                      Delivery Info
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Requested: {order.originalData?.requestedDelivery ? new Date(order.originalData.requestedDelivery).toLocaleDateString() : "N/A"}
                    </p>
                    {order.originalData?.estimatedDelivery && (
                      <p className="text-xs text-orange-600 mt-1">
                        Estimated: {new Date(order.originalData.estimatedDelivery).toLocaleDateString()}
                      </p>
                    )}
                    {order.originalData?.actualDelivery && (
                      <p className="text-xs text-green-600 mt-1">
                        Delivered: {new Date(order.originalData.actualDelivery).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-3">
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  className="flex items-center justify-center cursor-pointer gap-2 bg-transparent text-sm"
                >
                  <Printer className="h-4 w-4" />
                  Print Receipt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}