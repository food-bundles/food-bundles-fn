"use client";

import { useState } from "react";
import { Calendar, Filter} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useDashboard } from "@/app/contexts/DashboardContext";
import { StatsFilters } from "@/app/services/statisticsService";

export function DashboardFilters() {
  const { filters, updateFilters, loading } = useDashboard();
  const [isExpanded, setIsExpanded] = useState(false);
  const [tempFilters, setTempFilters] = useState<StatsFilters>(filters);

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

  const handleApplyFilters = () => {
    updateFilters(tempFilters);
    setIsExpanded(false);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      year: currentYear,
      month: new Date().getMonth() + 1,
    };
    setTempFilters(defaultFilters);
    updateFilters(defaultFilters);
  };

  const getFilterSummary = () => {
    const parts = [];
    if (filters.year) parts.push(`${filters.year}`);
    if (filters.month) {
      const monthName = months.find(m => m.value === filters.month)?.label;
      parts.push(monthName);
    }
    if (filters.dateFrom && filters.dateTo) {
      parts.push(`${filters.dateFrom} to ${filters.dateTo}`);
    }
    return parts.length > 0 ? parts.join(" • ") : "All Time";
  };

  return (
    <Card className="mb-3 py-1 rounded">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-gray-500" />
              <span className="text-xs font-medium">Filters:</span>
              <span className="text-xs text-gray-600">{getFilterSummary()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs h-7 px-2"
            >
              <Filter className="h-3 w-3" />
              <span className="text-xs">{isExpanded ? "Hide" : "Show"}</span>
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Year Filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium">Year</label>
                <Select
                  value={tempFilters.year?.toString()}
                  onValueChange={(value) =>
                    setTempFilters({ ...tempFilters, year: parseInt(value) })
                  }
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Select year" className="text-xs"/>
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()} className="text-xs">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Month Filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium">Month</label>
                <Select
                  value={tempFilters.month?.toString()}
                  onValueChange={(value) =>
                    setTempFilters({
                      ...tempFilters,
                      month: value === "all" ? undefined : parseInt(value),
                    })
                  }
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Select month" className="text-xs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Months</SelectItem>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()} className="text-xs">
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div className="space-y-1">
                <label className="text-xs font-medium">From Date</label>
                <Input
                  type="date"
                  value={tempFilters.dateFrom || ""}
                  onChange={(e) =>
                    setTempFilters({ ...tempFilters, dateFrom: e.target.value })
                  }
                  className="h-7 text-xs"
                />
              </div>

              {/* Date To */}
              <div className="space-y-1">
                <label className="text-xs font-medium">To Date</label>
                <Input
                  type="date"
                  value={tempFilters.dateTo || ""}
                  onChange={(e) =>
                    setTempFilters({ ...tempFilters, dateTo: e.target.value })
                  }
                  className="h-7 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs h-7 px-2"
              >
                Reset
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTempFilters(filters);
                    setIsExpanded(false);
                  }}
                  className="text-xs h-7 px-2"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleApplyFilters}
                  disabled={loading}
                  className="text-xs h-7 px-2"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}