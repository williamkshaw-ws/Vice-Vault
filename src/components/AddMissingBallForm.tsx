/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { CatalogItem, BundleItem } from "../types";
import { Plus, Upload, Trash, Sparkles, CheckCircle2, Box } from "lucide-react";

interface AddMissingBallFormProps {
  catalog: CatalogItem[];
  onAddCatalogItem: (newItem: Omit<CatalogItem, "id">) => void;
  onUpdateCatalogItem: (id: string, updatedFields: Partial<CatalogItem>) => void;
  editItem?: CatalogItem | null;
  onCancelEdit?: () => void;
}

export default function AddMissingBallForm({ 
  catalog,
  onAddCatalogItem, 
  onUpdateCatalogItem,
  editItem = null,
  onCancelEdit
}: AddMissingBallFormProps) {
  const [model, setModel] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [variation, setVariation] = useState("");
  const [year, setYear] = useState("");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2012 + 1 }, (_, i) => String(2012 + i));
  const [customImage, setCustomImage] = useState<string | undefined>(undefined);
  const [customImageSleeve, setCustomImageSleeve] = useState<string | undefined>(undefined);
  const [customImageBox, setCustomImageBox] = useState<string | undefined>(undefined);
  const [groupColor, setGroupColor] = useState(false);
  const [groupVariation, setGroupVariation] = useState(false);
  const [isBundle, setIsBundle] = useState(false);
  const [bundleItems, setBundleItems] = useState<BundleItem[]>([]);
  const [bundleSearch, setBundleSearch] = useState("");
  const [bundleModelFilter, setBundleModelFilter] = useState("All Models");
  const [selectedBundleItem, setSelectedBundleItem] = useState<string>("");
  const [bundleItemQty, setBundleItemQty] = useState(1);
  
  // Visual feedback states
  const [isDragActive, setIsDragActive] = useState(false);
  const [success, setSuccess] = useState(false);
  const ballInputRef = useRef<HTMLInputElement>(null);
  const sleeveInputRef = useRef<HTMLInputElement>(null);
  const boxInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (editItem) {
      setModel(editItem.model);
      setName(editItem.name || "");
      setColor(editItem.color);
      setVariation(editItem.variation || editItem.notes || "");
      setYear(editItem.year || "");
      setGroupColor(!!editItem.groupColor);
      setGroupVariation(!!editItem.groupVariation);
      setCustomImage(editItem.customImage);
      setCustomImageSleeve(editItem.customImageSleeve);
      setCustomImageBox(editItem.customImageBox);
      if (editItem.bundleItems && editItem.bundleItems.length > 0) {
        setIsBundle(true);
        setBundleItems(editItem.bundleItems);
      } else {
        setIsBundle(false);
        setBundleItems([]);
      }
    } else {
      setModel("");
      setName("");
      setColor("");
      setVariation("");
      setYear("");
      setGroupColor(false);
      setGroupVariation(false);
      setCustomImage(undefined);
      setCustomImageSleeve(undefined);
      setCustomImageBox(undefined);
      setIsBundle(false);
      setBundleItems([]);
    }
  }, [editItem]);

  const availableModels = Array.from(new Set(catalog.map(c => c.model))).sort();

  const filteredCatalog = catalog.filter(c => {
    if (bundleModelFilter !== "All Models" && c.model !== bundleModelFilter) return false;
    if (!bundleSearch.trim()) return true;
    const searchWords = bundleSearch.toLowerCase().split(/\s+/);
    const combinedStr = `${c.model} ${c.name || ""} ${c.color} ${c.variation || ""}`.toLowerCase();
    return searchWords.every(word => combinedStr.includes(word));
  }).slice(0, 20); // show up to 20 to avoid lag

  const addBundleItem = () => {
    if (!selectedBundleItem) return;
    const existing = bundleItems.find(b => b.catalogId === selectedBundleItem);
    if (existing) {
      setBundleItems(bundleItems.map(b => b.catalogId === selectedBundleItem ? { ...b, qty: b.qty + bundleItemQty } : b));
    } else {
      setBundleItems([...bundleItems, { catalogId: selectedBundleItem, qty: bundleItemQty }]);
    }
    setBundleItemQty(1);
  };

  const removeBundleItem = (catalogId: string) => {
    setBundleItems(bundleItems.filter(b => b.catalogId !== catalogId));
  };

  // Helper to convert files to Base64 for localStorage storage
  const processFile = (file: File, type: "ball" | "sleeve" | "box") => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (type === "ball") setCustomImage(result);
      else if (type === "sleeve") setCustomImageSleeve(result);
      else if (type === "box") setCustomImageBox(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!model.trim() || !name.trim() || !color.trim()) {
      alert("Please provide Model, Name, and Color.");
      return;
    }

    const payload = {
      model: model.trim().toUpperCase(),
      name: name.trim(),
      color: color.trim(),
      variation: variation.trim() ? variation.trim() : null,
      year: year.trim() ? year.trim() : undefined,
      groupColor: groupColor || undefined,
      groupVariation: groupVariation || undefined,
      notes: variation.trim() ? variation.trim() : null,
      customImage,
      customImageSleeve,
      customImageBox,
      bundleItems: isBundle && bundleItems.length > 0 ? bundleItems : []
    };

    if (editItem) {
      onUpdateCatalogItem(editItem.id, payload);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onCancelEdit) onCancelEdit();
      }, 1200);
    } else {
      onAddCatalogItem(payload);

      // Flash success state
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        // Reset form variables
        setModel("");
        setName("");
        setColor("");
        setVariation("");
        setYear("");
      setYear("");
        setGroupColor(false);
        setGroupVariation(false);
        setCustomImage(undefined);
        setCustomImageSleeve(undefined);
        setCustomImageBox(undefined);
        setIsBundle(false);
        setBundleItems([]);
      }, 1200);
    }
  };

  return (
    <div 
      className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl relative overflow-hidden"
      id="register-missing-database-panel"
    >
      {/* Decorative gradient header accent */}
      <div 
        className="absolute top-0 inset-x-0 h-1" 
        style={{ backgroundImage: "linear-gradient(to right, var(--theme-accent-color, #2563eb), var(--color-emerald-500, #10b981), var(--color-teal-500, #14b8a6))" }}
      />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#2563eb]" />
          <h3 className="font-sans font-black text-white text-base uppercase tracking-wider text-[#2563eb] font-extrabold">
            {editItem ? "Edit Existing Design" : "Add Ball to Vault"}
          </h3>
        </div>
      </div>
      <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
        {editItem 
          ? `You are currently updating the specifications of "${editItem.model} - ${editItem.color}" to make sure inventory listings remain pristine and custom.`
          : "Can't find a specific ball in the catalog? Register a custom ball or missing colorway into the Ball Vault so you can add it to your bag."
        }
      </p>

      {success ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-neutral-950/40 rounded-xl border border-[#2563eb]/30">
          <CheckCircle2 className="w-12 h-12 text-[#2563eb] animate-bounce" />
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">
            {editItem ? "Updated Successfully!" : "Added to Ball Vault!"}
          </h4>
          <p className="text-xs text-neutral-400 max-w-xs">
            {editItem 
              ? "All active references to this item are synchronized across the system."
              : "The new ball design has been successfully indexed. Type in the search box to find and count it!"
            }
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Row: Model, Name (All Required) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Model Name */}
             <div>
               <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-1.5 font-bold whitespace-nowrap">
                 Model (Pro, Tour, Soft) <span className="text-[#2563eb]">*</span>
               </label>
               <input
                 type="text"
                 required
                 maxLength={40}
                 placeholder="e.g. PRO, TOUR, PRO SOFT"
                 value={model}
                 onChange={(e) => setModel(e.target.value)}
                 className="w-full bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 focus:border-[#2563eb]/50 rounded-lg py-2 px-3 text-xs text-white placeholder-neutral-600 outline-none transition-all"
                 id="missing-model-input"
               />
             </div>


             {/* Name */}
             <div>
               <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-1.5 font-bold whitespace-nowrap">
                 Name (Beastin', Nicklaus) <span className="text-[#2563eb]">*</span>
               </label>
               <input
                 type="text"
                 required
                 maxLength={40}
                 placeholder="e.g. Beastin', Nicklaus, Standard"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 className="w-full bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 focus:border-[#2563eb]/50 rounded-lg py-2 px-3 text-xs text-white placeholder-neutral-600 outline-none transition-all"
                 id="missing-name-input"
               />
             </div>
          </div>

          {/* Second Row: Color, Variation & Grouping */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_140px] gap-4 items-end">
             {/* Color */}
             <div>
               <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-1.5 font-bold whitespace-nowrap">
                 Color <span className="text-[#2563eb]">*</span>
               </label>
               <input
                 type="text"
                 required
                 maxLength={40}
                 placeholder="e.g. Red, Drip"
                 value={color}
                 onChange={(e) => setColor(e.target.value)}
                 className="w-full bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 focus:border-[#2563eb]/50 rounded-lg py-2 px-3 text-xs text-white placeholder-neutral-600 outline-none transition-all"
                 id="missing-color-input"
               />
             </div>

             {/* Group By Color Checkbox */}
             <div className="flex items-center gap-2 select-none cursor-pointer pb-2.5 px-1" onClick={() => {
               setGroupColor(!groupColor);
               setGroupVariation(false);
             }}>
               <input
                 type="checkbox"
                 checked={groupColor}
                 onChange={() => {}} // handled by parent div onClick
                 className="w-3.5 h-3.5 rounded text-[#2563eb] bg-neutral-900 border-neutral-850 focus:ring-0 focus:ring-offset-0 cursor-pointer"
               />
               <span className="text-[9px] uppercase font-mono tracking-wider text-neutral-300 font-bold whitespace-nowrap">
                 Group By Color
               </span>
             </div>

             {/* Variation */}
             <div>
               <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-1.5 font-bold whitespace-nowrap">
                 Variation
               </label>
               <input
                 type="text"
                 maxLength={80}
                 placeholder="e.g. matte finish"
                 value={variation}
                 onChange={(e) => setVariation(e.target.value)}
                 className="w-full bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 focus:border-[#2563eb]/50 rounded-lg py-2 px-3 text-xs text-white placeholder-neutral-600 outline-none transition-all"
                 id="missing-variation-input"
               />
             </div>

             {/* Group By Variation Checkbox */}
             <div className="flex items-center gap-2 select-none cursor-pointer pb-2.5 px-1" onClick={() => {
               setGroupVariation(!groupVariation);
               setGroupColor(false);
             }}>
               <input
                 type="checkbox"
                 checked={groupVariation}
                 onChange={() => {}} // handled by parent div onClick
                 className="w-3.5 h-3.5 rounded text-[#2563eb] bg-neutral-900 border-neutral-850 focus:ring-0 focus:ring-offset-0 cursor-pointer"
               />
               <span className="text-[9px] uppercase font-mono tracking-wider text-neutral-300 font-bold whitespace-nowrap">
                 Group By Var.
               </span>
             </div>
             {/* Year */}
             <div>
               <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-1.5 font-bold whitespace-nowrap">
                 Year
               </label>
               <select
                 value={year}
                 onChange={(e) => setYear(e.target.value)}
                 className="w-full h-[34px] bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 focus:border-[#2563eb]/50 rounded-lg py-1 px-3 text-xs text-white placeholder-neutral-600 outline-none transition-all cursor-pointer appearance-none"
                 style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2371717a%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto' }}
               >
                 <option value="">Unknown</option>
                 {years.map(y => (
                   <option key={y} value={y}>{y}</option>
                 ))}
               </select>
             </div>
          </div>

          {/* Bundle Toggle */}
           <div className="flex items-center gap-2 select-none cursor-pointer pb-1 px-1" onClick={() => setIsBundle(!isBundle)}>
             <input
               type="checkbox"
               checked={isBundle}
               onChange={() => {}}
               className="w-4 h-4 rounded text-[#2563eb] bg-neutral-900 border-neutral-850 focus:ring-0 focus:ring-offset-0 cursor-pointer"
             />
             <span className="text-[11px] uppercase font-mono tracking-wider text-[#2563eb] font-black whitespace-nowrap flex items-center gap-1.5">
               <Box className="w-3.5 h-3.5" /> Is Bundle / Variety Pack?
             </span>
           </div>

           {/* Bundle Configuration */}
           {isBundle && (
             <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-4">
                <span className="block text-[10px] uppercase font-mono tracking-wider text-neutral-400 font-bold mb-2">
                  Bundle Contents
                </span>
                <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-end">
                  <div>
                     <label className="block text-[9px] uppercase font-mono text-neutral-500 mb-1">Search Catalog</label>
                     <div className="flex flex-col gap-1">
                       <div className="flex gap-1">
                         <select 
                           value={bundleModelFilter}
                           onChange={e => setBundleModelFilter(e.target.value)}
                           className="w-1/3 bg-neutral-900 border border-neutral-700 text-neutral-300 rounded-md px-2 py-1.5 text-xs focus:border-[#2563eb] outline-none"
                         >
                           <option value="All Models">All Models</option>
                           {availableModels.map(m => (
                             <option key={m} value={m}>{m}</option>
                           ))}
                         </select>
                         <input 
                           type="text" 
                           placeholder="Search by keyword..." 
                           value={bundleSearch}
                           onChange={e => setBundleSearch(e.target.value)}
                           className="w-2/3 bg-neutral-900 border border-neutral-700 text-neutral-300 rounded-md px-2 py-1.5 text-xs focus:border-[#2563eb] outline-none"
                         />
                       </div>
                       <select 
                         value={selectedBundleItem}
                         onChange={e => setSelectedBundleItem(e.target.value)}
                         className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-1.5 px-2 text-xs text-white"
                       >
                          <option value="">Select an item to add...</option>
                          {filteredCatalog.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.model} {c.name ? `"${c.name}"` : ""} - {c.color} {c.variation ? `(${c.variation})` : ""}
                            </option>
                          ))}
                       </select>
                     </div>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-mono text-neutral-500 mb-1">Qty</label>
                    <input 
                      type="number" 
                      min="1"
                      value={bundleItemQty}
                      onChange={e => setBundleItemQty(parseInt(e.target.value) || 1)}
                      className="w-16 bg-neutral-900 border border-neutral-800 rounded-lg py-1.5 px-2 text-xs text-white text-center"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={addBundleItem}
                    disabled={!selectedBundleItem}
                    className="bg-[#2563eb] text-white p-1.5 rounded-lg disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Bundle Items List */}
                {bundleItems.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {bundleItems.map(item => {
                      const catalogItem = catalog.find(c => c.id === item.catalogId);
                      return (
                        <div key={item.catalogId} className="flex items-center justify-between bg-neutral-900 p-2 rounded-lg border border-neutral-800">
                          <div className="text-[11px] text-white flex-1 overflow-hidden text-ellipsis whitespace-nowrap pr-2">
                            <span className="font-bold text-neutral-500 mr-2">{item.qty}x</span>
                            {catalogItem ? `${catalogItem.model} ${catalogItem.name ? `"${catalogItem.name}"` : ""} - ${catalogItem.color}` : item.catalogId}
                          </div>
                          <button 
                            type="button" 
                            onClick={() => removeBundleItem(item.catalogId)}
                            className="text-rose-500 hover:text-rose-400 p-1"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
             </div>
           )}

          {/* Upload Custom Images Grid */}
          <div className="space-y-1.5">
            <span className="block text-[10px] uppercase font-mono tracking-wider text-neutral-400 font-bold">
              Custom Uploads (Optional)
            </span>
            <div className="grid grid-cols-3 gap-3">
              {/* Ball Image */}
              <div 
                onClick={() => ballInputRef.current?.click()}
                className={`relative border border-dashed rounded-xl p-2.5 flex flex-col items-center justify-center gap-1 cursor-pointer h-16 text-center transition-all ${
                  customImage ? "border-neutral-700 bg-neutral-950/60" : "border-neutral-800 bg-neutral-950 hover:bg-neutral-900/60 hover:border-neutral-700"
                }`}
              >
                <input 
                  type="file" 
                  ref={ballInputRef} 
                  onChange={(e) => {
                    if (e.target.files?.[0]) processFile(e.target.files[0], "ball");
                  }} 
                  accept="image/*" 
                  className="hidden" 
                />
                {customImage ? (
                  <>
                    <img src={customImage} className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-40" />
                    <span className="relative z-10 text-[9px] font-black uppercase text-white bg-black/75 px-1 py-0.5 rounded-md leading-none">
                      Ball
                    </span>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomImage(undefined);
                        if (ballInputRef.current) ballInputRef.current.value = "";
                      }}
                      className="absolute top-1 right-1 z-20 p-0.5 rounded-full bg-rose-950 text-rose-450 hover:bg-rose-900 transition-colors"
                    >
                      <Trash className="w-2.5 h-2.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-[9px] font-bold text-neutral-400">Ball Image</span>
                  </>
                )}
              </div>

              {/* Sleeve Image */}
              <div 
                onClick={() => sleeveInputRef.current?.click()}
                className={`relative border border-dashed rounded-xl p-2.5 flex flex-col items-center justify-center gap-1 cursor-pointer h-16 text-center transition-all ${
                  customImageSleeve ? "border-neutral-700 bg-neutral-950/60" : "border-neutral-800 bg-neutral-950 hover:bg-neutral-900/60 hover:border-neutral-700"
                }`}
              >
                <input 
                  type="file" 
                  ref={sleeveInputRef} 
                  onChange={(e) => {
                    if (e.target.files?.[0]) processFile(e.target.files[0], "sleeve");
                  }} 
                  accept="image/*" 
                  className="hidden" 
                />
                {customImageSleeve ? (
                  <>
                    <img src={customImageSleeve} className="absolute inset-0 w-full h-full object-contain rounded-xl opacity-40 bg-neutral-950" />
                    <span className="relative z-10 text-[9px] font-black uppercase text-white bg-black/75 px-1 py-0.5 rounded-md leading-none">
                      Sleeve
                    </span>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomImageSleeve(undefined);
                        if (sleeveInputRef.current) sleeveInputRef.current.value = "";
                      }}
                      className="absolute top-1 right-1 z-20 p-0.5 rounded-full bg-rose-950 text-rose-450 hover:bg-rose-900 transition-colors"
                    >
                      <Trash className="w-2.5 h-2.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-[9px] font-bold text-neutral-400">Sleeve Image</span>
                  </>
                )}
              </div>

              {/* Box Image */}
              <div 
                onClick={() => boxInputRef.current?.click()}
                className={`relative border border-dashed rounded-xl p-2.5 flex flex-col items-center justify-center gap-1 cursor-pointer h-16 text-center transition-all ${
                  customImageBox ? "border-neutral-700 bg-neutral-950/60" : "border-neutral-800 bg-neutral-950 hover:bg-neutral-900/60 hover:border-neutral-700"
                }`}
              >
                <input 
                  type="file" 
                  ref={boxInputRef} 
                  onChange={(e) => {
                    if (e.target.files?.[0]) processFile(e.target.files[0], "box");
                  }} 
                  accept="image/*" 
                  className="hidden" 
                />
                {customImageBox ? (
                  <>
                    <img src={customImageBox} className="absolute inset-0 w-full h-full object-contain rounded-xl opacity-40 bg-neutral-950" />
                    <span className="relative z-10 text-[9px] font-black uppercase text-white bg-black/75 px-1 py-0.5 rounded-md leading-none">
                      Box
                    </span>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomImageBox(undefined);
                        if (boxInputRef.current) boxInputRef.current.value = "";
                      }}
                      className="absolute top-1 right-1 z-20 p-0.5 rounded-full bg-rose-950 text-rose-450 hover:bg-rose-900 transition-colors"
                    >
                      <Trash className="w-2.5 h-2.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-[9px] font-bold text-neutral-400">Box Image</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => {
                if (editItem && onCancelEdit) {
                  onCancelEdit();
                } else {
                  // Reset form fields
                  setModel("");
                  setName("");
                  setColor("");
                  setVariation("");
        setYear("");
      setYear("");
                  setCustomImage(undefined);
                  setIsBundle(false);
                  setBundleItems([]);
                }
              }}
              className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-all cursor-pointer text-[10px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#2563eb] hover:bg-[#3b82f6] text-black font-extrabold rounded-lg transition-all cursor-pointer text-[10px]"
            >
              <span>{editItem ? "Save Changes" : "Save Ball"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
