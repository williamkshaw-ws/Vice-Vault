/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { GolfBall, BallCondition, CatalogItem } from "../types";
import BallVisual from "./BallVisual";
import { Trash2, Calendar, FileText, ChevronDown, ChevronUp, Check, Save, Edit2, X, Package, MessageSquare, AlertTriangle, Box } from "lucide-react";

interface OwnedBallCardProps {
  key?: string | number;
  index?: number;
  ball: GolfBall;
  catalog: CatalogItem[];
  onUpdateBall?: (id: string, updatedFields: Partial<GolfBall>) => void;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
}

let currentlyEditingCard: {
  id: string;
  isDirty: () => boolean;
  promptAndSwitch: (onProceed: () => void) => void;
  discardAndClose: () => void;
} | null = null;

export default function OwnedBallCard({
  ball,
  catalog,
  onUpdateBall,
  onDelete,
  readOnly = false,
  index = 0
}: OwnedBallCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showBundleContents, setShowBundleContents] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
  const [pendingProceed, setPendingProceed] = useState<(() => void) | null>(null);

  // Parse version and notes from ball (handling legacy bracketed format if necessary)
  const getVersionAndNotes = (b: GolfBall) => {
    let version = b.version || "Standard Edition";
    let notes = b.notes || "";
    if (!b.version && notes.startsWith("[")) {
      const match = notes.match(/^\[(.*?)\]\s*(.*)$/);
      if (match) {
        version = match[1];
        notes = match[2];
      }
    }
    return { version, notes };
  };

  const { version: currentVersion, notes: currentNotes } = getVersionAndNotes(ball);

  // Edit fields state
  const [editQty, setEditQty] = useState(ball.quantity);
  const [editPkgType, setEditPkgType] = useState<'ea' | 'sleeve' | 'box'>(ball.packageType || 'ea');
  const [editPlayNumber, setEditPlayNumber] = useState<number>(ball.customNumber || 1);
  const [editCustomNumberInput, setEditCustomNumberInput] = useState<string>(
    [1, 2, 3, 4].includes(ball.customNumber) ? "" : String(ball.customNumber || "")
  );
  const [editCondition, setEditCondition] = useState<BallCondition>(ball.condition);
  const [editNotes, setEditNotes] = useState<string>(currentNotes);
  const [editYear, setEditYear] = useState<string>(ball.year || "2012");

  React.useEffect(() => {
    if (isEditing) {
      currentlyEditingCard = {
        id: ball.id,
        isDirty: () => {
          return editQty !== ball.quantity ||
            editPkgType !== (ball.packageType || 'ea') ||
            (editPkgType !== 'box' && editPlayNumber !== (ball.customNumber || 1)) ||
            editCondition !== ball.condition ||
            editNotes.trim() !== currentNotes ||
            editYear !== (ball.year || "2012");
        },
        promptAndSwitch: (onProceed: () => void) => {
          setShowUnsavedPrompt(true);
          setPendingProceed(() => onProceed);
        },
        discardAndClose: () => {
          setIsEditing(false);
          currentlyEditingCard = null;
        }
      };
    } else if (currentlyEditingCard?.id === ball.id) {
      currentlyEditingCard = null;
    }
  }, [isEditing, editQty, editPkgType, editPlayNumber, editCondition, editNotes, editYear, ball]);

  const startEditing = () => {
    if (readOnly) return;
    if (currentlyEditingCard && currentlyEditingCard.id !== ball.id) {
      if (currentlyEditingCard.isDirty()) {
        currentlyEditingCard.promptAndSwitch(() => {
          openThisCard();
        });
        return;
      } else {
        currentlyEditingCard.discardAndClose();
      }
    }
    openThisCard();
  };

  const openThisCard = () => {
    const { notes } = getVersionAndNotes(ball);
    setEditQty(ball.quantity);
    setEditPkgType(ball.packageType || 'ea');
    setEditPlayNumber(ball.customNumber || 1);
    setEditCustomNumberInput([1, 2, 3, 4].includes(ball.customNumber) ? "" : String(ball.customNumber || ""));
    setEditCondition(ball.condition);
    setEditNotes(notes);
    setEditYear(ball.year || "2012");
    setIsEditing(true);
  };

  const handlePromptSave = () => {
    handleSave();
    setShowUnsavedPrompt(false);
    if (pendingProceed) pendingProceed();
    setPendingProceed(null);
  };

  const handlePromptDiscard = () => {
    setIsEditing(false);
    if (currentlyEditingCard?.id === ball.id) currentlyEditingCard = null;
    setShowUnsavedPrompt(false);
    if (pendingProceed) pendingProceed();
    setPendingProceed(null);
  };

  const handlePromptCancel = () => {
    setShowUnsavedPrompt(false);
    setPendingProceed(null);
  };

  const handleCloseEdit = () => {
    if (currentlyEditingCard?.id === ball.id && currentlyEditingCard.isDirty()) {
      setShowUnsavedPrompt(true);
      setPendingProceed(() => () => {}); // No extra action needed on proceed
    } else {
      setIsEditing(false);
      if (currentlyEditingCard?.id === ball.id) currentlyEditingCard = null;
    }
  };

  const handleSave = () => {
    if (readOnly) return;
    if (onUpdateBall) {
      onUpdateBall(ball.id, {
        quantity: editQty,
        packageType: editPkgType,
        customNumber: editPkgType === 'box' ? 1 : editPlayNumber,
        condition: editCondition,
        notes: editNotes.trim(),
        year: editYear,
      });
    }
    setIsEditing(false);
    if (currentlyEditingCard?.id === ball.id) {
      currentlyEditingCard = null;
    }
  };

  const incrementEditQty = () => {
    if (editPkgType === 'box') {
      setEditQty((q) => q + 12);
    } else if (editPkgType === 'sleeve') {
      setEditQty((q) => q + 3);
    } else {
      setEditQty((q) => q + 1);
    }
  };

  const decrementEditQty = () => {
    if (editPkgType === 'box') {
      setEditQty((q) => (q > 12 ? q - 12 : 12));
    } else if (editPkgType === 'sleeve') {
      setEditQty((q) => (q > 3 ? q - 3 : 3));
    } else {
      setEditQty((q) => (q > 1 ? q - 1 : 1));
    }
  };

  const handlePkgTypeChange = (type: 'ea' | 'sleeve' | 'box') => {
    setEditPkgType(type);
    if (type === 'box') {
      setEditQty(12);
    } else if (type === 'sleeve') {
      setEditQty(3);
    } else {
      setEditQty(1);
    }
  };

  const getConditionColor = (cond: BallCondition) => {
    switch (cond) {
      case BallCondition.NEW:
        return "text-lime-700 bg-lime-100 border-lime-200 dark:text-lime-400 dark:bg-lime-950/40 dark:border-lime-900";
      case BallCondition.MINT:
        return "text-emerald-700 bg-emerald-100 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900";
      case BallCondition.PLAYED:
        return "text-amber-700 bg-amber-100 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900";
      case BallCondition.SHAG:
        return "text-rose-700 bg-rose-100 border-rose-200 dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-900";
      default:
        return "text-neutral-550 bg-neutral-100 border-neutral-200 dark:text-neutral-400 dark:bg-neutral-950/40 dark:border-neutral-900";
    }
  };

  if (isEditing) {
    return (
      <div 
        className="bg-neutral-900 border border-[#2563eb]/50 rounded-2xl p-4 transition-all duration-300 shadow-md shadow-[#2563eb]/5 relative overflow-hidden"
        id={`owned-card-edit-${ball.id}`}
      >
        {showUnsavedPrompt && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" style={{ position: 'fixed' }}>
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl animate-scale-in">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto animate-pulse" />
              <h4 className="text-white font-sans font-black text-base uppercase tracking-wider">
                Unsaved Changes
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed font-mono">
                Save changes to this record?
              </p>
              <div className="flex gap-3 mt-6 pt-2 w-full">
                <button
                  type="button"
                  onClick={() => {
                    handlePromptCancel();
                    document.getElementById(`owned-card-edit-${ball.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs font-bold text-[#2563eb] uppercase tracking-widest mb-3 flex items-center justify-between">
          <span>Edit {ball.model}{ball.name ? ` - ${ball.name}` : ''}{ball.color ? ` (${ball.color})` : ''}</span>
          <button 
            type="button" 
            onClick={handleCloseEdit} 
            className="text-neutral-500 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
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
                  disabled={editPkgType === 'box'}
                  onClick={() => {
                    setEditPlayNumber(num);
                    setEditCustomNumberInput("");
                  }}
                  className={`flex-1 text-center py-1 rounded text-[11px] font-mono font-bold border transition-all cursor-pointer ${
                    editPkgType === 'box'
                      ? "bg-neutral-950 text-neutral-600 border-neutral-900 cursor-not-allowed opacity-50"
                      : editPlayNumber === num && editCustomNumberInput === ""
                      ? "bg-[#2563eb] border-[#2563eb] text-black"
                      : "bg-neutral-950 border-neutral-850 text-neutral-300 hover:border-neutral-700"
                  }`}
                >
                  {num}
                </button>
              ))}
              
              <input
                type="text"
                maxLength={2}
                disabled={editPkgType === 'box'}
                value={editPkgType === 'box' ? "" : editCustomNumberInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setEditCustomNumberInput(val);
                  if (val === "") {
                    setEditPlayNumber(1);
                  } else {
                    setEditPlayNumber(parseInt(val, 10));
                  }
                }}
                placeholder={editPkgType === 'box' ? "—" : "##"}
                className={`w-9 text-center py-1 font-mono text-xs border rounded transition-all focus:outline-none focus:border-neutral-500 ${
                  editPkgType === 'box'
                    ? "border-neutral-900 bg-neutral-950 text-neutral-600 cursor-not-allowed opacity-55"
                    : editCustomNumberInput !== ""
                    ? "bg-[#2563eb] text-black border-[#2563eb] font-bold"
                    : "bg-neutral-950 border-neutral-850 text-neutral-400"
                }`}
                title={editPkgType === 'box' ? "Not customizable for boxes" : "Enter any 2-digit number"}
              />
            </div>
          </div>

          {/* Condition Dropdown */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1">
              Condition
            </label>
            <select
              value={editCondition}
              onChange={(e) => setEditCondition(e.target.value as BallCondition)}
              className="w-full bg-neutral-950 text-xs py-1.5 px-2 rounded text-neutral-300 font-bold border border-neutral-850 focus:border-neutral-750 outline-none cursor-pointer"
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
              value={editYear}
              onChange={(e) => setEditYear(e.target.value)}
              className="w-full bg-neutral-950 text-xs py-1.5 px-2 rounded text-neutral-300 font-bold border border-neutral-850 focus:border-neutral-750 outline-none cursor-pointer"
            >
              <option value="">Unknown</option>
              {Array.from({ length: new Date().getFullYear() - 2012 + 1 }, (_, i) => String(2012 + i)).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

        </div>

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
                  onClick={decrementEditQty}
                  className="w-4.5 h-4.5 flex items-center justify-center text-neutral-400 hover:text-white rounded hover:bg-neutral-900 transition-colors text-xs cursor-pointer"
                >
                  -
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={
                    editPkgType === 'box'
                      ? Math.max(1, Math.round(editQty / 12))
                      : editPkgType === 'sleeve'
                      ? Math.max(1, Math.round(editQty / 3))
                      : editQty
                  }
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value.replace(/[^0-9]/g, "")) || 1);
                    if (editPkgType === 'box') {
                      setEditQty(val * 12);
                    } else if (editPkgType === 'sleeve') {
                      setEditQty(val * 3);
                    } else {
                      setEditQty(val);
                    }
                  }}
                  className="w-5.5 bg-transparent text-center font-mono font-black text-xs text-white outline-none"
                />
                <button
                  type="button"
                  onClick={incrementEditQty}
                  className="w-4.5 h-4.5 flex items-center justify-center text-neutral-400 hover:text-white rounded hover:bg-neutral-900 transition-colors text-xs cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex gap-1 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => handlePkgTypeChange('ea')}
                  className={`flex-1 py-1 px-0.5 border text-center font-mono text-[9px] rounded transition-all cursor-pointer truncate ${
                    editPkgType === 'ea'
                      ? "bg-[#2563eb] border-[#2563eb] text-neutral-950 font-bold"
                      : "bg-neutral-950 border-neutral-850 text-neutral-400 hover:text-white"
                  }`}
                >
                  Ball
                </button>
                <button
                  type="button"
                  onClick={() => handlePkgTypeChange('sleeve')}
                  className={`flex-1 py-1 px-0.5 border text-center font-mono text-[9px] rounded transition-all cursor-pointer truncate ${
                    editPkgType === 'sleeve'
                      ? "bg-[#2563eb] border-[#2563eb] text-neutral-950 font-bold"
                      : "bg-neutral-950 border-neutral-850 text-neutral-400 hover:text-white"
                  }`}
                >
                  Sleeve
                </button>
                <button
                  type="button"
                  onClick={() => handlePkgTypeChange('box')}
                  className={`flex-1 py-1 px-0.5 border text-center font-mono text-[9px] rounded transition-all cursor-pointer truncate ${
                    editPkgType === 'box'
                      ? "bg-[#2563eb] border-[#2563eb] text-neutral-950 font-bold"
                      : "bg-neutral-950 border-neutral-850 text-neutral-400 hover:text-white"
                  }`}
                >
                  Box
                </button>
              </div>
            </div>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1 flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-neutral-500" /> Notes
            </label>
            <input
              type="text"
              placeholder="Collection notes..."
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="w-full bg-neutral-950 text-xs py-1.5 px-3 rounded text-neutral-300 border border-neutral-850 focus:border-neutral-750 outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-neutral-800/70">
          <button
            type="button"
            onClick={handleCloseEdit}
            className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-all cursor-pointer text-[10px] uppercase tracking-wider font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-1.5 bg-[#2563eb] hover:bg-[#3b82f6] text-black font-extrabold rounded-lg transition-all cursor-pointer text-[10px] uppercase tracking-wider flex items-center gap-1"
          >
            <Save className="w-3.5 h-3.5" /> Save Changes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-neutral-900 hover:bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 transition-all duration-300 shadow-sm relative group overflow-hidden"
      id={`owned-card-${ball.id}`}
    >
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center p-3 text-center z-10 animate-fade-in backdrop-blur-sm">
          <Trash2 className="w-5 h-5 text-rose-500 mb-1 animate-bounce" />
          <h4 className="text-white font-sans font-black text-xs uppercase tracking-wider">
            Remove from Bag?
          </h4>
          <p className="text-[10px] text-neutral-400 mt-0.5 max-w-[220px] leading-snug">
            Delete <strong>{ball.model}{ball.name ? ` - ${ball.name}` : ''} ({ball.color})</strong> from your list?
          </p>
              <div className="flex gap-2 mt-2 w-full max-w-[180px]">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 py-1 px-2 bg-neutral-950 border border-neutral-800 hover:bg-neutral-900 text-neutral-400 font-mono text-[9px] uppercase font-bold tracking-wider rounded-md transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (onDelete) onDelete(ball.id);
                setShowDeleteConfirm(false);
              }}
              className="flex-1 py-1 px-2 bg-rose-600 hover:bg-rose-500 text-white font-mono text-[9px] uppercase font-bold tracking-wider rounded-md transition-all cursor-pointer shadow-md shadow-rose-950/40"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Row representing main ball state and descriptors */}
      <div className="flex gap-4">
        {/* Ball representation */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center p-1 bg-neutral-950 rounded-xl border border-neutral-850 h-22 w-22 shadow-inner relative">
          <BallVisual 
            color={ball.color} 
            model={ball.model} 
            number={ball.packageType === 'box' ? undefined : ball.customNumber} 
            size="md" 
            customImage={ball.customImage}
            customImageSleeve={ball.customImageSleeve}
            customImageBox={ball.customImageBox}
            packageType={ball.packageType}
          />
          {ball.packageType !== 'box' && (
            <div className="absolute -bottom-1 text-[8px] font-mono uppercase bg-neutral-950 border border-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded leading-none scale-90">
              #{ball.customNumber}
            </div>
          )}
        </div>

        {/* Core content information */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-1">
              <div className="truncate">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-mono tracking-widest text-[#2563eb] uppercase font-black">
                    {ball.model}{ball.name ? ` - ${ball.name}` : ''}
                  </span>
                  <span className={`text-[8px] px-1 py-0.2 rounded font-mono font-bold uppercase border tracking-wider scale-95 ${
                    ball.bundleItems && ball.bundleItems.length > 0
                      ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400"
                      : ball.packageType === 'box'
                      ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-400"
                      : ball.packageType === 'sleeve'
                      ? "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/60 text-purple-700 dark:text-purple-400"
                      : "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900/60 text-teal-700 dark:text-teal-400"
                  }`}>
                    {ball.bundleItems && ball.bundleItems.length > 0 ? 'Bundle' : ball.packageType === 'box' ? 'Box' : ball.packageType === 'sleeve' ? 'Sleeve' : 'Ball'}
                  </span>
                </div>
                <h4 className="font-sans font-black text-white text-base leading-tight truncate mt-0.5" title={ball.color}>
                  {ball.color}
                </h4>
              </div>

              {/* Action Buttons (Edit and Delete) */}
              {!readOnly && (
                <div className="flex gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    type="button"
                    onClick={startEditing}
                    className="p-1 hover:bg-neutral-800 text-neutral-500 hover:text-white rounded transition-colors cursor-pointer"
                    title="Edit ball"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-1 hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                    title="Remove from bag"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Condition badge */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-mono text-neutral-500 uppercase">Condition:</span>
              <span className={`text-[10px] py-0.5 px-2 rounded font-bold border select-none transition-all ${getConditionColor(ball.condition)}`}>
                {ball.condition}
              </span>
            </div>

            {/* Year Display */}
            {ball.year && (
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-[10px] font-mono text-neutral-500 uppercase">Year:</span>
                <span className="text-[10px] py-0.5 px-2 rounded font-bold border border-neutral-800 bg-neutral-950 text-neutral-300 select-none">
                  {ball.year}
                </span>
              </div>
            )}

            {/* Variation Display */}
            {(ball.variation || currentVersion !== "Standard Edition") && (
              <div className="mt-1.5 flex flex-col gap-1 items-start">
                <span className="text-[10px] font-mono text-neutral-500 uppercase">Variation:</span>
                <div className="flex flex-wrap gap-1">
                  <span className="text-[9px] font-mono font-bold bg-neutral-950 border border-neutral-800 text-neutral-450 px-1.5 py-0.5 rounded select-none leading-none">
                    {ball.variation || currentVersion}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 text-[10px] text-neutral-400 font-mono flex items-center gap-2">
            <span className="text-neutral-500">ADDED:</span>
            <span className="bg-neutral-950/60 p-0.5 px-1.5 rounded text-neutral-400">{ball.dateAdded}</span>
          </div>
        </div>
      </div>

      {/* Row representing notes + count triggers */}
      <div className="mt-4 pt-3.5 border-t border-neutral-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Notes Read-Only */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 py-1.5 px-2 bg-neutral-950/20 rounded-xl">
            <FileText className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
            <span className="italic truncate text-[11px] font-sans" title={currentNotes}>
              {currentNotes || "No custom notes recorded."}
            </span>
          </div>
        </div>

        {/* Quantity Read-Only */}
        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
          <span className="text-[10px] font-mono text-neutral-500 uppercase">Quantity Owned:</span>
          
          <div className="px-3 py-1 bg-neutral-950 rounded-lg border border-neutral-850 text-xs font-mono font-black text-[#2563eb]">
            {ball.bundleItems && ball.bundleItems.length > 0 ? (() => {
              const bundleTotal = ball.bundleItems.reduce((acc, b) => acc + b.qty, 0);
              const numBundles = Math.max(1, Math.round(ball.quantity / bundleTotal));
              return (
                <span>
                  {numBundles}{" "}
                  <span className="text-[10px] text-neutral-500 font-normal">
                    {numBundles === 1 ? "Bundle" : "Bundles"}
                  </span>
                  <span className="text-[9px] text-neutral-400 font-normal ml-1.5">
                    ({ball.quantity} balls)
                  </span>
                </span>
              );
            })() : ball.packageType === "box" ? (
              <span>
                {Math.max(1, Math.round(ball.quantity / 12))}{" "}
                <span className="text-[10px] text-neutral-500 font-normal">
                  {Math.round(ball.quantity / 12) === 1 ? "Box" : "Boxes"}
                </span>
                <span className="text-[9px] text-neutral-400 font-normal ml-1.5">
                  ({ball.quantity} balls)
                </span>
              </span>
            ) : ball.packageType === "sleeve" ? (
              <span>
                {Math.max(1, Math.round(ball.quantity / 3))}{" "}
                <span className="text-[10px] text-neutral-500 font-normal">
                  {Math.round(ball.quantity / 3) === 1 ? "Sleeve" : "Sleeves"}
                </span>
                <span className="text-[9px] text-neutral-400 font-normal ml-1.5">
                  ({ball.quantity} balls)
                </span>
              </span>
            ) : (
              <span>
                {ball.quantity}{" "}
                <span className="text-[10px] text-neutral-500 font-normal">
                  {ball.quantity === 1 ? "Ball" : "Balls"}
                </span>
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Bundle Contents Accordion */}
      {ball.bundleItems && ball.bundleItems.length > 0 && (
        <div className="mt-4 pt-3 border-t border-neutral-800/70">
          <button 
            type="button"
            onClick={() => setShowBundleContents(!showBundleContents)}
            className="flex items-center gap-2 text-xs font-bold text-[#2563eb] hover:text-[#3b82f6] uppercase tracking-wider transition-colors"
          >
            <Box className="w-4 h-4" />
            Contains {ball.bundleItems.reduce((acc, item) => acc + item.qty, 0)} Items
            {showBundleContents ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showBundleContents && (
            <div className="mt-3 space-y-2 pl-6 animate-fade-in">
              {ball.bundleItems.map((item, idx) => {
                const catItem = catalog.find(c => c.id === item.catalogId);
                return (
                  <div key={idx} className="flex items-center gap-2 text-xs text-neutral-300">
                    <span className="font-bold text-neutral-500 w-6">{item.qty}x</span>
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="font-sans font-bold text-white truncate">
                        {catItem ? `${catItem.model}${catItem.name ? ` - ${catItem.name}` : ''}` : item.catalogId}
                      </span>
                      {catItem && (
                        <span className="text-[10px] text-neutral-400 font-mono bg-neutral-950 px-1.5 py-0.5 rounded truncate">
                          {catItem.color} {catItem.variation ? `(${catItem.variation})` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
