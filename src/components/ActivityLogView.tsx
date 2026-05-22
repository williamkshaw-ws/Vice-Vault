/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CourseLog, BallModel, BallColor, BallCondition } from "../types";
import { VICE_BALLS_SPECS, COLOR_STYLES } from "../constants";
import { Skull, Locate, Plus, Calendar, Compass, Clipboard } from "lucide-react";

interface ActivityLogViewProps {
  courseLogs: CourseLog[];
  onAddManualLog: (log: Omit<CourseLog, "id">) => void;
  onClearLogs: () => void;
}

export default function ActivityLogView({
  courseLogs,
  onAddManualLog,
  onClearLogs
}: ActivityLogViewProps) {
  const [showManualForm, setShowManualForm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // Form fields
  const [logType, setLogType] = useState<"lost" | "found">("found");
  const [model, setModel] = useState<BallModel>(BallModel.PRO);
  const [color, setColor] = useState<BallColor>(BallColor.WHITE);
  const [condition, setCondition] = useState<BallCondition>(BallCondition.MINT);
  const [courseName, setCourseName] = useState("");
  const [holeNumber, setHoleNumber] = useState<number>(1);
  const [notes, setNotes] = useState("");

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) {
      alert("Please specify the course name.");
      return;
    }

    onAddManualLog({
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      type: logType,
      model,
      color,
      condition: logType === "found" ? condition : undefined,
      courseName,
      holeNumber: holeNumber || undefined,
      notes: notes || (logType === "found" ? "Salvaged from the grass" : "Sliced off the tee")
    });

    // Reset Form
    setCourseName("");
    setNotes("");
    setShowManualForm(false);
    alert(`Successfully registered course ${logType === "found" ? "salvage" : "loss"}!`);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl text-neutral-100" id="activity-logs-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="font-sans font-black tracking-tight text-lg text-white flex items-center gap-2">
            <Compass className="text-lime-400" size={20} />
            COURSE LOGGER & BALL JOURNAL
          </h3>
          <p className="text-xs text-neutral-400">
            Track your ball survival rates, loss zones, and found golf ball rewards.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            id="btn-toggle-manual-course-log"
            onClick={() => {
              setShowManualForm(!showManualForm);
              if (!showManualForm) {
                // Default type to found if they click from top bar
                setLogType("found");
              }
            }}
            className="bg-lime-400 hover:bg-lime-300 text-black text-xs font-bold py-2 px-3.5 rounded-lg flex items-center gap-1 transition"
          >
            <Plus size={14} />
            <span>{showManualForm ? "Collapse Logger" : "Quick Course Event"}</span>
          </button>
          
          {courseLogs.length > 0 && (
            <div className="flex items-center gap-1.5">
              {showClearConfirm ? (
                <div className="flex items-center gap-1 bg-rose-950/20 border border-rose-900/60 p-0.5 rounded-lg">
                  <span className="text-[10px] text-rose-300 px-1.5 font-mono">Clear Journal?</span>
                  <button
                    onClick={() => {
                      onClearLogs();
                      setShowClearConfirm(false);
                    }}
                    className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-mono font-bold py-1 px-2.5 rounded transition cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="text-neutral-400 hover:text-white text-[10px] font-mono py-1 px-2 rounded transition cursor-pointer"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  id="btn-clear-course-logs"
                  onClick={() => setShowClearConfirm(true)}
                  className="text-neutral-500 hover:text-red-400 text-xs font-mono py-2 px-3 hover:bg-neutral-950 rounded border border-neutral-850 cursor-pointer"
                >
                  Reset History
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Inline Logger Form */}
      {showManualForm && (
        <form onSubmit={handleFormSubmit} className="bg-neutral-950 border border-neutral-850 p-5 rounded-xl mb-6 space-y-4 animate-fadeIn" id="manual-log-form">
          <h4 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-1.5 border-b border-neutral-900 pb-2 mb-2">
            <Clipboard size={14} className="text-lime-400" />
            File Course Occurrence
          </h4>

          <div className="grid grid-cols-2 gap-2 bg-neutral-900 p-1.5 rounded-xl border border-neutral-850">
            <button
              type="button"
              id="logger-type-lost"
              onClick={() => setLogType("lost")}
              className={`py-1.5 rounded-lg text-xs font-bold tracking-tight text-center transition ${
                logType === "lost" 
                  ? "bg-red-650 text-white shadow-sm" 
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              ☠️ LOST BALL
            </button>
            <button
              type="button"
              id="logger-type-found"
              onClick={() => setLogType("found")}
              className={`py-1.5 rounded-lg text-xs font-bold tracking-tight text-center transition ${
                logType === "found" 
                  ? "bg-emerald-650 text-white shadow-emerald-900 shadow-sm" 
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              🌲 FOUND BALL (Salvage)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1">Ball Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as BallModel)}
                className="w-full bg-neutral-900 border border-neutral-800 text-xs py-2 px-3 rounded-lg text-neutral-200"
              >
                {Object.values(BallModel).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1">Color</label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value as BallColor)}
                className="w-full bg-neutral-900 border border-neutral-800 text-xs py-2 px-3 rounded-lg text-neutral-200"
              >
                {VICE_BALLS_SPECS[model].availableColors.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {logType === "found" ? (
              <div>
                <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1">Condition Found</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as BallCondition)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs py-2 px-3 rounded-lg text-neutral-200"
                >
                  {Object.values(BallCondition).map(cond => (
                    <option key={cond} value={cond}>{cond}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-[10px] uppercase font-mono text-neutral-450 block mb-1">Penalties Filed</label>
                <div className="text-xs bg-neutral-900 border border-neutral-800 text-red-400 py-2 px-3 rounded-lg font-mono">
                  +1 Penalty Stroke
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1">Course Name</label>
              <input
                type="text"
                value={courseName}
                required
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g. Cypress Point, Whispering Pines"
                className="w-full bg-neutral-900 border border-neutral-800 text-xs py-2 px-3 rounded-lg text-neutral-200 outline-none focus:border-stone-550"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1">Hole #</label>
                <input
                  type="number"
                  min="1"
                  max="18"
                  value={holeNumber}
                  onChange={(e) => setHoleNumber(parseInt(e.target.value) || 1)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs py-2 px-3 rounded-lg text-neutral-200"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1">Incident Type</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={logType === "found" ? "In deep fescue near bunker" : "Lake hook shot with driver"}
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs py-2 px-3 rounded-lg text-neutral-200"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-900">
            <button
              type="button"
              id="cancel-logger-btn"
              onClick={() => setShowManualForm(false)}
              className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-logger-btn"
              className="px-4 py-2 rounded-lg bg-lime-400 hover:bg-lime-300 text-black text-xs font-extrabold"
            >
              Log to Timeline
            </button>
          </div>
        </form>
      )}

      {/* History Feed List */}
      {courseLogs.length === 0 ? (
        <div className="h-56 border border-dashed border-neutral-800 rounded-xl flex flex-col items-center justify-center text-center p-6 bg-neutral-950/30">
          <Calendar size={32} className="text-neutral-600 mb-2" />
          <h5 className="font-bold text-neutral-400 text-sm">Course timeline is empty</h5>
          <p className="text-xs text-neutral-500 max-w-sm mt-1">
            When you lose balls during a round or salvage a wild ball, log them here to keep track of bag metrics!
          </p>
        </div>
      ) : (
        <div className="space-y-3" id="course-logs-feed">
          {courseLogs.map(log => {
            const isLost = log.type === "lost";
            const clrConfig = COLOR_STYLES[log.color];

            return (
              <div 
                key={log.id} 
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
                  isLost 
                    ? "bg-red-950/5 border-red-900/10 hover:border-red-500/20" 
                    : "bg-emerald-950/5 border-emerald-950 hover:border-emerald-500/30"
                }`}
                id={`course-log-item-${log.id}`}
              >
                {/* Visual side */}
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg flex-shrink-0 ${isLost ? 'bg-red-950/40 text-red-400' : 'bg-emerald-950/50 text-emerald-400'}`}>
                    {isLost ? <Skull size={18} /> : <Locate size={18} />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-[9px] font-bold uppercase py-0.5 px-1.5 rounded bg-neutral-950 text-neutral-400">
                        {log.date}
                      </span>
                      <span className={`text-xs font-black uppercase ${isLost ? "text-red-400" : "text-emerald-400"}`}>
                        {isLost ? "DONATED IN ACTION" : "SALVAGED COMPELLINGLY"}
                      </span>
                      <span className="text-xs text-neutral-400 font-bold font-sans">
                        - VICE {log.model} ({log.color.split("/")[0]})
                      </span>
                    </div>

                    <p className="text-xs text-white font-medium mt-1">
                      ⛳️ {log.courseName} {log.holeNumber ? `• Hole ${log.holeNumber}` : ""}
                    </p>
                    
                    <p className="text-[11px] text-neutral-400 italic mt-0.5">
                      &quot;{log.notes}&quot;
                    </p>
                  </div>
                </div>

                {/* Right side stats */}
                <div className="text-right sm:flex-shrink-0 self-end sm:self-center">
                  {isLost ? (
                    <span className="text-xs font-mono font-bold text-red-400 bg-red-950/30 px-2.5 py-1 rounded-full border border-red-900/30">
                      -1 ball count
                    </span>
                  ) : (
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-900/30">
                        +1 ball count
                      </span>
                      {log.condition && (
                        <span className="text-[10px] text-neutral-500 font-mono">
                          Cond: {log.condition}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
