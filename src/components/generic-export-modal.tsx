/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Download,
  Calendar as CalendarIcon,
  FileSpreadsheet,
  FileText,
  FileType,
  CheckSquare,
  Square,
  Loader2,
  Filter,
} from "lucide-react";

export interface GenericExportConfig {
  format: "excel" | "csv" | "pdf";
  startDate?: string;
  endDate?: string;
  columns: string[];
  scope: "all" | "selected";
  module: string;
}

export interface ExportColumnDef {
  id: string;
  label: string;
  description?: string;
}

interface GenericExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRowsCount: number;
  initialDateRange?: { from?: Date; to?: Date };
  onExport: (config: GenericExportConfig) => Promise<void>;
  isLoading?: boolean;
  exportModule: string;
  moduleName?: string;
  columns: ExportColumnDef[];
}

export function GenericExportModal({
  open,
  onOpenChange,
  selectedRowsCount,
  initialDateRange,
  onExport,
  isLoading = false,
  exportModule,
  moduleName,
  columns,
}: GenericExportModalProps) {
  // Format selection
  const [format, setFormat] = useState<"excel" | "csv" | "pdf">("excel");
  
  // Scope selection
  const [scope, setScope] = useState<"all" | "selected">(
    selectedRowsCount > 0 ? "selected" : "all"
  );

  // Date Range state
  const [fromDate, setFromDate] = useState<string>(
    initialDateRange?.from ? initialDateRange.from.toISOString().split("T")[0] : ""
  );
  const [toDate, setToDate] = useState<string>(
    initialDateRange?.to ? initialDateRange.to.toISOString().split("T")[0] : ""
  );

  // Selected Columns state (default: all checked)
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columns.map((col) => col.id)
  );

  // Toggle single column
  const handleToggleColumn = (colId: string) => {
    setSelectedColumns((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
    );
  };

  // Select all columns
  const handleSelectAll = () => {
    setSelectedColumns(columns.map((col) => col.id));
  };

  // Deselect all columns
  const handleDeselectAll = () => {
    setSelectedColumns([]);
  };

  // Date Presets
  const applyPreset = (preset: "today" | "last7" | "last30" | "thisMonth" | "all") => {
    const today = new Date();
    if (preset === "all") {
      setFromDate("");
      setToDate("");
      return;
    }

    if (preset === "today") {
      const dateStr = today.toISOString().split("T")[0];
      setFromDate(dateStr);
      setToDate(dateStr);
      return;
    }

    if (preset === "last7") {
      const past = new Date();
      past.setDate(today.getDate() - 7);
      setFromDate(past.toISOString().split("T")[0]);
      setToDate(today.toISOString().split("T")[0]);
      return;
    }

    if (preset === "last30") {
      const past = new Date();
      past.setDate(today.getDate() - 30);
      setFromDate(past.toISOString().split("T")[0]);
      setToDate(today.toISOString().split("T")[0]);
      return;
    }

    if (preset === "thisMonth") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setFromDate(firstDay.toISOString().split("T")[0]);
      setToDate(today.toISOString().split("T")[0]);
      return;
    }
  };

  const handleDownload = async () => {
    if (selectedColumns.length === 0) {
      return;
    }

    await onExport({
      format,
      startDate: fromDate || undefined,
      endDate: toDate || undefined,
      columns: selectedColumns,
      scope,
      module: exportModule,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-600" />
            Export {moduleName || exportModule} Data
          </DialogTitle>
          <DialogDescription>
            Customize your data export format, filters, and specific columns.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Export Scope (if rows are selected) */}
          {selectedRowsCount > 0 && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                You have <Badge variant="secondary" className="bg-emerald-200 text-emerald-900 font-bold">{selectedRowsCount}</Badge> record(s) selected in table.
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={scope === "selected" ? "default" : "outline"}
                  className={scope === "selected" ? "bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7" : "text-xs h-7"}
                  onClick={() => setScope("selected")}
                >
                  Selected ({selectedRowsCount})
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={scope === "all" ? "default" : "outline"}
                  className={scope === "all" ? "bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7" : "text-xs h-7"}
                  onClick={() => setScope("all")}
                >
                  All Filtered
                </Button>
              </div>
            </div>
          )}

          {/* Format Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              1. Choose Export Format
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormat("excel")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
                  format === "excel"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 ring-2 ring-emerald-600/20"
                    : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 mb-1.5 text-emerald-600 dark:text-emerald-400" />
                <span>Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat("csv")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
                  format === "csv"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 ring-2 ring-emerald-600/20"
                    : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <FileType className="w-5 h-5 mb-1.5 text-blue-600 dark:text-blue-400" />
                <span>CSV (.csv)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
                  format === "pdf"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 ring-2 ring-emerald-600/20"
                    : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <FileText className="w-5 h-5 mb-1.5 text-red-600 dark:text-red-400" />
                <span>PDF Document</span>
              </button>
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. Select Date Range</span>
              </Label>
              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[11px] text-gray-600 hover:text-emerald-700"
                  onClick={() => applyPreset("all")}
                >
                  All Time
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[11px] text-gray-600 hover:text-emerald-700"
                  onClick={() => applyPreset("today")}
                >
                  Today
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[11px] text-gray-600 hover:text-emerald-700"
                  onClick={() => applyPreset("last7")}
                >
                  Last 7 Days
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[11px] text-gray-600 hover:text-emerald-700"
                  onClick={() => applyPreset("last30")}
                >
                  Last 30 Days
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[11px] text-gray-600 hover:text-emerald-700"
                  onClick={() => applyPreset("thisMonth")}
                >
                  This Month
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Start Date (From)</label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-9 text-xs border-gray-300 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">End Date (To)</label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-9 text-xs border-gray-300 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Column Customizer */}
          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-emerald-600" />
                  <span>3. Select Included Columns</span>
                </Label>
                <Badge variant="outline" className="text-[10px] font-mono border-emerald-300 text-emerald-700 dark:text-emerald-300">
                  {selectedColumns.length} / {columns.length} Selected
                </Badge>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-6 px-2 text-[11px] text-emerald-700 hover:bg-emerald-50 flex items-center gap-1"
                >
                  <CheckSquare className="w-3 h-3" />
                  <span>Select All</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDeselectAll}
                  className="h-6 px-2 text-[11px] text-gray-500 hover:bg-gray-100 flex items-center gap-1"
                >
                  <Square className="w-3 h-3" />
                  <span>Deselect All</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50/70 dark:bg-gray-800/40 p-3 rounded-lg border border-gray-200/80 dark:border-gray-700/60 max-h-48 overflow-y-auto">
              {columns.map((col) => {
                const isChecked = selectedColumns.includes(col.id);
                return (
                  <label
                    key={col.id}
                    onClick={() => handleToggleColumn(col.id)}
                    className={`flex items-start gap-2.5 p-2 rounded cursor-pointer transition-colors ${
                      isChecked
                        ? "bg-white dark:bg-gray-800 shadow-2xs border border-emerald-200 dark:border-emerald-900/60"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800/60 opacity-60"
                    }`}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => handleToggleColumn(col.id)}
                      className="mt-0.5 border-gray-400 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                        {col.label}
                      </span>
                      {col.description && (
                        <span className="text-[10px] text-gray-500 truncate">
                          {col.description}
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
            {selectedColumns.length === 0 && (
              <p className="text-xs text-red-500 font-medium">
                * Please select at least one column to export.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-gray-100 dark:border-gray-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDownload}
            disabled={isLoading || selectedColumns.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Export...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download {format.toUpperCase()}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
