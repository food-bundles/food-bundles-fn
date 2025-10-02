"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ChevronDown, Search, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Types for filter options
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

interface TableFiltersProps {
  filters: FilterConfig[];
  className?: string;
}

export function TableFilters({ filters, className }: TableFiltersProps) {
  const renderFilter = (filter: FilterConfig) => {
    switch (filter.type) {
      case "search":
        return (
          <div
            key={filter.key}
            className={`relative ${filter.width || "w-full max-w-sm"}`}
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2  text-gray-900" />
            <Input
              placeholder={
                filter.placeholder || `Search ${filter.label.toLowerCase()}...`
              }
              value={(filter.value as string) || ""}
              onChange={(e) => filter.onChange?.(e.target.value)}
              className="pl-10 text-xs text-gray-900 rounded border border-green-700"
            />
          </div>
        );

      case "select":
        return (
          <DropdownMenu key={filter.key}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={`${
                  filter.width || "min-w-[120px]"
                } justify-between font-normal rounded border border-green-700 bg-white hover:bg-green-100 cursor-pointer`}
              >
                {filter.options?.find((option) => option.value === filter.value)
                  ?.label || filter.label}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {filter.options?.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={filter.value === option.value}
                  onCheckedChange={() => filter.onChange?.(option.value)}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );

      case "date":
        return (
          <Popover key={filter.key}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  filter.width || "min-w-[120px]",
                  "justify-between text-left font-normal",
                  !filter.value && "text-gray-900 rounded border border-green-700 bg-white hover:bg-green-100 cursor-pointer"
                )}
              >
                {filter.value
                  ? format(filter.value as Date, "PPP")
                  : filter.label}
                <CalendarIcon className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filter.value as Date}
                onSelect={(date) => filter.onChange?.(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case "dateRange":
        return (
          <Popover key={filter.key}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  filter.width || "min-w-[200px]",
                  "justify-between text-left font-normal",
                  !filter.value?.from &&
                    !filter.value?.to &&
                    "text-muted-foreground"
                )}
              >
                {filter.value?.from ? (
                  filter.value.to ? (
                    <>
                      {format(filter.value.from, "MMM dd")} -{" "}
                      {format(filter.value.to, "MMM dd, yyyy")}
                    </>
                  ) : (
                    format(filter.value.from, "MMM dd, yyyy")
                  )
                ) : (
                  <span>{filter.label}</span>
                )}
                <div className="flex items-center gap-1">
                  {(filter.value?.from || filter.value?.to) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-gray-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        filter.onChange?.({});
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  <CalendarIcon className="h-4 w-4" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-4">
                <div className="text-sm font-medium mb-3">
                  Select Date Range
                </div>
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filter.value?.from}
                  selected={{
                    from: filter.value?.from,
                    to: filter.value?.to,
                  }}
                  onSelect={(range) => {
                    filter.onChange?.({
                      from: range?.from,
                      to: range?.to,
                    });
                  }}
                  numberOfMonths={2}
                />
                <div className="flex justify-between items-center mt-4 pt-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => filter.onChange?.({})}
                  >
                    Clear
                  </Button>
                  <div className="text-xs text-gray-500">
                    Select start and end dates
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("flex items-center gap-4 py-2", className)}>
      {filters.map(renderFilter)}
    </div>
  );
}

// Pre-configured filter sets for common use cases
export const createCommonFilters = {
  search: (
    value: string,
    onChange: (value: string) => void,
    placeholder = "Search..."
  ): FilterConfig => ({
    type: "search",
    key: "search",
    label: "Search",
    placeholder,
    value,
    onChange,
    width: "w-full max-w-sm",
  }),

  status: (
    value: string,
    onChange: (value: string) => void,
    options: FilterOption[]
  ): FilterConfig => ({
    type: "select",
    key: "status",
    label: "Status",
    options,
    value,
    onChange,
    width: "min-w-[120px]",
  }),

  category: (
    value: string,
    onChange: (value: string) => void,
    options: FilterOption[]
  ): FilterConfig => ({
    type: "select",
    key: "category",
    label: "Category",
    options,
    value,
    onChange,
    width: "min-w-[160px]",
  }),

  date: (
    value: Date | undefined,
    onChange: (date: Date | undefined) => void,
    label = "Date"
  ): FilterConfig => ({
    type: "date",
    key: "date",
    label,
    value,
    onChange,
    width: "min-w-[120px]",
  }),

  dateRange: (
    value: { from?: Date; to?: Date } | undefined,
    onChange: (range: { from?: Date; to?: Date }) => void,
    label = "Date Range"
  ): FilterConfig => ({
    type: "dateRange",
    key: "dateRange",
    label,
    value,
    onChange,
    width: "min-w-[200px]",
  }),
};
