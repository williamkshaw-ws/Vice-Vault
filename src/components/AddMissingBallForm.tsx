/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { CatalogItem } from "../types";
import { Plus, Upload, Trash, Sparkles, CheckCircle2 } from "lucide-react";

interface AddMissingBallFormProps {
  onAddCatalogItem: (newItem: Omit<CatalogItem, "id">) => void;
  onUpdateCatalogItem: (id: string, updatedFields: Partial<CatalogItem>) => void;
  editItem?: CatalogItem | null;
  onCancelEdit?: () => void;
}

export default function AddMissingBallForm({ 
  onAddCatalogItem, 
  onUpdateCatalogItem,
  editItem = null,
  onCancelEdit
}: AddMissingBallFormProps) {
  const [model, setModel] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [variation, setVariation] = useState("");
  const [customImage, setCustomImage] = useState<string | undefined>(undefined);
  const [customImageSleeve, setCustomImageSleeve] = useState<string | undefined>(undefined);
  const [customImageBox, setCustomImageBox] = useState<string | undefined>(undefined);
  const [groupColor, setGroupColor] = useState(false);
  const [groupVariation, setGroupVariation] = useState(false);
  
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
      setGroupColor(!!editItem.groupColor);
      setGroupVariation(!!editItem.groupVariation);
      setCustomImage(editItem.customImage);
      setCustomImageSleeve(editItem.customImageSleeve);
      setCustomImageBox(editItem.customImageBox);
    } else {
      setModel("");
      setName("");
      setColor("");
      setVariation("");
      setGroupColor(false);
      setGroupVariation(false);
      setCustomImage(undefined);
      setCustomImageSleeve(undefined);
      setCustomImageBox(undefined);
    }
  }, [editItem]);

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
      groupColor: groupColor || undefined,
      groupVariation: groupVariation || undefined,
      notes: variation.trim() ? variation.trim() : null,
      customImage,
      customImageSleeve,
      customImageBox,
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
        setGroupColor(false);
        setGroupVariation(false);
        setCustomImage(undefined);
        setCustomImageSleeve(undefined);
        setCustomImageBox(undefined);
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
          </div>

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
                  setCustomImage(undefined);
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
