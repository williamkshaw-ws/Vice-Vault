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
  const [year, setYear] = useState("");
  const [customImage, setCustomImage] = useState<string | undefined>(undefined);
  
  // Visual feedback states
  const [isDragActive, setIsDragActive] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prefill fields when editing an item
  React.useEffect(() => {
    if (editItem) {
      setModel(editItem.model);
      setName(editItem.name || "");
      setColor(editItem.color);
      setVariation(editItem.variation || editItem.notes || "");
      setYear(editItem.year || "");
      setCustomImage(editItem.customImage);
    } else {
      setModel("");
      setName("");
      setColor("");
      setVariation("");
      setYear("");
      setCustomImage(undefined);
    }
  }, [editItem]);

  // Helper to convert files to Base64 for localStorage storage
  const processFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
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
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleTriggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomImage(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      variation: variation.trim() || undefined,
      year: year.trim() || undefined,
      notes: variation.trim() || undefined,
      customImage,
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
        setCustomImage(undefined);
      }, 1500);
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
          {/* First Row: Model, Name, Color (All Required) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
 
             {/* Color */}
             <div>
               <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-1.5 font-bold whitespace-nowrap">
                 Color (Red, Drip, Shade) <span className="text-[#2563eb]">*</span>
               </label>
               <input
                 type="text"
                 required
                 maxLength={40}
                 placeholder="e.g. Red, Drip, Shade"
                 value={color}
                 onChange={(e) => setColor(e.target.value)}
                 className="w-full bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 focus:border-[#2563eb]/50 rounded-lg py-2 px-3 text-xs text-white placeholder-neutral-600 outline-none transition-all"
                 id="missing-color-input"
               />
             </div>
          </div>

          {/* Second Row: Variation, Year (Both Optional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Variation */}
             <div>
               <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-1.5 font-bold whitespace-nowrap">
                 Variation (Different Ball Designs)
               </label>
               <input
                 type="text"
                 maxLength={80}
                 placeholder="e.g. matte finish, customized side stamp"
                 value={variation}
                 onChange={(e) => setVariation(e.target.value)}
                 className="w-full bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 focus:border-[#2563eb]/50 rounded-lg py-2 px-3 text-xs text-white placeholder-neutral-600 outline-none transition-all"
                 id="missing-variation-input"
               />
             </div>

             {/* Year */}
             <div>
               <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-1.5 font-bold whitespace-nowrap">
                 Year (release year)
               </label>
               <input
                 type="text"
                 maxLength={10}
                 placeholder="e.g. 2026, 2024"
                 value={year}
                 onChange={(e) => setYear(e.target.value)}
                 className="w-full bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 focus:border-[#2563eb]/50 rounded-lg py-2 px-3 text-xs text-white placeholder-neutral-600 outline-none transition-all"
                 id="missing-year-input"
               />
             </div>
          </div>

          {/* Upload Custom Image Area */}
          <div className="space-y-1.5">
            <span className="block text-[10px] uppercase font-mono tracking-wider text-neutral-400 font-bold">
              Custom Image texture / logo
            </span>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleTriggerFileInput}
              className={`border border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                isDragActive
                  ? "border-[#2563eb] bg-[#2563eb]/10"
                  : customImage
                  ? "border-neutral-700 bg-neutral-950/60"
                  : "border-neutral-800 bg-neutral-950 hover:bg-neutral-900 hover:border-neutral-700"
              }`}
              id="missing-image-uploader-dropzone"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {customImage ? (
                <div className="flex items-center gap-4 w-full justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={customImage}
                      alt="Thumbnail preview"
                      className="w-12 h-12 rounded-lg object-cover border border-neutral-700"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="block text-xs font-bold text-white">Image Uploaded Successfully</span>
                      <span className="text-[10px] text-neutral-500 font-mono">Compressed Base64 asset</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1 px-2.5 rounded bg-rose-950 text-rose-400 hover:bg-rose-900 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Trash className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              ) : (
                <>
                  <Upload className={`w-6 h-6 ${isDragActive ? "text-[#2563eb] animate-bounce" : "text-neutral-500"}`} />
                  <div className="text-center">
                    <p className="text-xs text-neutral-300 font-medium">
                      Drag & Drop photo here, or <span className="text-[#2563eb] underline">Browse files</span>
                    </p>
                    <p className="text-[10px] text-neutral-500 font-mono mt-1">
                      PNG, JPG, or WEBP up to 2MB (Auto 3D-molding)
                    </p>
                  </div>
                </>
              )}
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
