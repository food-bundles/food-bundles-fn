/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Printer } from "lucide-react";
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
  <title>${order.originalData?.billingName || order.customerName}-Order Invoice-${order.originalData?.orderNumber || order.orderId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Arial', sans-serif; padding: 20px; font-size: 0.875rem; color: #1f2937; }
    .invoice { max-width: 700px; margin: 0 auto;  padding: 20px; }
    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #22c55e; padding-bottom: 15px; }
    .header h1 { color: #22c55e; font-size: 1.25rem; margin-bottom: 5px; font-weight: 600; }
    .header p { font-size: 0.875rem; color: #64748b; }
    .info-section { margin: 20px 0; font-size: 0.875rem; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
    .info-item { background: #f8fafc; padding: 10px; border-left: 3px solid #22c55e; }
    .info-label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
    .info-value { color: #1f2937; }
    .items { margin: 20px 0; font-size: 0.875rem; }
    .items table { width: 100%; border-collapse: collapse; }
    .items th, .items td { padding: 6px; border: 1px solid #e5e7eb; text-align: left; font-weight: normal; font-size: 0.875rem; }
    .items th { background: #22c55e; color: white; font-weight: 600; font-size: 0.875rem; }
    .total { background: #f0fdf4; text-align: right; padding: 12px; margin-top: 10px; border-radius: 5px; font-size: 0.875rem; color: #22c55e; }
    .total strong { font-size: 1rem; }
    .footer { text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid #e5e7eb; color: #64748b; font-size: 0.75rem; }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <img src="https://res.cloudinary.com/dzxyelclu/image/upload/v1760111270/Food_bundle_logo_cfsnsw.png" alt="Logo" style="width: 50px; height: 50px; margin: 0 auto 8px; border-radius: 50%;">
      <h1>Food Bundles Ltd</h1>
      <p>Order Invoice</p>
    </div>

<div class="info-section">
  <div class="info-flex-container" style="display: flex; flex-wrap: wrap; gap: 12px;">

    <!-- Row 1 -->
    <div class="info-item" style="flex: 1 1 calc(33.33% - 8px);">
      <div class="info-label">Order Number</div>
      <div class="info-value">${order.originalData?.orderNumber || order.orderId}</div>
    </div>

    <div class="info-item" style="flex: 1 1 calc(33.33% - 8px);">
      <div class="info-label">Order Date</div>
      <div class="info-value">${order.originalData?.createdAt ? new Date(order.originalData.createdAt).toLocaleDateString() : order.orderedDate}</div>
    </div>

    <div class="info-item" style="flex: 1 1 calc(33.33% - 8px);">
      <div class="info-label">Restaurant</div>
      <div class="info-value">${order.originalData?.restaurant?.name || "N/A"}</div>
    </div>

    <!-- Row 2 -->
    <div class="info-item" style="flex: 1 1 calc(33.33% - 8px);">
      <div class="info-label">Status</div>
      <div class="info-value">${order.originalData?.status || order.status}</div>
    </div>

    <div class="info-item" style="flex: 1 1 calc(33.33% - 8px);">
      <div class="info-label">Customer</div>
      <div class="info-value">${order.originalData?.billingName || order.customerName} - ${order.originalData?.billingPhone || "N/A"}</div>
    </div>

    <div class="info-item" style="flex: 1 1 calc(33.33% - 8px);">
      <div class="info-label">Delivery Address</div>
      <div class="info-value">${order.originalData?.billingAddress || order.deliveryAddress}</div>
    </div>

  </div>
</div>



    <div class="items">
      <h3 style="font-size: 0.875rem; margin-bottom: 8px;">Order Items</h3>
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
          `,
              )
              .join("") ||
            `<tr><td colspan="3">${order.items}</td><td>${order.totalAmount} RWF</td></tr>`
          }
        </tbody>
      </table>
    </div>

    <div class="total">
      <div style="margin-bottom: 6px; font-size: 0.875rem; color: #374151;">
        Subtotal: ${order.originalData?.originalAmount?.toLocaleString() || order.totalAmount} RWF
      </div>
      ${order.originalData?.deliveryFee > 0 ? `<div style="color: #374151; margin-bottom: 4px;">Delivery Fee: +${order.originalData.deliveryFee.toLocaleString()} RWF</div>` : ""}
      ${order.originalData?.packagingFee > 0 ? `<div style="color: #374151; margin-bottom: 4px;">Packaging Fee: +${order.originalData.packagingFee.toLocaleString()} RWF</div>` : ""}
      ${order.originalData?.originalAmount && order.originalData.totalAmount < order.originalData.originalAmount ? `<div style="color: #22c55e; margin-bottom: 4px;">Discount Applied: -${(order.originalData.originalAmount - order.originalData.totalAmount).toLocaleString()} RWF</div>` : ""}
      <strong>Total Amount: ${order.originalData?.totalAmount?.toLocaleString() || order.totalAmount} RWF</strong>
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
          <DialogTitle className="text-sm">Order Details - {order.originalData?.orderNumber || order.orderId}</DialogTitle>
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
                <h2 className="text-sm font-semibold text-gray-900 mb-4 sm:mb-6">
                  Order Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order Number</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {order.originalData?.orderNumber || order.orderId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order Date</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {order.originalData?.createdAt ? new Date(order.originalData.createdAt).toLocaleDateString() : order.orderedDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Customer Name</p>
                    <p className="font-semibold text-gray-900 text-sm ">
                      {order.originalData?.billingName || order.customerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                    <p className="font-semibold text-gray-900 text-sm ">
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
                    <p className="font-semibold text-gray-900 text-sm">
                      {order.originalData?.restaurant?.name || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-sm font-bold text-gray-900 mb-3 sm:mb-4">
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
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {item.productName}
                          </h4>
                          <p className="text-xs text-gray-500 mb-1">
                            Category: {item.category || "N/A"}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>Qty: {item.quantity} {item.unit}</span>
                            <span>Unit Price: {item.unitPrice?.toLocaleString()} RWF</span>
                          </div>
                        </div>
                        
                        {/* Subtotal */}
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 text-sm">
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
                      <div className="space-y-2">
                        {/* Subtotal */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Subtotal</span>
                          <span className="text-sm text-gray-900">
                            {order.originalData?.originalAmount?.toLocaleString() || order.originalData?.totalAmount?.toLocaleString() || order.totalAmount} RWF
                          </span>
                        </div>
                        
                        {order.originalData?.deliveryFee > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Delivery Fee</span>
                            <span className="text-sm text-gray-900">
                              +{order.originalData.deliveryFee.toLocaleString()} RWF
                            </span>
                          </div>
                        )}
                        
                        {order.originalData?.packagingFee > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Packaging Fee</span>
                            <span className="text-sm text-gray-900">
                              +{order.originalData.packagingFee.toLocaleString()} RWF
                            </span>
                          </div>
                        )}
                        
                        {/* Discount (if total is less than original) */}
                        {order.originalData?.originalAmount && order.originalData.totalAmount < order.originalData.originalAmount && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-green-600">Discount Applied</span>
                            <span className="text-sm text-green-600">
                              -{(order.originalData.originalAmount - order.originalData.totalAmount).toLocaleString()} RWF
                            </span>
                          </div>
                        )}
                        
                        {/* Final Total */}
                        <div className="flex justify-between items-center border-t pt-2">
                          <span className="text-sm font-semibold text-gray-900">
                            Total Amount
                          </span>
                          <span className="text-sm font-semibold text-green-600">
                            {order.originalData?.totalAmount?.toLocaleString() || order.totalAmount} RWF
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment & Delivery Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 sm:mb-8">
                <div className="flex items-start gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 mb-1 text-sm ">
                      Payment Method
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {order.originalData?.paymentMethod || order.paymentMethod}
                    </p>
                    {order.originalData?.voucherCode && (
                      <p className="text-xs text-blue-600 mt-1">
                        Voucher: {order.originalData.voucherCode}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 mb-1 text-sm">
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
                  className="flex items-center justify-center cursor-pointer gap-2 bg-transparent text-sm "
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