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

interface FiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (columnId: string, visible: boolean) => void;
}

const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "Pending", value: "Pending" },
  { label: "Accepted", value: "Accepted" },
  { label: "Rejected", value: "Rejected" },
];

const categoryOptions = [
  { label: "All Categories", value: "all" },
  { label: "Organic Vegetables", value: "organic" },
  { label: "Fresh Produce", value: "fresh" },
  { label: "Grains", value: "grains" },
  { label: "Fruits", value: "fruits" },
];

const columnOptions = [
  { id: "farmerName", label: "Farmer Name" },
  { id: "location", label: "Location" },
  { id: "product", label: "Product" },
  { id: "quantity", label: "Quantity" },
  { id: "proposedPrice", label: "Proposed Price" },
  { id: "acceptedQtyPrice", label: "Accepted Qty/Price" },
  { id: "aggregatorName", label: "Aggregator Name" },
  { id: "status", label: "Status" },
  { id: "actions", label: "Actions" },
];

export function Filters({
  searchValue,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
  selectedDate,
  onDateChange,
  columnVisibility,
  onColumnVisibilityChange,
}: FiltersProps) {
  return (
    <div className="flex items-center gap-4 py-2">
      {/* Search Input */}
      <div className="relative w-full ">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search offers..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="min-w-[120px] justify-between bg-transparent"
          >
            {statusOptions.find((option) => option.value === selectedStatus)
              ?.label || "Status"}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {statusOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selectedStatus === option.value}
              onCheckedChange={() => onStatusChange(option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Product Category Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="min-w-[160px] justify-between bg-transparent"
          >
            {categoryOptions.find((option) => option.value === selectedCategory)
              ?.label || "Product Category"}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {categoryOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selectedCategory === option.value}
              onCheckedChange={() => onCategoryChange(option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Date Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "min-w-[120px] justify-between text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            {selectedDate ? format(selectedDate, "PPP") : "Date"}
            <CalendarIcon className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Column Visibility */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="min-w-[100px] justify-between bg-transparent"
          >
            Columns
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {columnOptions.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={columnVisibility[column.id] !== false}
              onCheckedChange={(checked) =>
                onColumnVisibilityChange(column.id, !!checked)
              }
            >
              {column.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
