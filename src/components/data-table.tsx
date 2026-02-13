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
import { Skeleton } from "@/components/ui/skeleton";
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
  showSecondaryButton?: boolean;
  secondaryButtonLabel?: string;
  onSecondaryButton?: () => void;

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

  // Server-side pagination
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPaginationChange?: (page: number, limit: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isLoading?: boolean;
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
  showSecondaryButton = false,
  secondaryButtonLabel,
  onSecondaryButton,
  filters = [],
  showColumnVisibility = true,
  showPagination = true,
  showRowSelection = true,
  customFilters,
  pagination,
  onPaginationChange,
  onPageSizeChange,
  isLoading = false,
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
    ...(pagination ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    ...(!pagination && {
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: 5,
        },
      },
    }),
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
    const totalPages = pagination?.totalPages || table.getPageCount();
    const currentPage = pagination?.page || (table.getState().pagination.pageIndex + 1);
    const pages = [];

    // Show 3 buttons on mobile, 5 on desktop
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const maxButtons = isMobile ? 3 : 5;
    const sideButtons = Math.floor((maxButtons - 1) / 2);

    const startPage = Math.max(1, currentPage - sideButtons);
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (pagination && onPaginationChange) {
      onPaginationChange(page, pagination.limit);
    } else {
      table.setPageIndex(page - 1);
    }
  };

  const handlePageSizeChange = (pageSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(pageSize);
    } else if (pagination && onPaginationChange) {
      onPaginationChange(1, pageSize);
    } else {
      table.setPageSize(pageSize);
    }
  };

  const renderFilter = (filter: FilterConfig) => {
    // Placeholder for filter rendering logic
    return <div key={filter.key}>{filter.label}</div>;
  };

  return (
    <div className="space-y-0.5 h-full overflow-auto ">
      {(title || showAddButton || showExport) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {title && (
            <div className="flex-1 min-w-0">
              <h1 className="text-[16px] font-medium text-gray-800 ">
                {title}
              </h1>
              {description && (
                <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
          )}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {showAddButton && addButtonLabel && onAddButton && (
              <button
                onClick={onAddButton}
                className="bg-green-700 hover:bg-green-600 text-xs px-2 sm:px-3 py-2 text-white rounded cursor-pointer flex items-center gap-1 sm:gap-2 whitespace-nowrap"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className=" ">{addButtonLabel}</span>
              </button>
            )}
            {showSecondaryButton && secondaryButtonLabel && onSecondaryButton && (
              <button
                onClick={onSecondaryButton}
                className="bg-blue-700 hover:bg-blue-600 text-xs px-2 sm:px-3 py-2 text-white rounded cursor-pointer flex items-center gap-1 sm:gap-2 whitespace-nowrap"
              >
                <span className=" ">{secondaryButtonLabel}</span>
              </button>
            )}
            {/* Export button */}
            {showExport && (
              <button
                onClick={onExport}
                className="flex items-center bg-green-700 hover:bg-green-600 text-xs cursor-pointer px-2 sm:px-3 py-2  text-white rounded gap-1 sm:gap-2 whitespace-nowrap"
              >
                <Download className="h-3 w-3" />
                <span className="">Export</span>
              </button>
            )}
          </div>
        </div>
      )}

      {(customFilters || filters.length > 0 || showColumnVisibility) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 py-2">
          <div className="flex flex-wrap items-center gap-2 flex-1 w-full sm:w-auto">
            {customFilters}
            {filters.map(renderFilter)}
          </div>

          {showColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center justify-between bg-white rounded border-2 border-green-500 px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-900 hover:bg-gray-200 whitespace-nowrap min-w-0">
                  <span className="">Columns</span>
                  <ChevronDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
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
      <div className="rounded-md border bg-white relative">
        {/* Loading bar */}
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 overflow-hidden z-10">
            <div className="h-full bg-green-600 animate-[loading_1s_ease-in-out_infinite]" 
                 style={{
                   width: '30%',
                   animation: 'loading 1s ease-in-out infinite'
                 }} />
          </div>
        )}
        <style jsx>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }
        `}</style>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className=" py-0 text-[13px]">
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
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, colIndex) => (
                      <TableCell
                        key={colIndex}
                        className="text-xs py-4 text-gray-800 whitespace-nowrap"
                      >
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : table.getRowModel().rows?.length
              ? table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-green-50 text-[13px]"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="text-xs text-gray-800 whitespace-nowrap"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                        <svg
                          className="w-12 h-12 mb-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                        <p className="text-sm font-medium">No data available.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {(showPagination || showRowSelection) && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4">
          {showPagination && (
            <div className="flex items-center space-x-2 order-1 sm:order-1">
              <button
                onClick={() => {
                  const currentPage =
                    pagination?.page ||
                    table.getState().pagination.pageIndex + 1;
                  if (currentPage > 1) handlePageChange(currentPage - 1);
                }}
                disabled={
                  pagination
                    ? pagination.page <= 1
                    : !table.getCanPreviousPage()
                }
                className={`p-1 rounded ${
                  pagination
                    ? pagination.page > 1
                      ? "text-gray-900 hover:bg-gray-100"
                      : "text-gray-400 cursor-not-allowed"
                    : table.getCanPreviousPage()
                    ? "text-gray-900 hover:bg-gray-100"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                <ChevronsLeft className="h-6 w-6" />
              </button>

              {getPageNumbers().map((pageNumber) => {
                const currentPage =
                  pagination?.page || table.getState().pagination.pageIndex + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-3 sm:px-2 py-1 text-xs rounded ${
                      currentPage === pageNumber
                        ? "bg-green-700 hover:bg-green-800 text-white"
                        : "bg-white hover:bg-gray-100 text-gray-900"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  const currentPage =
                    pagination?.page ||
                    table.getState().pagination.pageIndex + 1;
                  const totalPages =
                    pagination?.totalPages || table.getPageCount();
                  if (currentPage < totalPages)
                    handlePageChange(currentPage + 1);
                }}
                disabled={
                  pagination
                    ? pagination.page >= pagination.totalPages
                    : !table.getCanNextPage()
                }
                className={`p-1 rounded ${
                  pagination
                    ? pagination.page < pagination.totalPages
                      ? "text-gray-900 hover:bg-gray-100"
                      : "text-gray-400 cursor-not-allowed"
                    : table.getCanNextPage()
                    ? "text-gray-900 hover:bg-gray-100"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                <ChevronsRight className="h-6 w-6" />
              </button>
            </div>
          )}

          {showPagination && (
            <div className="flex items-center space-x-2 order-2 sm:order-2">
              <Select
                value={`${
                  pagination?.limit || table.getState().pagination.pageSize
                }`}
                onValueChange={(value) => handlePageSizeChange(Number(value))}
              >
                <SelectTrigger className="h-8 min-w-22.5 w-auto">
                  <SelectValue
                    placeholder={
                      pagination?.limit || table.getState().pagination.pageSize
                    }
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[
                    5, 10, 20, 30, 40, 50, 100, 200, 500, 1000, 5000, 10000000,
                  ].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="hidden sm:inline text-xs text-gray-900">
                rows per page
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
