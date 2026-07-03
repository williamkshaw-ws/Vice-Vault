import React, { useState, useMemo } from "react";
import { PlusSquare, FileSpreadsheet, Pencil, Trash2, X } from "lucide-react";
import BallVisual from "./BallVisual";
import AddMissingBallForm from "./AddMissingBallForm";
import SearchInput from "./SearchInput";
import { CatalogItem } from "../types";

const XlsImporter = React.lazy(() => import("./XlsImporter"));

interface VaultManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isVaultProcessing: boolean;
  catalog: CatalogItem[];
  registeredModels: string[];
  handleAddCatalogItem: (item: Omit<CatalogItem, "id">) => void;
  handleUpdateCatalogItem: (id: string, updates: Partial<CatalogItem>) => void;
  handleDeleteCatalogItem: (id: string) => void;
  handleXlsImportCatalogItems: (items: any[]) => void;
  handleExportCatalogToExcel: () => void;
  handleDeleteAllCatalog: () => void;
}

export default function VaultManagerModal({
  isOpen,
  onClose,
  isVaultProcessing,
  catalog,
  registeredModels,
  handleAddCatalogItem,
  handleUpdateCatalogItem,
  handleDeleteCatalogItem,
  handleXlsImportCatalogItems,
  handleExportCatalogToExcel,
  handleDeleteAllCatalog
}: VaultManagerModalProps) {
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [adminBrandFilter, setAdminBrandFilter] = useState("ALL");
  const [showXlsImporter, setShowXlsImporter] = useState(false);
  const [showDeleteAllCatalogConfirm, setShowDeleteAllCatalogConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleClose = () => {
    setEditingItem(null);
    setAdminSearchQuery("");
    setAdminBrandFilter("ALL");
    setShowXlsImporter(false);
    onClose();
  };

  const filteredCatalog = useMemo(() => {
    return catalog.filter(item => {
      const q = adminSearchQuery.toLowerCase();
      const matchesSearch = 
        item.model.toLowerCase().includes(q) || 
        item.color.toLowerCase().includes(q) ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.variation && item.variation.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q)) ||
        (item.year && item.year.toLowerCase().includes(q));

      const matchesBrand = 
        adminBrandFilter === "ALL" || 
        item.model === adminBrandFilter;

      return matchesSearch && matchesBrand;
    });
  }, [catalog, adminSearchQuery, adminBrandFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-5 border-b border-neutral-800 bg-neutral-950/60">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent"></span>
              Vault Manager
            </h2>
            <p className="text-[10px] text-neutral-400 mt-0.5 font-mono">
              Prune and edit existing designs to prevent duplicate similar entries.
            </p>
          </div>
          <button 
            disabled={isVaultProcessing}
            onClick={handleClose}
            className={`p-1 rounded-lg transition-all ${
              isVaultProcessing
                ? "text-neutral-750 cursor-not-allowed"
                : "text-neutral-400 hover:text-white hover:bg-neutral-850 cursor-pointer"
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6 relative" id="register-missing-database-panel">
          {isVaultProcessing && (
            <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4 animate-fade-in p-6">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-center space-y-1">
                <h3 className="text-white text-xs font-black uppercase tracking-wider">Syncing with the Ball Vault</h3>
                <p className="text-[10px] text-neutral-400 font-mono">Please keep this window open while we commit database changes...</p>
              </div>
            </div>
          )}
          {/* Inner admin toggle buttons */}
          <div className="flex gap-2 p-1 bg-neutral-950/60 border border-neutral-850 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setShowXlsImporter(false);
                setEditingItem(null);
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !showXlsImporter
                  ? "bg-neutral-900 text-accent border border-neutral-800"
                  : "text-neutral-550 hover:text-neutral-350"
              }`}
            >
              <PlusSquare className="w-3.5 h-3.5 text-accent" />
              <span>Single Form</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowXlsImporter(true);
                setEditingItem(null);
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                showXlsImporter
                  ? "bg-neutral-900 text-accent border border-neutral-800"
                  : "text-neutral-550 hover:text-neutral-350"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Excel / XLS Bulk</span>
            </button>
          </div>

          {!showXlsImporter ? (
            <AddMissingBallForm 
              catalog={catalog}
              onAddCatalogItem={handleAddCatalogItem} 
              onUpdateCatalogItem={(id, updates) => {
                handleUpdateCatalogItem(id, updates);
                setEditingItem(null); // Clear editing state after update
              }}
              editItem={editingItem}
              onCancelEdit={() => setEditingItem(null)}
            />
          ) : (
          <React.Suspense fallback={<div className="p-8 text-center text-neutral-500 font-mono text-xs">Loading importer...</div>}>
            <XlsImporter onImportItems={(items) => {
              handleXlsImportCatalogItems(items);
              setShowXlsImporter(false); // Return to form after import
            }} />
          </React.Suspense>
          )}

          {/* Registry Manager List Header */}
          <div className="border-t border-neutral-800 pt-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-sans font-black text-white text-xs uppercase tracking-wider text-accent font-extrabold">
                  Existing Catalog
                </h4>
                <p className="text-[10px] text-neutral-400">
                  Search and manage balls that are already in the vault
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-[9px] bg-neutral-950 border border-neutral-850 text-neutral-400 px-2 py-0.5 rounded font-mono">
                  {catalog.length} BALLS
                </span>
                <div className="flex items-center gap-1.5">
                  {catalog.length > 0 && (
                    <button
                      type="button"
                      onClick={handleExportCatalogToExcel}
                      className="text-[9px] font-mono text-neutral-400 hover:text-emerald-450 border border-neutral-850 hover:border-emerald-950/40 bg-neutral-950/30 px-2 py-0.5 rounded transition-all cursor-pointer flex items-center gap-1"
                    >
                      <FileSpreadsheet className="w-3 h-3 text-emerald-450" /> Export
                    </button>
                  )}
                  {catalog.length > 0 && (
                    showDeleteAllCatalogConfirm ? (
                      <div className="flex items-center gap-1 bg-rose-950/30 border border-rose-900/60 rounded-md p-0.5 animate-pulse">
                        <span className="text-[9px] font-mono text-rose-300 px-1 uppercase font-bold">Wipe?</span>
                        <button
                          type="button"
                          onClick={() => {
                            handleDeleteAllCatalog();
                            setShowDeleteAllCatalogConfirm(false);
                          }}
                          className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-500 text-white text-[9px] font-mono rounded font-bold cursor-pointer transition-all"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteAllCatalogConfirm(false)}
                          className="px-1 text-[9px] font-mono text-neutral-400 hover:text-white rounded cursor-pointer transition-all"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowDeleteAllCatalogConfirm(true)}
                        className="text-[9px] font-mono text-neutral-500 hover:text-rose-400 border border-neutral-850 hover:border-rose-950/40 bg-neutral-950/30 px-1.5 py-0.5 rounded transition-all cursor-pointer"
                      >
                        Delete All
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Admin filter input & Model filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <SearchInput
                  value={adminSearchQuery}
                  onChange={setAdminSearchQuery}
                  placeholder="Search database..."
                  className="font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono uppercase text-neutral-450 shrink-0">Filter model:</span>
                <div className="relative w-full sm:w-[180px]">
                  <select
                    value={adminBrandFilter}
                    onChange={(e) => setAdminBrandFilter(e.target.value)}
                    className="w-full bg-neutral-950 text-neutral-300 border border-neutral-850 hover:border-neutral-750 focus:border-accent rounded-xl px-3 py-1.5 text-xs font-semibold outline-none transition-all cursor-pointer appearance-none pr-8 font-mono uppercase tracking-wider"
                  >
                    <option value="ALL">All Varieties</option>
                    {registeredModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-550">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin items list */}
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 font-sans">
              {filteredCatalog.map((item) => (
                  <div 
                    key={item.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      editingItem?.id === item.id 
                        ? "bg-neutral-900 border-accent" 
                        : "bg-neutral-950/60 hover:bg-neutral-900/80 border-neutral-850"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-8 h-8 rounded-full bg-black/40 border border-neutral-950 flex items-center justify-center shrink-0 overflow-hidden">
                        <BallVisual 
                          color={item.color} 
                          model={item.model} 
                          size="sm" 
                          className="!w-8 !h-8 shadow-none border-none" 
                          customImage={item.customImage} 
                          customImageSleeve={item.customImageSleeve}
                          customImageBox={item.customImageBox}
                        />
                      </span>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h5 className="font-bold text-xs text-white truncate max-w-[120px] md:max-w-[160px]">
                            {item.model}{item.name ? ` - ${item.name}` : ''}
                          </h5>
                          {item.year && (
                            <span className="text-[9px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-450 px-1.5 py-0.5 rounded leading-none scale-90 select-none">
                              {item.year}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-400 truncate mt-0.5 flex flex-wrap gap-x-2 items-center">
                          <span className="font-medium text-neutral-300">{item.color}</span>
                          {(item.variation || item.notes) && (
                            <>
                              <span className="text-neutral-600 font-mono select-none">•</span>
                              <span className="text-neutral-400 italic text-[10px] truncate max-w-[150px] md:max-w-[280px]" title={
                                item.variation || item.notes
                              }>
                                {item.variation || item.notes}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {deleteConfirmId === item.id ? (
                        <div className="flex items-center gap-1 bg-rose-950/40 border border-rose-900/60 rounded-md p-0.5 animate-pulse">
                          <button
                            type="button"
                            onClick={() => {
                              handleDeleteCatalogItem(item.id);
                              setDeleteConfirmId(null);
                            }}
                            className="py-1 px-1.5 text-[9px] font-mono font-black uppercase text-rose-400 hover:text-white rounded transition-all cursor-pointer"
                            title="Confirm delete specification"
                          >
                            Delete?
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-1 text-[9px] text-neutral-400 hover:text-white rounded transition-all cursor-pointer font-bold"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setShowXlsImporter(false); // force switch to form
                              setEditingItem(item);
                              // Smoothly scroll to top of database panel inside the modal
                              const el = document.getElementById("register-missing-database-panel");
                              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                            }}
                            className="p-1 px-2 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-850 hover:border-neutral-750 text-accent hover:text-white transition-colors flex items-center gap-1 text-[10px] font-mono font-black shrink-0 cursor-pointer"
                            title="Edit Entry Specs"
                          >
                            <Pencil size={11} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1 rounded-md bg-neutral-900 hover:bg-rose-950/50 border border-neutral-850 hover:border-rose-900 text-neutral-555 hover:text-rose-455 transition-colors cursor-pointer"
                            title="Delete Specification"
                          >
                            <Trash2 size={11} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}

              {catalog.length === 0 ? (
                <div className="py-8 px-4 text-center border border-dashed border-neutral-850 rounded-xl bg-neutral-950/10 text-neutral-500 text-xs">
                  Ball Vault list is empty. Create some above or use Excel Bulk Import!
                </div>
              ) : (
                filteredCatalog.length === 0 && (
                  <div className="py-6 text-center border border-dashed border-neutral-850 rounded-xl bg-neutral-950/10 text-neutral-500 text-xs">
                    No balls match "{adminSearchQuery}"{adminBrandFilter !== "ALL" && ` under model "${adminBrandFilter}"`}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
