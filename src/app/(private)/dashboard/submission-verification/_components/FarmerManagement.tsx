/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useMemo, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { getFarmerColumns } from "./farmer-columns";
import { createCommonFilters, TableFilters } from "@/components/filters";
import { useFarmers, type Farmer } from "@/app/contexts/FarmersContext";
import { toast } from "sonner";
import { FarmerManagementModal } from "./farmer-management-modal";
import { CreateFarmerModal } from "./create-farmer-modal";
import { farmersService } from "@/app/services/farmersService";

export default function FarmerManagement() {
  const { farmers, error, getAllFarmers, updateFarmer, clearError } = useFarmers();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<Date | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredData = useMemo(() => {
    if (!mounted) return [];
    return farmers.filter((farmer) => {
      const matchesSearch =
        farmer.province?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || (farmer.status || "active") === statusFilter;

      const matchesDate = !dateRange || new Date(farmer.createdAt) >= dateRange;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [searchTerm, statusFilter, dateRange, farmers, mounted]);

  const filters = useMemo(() => {
    return [
      createCommonFilters.search(
        searchTerm,
        setSearchTerm,
        "Search farmers..."
      ),
      createCommonFilters.status(statusFilter, setStatusFilter, [
        { label: "All Statuses", value: "all" },
        { label: "Active", value: "active" },
        { label: "Pending", value: "pending" },
        { label: "Inactive", value: "inactive" },
      ]),
      createCommonFilters.date(dateRange, setDateRange, "Joined Date"),
    ];
  }, [searchTerm, statusFilter, dateRange]);

  const farmerColumns = useMemo(() => {
    return getFarmerColumns((farmer: Farmer) => {
      setSelectedFarmer(farmer);
      setIsModalOpen(true);
    });
  }, []);



  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedFarmer(null);
  };

  const handleUpdate = () => {
    getAllFarmers();
  };

  const handleCreateFarmer = async (data: any) => {
    try {
      await farmersService.createFarmerByAdmin(data);
      toast.success("Farmer created successfully. PIN sent via SMS.");
      getAllFarmers();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to create farmer");
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      getAllFarmers().catch((err) => {
        toast.error("Failed to load farmers");
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
        columns={farmerColumns}
        data={filteredData}
        title="Farmers Management"
        showAddButton={true}
        addButtonLabel="Add Farmer"
        onAddButton={() => setIsCreateOpen(true)}
        customFilters={mounted ? <TableFilters filters={filters} /> : <div />}
        showSearch={false}
        showColumnVisibility={true}
        showPagination={true}
        showRowSelection={true}
      />
      
      <FarmerManagementModal
        farmer={selectedFarmer}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onUpdate={handleUpdate}
        onEdit={updateFarmer}
      />
      
      <CreateFarmerModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreate={handleCreateFarmer}
      />
    </div>
  );
}