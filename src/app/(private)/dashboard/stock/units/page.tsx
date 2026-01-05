/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { Plus } from "lucide-react";
import { createUnitColumns } from "./_components/unit-columns";
import { UnitModal } from "./_components/UnitModal";
import { DeleteConfirmDialog } from "./_components/DeleteConfirmDialog";
import { toast } from "sonner";
import { unitService, UnitFormData } from "@/app/services/unitService";

interface Unit {
  id: string;
  tableTronicId: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<string | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchUnits = async (page = 1, limit = 10, isPagination = false) => {
    try {
      if (isPagination) {
        setPaginationLoading(true);
      } else {
        setIsLoading(true);
      }
      
      const response = await unitService.getAllUnits({ page, limit });
      setUnits(response.data || []);
      
      if (response.pagination) {
        setPagination({
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages,
        });
      }
    } catch (error) {
      console.error("Error fetching units:", error);
      toast.error("Failed to fetch units");
    } finally {
      setIsLoading(false);
      setPaginationLoading(false);
    }
  };

  // Pagination handler
  const handlePaginationChange = (page: number, limit: number) => {
    fetchUnits(page, limit, true);
  };

  useEffect(() => {
    fetchUnits(1, 10);
  }, []);

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (unitId: string) => {
    setUnitToDelete(unitId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (unitToDelete) {
      try {
        await unitService.deleteUnit(unitToDelete);
        toast.success("Unit deleted successfully");
        await fetchUnits(pagination.page, pagination.limit);
      } catch (error) {
        toast.error("Failed to delete unit");
      }
      setUnitToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleSubmit = async (data: UnitFormData) => {
    try {
      if (editingUnit) {
        await unitService.updateUnit(editingUnit.id, data);
        toast.success("Unit updated successfully");
      } else {
        await unitService.createUnit(data);
        toast.success("Unit created successfully");
      }
      await fetchUnits(pagination.page, pagination.limit);
      setEditingUnit(null);
    } catch (error) {
      toast.error(editingUnit ? "Failed to update unit" : "Failed to create unit");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingUnit(null);
  };

  const columns = createUnitColumns(handleEdit, handleDeleteClick);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[15px] font-medium">Product Units</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Unit
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={units}
        title=""
        description={``}
        showPagination={true}
        showColumnVisibility={false}
        showRowSelection={false}
        isLoading={paginationLoading}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
      />

      <UnitModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        unit={editingUnit}
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