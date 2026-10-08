"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Database,
  ArrowRight,
  Sparkles,
  Server,
} from "lucide-react";
import {
  wfpMarketService,
  WfpUploadResponse,
} from "@/app/services/wfpMarketService";

interface UploadWfpCsvModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadWfpCsvModal({
  open,
  onClose,
  onSuccess,
}: UploadWfpCsvModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<WfpUploadResponse["data"] | null>(
    null
  );
  const [importMode, setImportMode] = useState<"file" | "server">("file");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setUploading(false);
    setProgress(0);
    setError(null);
    setUploadResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    if (uploading) return;
    resetState();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
        setError("Please select a valid CSV (.csv) file");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (!droppedFile.name.toLowerCase().endsWith(".csv")) {
        setError("Please select a valid CSV (.csv) file");
        return;
      }
      setFile(droppedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      let res: WfpUploadResponse;
      if (importMode === "server") {
        res = await wfpMarketService.importLocalCsv();
      } else {
        if (!file) {
          setError("Please select a CSV file to upload");
          setUploading(false);
          return;
        }
        res = await wfpMarketService.uploadCsv(file, (p) => setProgress(p));
      }

      setUploadResult(res.data);
      onSuccess();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to ingest CSV dataset"
      );
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-xl w-full overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-gray-900">
                  Upload WFP Market Prices CSV
                </h2>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Isolated WFP Rwanda historical food security dataset ingestion
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={uploading}
              aria-label="Close modal"
              className="w-7 h-7 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all disabled:opacity-50 mt-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Isolation Guarantee Notice */}
            <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-green-800">
                <strong className="font-bold text-green-900">Isolated External Data:</strong> This ingestion pipeline stores records strictly in the external WFP surveillance repository. It does not overwrite, mutate, or merge into FoodBundles internal product catalog or local benchmark markets.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}

            {uploadResult ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 py-1"
              >
                <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-green-900">
                      WFP Dataset Successfully Ingested!
                    </h4>
                    <p className="text-xs text-green-700 mt-0.5">
                      Surveillance records have been saved into the isolated external database store.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Processed Records
                    </p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {uploadResult.insertedCount.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      out of {uploadResult.totalRows.toLocaleString()} rows
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Markets Surveillance
                    </p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {uploadResult.marketsDiscovered}
                    </p>
                    <p className="text-[11px] text-green-600 font-medium mt-0.5">
                      Indexed in WFP store
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 col-span-2 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Ingestion Speed
                      </p>
                      <p className="text-xs font-semibold text-gray-800 mt-0.5">
                        Completed in {uploadResult.durationSeconds} seconds
                      </p>
                    </div>
                    <Sparkles className="w-4 h-4 text-green-600" />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleClose}
                    className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-bold text-xs hover:bg-green-700 transition flex items-center gap-1.5 shadow-sm"
                  >
                    View Visualizations <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Import Mode Tabs */}
                <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setImportMode("file")}
                    disabled={uploading}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                      importMode === "file"
                        ? "bg-white text-gray-900 shadow-sm font-bold"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMode("server")}
                    disabled={uploading}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                      importMode === "server"
                        ? "bg-white text-gray-900 shadow-sm font-bold"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <Server className="w-3.5 h-3.5" />
                    Server File (Direct)
                  </button>
                </div>

                {importMode === "file" ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                      isDragging
                        ? "border-green-500 bg-green-50/50"
                        : file
                        ? "border-green-400 bg-green-50/20"
                        : "border-gray-200 hover:border-green-400 bg-gray-50/50"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    {file ? (
                      <div className="space-y-0.5">
                        <p className="font-bold text-xs text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to import
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <p className="font-semibold text-xs text-gray-800">
                          Click to browse or drag & drop CSV here
                        </p>
                        <p className="text-[11px] text-gray-400">
                          Format: wfp_food_prices_rwa.csv (up to 100MB)
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                    <div className="flex items-center gap-2 text-gray-900 text-xs font-bold">
                      <Database className="w-4 h-4 text-green-600" />
                      Direct Server Import
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Imports directly from the local file path:
                      <br />
                      <code className="text-[11px] font-mono bg-white px-2 py-1 rounded border border-gray-200 mt-1 inline-block text-gray-800 break-all">
                        C:\Users\muvunyi\Documents\FOODBUNDLES\wfp_food_prices_rwa.csv
                      </code>
                    </p>
                  </div>
                )}

                {/* Progress Bar */}
                {uploading && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-green-600" />
                        Processing & Indexing Database...
                      </span>
                      <span className="font-bold text-green-700">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-green-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress || 100}%` }}
                        transition={{ ease: "easeInOut" }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={uploading}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-xl border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading || (importMode === "file" && !file)}
                    className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-bold text-xs hover:bg-green-700 transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Importing Dataset...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5" />
                        Start Ingestion
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
