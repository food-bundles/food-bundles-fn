"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { Plus } from "lucide-react";
import { createPaymentMethodColumns } from "./_components/payment-method-columns";
import { PaymentMethodModal, PaymentMethodFormData } from "./_components/PaymentMethodModal";
import { DeleteConfirmDialog } from "./_components/DeleteConfirmDialog";
import { toast } from "sonner";
import { paymentMethodService } from "@/app/services/paymentMethodService";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchPaymentMethods = async (page = 1, limit = 10, isPagination = false) => {
    try {
      if (isPagination) {
        setPaginationLoading(true);
      } else {
        setIsLoading(true);
      }

      const response = await paymentMethodService.getAllPaymentMethods({ page, limit });
      setMethods(response.data || []);

      if (response.pagination) {
        setPagination({
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages,
        });
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast.error("Failed to fetch payment methods");
    } finally {
      setIsLoading(false);
      setPaginationLoading(false);
    }
  };

  const handlePaginationChange = (page: number, limit: number) => {
    fetchPaymentMethods(page, limit, true);
  };

  useEffect(() => {
    fetchPaymentMethods(1, 10);
  }, []);

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (methodId: string) => {
    setMethodToDelete(methodId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (methodToDelete) {
      try {
        await paymentMethodService.deletePaymentMethod(methodToDelete);
        toast.success("Payment method deleted successfully");
        await fetchPaymentMethods(pagination.page, pagination.limit);
      } catch (error) {
        toast.error("Failed to delete payment method");
      }
      setMethodToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleSubmit = async (data: PaymentMethodFormData) => {
    try {
      if (editingMethod) {
        await paymentMethodService.updatePaymentMethod(editingMethod.id, data);
        toast.success("Payment method updated successfully");
      } else {
        await paymentMethodService.createPaymentMethod(data);
        toast.success("Payment method created successfully");
      }
      await fetchPaymentMethods(pagination.page, pagination.limit);
      setEditingMethod(null);
    } catch (error) {
      toast.error(
        editingMethod ? "Failed to update payment method" : "Failed to create payment method"
      );
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingMethod(null);
  };

  const columns = createPaymentMethodColumns(handleEdit, handleDeleteClick);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[15px] font-medium">Payment Methods</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={methods}
        title=""
        description={``}
        showPagination={true}
        showColumnVisibility={false}
        showRowSelection={false}
        isLoading={paginationLoading}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
      />

      <PaymentMethodModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        method={editingMethod}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}