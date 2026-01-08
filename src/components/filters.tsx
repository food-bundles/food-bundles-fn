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
  showColumnToggle?: boolean;
  onColumnToggle?: () => void;
}

export function TableFilters({ filters, className, showColumnToggle = false, onColumnToggle }: TableFiltersProps) {
  const renderFilter = (filter: FilterConfig) => {
    switch (filter.type) {
      case "search":
        return (
          <div key={filter.key} className="w-full sm:w-auto sm:flex-1 md:flex-1 lg:flex-1 relative">
            <Search className="absolute left-2 sm:left-3 top-1/2 h-3 w-3 sm:h-4 sm:w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
              value={(filter.value as string) || ""}
              onChange={(e) => filter.onChange?.(e.target.value)}
              className="pl-8 sm:pl-10 h-8 sm:h-9 text-xs sm:text-sm border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>
        );

      case "select":
        return (
          <div key={filter.key} className="w-full sm:w-auto sm:min-w-[120px] md:min-w-[140px] lg:flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-8 sm:h-9 px-2 sm:px-3 md:px-4 text-xs sm:text-sm border-gray-300 hover:border-gray-400"
                >
                  <span className="truncate">
                    {filter.options?.find((option) => option.value === filter.value)?.label || filter.label}
                  </span>
                  <ChevronDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-full min-w-[200px]">
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
          </div>
        );

      case "date":
        return (
          <div key={filter.key} className="w-full sm:w-auto sm:min-w-[140px] md:min-w-[160px] lg:flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-between h-8 sm:h-9 px-2 sm:px-3 md:px-4 text-xs sm:text-sm border-gray-300 hover:border-gray-400",
                    !filter.value && "text-muted-foreground"
                  )}
                >
                  <span className="truncate">
                    {filter.value ? (
                      <>
                        <span className="sm:hidden">{format(filter.value as Date, "MM/dd/yy")}</span>
                        <span className="hidden sm:inline md:hidden">{format(filter.value as Date, "MMM dd")}</span>
                        <span className="hidden md:inline">{format(filter.value as Date, "MMM dd, yyyy")}</span>
                      </>
                    ) : filter.label}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {filter.value && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-3 w-3 sm:h-4 sm:w-4 p-0 hover:bg-gray-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          filter.onChange?.(undefined);
                        }}
                      >
                        <X className="h-2 w-2 mr-2 sm:h-3 sm:w-3" />
                      </Button>
                    )}
                    <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
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
          </div>
        );

      case "dateRange":
        return (
          <div key={filter.key} className="w-full sm:flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-between h-9 border-gray-300 hover:border-gray-400",
                    !filter.value?.from && !filter.value?.to && "text-muted-foreground"
                  )}
                >
                  <span className="truncate">
                    {filter.value?.from ? (
                      filter.value.to ? (
                        <>
                          <span className="hidden sm:inline">
                            {format(filter.value.from, "MMM dd")} - {format(filter.value.to, "MMM dd, yyyy")}
                          </span>
                          <span className="sm:hidden">
                            {format(filter.value.from, "MM/dd")} - {format(filter.value.to, "MM/dd/yy")}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="hidden sm:inline">{format(filter.value.from, "MMM dd, yyyy")}</span>
                          <span className="sm:hidden">{format(filter.value.from, "MM/dd/yy")}</span>
                        </>
                      )
                    ) : (
                      <span>{filter.label}</span>
                    )}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
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
                <div className="p-2">
                  <div className="flex justify-center items-center my-2">
                    <h3 className="text-xs text-center font-medium">Select start and end dates</h3>
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
                    numberOfMonths={1}
                    className="sm:block"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("flex flex-col sm:flex-row md:flex-row lg:flex-row items-stretch sm:items-center gap-2 sm:gap-2 md:gap-3 lg:gap-4", className)}>
      {filters.map(renderFilter)}
      {showColumnToggle && (
        <Button
          variant="outline"
          onClick={onColumnToggle}
          className="h-9 px-2 sm:px-3 md:px-4 border-gray-300 hover:border-gray-400 whitespace-nowrap flex-shrink-0 text-xs sm:text-sm"
        >
          Columns
        </Button>
      )}
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
