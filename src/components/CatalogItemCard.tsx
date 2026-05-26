/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CatalogItem, BallCondition } from "../types";
import BallVisual from "./BallVisual";
import { Plus, Check, ChevronDown, ChevronUp, Layers, HelpCircle, Package, MessageSquare, X } from "lucide-react";

interface CatalogItemCardProps {
  key?: string | number;
  item: CatalogItem;
  isReadOnly?: boolean;
  onAddToLocker: (
    model: string,
    color: string,
    qty: number,
    customNum: number,
    notes: string,
    condition: BallCondition,
    customImage?: string,
    packageType?: 'ea' | 'sleeve' | 'box',
    year?: string
  ) => void;
}

export default function CatalogItemCard({ item, onAddToLocker, isReadOnly = false }: CatalogItemCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(12); // Defaults to a standard Box
  const [pkgType, setPkgType] = useState<'sleeve' | 'box' | 'ea'>('box');
  const [playNumber, setPlayNumber] = useState<number>(1);
  const [customNumberInput, setCustomNumberInput] = useState<string>("");
  const [condition, setCondition] = useState<BallCondition>(BallCondition.NEW);
  const [notes, setNotes] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onAddToLocker(
      item.model,
      item.color,
      quantity,
      playNumber,
      notes.trim(),
      condition,
      item.customImage,
      pkgType,
      item.year
    );

    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      setIsOpen(false);
      // Reset form controls
      setNotes("");
      setPlayNumber(1);
      setCustomNumberInput("");
    }, 1200);
  };

  const incrementQty = () => {
    if (pkgType === 'box') {
      setQuantity((q) => q + 12);
    } else if (pkgType === 'sleeve') {
      setQuantity((q) => q + 3);
    } else {
      setQuantity((q) => q + 1);
    }
  };

  const decrementQty = () => {
    if (pkgType === 'box') {
      setQuantity((q) => (q > 12 ? q - 12 : 12));
    } else if (pkgType === 'sleeve') {
      setQuantity((q) => (q > 3 ? q - 3 : 3));
    } else {
      setQuantity((q) => (q > 1 ? q - 1 : 1));
    }
  };

  return (
    <div 
      className={`relative rounded-xl border p-4 transition-all duration-300 ${
        isOpen 
          ? "bg-neutral-900 border-[#2563eb]/50 shadow-md shadow-[#2563eb]/10" 
          : "bg-neutral-900/60 hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700 hover:shadow-sm"
      }`}
      id={`catalog-item-card-${item.id}`}
    >
      <div className="flex gap-4">
        {/* Ball Visual Display */}
        <div className="flex-shrink-0 flex items-center justify-center p-1 bg-neutral-950/40 rounded-xl border border-neutral-850/55 h-20 w-20">
          <BallVisual 
            color={item.color} 
            model={item.model} 
            size="md" 
            customImage={item.customImage}
          />
        </div>

        {/* Core Specs */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="truncate font-sans">
                <h4 className="font-sans font-black text-white text-base leading-tight truncate" title={item.model}>
                  {item.model}{item.name ? ` - ${item.name}` : ''}
                </h4>
                <p className="text-xs text-[#2563eb] font-mono font-medium truncate mt-0.5">
                  {item.color}
                </p>
                {(item.variation || item.notes) && (
                  <p className="text-[10px] text-neutral-400 font-mono mt-1 break-words line-clamp-2 italic leading-tight" title={item.variation || item.notes}>
                    "{item.variation || item.notes}"
                  </p>
                )}
                {item.year && (
                  <span className="inline-block text-[9px] font-mono font-bold bg-neutral-950 border border-neutral-850 text-neutral-450 px-1.5 py-0.5 rounded select-none mt-1 leading-none">
                    {item.year}
                  </span>
                )}
              </div>

              {!isReadOnly && (
                !isOpen ? (
                  <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-[#2563eb] hover:bg-[#2563eb]/80 text-black transition-colors cursor-pointer"
                    id={`btn-open-add-${item.id}`}
                    title="Add to Bag"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer animate-fade-in"
                    id={`btn-close-add-${item.id}`}
                    title="Cancel Add"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Add Container */}
      {isOpen && (
        <form onSubmit={handleAddSubmit} className="mt-4 pt-4 border-t border-neutral-800 space-y-4">
          <div className="text-xs font-bold text-[#2563eb] uppercase tracking-widest flex items-center justify-between">
            <span>Add to My Bag</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Play Number */}
            <div>
              <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1">
                Ball Play-Number
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    disabled={pkgType === 'box'}
                    onClick={() => {
                      setPlayNumber(num);
                      setCustomNumberInput("");
                    }}
                    className={`flex-1 text-center py-1 rounded text-[11px] font-mono font-bold border transition-all cursor-pointer ${
                      pkgType === 'box'
                        ? "bg-neutral-950 text-neutral-600 border-neutral-900 cursor-not-allowed opacity-50"
                        : playNumber === num && customNumberInput === ""
                        ? "bg-[#2563eb] border-[#2563eb] text-black"
                        : "bg-neutral-950 border-neutral-850 text-neutral-300 hover:border-neutral-700"
                    }`}
                  >
                    {num}
                  </button>
                ))}
                
                {/* 2-digit play number input */}
                <input
                  type="text"
                  maxLength={2}
                  disabled={pkgType === 'box'}
                  value={pkgType === 'box' ? "" : customNumberInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setCustomNumberInput(val);
                    if (val === "") {
                      setPlayNumber(1);
                    } else {
                      setPlayNumber(parseInt(val, 10));
                    }
                  }}
                  placeholder={pkgType === 'box' ? "—" : "##"}
                  className={`w-9 text-center py-1 font-mono text-xs border rounded transition-all focus:outline-none focus:border-neutral-500 ${
                    pkgType === 'box'
                      ? "border-neutral-900 bg-neutral-950 text-neutral-600 cursor-not-allowed opacity-55"
                      : customNumberInput !== ""
                      ? "bg-[#2563eb] text-black border-[#2563eb] font-bold"
                      : "bg-neutral-950 border-neutral-850 text-neutral-400"
                  }`}
                  title={pkgType === 'box' ? "Not customizable for boxes" : "Enter any 2-digit number"}
                />
              </div>
            </div>

            {/* Packaging / Quality appraisal */}
            <div>
              <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1">
                Current Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as BallCondition)}
                className="w-full bg-neutral-950 text-xs py-1.5 px-2 rounded text-neutral-300 font-bold border border-neutral-850 focus:border-neutral-700 outline-none cursor-pointer"
              >
                {Object.values(BallCondition).map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            {/* Quantity adjustment */}
            <div>
              <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1">
                Quantity
              </label>
              <div className="flex items-center gap-2">
                <div className="flex bg-neutral-950 rounded-md border border-neutral-850 p-0.5 shrink-0 transition-opacity items-center">
                  <button
                    type="button"
                    onClick={decrementQty}
                    className="w-4.5 h-4.5 flex items-center justify-center text-neutral-400 hover:text-white rounded hover:bg-neutral-900 transition-colors text-xs cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={
                      pkgType === 'box'
                        ? Math.max(1, Math.round(quantity / 12))
                        : pkgType === 'sleeve'
                        ? Math.max(1, Math.round(quantity / 3))
                        : quantity
                    }
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value.replace(/[^0-9]/g, "")) || 1);
                      if (pkgType === 'box') {
                        setQuantity(val * 12);
                      } else if (pkgType === 'sleeve') {
                        setQuantity(val * 3);
                      } else {
                        setQuantity(val);
                      }
                    }}
                    className="w-5.5 bg-transparent text-center font-mono font-black text-xs text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={incrementQty}
                    className="w-4.5 h-4.5 flex items-center justify-center text-neutral-400 hover:text-white rounded hover:bg-neutral-900 transition-colors text-xs cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex gap-1 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      setQuantity(1);
                      setPkgType('ea');
                    }}
                    className={`flex-1 py-1 px-0.5 border text-center font-mono text-[9px] rounded transition-all cursor-pointer truncate ${
                      pkgType === 'ea'
                        ? "bg-[#2563eb] border-[#2563eb] text-neutral-950 font-bold"
                        : "bg-neutral-950 border-neutral-850 text-neutral-400 hover:text-white"
                    }`}
                  >
                    Ball
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuantity(3);
                      setPkgType('sleeve');
                    }}
                    className={`flex-1 py-1 px-0.5 border text-center font-mono text-[9px] rounded transition-all cursor-pointer truncate ${
                      pkgType === 'sleeve'
                        ? "bg-[#2563eb] border-[#2563eb] text-neutral-950 font-bold"
                        : "bg-neutral-950 border-neutral-850 text-neutral-400 hover:text-white"
                    }`}
                  >
                    Sleeve
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuantity(12);
                      setPkgType('box');
                    }}
                    className={`flex-1 py-1 px-0.5 border text-center font-mono text-[9px] rounded transition-all cursor-pointer truncate ${
                      pkgType === 'box'
                        ? "bg-[#2563eb] border-[#2563eb] text-neutral-950 font-bold"
                        : "bg-neutral-950 border-neutral-850 text-neutral-400 hover:text-white"
                    }`}
                  >
                    Box
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1 flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-neutral-500" /> Collection Notes
              </label>
              <input
                type="text"
                placeholder="Where, when, or any specific details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-neutral-950 text-xs py-1.5 px-3 rounded text-neutral-300 border border-neutral-850 focus:border-neutral-700 outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={justAdded}
            className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              justAdded
                ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-950/20"
                : "bg-[#2563eb] hover:bg-[#2563eb]/80 text-black active:scale-[0.99] shadow-sm cursor-pointer"
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4 text-neutral-950" /> Add Successful!
              </>
            ) : (
              <>
                <Package className="w-4 h-4 text-neutral-950" /> Add to Bag
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
