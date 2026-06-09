/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CatalogItem, BallCondition } from "../types";
import BallVisual from "./BallVisual";
import { Plus, Check, ChevronDown, ChevronUp, Layers, HelpCircle, Package, MessageSquare, X, AlertTriangle, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CatalogItemCardProps {
  key?: string | number;
  index?: number;
  item: CatalogItem;
  subItems?: CatalogItem[];
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
    year?: string,
    customImageSleeve?: string,
    customImageBox?: string,
    name?: string,
    variation?: string,
    bundleItems?: { catalogId: string; qty: number }[]
  ) => void;
  wishlistItems?: string[];
  onToggleWishlist?: (id: string) => void;
  variant?: string;
}

let currentlyAddingCard: {
  id: string;
  isDirty: () => boolean;
  promptAndSwitch: (onProceed: () => void) => void;
  discardAndClose: () => void;
} | null = null;

export default function CatalogItemCard({ item, subItems = [], onAddToLocker, isReadOnly = false, wishlistItems = [], onToggleWishlist, variant, index = 0 }: CatalogItemCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isBundle = item.bundleItems && item.bundleItems.length > 0;
  
  // If the item is wishlisted specifically as an individual item (no -pkg-box suffix), default to 'ea'
  const isWishlistedAsBox = wishlistItems.some(w => w === `${item.id}-pkg-box`);
  const isWishlistedAsEa = wishlistItems.some(w => w === item.id || w === `${item.id}-pkg-ea`);
  const initialPkgType = (!isBundle && isWishlistedAsEa && !isWishlistedAsBox) ? 'ea' : 'box';
  
  const bundleTotal = isBundle ? item.bundleItems!.reduce((acc, b) => acc + b.qty, 0) : 12;
  const [quantity, setQuantity] = useState(initialPkgType === 'ea' ? 1 : (isBundle ? bundleTotal : 12));
  const [pkgType, setPkgType] = useState<'sleeve' | 'box' | 'ea'>(initialPkgType);
  const [playNumber, setPlayNumber] = useState<number>(1);
  const [customNumberInput, setCustomNumberInput] = useState<string>("");
  const [condition, setCondition] = useState<BallCondition>(BallCondition.NEW);
  const [notes, setNotes] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2012 + 1 }, (_, i) => String(2012 + i));
  const [selectedYear, setSelectedYear] = useState<string>("");

  const [selectedItemId, setSelectedItemId] = useState(item.id);
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
  const [pendingProceed, setPendingProceed] = useState<(() => void) | null>(null);
  
  const [showWishlistPrompt, setShowWishlistPrompt] = useState(false);
  const wishlistBtnRef = React.useRef<HTMLButtonElement>(null);
  const [wishlistCoords, setWishlistCoords] = React.useState({ top: 0, left: 0, width: 224, openUpwards: false });

  React.useEffect(() => {
    if (showWishlistPrompt && wishlistBtnRef.current) {
      const rect = wishlistBtnRef.current.getBoundingClientRect();
      const popupHeight = 200; // estimated max-h
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      const openUpwards = spaceBelow < popupHeight && spaceAbove > spaceBelow;
      
      setWishlistCoords({
        top: openUpwards ? rect.top + window.scrollY : rect.bottom + window.scrollY,
        left: rect.right + window.scrollX - 224, // 224px is w-56, align right edges
        width: 224,
        openUpwards
      });
    }
  }, [showWishlistPrompt]);

  React.useEffect(() => {
    setSelectedItemId(item.id);
  }, [item.id]);

  React.useEffect(() => {
    if (isOpen && !justAdded) {
      currentlyAddingCard = {
        id: item.id,
        isDirty: () => {
          return quantity !== 12 ||
            pkgType !== 'box' ||
            (pkgType !== 'box' && playNumber !== 1) ||
            condition !== BallCondition.NEW ||
            notes.trim() !== "" ||
            selectedYear !== "";
        },
        promptAndSwitch: (onProceed: () => void) => {
          setShowUnsavedPrompt(true);
          setPendingProceed(() => onProceed);
        },
        discardAndClose: () => {
          setIsOpen(false);
          currentlyAddingCard = null;
        }
      };
    } else if (currentlyAddingCard?.id === item.id) {
      currentlyAddingCard = null;
    }
  }, [isOpen, justAdded, quantity, pkgType, playNumber, condition, notes, selectedYear, item.id]);

  const activeItem = subItems.find(si => si.id === selectedItemId) || item;

  const startAdding = () => {
    if (currentlyAddingCard && currentlyAddingCard.id !== item.id) {
      if (currentlyAddingCard.isDirty()) {
        currentlyAddingCard.promptAndSwitch(() => {
          openThisCard();
        });
        return;
      } else {
        currentlyAddingCard.discardAndClose();
      }
    }
    openThisCard();
  };

  const openThisCard = () => {
    setQuantity(12);
    setPkgType('box');
    setPlayNumber(1);
    setCustomNumberInput("");
    setCondition(BallCondition.NEW);
    setNotes("");
    setSelectedYear("");
    setIsOpen(true);
  };

  const handleCloseAdd = () => {
    if (currentlyAddingCard?.id === item.id && currentlyAddingCard.isDirty()) {
      setShowUnsavedPrompt(true);
      setPendingProceed(() => () => {});
    } else {
      setIsOpen(false);
      if (currentlyAddingCard?.id === item.id) currentlyAddingCard = null;
    }
  };

  const submitAdd = () => {

    const itemToAdd = pkgType === 'box' ? item : activeItem;
    
    let colorToAdd = itemToAdd.color;
    let varToAdd = itemToAdd.variation;

    if (pkgType === 'box') {
      if (item.groupColor) colorToAdd = "Mixed";
      if (item.groupVariation) varToAdd = "Mixed";
    }

    onAddToLocker(
      itemToAdd.model,
      colorToAdd,
      quantity,
      playNumber,
      notes.trim(),
      condition,
      itemToAdd.customImage,
      pkgType,
      selectedYear === "" ? undefined : selectedYear,
      itemToAdd.customImageSleeve,
      itemToAdd.customImageBox,
      itemToAdd.name,
      varToAdd,
      itemToAdd.bundleItems
    );

    setJustAdded(true);
    if (currentlyAddingCard?.id === item.id) currentlyAddingCard = null;

    setTimeout(() => {
      setJustAdded(false);
      setIsOpen(false);
      setNotes("");
      setPlayNumber(1);
      setCustomNumberInput("");
    }, 1200);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitAdd();
  };

  const handlePromptSave = () => {
    submitAdd();
    setShowUnsavedPrompt(false);
    if (pendingProceed) pendingProceed();
    setPendingProceed(null);
  };

  const handlePromptDiscard = () => {
    setIsOpen(false);
    if (currentlyAddingCard?.id === item.id) currentlyAddingCard = null;
    setShowUnsavedPrompt(false);
    if (pendingProceed) pendingProceed();
    setPendingProceed(null);
  };

  const handlePromptCancel = () => {
    setShowUnsavedPrompt(false);
    setPendingProceed(null);
  };

  const incrementQty = () => {
    if (isBundle || pkgType === 'box') {
      setQuantity((q) => q + bundleTotal);
    } else if (pkgType === 'sleeve') {
      setQuantity((q) => q + 3);
    } else {
      setQuantity((q) => q + 1);
    }
  };

  const decrementQty = () => {
    if (isBundle || pkgType === 'box') {
      setQuantity((q) => Math.max(bundleTotal, q - bundleTotal));
    } else if (pkgType === 'sleeve') {
      setQuantity((q) => Math.max(3, q - 3));
    } else {
      setQuantity((q) => Math.max(1, q - 1));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.23, 1, 0.32, 1] }}
      className={`relative rounded-xl border p-4 transition-all duration-300 ${
        isOpen 
          ? "bg-neutral-900 border-[#2563eb]/50 shadow-md shadow-[#2563eb]/10" 
          : "bg-neutral-900/60 hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700 hover:shadow-sm"
      } ${showWishlistPrompt ? "z-[60]" : ""}`}
      id={`catalog-item-card-${item.id}`}
    >
      {showUnsavedPrompt && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" style={{ position: 'fixed' }}>
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl animate-scale-in">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto animate-pulse" />
            <h4 className="text-white font-sans font-black text-base uppercase tracking-wider">
              Unsaved Changes
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed font-mono">
              Add this to your bag before switching?
            </p>
            <div className="flex gap-3 mt-6 pt-2 w-full">
              <button
                type="button"
                onClick={() => {
                  handlePromptCancel();
                  document.getElementById(`catalog-item-card-${item.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="flex-1 py-2.5 px-3 bg-neutral-950 border border-neutral-800 hover:bg-neutral-900 text-neutral-400 font-mono text-[10px] uppercase font-bold tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePromptDiscard}
                className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-mono text-[10px] uppercase font-bold tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-rose-950/40"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handlePromptSave}
                className="flex-1 py-2.5 px-3 bg-[#2563eb] hover:bg-[#3b82f6] text-black font-mono text-[10px] uppercase font-bold tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-blue-900/20"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex gap-4">
        {/* Ball Visual Display */}
        <div className="flex-shrink-0 flex items-center justify-center p-1 bg-neutral-950/40 rounded-xl border border-neutral-850/55 h-20 w-20">
          <BallVisual 
            color={activeItem.color} 
            model={activeItem.model} 
            size="md" 
            customImage={activeItem.customImage}
            customImageSleeve={activeItem.customImageSleeve}
            customImageBox={activeItem.customImageBox}
            packageType={pkgType}
          />
        </div>

        {/* Core Specs */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="truncate font-sans">
                <h4 className="font-sans font-black text-white text-base leading-tight truncate" title={activeItem.model}>
                  {activeItem.model}{activeItem.name ? ` - ${activeItem.name}` : ''}
                </h4>
                <p className="text-xs text-[#2563eb] font-mono font-medium truncate mt-0.5">
                  {item.groupColor && (!isOpen || pkgType === 'box') ? "Mixed" : activeItem.color}
                </p>
                {!(item.groupVariation && subItems.length > 1) && (activeItem.variation || activeItem.notes) && (
                  <p className="text-[10px] text-neutral-400 font-mono mt-1 break-words line-clamp-2 italic leading-tight" title={
                    activeItem.variation || activeItem.notes
                  }>
                    "{activeItem.variation || activeItem.notes}"
                  </p>
                )}
              </div>

              {!isReadOnly && (
                !isOpen ? (
                  <div className="relative flex items-center gap-2 flex-shrink-0">
                  <button
                    ref={wishlistBtnRef}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const isWishlisted = wishlistItems.some(w => w === item.id || w.startsWith(`${item.id}-pkg-`));
                      if (isWishlisted) {
                        const idToToggle = wishlistItems.includes(`${item.id}-pkg-box`) ? `${item.id}-pkg-box` : wishlistItems.includes(item.id) ? item.id : `${item.id}-pkg-box`;
                        onToggleWishlist?.(idToToggle);
                      } else if (isBundle) {
                        const idToToggle = wishlistItems.includes(`${item.id}-pkg-box`) ? `${item.id}-pkg-box` : wishlistItems.includes(item.id) ? item.id : `${item.id}-pkg-box`;
                        onToggleWishlist?.(idToToggle);
                      } else {
                        setShowWishlistPrompt(!showWishlistPrompt);
                      }
                    }}
                    className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer ${
                      wishlistItems.some(w => w === item.id || w.startsWith(`${item.id}-pkg-`) || (subItems && subItems.some(sub => w === sub.id)))
                        ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30' 
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
                    }`}
                    title="Wishlist Options"
                  >
                    <Heart className={`w-4 h-4 ${wishlistItems.some(w => w === item.id || w.startsWith(`${item.id}-pkg-`) || (subItems && subItems.some(sub => w === sub.id))) ? 'fill-current' : ''}`} />
                  </button>

                  {showWishlistPrompt && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowWishlistPrompt(false); }} />
                      <div 
                        className={`absolute right-0 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in duration-150 flex flex-col ${wishlistCoords.openUpwards ? 'bottom-full mb-2 slide-in-from-bottom-2' : 'top-full mt-2 slide-in-from-top-2'}`}
                        onClick={e => e.stopPropagation()}
                      >
                        {subItems.length > 0 ? (
                          <div className="flex flex-col">
                            <button 
                              type="button"
                              onClick={() => {
                                onToggleWishlist?.(`${item.id}-pkg-box`); 
                              }}
                              className="text-left px-4 py-3 text-xs font-bold text-white hover:bg-neutral-800 border-b border-neutral-800 cursor-pointer flex justify-between items-center group"
                            >
                              <div className="flex flex-col">
                                <span>Entire Box</span>
                                <span className="text-[10px] text-neutral-500 font-mono font-normal">({item.groupColor ? 'Mixed Colors' : 'Mixed Variations'})</span>
                              </div>
                              <Heart className={`w-4 h-4 transition-colors shrink-0 ${wishlistItems.includes(`${item.id}-pkg-box`) ? 'fill-current text-rose-500' : 'text-neutral-600 group-hover:text-rose-500'}`} />
                            </button>
                            <div className="max-h-48 overflow-y-auto custom-scrollbar">
                              {subItems.map(subItem => (
                                <button
                                  key={subItem.id}
                                  type="button"
                                  onClick={() => { onToggleWishlist?.(subItem.id); }}
                                  className="w-full text-left px-4 py-3 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 border-b border-neutral-800/50 cursor-pointer flex justify-between items-center group"
                                >
                                  <div className="flex flex-col">
                                    <span>{subItem.color}</span>
                                    {(subItem.variation || subItem.notes) && (
                                      <span className="text-[10px] text-neutral-500 font-mono italic truncate max-w-[140px]">
                                        {subItem.variation || subItem.notes}
                                      </span>
                                    )}
                                  </div>
                                  <Heart className={`w-4 h-4 transition-colors shrink-0 ${wishlistItems.includes(subItem.id) ? 'fill-current text-rose-500' : 'text-neutral-600 group-hover:text-rose-500'}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </>
                  )}

                  {variant !== 'wishlist' && (
                    <button
                      type="button"
                      onClick={startAdding}
                      className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-[#2563eb] hover:bg-[#2563eb]/80 text-black transition-colors cursor-pointer"
                      id={`btn-open-add-${item.id}`}
                      title="Add to Bag"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleCloseAdd}
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

            {/* Release Year Dropdown */}
            <div>
              <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1">
                Release Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-neutral-950 text-xs py-1.5 px-2 rounded text-neutral-300 font-bold border border-neutral-850 focus:border-neutral-700 outline-none cursor-pointer"
              >
                <option value="">Unknown</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {subItems.length > 1 && pkgType !== 'box' && (
            <div className="mt-3">
              <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1">
                {item.groupColor ? 'Select Color' : item.groupVariation ? 'Select Variation' : 'Select Variant'}
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full bg-neutral-950 text-xs py-1.5 px-2 rounded text-neutral-300 font-bold border border-neutral-850 focus:border-neutral-700 outline-none cursor-pointer"
              >
                {subItems.map((subItem) => (
                  <option key={subItem.id} value={subItem.id}>
                    {item.groupColor ? subItem.color : subItem.variation || subItem.color}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end mt-3">
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
                      isBundle
                        ? Math.max(1, Math.round(quantity / bundleTotal))
                        : pkgType === 'box'
                        ? Math.max(1, Math.round(quantity / 12))
                        : pkgType === 'sleeve'
                        ? Math.max(1, Math.round(quantity / 3))
                        : quantity
                    }
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value.replace(/[^0-9]/g, "")) || 1);
                      if (isBundle) {
                        setQuantity(val * bundleTotal);
                      } else if (pkgType === 'box') {
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
                  {!isBundle && (
                    <>
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
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setQuantity(isBundle ? bundleTotal : 12);
                      setPkgType('box');
                    }}
                    className={`flex-1 py-1 px-0.5 border text-center font-mono text-[9px] rounded transition-all cursor-pointer truncate ${
                      pkgType === 'box'
                        ? "bg-[#2563eb] border-[#2563eb] text-neutral-950 font-bold"
                        : "bg-neutral-950 border-neutral-850 text-neutral-400 hover:text-white"
                    }`}
                  >
                    {isBundle ? 'Bundle' : 'Box'}
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
    </motion.div>
  );
}
