/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { CalendarIcon, ChevronDown, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Types for filter options
export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  type: "search" | "select" | "date";
  key: string;
  label: string;
  placeholder?: string;
  options?: FilterOption[];
  width?: string;
  value?: string | Date;
  onChange?: (value: any) => void;
}

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
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={
                filter.placeholder || `Search ${filter.label.toLowerCase()}...`
              }
              value={(filter.value as string) || ""}
              onChange={(e) => filter.onChange?.(e.target.value)}
              className="pl-10"
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
                } justify-between bg-transparent`}
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
                  !filter.value && "text-muted-foreground"
                )}
              >
                {filter.value
                  ? format(filter.value as Date, "PPP")
                  : filter.placeholder || filter.label}
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
};
