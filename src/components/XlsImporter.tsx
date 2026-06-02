/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { CatalogItem } from "../types";
import { FileSpreadsheet, Upload, Check, AlertCircle, Info, ArrowRight, Trash2 } from "lucide-react";

interface XlsImporterProps {
  onImportItems: (items: Omit<CatalogItem, "id">[]) => void;
}

interface TempImportRow {
  model: string;
  name: string;
  color: string;
  variation: string;
  groupColor?: boolean;
  groupVariation?: boolean;
  customImage?: string;
  customImageSleeve?: string;
  customImageBox?: string;
  bundleItems?: { catalogId: string; qty: number }[];
}

export default function XlsImporter({ onImportItems }: XlsImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<TempImportRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<{
    model: string;
    name: string;
    color: string;
    variation: string;
  }>({
    model: "",
    name: "",
    color: "",
    variation: "",
  });
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetImporter = () => {
    setFile(null);
    setParsedRows([]);
    setHeaders([]);
    setColumnMapping({ model: "", name: "", color: "", variation: "" });
    setError(null);
    setSuccessCount(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFile = (uploadedFile: File) => {
    setError(null);
    setSuccessCount(null);

    const fileExtension = uploadedFile.name.split(".").pop()?.toLowerCase();
    if (!["xls", "xlsx", "csv"].includes(fileExtension || "")) {
      setError("Unsupported file format. Please upload an Excel (.xls, .xlsx) or CSV (.csv) spreadsheet.");
      return;
    }

    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        
        if (workbook.SheetNames.length === 0) {
          setError("The spreadsheet appears to be empty.");
          return;
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert worksheet to raw json with headers
        const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
        
        if (rawJson.length === 0) {
          setError("No data found inside the first sheet.");
          return;
        }

        // Get all unique keys/headers in the spreadsheet
        const detectedHeaders = Array.from(
          new Set(rawJson.flatMap((row) => Object.keys(row)))
        );
        setHeaders(detectedHeaders);

        // Smart column mapping auto-detection
        let detectedModelCol = "";
        let detectedNameCol = "";
        let detectedColorCol = "";
        let detectedVariationCol = "";

        detectedHeaders.forEach((h) => {
          const lh = h.toLowerCase();
          if (lh === "model" || lh.includes("brand") || lh === "ball" || lh === "title") {
            if (!detectedModelCol) detectedModelCol = h;
          }
          if (lh === "name" || lh.includes("label") || lh.includes("design name")) {
            if (!detectedNameCol) detectedNameCol = h;
          }
          if (lh.includes("color") || lh.includes("finish") || lh.includes("shade") || lh.includes("style")) {
            if (!detectedColorCol) detectedColorCol = h;
          }
          if (lh.includes("variation") || lh.includes("type") || lh.includes("subcolor")) {
            if (!detectedVariationCol) detectedVariationCol = h;
          }
        });

        // Fallbacks if no match discovered
        if (!detectedModelCol && detectedHeaders.length > 0) detectedModelCol = detectedHeaders[0];
        if (!detectedNameCol) {
          const found = detectedHeaders.find(h => h.toLowerCase() === "name");
          detectedNameCol = found || "";
        }
        if (!detectedColorCol) {
          const found = detectedHeaders.find(h => h.toLowerCase() === "color");
          detectedColorCol = found || "";
        }
        if (!detectedVariationCol) {
          const found = detectedHeaders.find(h => h.toLowerCase() === "variation");
          detectedVariationCol = found || "";
        }

        setColumnMapping({
          model: detectedModelCol,
          name: detectedNameCol,
          color: detectedColorCol,
          variation: detectedVariationCol,
        });

        // Store rows for previewing
        processRows(
          rawJson,
          detectedModelCol,
          detectedNameCol,
          detectedColorCol,
          detectedVariationCol
        );

      } catch (err: any) {
        setError(`Failed to read spreadsheet file: ${err.message || err}`);
      }
    };

    reader.readAsArrayBuffer(uploadedFile);
  };

  const processRows = (
    rawJson: Record<string, any>[],
    modelCol: string,
    nameCol: string,
    colorCol: string,
    variationCol: string
  ) => {
    const formatted: TempImportRow[] = rawJson
      .map((row) => {
        const mVal = row[modelCol] !== undefined && row[modelCol] !== null ? String(row[modelCol]).trim() : "";
        const nameVal = nameCol && row[nameCol] !== undefined && row[nameCol] !== null ? String(row[nameCol]).trim() : "";
        const cVal = row[colorCol] !== undefined && row[colorCol] !== null ? String(row[colorCol]).trim() : "";
        const varVal = variationCol && row[variationCol] !== undefined && row[variationCol] !== null ? String(row[variationCol]).trim() : "";

        // Reconstruct ball image chunks
        let customImage = "";
        const ballKeys = Object.keys(row)
          .filter((k) => k.toLowerCase().startsWith("ball image") || k.toLowerCase().startsWith("ballimage"))
          .sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, ""), 10) || 0;
            const numB = parseInt(b.replace(/\D/g, ""), 10) || 0;
            return numA - numB;
          });
        ballKeys.forEach((k) => {
          if (row[k]) customImage += String(row[k]);
        });

        // Reconstruct sleeve image chunks
        let customImageSleeve = "";
        const sleeveKeys = Object.keys(row)
          .filter((k) => k.toLowerCase().startsWith("sleeve image") || k.toLowerCase().startsWith("sleeveimage"))
          .sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, ""), 10) || 0;
            const numB = parseInt(b.replace(/\D/g, ""), 10) || 0;
            return numA - numB;
          });
        sleeveKeys.forEach((k) => {
          if (row[k]) customImageSleeve += String(row[k]);
        });

        // Reconstruct box image chunks
        let customImageBox = "";
        const boxKeys = Object.keys(row)
          .filter((k) => k.toLowerCase().startsWith("box image") || k.toLowerCase().startsWith("boximage"))
          .sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, ""), 10) || 0;
            const numB = parseInt(b.replace(/\D/g, ""), 10) || 0;
            return numA - numB;
          });
        boxKeys.forEach((k) => {
          if (row[k]) customImageBox += String(row[k]);
        });

        const parseBool = (val: any) => {
          if (val === undefined || val === null) return false;
          const s = String(val).trim().toUpperCase();
          return s === "TRUE" || s === "T" || s === "1" || s === "YES" || s === "Y";
        };

        let groupColor = false;
        const colorGroupKey = Object.keys(row).find(k => {
          const lk = k.toLowerCase();
          return lk.includes("group") && lk.includes("color");
        });
        if (colorGroupKey) {
          groupColor = parseBool(row[colorGroupKey]);
        }

        let groupVariation = false;
        const varGroupKey = Object.keys(row).find(k => {
          const lk = k.toLowerCase();
          return lk.includes("group") && (lk.includes("var") || lk.includes("version") || lk.includes("v_"));
        });
        if (varGroupKey) {
          groupVariation = parseBool(row[varGroupKey]);
        }

        let bundleItems: any = undefined;
        const bundleKey = Object.keys(row).find(k => k.toLowerCase().includes("bundle data"));
        if (bundleKey && row[bundleKey]) {
          try {
            bundleItems = JSON.parse(String(row[bundleKey]));
          } catch(e) {
            console.error("Failed to parse bundle data for row", row);
          }
        }

        return {
          model: mVal,
          name: nameVal,
          color: cVal,
          variation: varVal,
          groupColor,
          groupVariation,
          customImage: customImage || undefined,
          customImageSleeve: customImageSleeve || undefined,
          customImageBox: customImageBox || undefined,
          bundleItems
        };
      })
      .filter((row) => row.model.length > 0); // Need at least model name

    setParsedRows(formatted);
  };

  const handleMappingChange = (
    key: "model" | "name" | "color" | "variation",
    selectedHeader: string
  ) => {
    const nextMapping = { ...columnMapping, [key]: selectedHeader };
    setColumnMapping(nextMapping);

    if (file) {
      // Reparse raw excel details with updated user columns mapping
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
          processRows(
            rawJson,
            nextMapping.model,
            nextMapping.name,
            nextMapping.color,
            nextMapping.variation
          );
        } catch (err) {}
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleRowChange = (
    index: number,
    key: "model" | "name" | "color" | "variation",
    value: string
  ) => {
    setParsedRows((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [key]: value } : row))
    );
  };

  const handleRemoveRow = (index: number) => {
    setParsedRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    excelInputRef.current?.click();
  };

  const excelInputRef = useRef<HTMLInputElement>(null);

  const executeImport = () => {
    if (parsedRows.length === 0) return;

    // Convert fully to proper catalog template objects
    const itemsToImport: Omit<CatalogItem, "id">[] = parsedRows.map((row) => {
      const item: Omit<CatalogItem, "id"> = {
        model: row.model.trim().toUpperCase(),
        name: row.name.trim() || undefined,
        color: row.color.trim(),
        variation: row.variation.trim() || undefined,
        groupColor: row.groupColor,
        groupVariation: row.groupVariation,
        customImage: row.customImage,
        customImageSleeve: row.customImageSleeve,
        customImageBox: row.customImageBox,
        bundleItems: row.bundleItems
      };

      return item;
    });

    onImportItems(itemsToImport);
    setSuccessCount(itemsToImport.length);
    setParsedRows([]);
    setFile(null);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-850 p-5 rounded-2xl relative overflow-hidden space-y-4">
      {/* Decorative gradient border */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-lime-500 to-teal-500" />

      <div className="flex items-center gap-2">
        <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
        <h3 className="font-sans font-black text-white text-sm uppercase tracking-wider">
          Import Balls from Spreadsheet
        </h3>
      </div>

      <p className="text-xs text-neutral-400 leading-relaxed">
        Batch register your custom catalog designs instantly using an Excel <code className="text-lime-400 font-mono text-[11px]">.xlsx</code>, <code className="text-lime-400 font-mono text-[11px]">.xls</code>, or <code className="text-lime-400 font-mono text-[11px]">.csv</code> list. Upload files directly to populate registry search index matches.
      </p>

      {/* Excel Structure Tip Info Box */}
      <div className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl flex gap-2.5 items-start text-[11px] text-neutral-400">
        <Info className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-neutral-200 block mb-0.5">Expected Column Headers:</span>
          Ideally, include columns like <strong className="text-white font-mono">Model</strong> (e.g. Pro Plus), and <strong className="text-white font-mono">Color</strong> (e.g. Neon Lime Splatter). If named differently, you can map columns manually.
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-900 rounded-xl flex gap-2.5 items-center text-xs text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successCount !== null && (
        <div className="p-4 bg-emerald-950/30 border border-emerald-900/50 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-800">
            <Check className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-wider">Import Completed!</h4>
            <p className="text-xs text-neutral-400 mt-1">
              Successfully imported <strong>{successCount}</strong> custom ball template designs to your Ball Vault index.
            </p>
          </div>
          <button
            onClick={resetImporter}
            className="text-[10px] font-mono text-neutral-400 hover:text-white uppercase tracking-widest underline mt-2"
          >
            Import Another Sheet
          </button>
        </div>
      )}

      {/* Spreadsheet Upload Area */}
      {!file && successCount === null && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            isDragActive
              ? "border-emerald-400 bg-emerald-950/20"
              : "border-neutral-800 bg-neutral-950 hover:bg-neutral-900 hover:border-neutral-700"
          }`}
        >
          <input
            type="file"
            ref={excelInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />
          <Upload className={`w-8 h-8 ${isDragActive ? "text-emerald-400 animate-bounce" : "text-neutral-500"}`} />
          <div className="text-center">
            <p className="text-xs text-neutral-300 font-bold">
              Drag & Drop spreadsheet file, or <span className="text-emerald-400 underline">Browse files</span>
            </p>
            <p className="text-[10px] text-neutral-500 font-mono mt-1">
              Accepts .xlsx, .xls, and .csv files (Auto-maps and reviews)
            </p>
          </div>
        </div>
      )}

      {/* File Parsing Configuration & Alignment */}
      {file && parsedRows.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-neutral-950 border border-neutral-850 rounded-xl">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono text-neutral-500 block">Active Spreadsheet</span>
              <span className="text-xs font-bold text-white truncate block">{file.name}</span>
            </div>
            <button
              onClick={resetImporter}
              className="text-[10px] font-mono text-rose-400 hover:text-rose-350 uppercase cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* Column Mappings Panel */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-450 font-bold block">
              Identify Spreadsheet Columns
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                  Model Name Column:
                </label>
                <select
                  value={columnMapping.model}
                  onChange={(e) => handleMappingChange("model", e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 py-1.5 px-2 rounded-md text-xs text-white outline-none cursor-pointer focus:border-emerald-500"
                >
                  <option value="">-- Ignore / Skip --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                  Ball Name Column:
                </label>
                <select
                  value={columnMapping.name}
                  onChange={(e) => handleMappingChange("name", e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 py-1.5 px-2 rounded-md text-xs text-white outline-none cursor-pointer focus:border-emerald-500"
                >
                  <option value="">-- Ignore / Skip --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                  Color / Finish Column:
                </label>
                <select
                  value={columnMapping.color}
                  onChange={(e) => handleMappingChange("color", e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 py-1.5 px-2 rounded-md text-xs text-white outline-none cursor-pointer focus:border-emerald-500"
                >
                  <option value="">-- Ignore / Skip --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                  Variation Column:
                </label>
                <select
                  value={columnMapping.variation}
                  onChange={(e) => handleMappingChange("variation", e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 py-1.5 px-2 rounded-md text-xs text-white outline-none cursor-pointer focus:border-emerald-500"
                >
                  <option value="">-- Ignore / Skip --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Pre-Import Items Preview Lists Panel */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider font-bold">
              <span className="text-neutral-400">Review Entries ({parsedRows.length})</span>
              <span className="text-neutral-500">Edit values inline if needed</span>
            </div>

            <div className="max-h-[250px] overflow-y-auto border border-neutral-850 rounded-xl bg-neutral-950/60 divide-y divide-neutral-850 pr-1">
              {parsedRows.map((row, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 gap-2 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
                    <input
                      type="text"
                      value={row.model}
                      onChange={(e) => handleRowChange(idx, "model", e.target.value)}
                      placeholder="Model"
                      className="bg-transparent border-0 font-bold text-white focus:bg-neutral-900 focus:ring-1 focus:ring-emerald-500 rounded py-0.5 px-1 truncate placeholder-neutral-600 outline-none w-full text-xs"
                    />
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => handleRowChange(idx, "name", e.target.value)}
                      placeholder="Name"
                      className="bg-transparent border-0 font-bold text-white focus:bg-neutral-900 focus:ring-1 focus:ring-emerald-500 rounded py-0.5 px-1 truncate placeholder-neutral-600 outline-none w-full text-xs"
                    />
                    <input
                      type="text"
                      value={row.color}
                      onChange={(e) => handleRowChange(idx, "color", e.target.value)}
                      placeholder="Color"
                      className="bg-transparent border-0 text-neutral-300 focus:bg-neutral-900 focus:ring-1 focus:ring-emerald-500 rounded py-0.5 px-1 truncate placeholder-neutral-600 outline-none w-full text-xs"
                    />
                    <input
                      type="text"
                      value={row.variation}
                      onChange={(e) => handleRowChange(idx, "variation", e.target.value)}
                      placeholder="Variation"
                      className="bg-transparent border-0 text-neutral-400 focus:bg-neutral-900 focus:ring-1 focus:ring-emerald-500 rounded py-0.5 px-1 truncate placeholder-neutral-600 outline-none w-full text-xs"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveRow(idx)}
                    className="p-1 text-neutral-500 hover:text-rose-400 hover:bg-rose-950/20 rounded transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Batch submission trigger button */}
          <button
            onClick={executeImport}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-mono font-bold text-xs uppercase py-2.5 rounded-lg flex items-center justify-center gap-2 tracking-widest cursor-pointer transition-all shadow-lg shadow-emerald-500/10"
          >
            <span>Confirm Import of {parsedRows.length} Items</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
