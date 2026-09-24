"use client";

import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  customerTypeService,
  PriceUsageData,
  PriceUsageEntry,
} from "@/app/services/customerTypeService";

export function PriceUsage() {
  const [data, setData] = useState<PriceUsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRoleId, setFilterRoleId] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await customerTypeService.getPriceUsage();
      setData(response.data);
    } catch (error) {
      console.error("Error fetching price usage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // customerTypeId === "" resets the buyer to the customer type named after their role
  const handleCustomerTypeChange = async (restaurantId: string, customerTypeId: string) => {
    if (updatingId) return;
    try {
      setUpdatingId(restaurantId);
      const result = await customerTypeService.assignCustomerType(
        restaurantId,
        customerTypeId || null
      );
      toast.success(result.message);

      setData((prev) =>
        prev
          ? {
              ...prev,
              restaurants: prev.restaurants.map((r) =>
                r.id === restaurantId ? { ...r, ...result.restaurant } : r
              ),
            }
          : prev
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update customer type");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRestaurants = useMemo(() => {
    return (data?.restaurants || []).filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRoleId === "ALL" || r.role === filterRoleId;
      return matchesSearch && matchesRole;
    });
  }, [data, searchTerm, filterRoleId]);

  const columns: ColumnDef<PriceUsageEntry>[] = useMemo(
    () => [
      {
        id: "nbr",
        header: "Nbr",
        cell: ({ row }) => (
          <span className="text-gray-600">{row.index + 1}</span>
        ),
        size: 50,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge variant="outline" className="border-gray-200 text-gray-700 bg-gray-50">
            {row.original.role}
          </Badge>
        ),
      },
      {
        id: "contact",
        header: "Contact",
        cell: ({ row }) => (
          <div className="text-gray-600">
            {row.original.phone && <div>{row.original.phone}</div>}
            {row.original.email && <div className="text-xs text-gray-400">{row.original.email}</div>}
          </div>
        ),
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => (
          <span className="text-gray-600">{row.original.location || "—"}</span>
        ),
      },
      {
        id: "assignedCustomerType",
        header: () => <div className="text-center">Assigned Customer Type</div>,
        cell: ({ row }) => {
          const restaurant = row.original;
          return (
            <div className="flex items-center justify-center gap-1">
              <select
                value={
                  restaurant.isExplicitAssignment
                    ? restaurant.assignedCustomerType?.id ?? ""
                    : ""
                }
                onChange={(e) => handleCustomerTypeChange(restaurant.id, e.target.value)}
                disabled={updatingId === restaurant.id}
                className="text-xs border rounded px-2 py-1 bg-white disabled:opacity-60"
              >
                <option value="">
                  {`Default (${
                    restaurant.isExplicitAssignment || !restaurant.assignedCustomerType
                      ? "no match"
                      : restaurant.assignedCustomerType.name
                  })`}
                </option>
                {data?.customerTypes.map((ct) => (
                  <option key={ct.id} value={ct.id}>
                    {ct.name}
                    {ct.isActive ? "" : " (inactive)"}
                  </option>
                ))}
              </select>
              {updatingId === restaurant.id && (
                <Loader2 className="h-3 w-3 animate-spin text-green-600" />
              )}
            </div>
          );
        },
      },
      {
        id: "status",
        header: () => <div className="text-center">Status</div>,
        cell: ({ row }) => {
          const restaurant = row.original;
          return (
            <div className="flex items-center justify-center">
              {restaurant.isExplicitAssignment ? (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  Assigned
                </Badge>
              ) : restaurant.isUsingOwnPricing ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  Matched
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                  No Match
                </Badge>
              )}
            </div>
          );
        },
      },
    ],
    [data, updatingId]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
        <span className="ml-2 text-sm text-gray-500">Loading price usage...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        Failed to load price usage data
      </div>
    );
  }

  const uniqueRoles = Array.from(new Set(data.restaurants.map((r) => r.role)));

  return (
    <div className="space-y-4">
      {/* Table and pagination */}
      <DataTable
        columns={columns}
        data={filteredRestaurants}
        showPagination={true}
        showColumnVisibility={false}
        showRowSelection={false}
        isLoading={isLoading}
        customFilters={
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
            <div className="relative flex-1 max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterRoleId("ALL")}
                className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                  filterRoleId === "ALL"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                All ({data.restaurants.length})
              </button>
              {uniqueRoles.map((role) => {
                const count = data.restaurants.filter((r) => r.role === role).length;
                return (
                  <button
                    key={role}
                    onClick={() => setFilterRoleId(role)}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                      filterRoleId === role
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {role} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        }
      />
    </div>
  );
}
