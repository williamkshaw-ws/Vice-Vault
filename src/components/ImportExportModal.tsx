import React, { useRef, useState } from "react";
import { Download, Upload, X, AlertTriangle } from "lucide-react";
import { GolfBall } from "../types";

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: (data: any) => Promise<void>;
}

export default function ImportExportModal({ isOpen, onClose, onExport, onImport }: ImportExportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsImporting(true);

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
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
              <div className="text-xs text-neutral-500 mt-1">Download a slim JSON file of your current bag.</div>
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
              <div className="text-xs text-neutral-500 mt-1">Select a previously exported JSON backup.</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center group-hover:bg-pink-500 group-hover:text-black transition-colors shrink-0">
              <Upload size={20} weight="bold" />
            </div>
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept=".json" 
            className="hidden" 
          />
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2">
            <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" weight="fill" />
            <span className="text-xs text-rose-400 font-mono">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
