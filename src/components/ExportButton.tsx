"use client";

import React, { useState } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportService, ExportModuleType, ExportFilterParams } from "@/app/services/exportService";
import { showToast } from "@/lib/toast";

interface ExportButtonProps {
  module: ExportModuleType;
  filters?: ExportFilterParams;
  format?: "excel" | "csv" | "pdf";
  label?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  module,
  filters = {},
  format = "excel",
  label = "Export Excel",
  className = "",
  variant = "outline",
  size = "sm",
}) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      showToast("info", "Generating Excel export file...");
      await exportService.downloadExport(module, format, filters);
      showToast("success", "Export downloaded successfully!");
    } catch (error: any) {
      console.error("Export error:", error);
      const msg = error?.response?.data?.message || "Failed to download export file";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={loading}
      className={`gap-2 font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 dark:border-emerald-800 ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
      ) : (
        <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
      )}
      <span>{loading ? "Exporting..." : label}</span>
    </Button>
  );
};

export default ExportButton;
