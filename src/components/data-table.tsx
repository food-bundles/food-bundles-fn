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
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Plus,
} from "lucide-react";

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

// Discriminated union for filters
export type FilterConfig =
  | {
      type: "search";
      key: string;
      label: string;
      placeholder?: string;
      width?: string;
      value?: string;
      onChange?: (value: string) => void;
    }
  | {
      type: "select";
      key: string;
      label: string;
      options: FilterOption[];
      width?: string;
      value?: string;
      onChange?: (value: string) => void;
    }
  | {
      type: "date";
      key: string;
      label: string;
      width?: string;
      value?: Date;
      onChange?: (value: Date | undefined) => void;
    }
  | {
      type: "dateRange";
      key: string;
      label: string;
      width?: string;
      value?: { from?: Date; to?: Date };
      onChange?: (value: { from?: Date; to?: Date }) => void;
  };
    


interface DataTableProps<TData, TValue> {
  // Core table props
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  // Header configuration
  title?: string;
  description?: string;
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
  description,
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
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 5,
      },
    },
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
    <div className="space-y-2 h-full overflow-auto">
      {(title || showAddButton || showExport) && (
        <div className="flex items-center justify-between">
          {title && (
            <>
              <div>
                <h1 className="text-[16px] font-medium text-gray-800">{title}</h1>
                <p className="text-gray-600 text-sm">{description}</p>
              </div>
            </>
          )}
          <div className="flex items-center gap-4">
            {/* Add button - completely optional */}
            {showAddButton && addButtonLabel && onAddButton && (
              <button
                onClick={onAddButton}
                className="bg-green-700 hover:bg-green-600 text-[13px] p-1 text-white rounded cursor-pointer flex shrink-0"
              >
                <Plus className="mr-2 h-4 w-4" />
                {addButtonLabel}
              </button>
            )}
            {/* Export button */}
            {showExport && (
              <button
                onClick={onExport}
                className="flex items-center bg-green-700 hover:bg-green-600 text-[13px] cursor-pointer p-1 text-white rounded gap-2 min-w-[100px] shrink-0"
              >
                <Download className=" h-4 w-4" />
                Export
              </button>
            )}
          </div>
        </div>
      )}

      {(customFilters || filters.length > 0 || showColumnVisibility) && (
        <div className="flex items-center gap-4 py-2 flex-wrap">
          {customFilters}

          {filters.map(renderFilter)}

          {showColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  // variant="outline"
                  className="min-w-[100px] flex items-center justify-between bg-transparent ml-auto rounded border-2 border-green-500 px-3 py-1 text-[13px] text-gray-900 hover:bg-green-100"
                >
                  Columns
                  <ChevronDown className="ml-2 h-4 w-4" />
                </button>
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
              <TableRow
                key={headerGroup.id}
                className="bg-green-700 hover:bg-green-800"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-white py-0 text-[13px]"
                    >
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
                  className="hover:bg-green-50 text-[13px]"
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
            <div className="hidden md:flex text-sm text-gray-700 text-[13px]">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
          )}

          {showPagination && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className={`p-1 rounded  ${
                  table.getCanNextPage()
                    ? "text-gray-900 hover:bg-gray-100"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                {/* previous */}
                <ChevronsLeft className="h-6 w-6" />
              </button>

              {getPageNumbers().map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => table.setPageIndex(pageNumber - 1)}
                  className={`px-3 rounded ${
                    table.getState().pagination.pageIndex + 1 === pageNumber
                      ? "bg-green-700 hover:bg-green-800 text-white"
                      : "bg-white hover:bg-gray-100 text-gray-900"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className={`p-1 rounded ${
                  table.getCanNextPage()
                    ? "text-gray-900 hover:bg-gray-100"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                <ChevronsRight className="h-6 w-6" />
              </button>
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
              <span className="text-[13px] text-gray-900">rows per page</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
