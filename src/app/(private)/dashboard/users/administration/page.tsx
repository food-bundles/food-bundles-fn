/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useAdmins } from "@/app/contexts/AdminsContext";
import type { Admin } from "@/app/contexts/AdminsContext";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { DataTable } from "@/components/data-table";
import { getAdminColumns } from "./_components/admintration-columns";
import { AdminManagementModal } from "./_components/admin-management-modal";
import { CreateAdminModal } from "./_components/create-admin-modal";
import { UpdateCommissionModal } from "./_components/update-commission-modal";
import UserDetailsSheet from "../farmers/_components/UserDetailsSheet";

export default function AdministrationPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  });
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { getAllAdmins, createAdmin, updateAdmin, deleteAdmin } = useAdmins();

  const fetchAdmins = async (page = 1, limit = 5, isPagination = false) => {
    try {
      if (isPagination) {
        setPaginationLoading(true);
      } else {
        setLoading(true);
      }
      const response = await getAllAdmins({ page, limit });

      if (response?.success && Array.isArray(response?.data)) {
        setAdmins(response.data);
        
        if (response.pagination) {
          setPagination({
            page: response.pagination.page,
            limit: response.pagination.limit,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
          });
        }
      } else {
        console.warn("Unexpected API response format:", response);
      }
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  };

  const handlePaginationChange = (page: number, limit: number) => {
    fetchAdmins(page, limit, true);
  };

  const handleUpdateCommission = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsCommissionModalOpen(true);
  };

  const adminColumns = getAdminColumns(
    (admin: Admin) => {
      setSelectedAdmin(admin);
      setIsModalOpen(true);
    },
    handleUpdateCommission,
    (adminId: string) => {
      setSelectedUserId(adminId);
      setIsDetailsSheetOpen(true);
    }
  );

  const handleRowClick = (admin: Admin) => {
    setSelectedUserId(admin.id);
    setIsDetailsSheetOpen(true);
  };

  useEffect(() => {
    fetchAdmins(1, 5);
  }, []);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner variant="ring" className="w-10 h-10" />
      </div>
    );

  return (
    <div className="p-6">
      <DataTable 
        columns={adminColumns}
        data={admins}
        title="Administration Management"
        showExport={true}
        onExport={() => console.log("Exporting administrators data...")}
        showAddButton={true}
        addButtonLabel="Add Admin"
        onAddButton={() => setIsCreateModalOpen(true)}
        showSearch={false}
        showColumnVisibility={true}
        showPagination={true}
        showRowSelection={true}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        isLoading={paginationLoading}
        onRowClick={handleRowClick}
      />

      <AdminManagementModal
        admin={selectedAdmin}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onUpdate={() => fetchAdmins(pagination.page, pagination.limit)}
        onEdit={updateAdmin}
        onDelete={deleteAdmin}
      />

      <CreateAdminModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onUpdate={() => fetchAdmins(pagination.page, pagination.limit)}
        onCreate={createAdmin}
      />

      <UpdateCommissionModal
        admin={selectedAdmin}
        open={isCommissionModalOpen}
        onOpenChange={setIsCommissionModalOpen}
        onUpdate={() => fetchAdmins(pagination.page, pagination.limit)}
      />
      
      <UserDetailsSheet
        isOpen={isDetailsSheetOpen}
        onClose={() => setIsDetailsSheetOpen(false)}
        userId={selectedUserId}
      />
    </div>
  );
}
