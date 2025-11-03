"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, CreditCard, Download, Printer } from "lucide-react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useOrders } from "@/app/contexts/orderContext";
import { toast } from "sonner";

export default function ViewOrderPage() {
  const params = useParams();
  const { orders } = useOrders();
  const [order, setOrder] = useState<any>(null);


  useEffect(() => {
    if (orders && params.orderId) {
      const foundOrder = orders.find((o: any) => o.orderNumber === params.orderId);
      if (foundOrder) {
        setOrder({
          id: foundOrder.id,
          orderId: foundOrder.orderNumber,
          customerName: foundOrder.restaurant?.name || "Unknown Restaurant",
          orderedDate: new Date(foundOrder.createdAt).toLocaleDateString(),
          items: foundOrder.orderItems
            ?.map((item: any) => `${item.product?.productName} (${item.quantity})`)
            .join(", ") || "No items",
          totalAmount: foundOrder.totalAmount || 0,
          deliveryAddress: foundOrder.billingAddress || "No address provided",
          status: foundOrder.status,
          phoneNumber: foundOrder.billingPhone || "N/A",
          paymentMethod: foundOrder.paymentMethod || "N/A",
          estimatedDelivery: foundOrder.estimatedDelivery 
            ? new Date(foundOrder.estimatedDelivery).toLocaleString() 
            : "TBD",
        });
      }
    }
  }, [orders, params.orderId]);

  const handleDownload = () => {
    if (!order) return;
    
    try {
      const doc = new jsPDF();
      
      // Clean header area (no background color)
      // Removed green border for cleaner look
      
      // Add Food Bundle logo in circle with #00D048 color
      doc.setFillColor(0, 208, 72);
      doc.circle(105, 30, 12, 'F');
      
      try {
        // Add logo image centered in circle
        doc.addImage('https://res.cloudinary.com/dzxyelclu/image/upload/v1760111270/Food_bundle_logo_cfsnsw.png', 'PNG', 97, 22, 16, 16);
      } catch (error) {
        // Fallback to FB text if image fails to load
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('FB', 105, 35, { align: 'center' });
      }
      
      // Header text
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(16);
      doc.text('Food Bundle', 105, 50, { align: 'center' });
      
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(16);
      doc.text('Order Receipt', 105, 60, { align: 'center' });
      
      // Order Information Section
      let yPos = 80;
      doc.setTextColor(31, 41, 55);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Order Information', 20, yPos);
      
      // Add line under section title
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.5);
      doc.line(20, yPos + 2, 190, yPos + 2);
      
      yPos += 20;
      
      // Order info in boxes (simulated)
      const infoItems = [
        ['Order Number', `#${order.orderId}`, 'Order Date', order.orderedDate],
        ['Customer Name', order.customerName, 'Phone Number', order.phoneNumber]
      ];
      
      infoItems.forEach((row, index) => {
        // Left box
        doc.setFillColor(248, 250, 252);
        doc.rect(20, yPos, 80, 20, 'F');

        
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(16);
        doc.text(row[0].toUpperCase(), 22, yPos + 8);
        
        doc.setTextColor(31, 41, 55);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(row[1], 22, yPos + 16);
        
        // Right box
        doc.setFillColor(248, 250, 252);
        doc.rect(110, yPos, 80, 20, 'F');

        
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(16);
        doc.text(row[2].toUpperCase(), 112, yPos + 8);
        
        doc.setTextColor(31, 41, 55);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(row[3], 112, yPos + 16);
        
        yPos += 25;
      });
      
      yPos += 10;
      
      // Order Items Section
      doc.setTextColor(31, 41, 55);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Order Items', 20, yPos);
      
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.5);
      doc.line(20, yPos + 2, 190, yPos + 2);
      
      yPos += 20;
      
      // Items container
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(1);
      doc.rect(20, yPos, 170, 30, 'D');
      
      // Item details
      doc.setTextColor(31, 41, 55);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(16);
      doc.text(order.items, 25, yPos + 12);
      doc.text(`${order.totalAmount} Rwf`, 160, yPos + 12);
      
      // Total line
      doc.setDrawColor(209, 213, 219);
      doc.line(25, yPos + 18, 185, yPos + 18);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text('Total', 25, yPos + 26);
      doc.setTextColor(0, 208, 72);
      doc.setFontSize(16);
      doc.text(`${order.totalAmount} Rwf`, 160, yPos + 26);
      
      yPos += 45;
      
      // Payment Info (centered)
      doc.setTextColor(31, 41, 55);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Payment Method', 105, yPos, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(16);
      doc.text(order.paymentMethod, 105, yPos + 8, { align: 'center' });
      
      // Footer
      yPos += 30;
      doc.setDrawColor(229, 231, 235);
      doc.line(20, yPos, 190, yPos);
      
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(16);
      doc.text('Thank you for choosing Food Bundle!', 105, yPos + 12, { align: 'center' });
      doc.text(`Generated on ${new Date().toLocaleString()}`, 105, yPos + 22, { align: 'center' });
      
      doc.save(`order-${order.orderId}-receipt.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const handlePrint = () => {
    if (!order) return;
    
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to print');
        return;
      }
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Order Receipt - ${order.orderId}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; }
            .receipt { max-width: 600px; margin: 0 auto; border: 2px solid #22c55e; border-radius: 8px; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #22c55e; padding-bottom: 15px; }
            .logo { width: 50px; height: 50px; margin: 0 auto 10px; background: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; }
            .header h1 { color: #22c55e; margin-bottom: 5px; }
            .info-section { margin: 20px 0; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
            .info-item { background: #f8fafc; padding: 10px; border-radius: 5px; border-left: 3px solid #22c55e; }
            .info-label { font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 3px; }
            .info-value { font-weight: 600; color: #1f2937; }
            .items { margin: 20px 0; }
            .item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #e5e7eb; }
            .total { background: #f0fdf4; font-weight: bold; color: #22c55e; }
            .footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="logo">FB</div>
              <h1>Food Bundle</h1>
              <p>Order Receipt</p>
            </div>
            <div class="info-section">
              <h3>Order Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Order Number</div>
                  <div class="info-value">#${order.orderId}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Order Date</div>
                  <div class="info-value">${order.orderedDate}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Customer</div>
                  <div class="info-value">${order.customerName}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Status</div>
                  <div class="info-value">${order.status}</div>
                </div>
              </div>
            </div>
            <div class="items">
              <h3>Order Items</h3>
              <div class="item">
                <span>${order.items}</span>
                <span>${order.totalAmount} Rwf</span>
              </div>
              <div class="item total">
                <span>Total</span>
                <span>${order.totalAmount} Rwf</span>
              </div>
            </div>
            <div class="footer">
              <p>Thank you for choosing Food Bundle!</p>
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
      
      toast.success('Print dialog opened');
    } catch (error) {
      console.error('Failed to print:', error);
      toast.error('Failed to print');
    }
  };



  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative w-full max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/restaurant/orders">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
        </div>

        {/* Order Receipt */}
        <div className="w-full max-w-3xl mx-auto">
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              {/* Platform Logo Header */}
              <div className="flex justify-center mb-6 sm:mb-8">
                <div className="flex items-center gap-3">
                  <Image
                    src="/imgs/Food_bundle_logo.png"
                    alt=""
                    width={40}
                    height={40}
                    className="rounded-full object-cover w-10 h-10"
                  />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      Food Bundle
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
                      #{order.orderId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order Date</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      {order.orderedDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Customer Name</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      {order.customerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      {order.phoneNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
                  Order Items
                </h3>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-green-100">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-900 text-sm sm:text-base">
                        {order.items}
                      </span>
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">
                        {order.totalAmount} Rwf
                      </span>
                    </div>
                    <div className="border-t border-gray-300 pt-3 mt-3 sm:mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-base sm:text-lg font-bold text-gray-900">
                          Total
                        </span>
                        <span className="text-base sm:text-lg font-bold text-green-600">
                          {order.totalAmount} Rwf
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="flex items-center justify-center mb-6 sm:mb-8">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                    <CreditCard className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                      Payment Method
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">
                      {order.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-3">
                <Button 
                  onClick={handleDownload}
                  className="bg-green-500 hover:bg-green-600 cursor-pointer text-white flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="h-4 w-4" />
                  Download Receipt
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  className="flex items-center justify-center cursor-pointer gap-2 bg-transparent text-sm"
                >
                  <Printer className="h-4 w-4" />
                  Print Receipt
                </Button>
              </div>

              <div className="text-center mt-4 sm:mt-6">
                <Link
                  href="/restaurant/orders"
                  className="text-green-600 hover:text-green-700 transition-colors text-sm sm:text-base"
                >
                  ← Back to Orders
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}