"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Users, UserCheck, UserX } from "lucide-react";
import { createCustomerTypeColumns } from "./_components/customer-type-columns";
import { CustomerTypeModal } from "./_components/CustomerTypeModal";
import { toast } from "sonner";
import {
  customerTypeService,
  CustomerTypeFormData,
  CustomerType,
} from "@/app/services/customerTypeService";

export default function CustomerTypesPage() {
  const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<CustomerType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<CustomerType | null>(null);

  const stats = useMemo(() => {
    const total = customerTypes.length;
    const active = customerTypes.filter((ct) => ct.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [customerTypes]);

  const fetchCustomerTypes = async () => {
    try {
      setIsLoading(true);
      const response = await customerTypeService.getAllCustomerTypes();
      setCustomerTypes(response.data || []);
    } catch (error) {
      console.error("Error fetching customer types:", error);
      toast.error("Failed to fetch customer types");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerTypes();
  }, []);

  const handleEdit = (customerType: CustomerType) => {
    setEditingType(customerType);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    const type = customerTypes.find((ct) => ct.id === id);
    if (type) {
      setTypeToDelete(type);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!typeToDelete) return;
    try {
      await customerTypeService.deleteCustomerType(typeToDelete.id);
      toast.success("Customer type deleted successfully");
      await fetchCustomerTypes();
    } catch (error) {
      toast.error("Failed to delete customer type");
    } finally {
      setTypeToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const response = await customerTypeService.toggleCustomerTypeStatus(id);
      toast.success(response.message);
      await fetchCustomerTypes();
    } catch (error) {
      toast.error("Failed to toggle customer type status");
    }
  };

  const handleSubmit = async (data: CustomerTypeFormData) => {
    try {
      if (editingType) {
        await customerTypeService.updateCustomerType(editingType.id, data);
        toast.success("Customer type updated successfully");
      } else {
        await customerTypeService.createCustomerType(data);
        toast.success("Customer type created successfully");
      }
      await fetchCustomerTypes();
      setEditingType(null);
    } catch (error) {
      toast.error(
        editingType ? "Failed to update customer type" : "Failed to create customer type"
      );
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingType(null);
  };

  const columns = createCustomerTypeColumns(handleEdit, handleDeleteClick, handleToggle);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Customer Types
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage customer types for product pricing
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Customer Type
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Types */}
        <div className="p-4 rounded-lg border bg-blue-50 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <div className="w-3 h-3">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14l5-5 5 5z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600 font-medium">Total Types</p>
            <p className="text-sm font-bold text-blue-600">{isLoading ? "—" : stats.total}</p>
          </div>
        </div>

        {/* Active */}
        <div className="p-4 rounded-lg border bg-green-50 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <UserCheck className="w-5 h-5 text-green-600" />
            <div className="flex items-center gap-1 text-xs text-green-600">
              <div className="w-3 h-3">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14l5-5 5 5z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600 font-medium">Active</p>
            <p className="text-sm font-bold text-green-600">{isLoading ? "—" : stats.active}</p>
          </div>
        </div>

        {/* Inactive */}
        <div className="p-4 rounded-lg border bg-red-50 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <UserX className="w-5 h-5 text-red-600" />
            <div className="flex items-center gap-1 text-xs text-red-600">
              <div className="w-3 h-3">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 10l-5 5-5-5z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600 font-medium">Inactive</p>
            <p className="text-sm font-bold text-red-600">{isLoading ? "—" : stats.inactive}</p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={customerTypes}
        title=""
        description=""
        showPagination={false}
        showColumnVisibility={false}
        showRowSelection={false}
        isLoading={isLoading}
      />

      <CustomerTypeModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        customerType={editingType}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-gray-900">{typeToDelete?.name}</span>? This action cannot be undone and will remove all associated product pricing for this customer type.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTypeToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
