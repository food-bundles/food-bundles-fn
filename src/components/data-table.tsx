/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown, Download, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Filter configuration types
export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  type: "select" | "date" | "search";
  key: string;
  label: string;
  placeholder?: string;
  options?: FilterOption[];
  width?: string;
}

interface DataTableProps<TData, TValue> {
  // Core table props
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  // Header configuration
  title?: string;
  descrption?: string;
  showExport?: boolean;
  onExport?: () => void;
  showAddButton?: boolean;
  addButtonLabel?: string;
  onAddButton?: () => void;

  // Filter configuration
  filters?: FilterConfig[];

  // Built-in table features
  showSearch?: boolean;
  showColumnVisibility?: boolean;
  showPagination?: boolean;
  showRowSelection?: boolean;

  // Search configuration
  searchKey?: string;
  searchPlaceholder?: string;

  // Custom filter props
  customFilters?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  title,
  descrption,
  showExport = false,
  onExport,
  showAddButton = false,
  addButtonLabel,
  onAddButton,
  filters = [],
  showColumnVisibility = true,
  showPagination = true,
  showRowSelection = true,
  customFilters,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const getPageNumbers = () => {
    const totalPages = table.getPageCount();
    const currentPage = table.getState().pagination.pageIndex + 1;
    const pages = [];

    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
      pages.push(i);
    }

    return pages;
  };

  const renderFilter = (filter: FilterConfig) => {
    // Placeholder for filter rendering logic
    return <div key={filter.key}>{filter.label}</div>;
  };

  return (
    <div className="space-y-6 h-full overflow-auto">
      {(title || showAddButton || showExport) && (
        <div className="flex items-center justify-between">
          {title && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <p className="text-gray-600 text-sm">{descrption}</p>
              </div>
            </>
          )}
          <div className="flex items-center gap-4">
            {/* Add button - completely optional */}
            {showAddButton && addButtonLabel && onAddButton && (
              <Button
                onClick={onAddButton}
                className="bg-green-500 hover:bg-green-600 flex-shrink-0"
              >
                <Plus className="mr-2 h-4 w-4" />
                {addButtonLabel}
              </Button>
            )}
            {/* Export button */}
            {showExport && (
              <Button
                onClick={onExport}
                className="bg-green-500 hover:bg-green-600 flex-shrink-0"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            )}
          </div>
        </div>
      )}

      {(customFilters || filters.length > 0 || showColumnVisibility) && (
        <div className="flex items-center gap-4 py-2 flex-wrap">
          {/* Custom filters (passed from parent) */}
          {customFilters}

          {/* Dynamic filters */}
          {filters.map(renderFilter)}

          {/* Column visibility - always at the end */}
          {showColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="min-w-[100px] justify-between bg-transparent ml-auto"
                >
                  Columns
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id.replace(/([A-Z])/g, " $1").trim()}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {(showPagination || showRowSelection) && (
        <div className="flex items-center justify-between py-4">
          {showRowSelection && (
            <div className="text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
          )}

          {showPagination && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1"
              >
                Previous
              </Button>

              {getPageNumbers().map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={
                    table.getState().pagination.pageIndex + 1 === pageNumber
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => table.setPageIndex(pageNumber - 1)}
                  className={`px-3 py-1 ${
                    table.getState().pagination.pageIndex + 1 === pageNumber
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : ""
                  }`}
                >
                  {pageNumber}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1"
              >
                Next
              </Button>
            </div>
          )}

          {showPagination && (
            <div className="flex items-center space-x-2">
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                rows per page
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
