"use client";

import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboard } from "@/app/contexts/DashboardContext";

export function DashboardFilters() {
  const { filters, updateFilters } = useDashboard();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];



  const getFilterSummary = () => {
    const parts = [];
    if (filters.year) parts.push(`${filters.year}`);
    if (filters.month) {
      const monthName = months.find(m => m.value === filters.month)?.label;
      parts.push(monthName);
    } else {
      parts.push("All Months");
    }
    return parts.length > 0 ? parts.join(" • ") : "All Time";
  };

  return (
    <Card className="mb-3 py-1 w-1/2 rounded">
      <CardContent className="p-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-gray-500" />
            <span className="text-xs font-medium">Filters:</span>
            <span className="text-xs text-gray-600">{getFilterSummary()}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Select
              value={filters.year?.toString() || currentYear.toString()}
              onValueChange={(value) =>
                updateFilters({ ...filters, year: parseInt(value) })
              }
            >
              <SelectTrigger className="h-7 text-xs w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()} className="text-xs">
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.month?.toString() || "all"}
              onValueChange={(value) =>
                updateFilters({
                  ...filters,
                  month: value === "all" ? undefined : parseInt(value),
                })
              }
            >
              <SelectTrigger className="h-7 text-xs w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()} className="text-xs">
                    {month.label.slice(0, 3)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}