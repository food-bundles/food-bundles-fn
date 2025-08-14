"use client";

import { Button } from "@/components/ui/button";

interface StatusFilterProps {
  filters: Array<{ value: string; label: string }>;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

export function StatusFilter({
  filters,
  selectedStatus,
  onStatusChange,
}: StatusFilterProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.value}
            variant={selectedStatus === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => onStatusChange(filter.value)}
            className={
              selectedStatus === filter.value
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
