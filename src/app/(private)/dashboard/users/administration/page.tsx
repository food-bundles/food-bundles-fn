/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useMemo, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { getAdminColumns } from "./_components/admintration-columns";
import { createCommonFilters, TableFilters } from "@/components/filters";
import { useAdmins, type Admin } from "@/app/contexts/AdminsContext";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { AdminManagementModal } from "./_components/admin-management-modal";
import { CreateAdminModal } from "./_components/create-admin-modal";

function AdministrationPageContent() {
  const { admins,  error, getAllAdmins, createAdmin, updateAdmin, deleteAdmin, clearError } = useAdmins();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<Date | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // All hooks must be called before any conditional returns
  const filteredData = useMemo(() => {
    if (!mounted) return [];
    return admins.filter((admin) => {
      const matchesSearch =
        admin.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.phone?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || (admin.status || "active") === statusFilter;

      const matchesDate = !dateRange || new Date(admin.createdAt) >= dateRange;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [searchTerm, statusFilter, dateRange, admins, mounted]);

  const adminColumns = useMemo(() => {
    return getAdminColumns((admin: Admin) => {
      setSelectedAdmin(admin);
      setIsModalOpen(true);
    });
  }, []);

  const filters = useMemo(() => {
    return [
      createCommonFilters.search(
        searchTerm,
        setSearchTerm,
        "Search administrators..."
      ),
      createCommonFilters.status(statusFilter, setStatusFilter, [
        { label: "All Statuses", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Suspended", value: "suspended" },
      ]),
      createCommonFilters.date(dateRange, setDateRange, "Created Date"),
    ];
  }, [searchTerm, statusFilter, dateRange]);

  const handleExport = () => {
    console.log("Exporting administrators data...");
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAdmin(null);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleUpdate = () => {
    getAllAdmins();
  };

  const handleCreateAdmin = () => {
    setIsCreateModalOpen(true);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      getAllAdmins().catch((err) => {
        toast.error("Failed to load admins");
        console.error(err);
      });
    }
  }, [mounted]);

  useEffect(() => {
    if (error && mounted) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError, mounted]);

  return (
    <div className="p-6">
      <DataTable
        columns={adminColumns}
        data={filteredData}
        title="Administration Management"
        showExport={true}
        onExport={handleExport}
        showAddButton={true}
        onAddButton={handleCreateAdmin}
        customFilters={mounted ? <TableFilters filters={filters} /> : <div />}
        showSearch={false}
        showColumnVisibility={true}
        showPagination={true}
        showRowSelection={true}
      />
      
      <AdminManagementModal
        admin={selectedAdmin}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onUpdate={handleUpdate}
        onEdit={updateAdmin}
        onDelete={deleteAdmin}
      />
      
      <CreateAdminModal
        open={isCreateModalOpen}
        onOpenChange={handleCreateModalClose}
        onUpdate={handleUpdate}
        onCreate={createAdmin}
      />
    </div>
  );
}

const AdministrationPage = dynamic(() => Promise.resolve(AdministrationPageContent), {
  ssr: false,
  loading: () => (
    <div className="p-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  ),
});

export default AdministrationPage;
