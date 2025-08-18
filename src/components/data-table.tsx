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

  const renderFilter = (filter: FilterConfig) => {
    // Placeholder for filter rendering logic
    return <div key={filter.key}>{filter.label}</div>;
  };

  return (
    <div className="space-y-6 h-full overflow-auto">
      {(title || showAddButton || showExport) && (
        <div className="flex items-center justify-between">
          {title && (
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          )}
          <div className="flex items-center gap-4">
            {/* Add button - completely optional */}
            {showAddButton && addButtonLabel && onAddButton && (
              <Button
                onClick={onAddButton}
                className="bg-green-600 hover:bg-green-700 flex-shrink-0"
              >
                <Plus className="mr-2 h-4 w-4" />
                {addButtonLabel}
              </Button>
            )}
            {/* Export button */}
            {showExport && (
              <Button
                onClick={onExport}
                className="bg-green-600 hover:bg-green-700 flex-shrink-0"
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
      {showPagination && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {showRowSelection && (
              <>
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </>
            )}
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex bg-transparent"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              {"<<"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 bg-transparent"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              {"<"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 bg-transparent"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              {">"}
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex bg-transparent"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              {">>"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
