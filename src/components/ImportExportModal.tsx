import React, { useRef, useState } from "react";
import { Download, Upload, X, AlertTriangle, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import { GolfBall } from "../types";

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: (data: any) => Promise<void>;
  onDeleteBag?: () => void;
  hasBagItems?: boolean;
}

export default function ImportExportModal({ isOpen, onClose, onExport, onImport, onDeleteBag, hasBagItems }: ImportExportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsImporting(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      // Basic validation
      if (!Array.isArray(data)) {
        throw new Error("Invalid format: The backup file must contain an array of items.");
      }

      await onImport(data);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to parse the backup file.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
            >
          <X size={20} weight="bold" />
        </button>

        <h2 className="text-xl font-sans font-black uppercase tracking-wider text-white mb-2">Data Management</h2>
        <p className="text-sm text-neutral-400 mb-8">
          Backup or restore your locker inventory. Importing data will merge with your existing items.
        </p>

        <div className="space-y-4">
          <button
            onClick={onExport}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-blue-500/50 transition-colors group text-left"
          >
            <div>
              <div className="font-bold text-white text-sm uppercase tracking-wider">Export Backup</div>
              <div className="text-xs text-neutral-500 mt-1">Download an Excel (.xlsx) file of your current bag.</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-black transition-colors shrink-0">
              <Download size={20} weight="bold" />
            </div>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-pink-500/50 transition-colors group text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div>
              <div className="font-bold text-white text-sm uppercase tracking-wider">Import Data</div>
              <div className="text-xs text-neutral-500 mt-1">Select a previously exported .xlsx backup.</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center group-hover:bg-pink-500 group-hover:text-black transition-colors shrink-0">
              <Upload size={20} weight="bold" />
            </div>
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept=".xlsx,.xls" 
            className="hidden" 
          />
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2">
            <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" weight="fill" />
            <span className="text-xs text-rose-400 font-mono">{error}</span>
          </div>
        )}

        {/* Delete Bag Section */}
        <div className="pt-6 mt-6 border-t border-neutral-800">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={!hasBagItems}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-rose-950/10 border border-rose-950/50 hover:border-rose-500/50 hover:bg-rose-950/30 transition-colors group text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div>
              <div className="font-bold text-rose-500 text-sm uppercase tracking-wider">Delete My Bag</div>
              <div className="text-xs text-rose-500/60 mt-1">Permanently wipe all your inventory.</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-black transition-colors shrink-0">
              <Trash2 size={20} weight="bold" />
            </div>
          </button>
        </div>
      </motion.div>

      {/* Delete Bag Confirmation Modal */}
      <AnimatePresence>
      {showDeleteConfirm && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 10 }}
            className="bg-neutral-900 border border-rose-900/50 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl relative"
          >
            <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto animate-pulse" />
            <h4 className="text-white font-sans font-black text-base uppercase tracking-wider">
              Delete My Bag
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed font-mono">
              Are you absolutely sure you want to permanently delete all items in your bag? This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-6 pt-2 w-full">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 px-3 bg-neutral-950 border border-neutral-800 hover:bg-neutral-900 text-neutral-400 font-mono text-[10px] uppercase font-bold tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteBag?.();
                  setShowDeleteConfirm(false);
                  onClose();
                }}
                className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-mono text-[10px] uppercase font-extrabold tracking-wider rounded-xl transition-all cursor-pointer border-none"
              >
                Yes, Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
    )}
    </AnimatePresence>
  );
}
