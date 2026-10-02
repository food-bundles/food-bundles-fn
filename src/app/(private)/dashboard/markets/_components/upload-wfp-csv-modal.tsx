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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-xl w-full overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white relative">
            <button
              onClick={handleClose}
              disabled={uploading}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black">Upload WFP Market Prices CSV</h3>
                <p className="text-xs text-gray-300">
                  Isolated WFP Rwanda historical food security dataset ingestion
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Isolation Guarantee Notice */}
            <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="font-black">Isolated External Data:</strong> This ingestion pipeline stores records strictly in the external WFP surveillance repository. It does not overwrite, mutate, or merge into FoodBundles internal product catalog or local benchmark markets.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}

            {uploadResult ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 py-2"
              >
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">
                      WFP Dataset Successfully Ingested!
                    </h4>
                    <p className="text-xs text-emerald-700">
                      Surveillance records have been saved into the isolated external database store.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Processed Records
                    </p>
                    <p className="text-xl font-black text-slate-900 mt-1">
                      {uploadResult.insertedCount.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      out of {uploadResult.totalRows.toLocaleString()} rows
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Markets Surveillance
                    </p>
                    <p className="text-xl font-black text-slate-900 mt-1">
                      {uploadResult.marketsDiscovered}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-medium">
                      Indexed in WFP store
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 col-span-2 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        Ingestion Speed
                      </p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        Completed in {uploadResult.durationSeconds} seconds
                      </p>
                    </div>
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleClose}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition flex items-center gap-2"
                  >
                    View Visualizations <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Import Mode Tabs */}
                <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-2xl gap-1">
                  <button
                    type="button"
                    onClick={() => setImportMode("file")}
                    disabled={uploading}
                    className={`py-2 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                      importMode === "file"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-gray-500 hover:text-slate-900"
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMode("server")}
                    disabled={uploading}
                    className={`py-2 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                      importMode === "server"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-gray-500 hover:text-slate-900"
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
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                      isDragging
                        ? "border-emerald-500 bg-emerald-50/50"
                        : file
                        ? "border-emerald-400 bg-slate-50"
                        : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="p-3.5 rounded-full bg-emerald-100 text-emerald-700">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    {file ? (
                      <div className="space-y-1">
                        <p className="font-bold text-sm text-slate-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to
                          import
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="font-bold text-sm text-slate-800">
                          Click to browse or drag & drop CSV here
                        </p>
                        <p className="text-xs text-gray-400">
                          Format: wfp_food_prices_rwa.csv (up to 100MB)
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-slate-800 text-xs font-bold">
                      <Database className="w-4 h-4 text-emerald-600" />
                      Direct Server Import
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Imports directly from the local file path:
                      <br />
                      <code className="text-[11px] font-mono bg-white px-2 py-1 rounded border border-gray-200 mt-1 inline-block text-slate-700">
                        C:\Users\muvunyi\Documents\FOODBUNDLES\wfp_food_prices_rwa.csv
                      </code>
                    </p>
                  </div>
                )}

                {/* Progress Bar */}
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                        Processing & Indexing Database...
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-emerald-600 rounded-full"
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
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-slate-900 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading || (importMode === "file" && !file)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Importing Dataset...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
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
