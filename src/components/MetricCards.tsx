/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { GolfBall, CourseLog, BallCondition, BallModel } from "../types";
import { VICE_BALLS_SPECS } from "../constants";
import { Sparkles, Trophy, Skull, Locate } from "lucide-react";

interface MetricCardsProps {
  balls: GolfBall[];
  courseLogs: CourseLog[];
  onTriggerQuickAction: (type: "lost" | "found") => void;
}

export default function MetricCards({ balls, courseLogs, onTriggerQuickAction }: MetricCardsProps) {
  // 1. Total individual balls owned
  const totalBalls = balls.reduce((sum, item) => sum + item.quantity, 0);
  const totalSleevesCount = Math.floor(totalBalls / 3);
  const looseBallsCount = totalBalls % 3;

  // 2. Unique brands and custom designs counter
  const uniqueModelsCount = new Set(
    balls.map(b => `${b.model.trim().toLowerCase()}|${b.color.trim().toLowerCase()}|${b.notes.trim().toLowerCase()}`)
  ).size;
  const standardModels = Object.values(BallModel) as string[];
  const customBallsCount = balls
    .filter(b => !standardModels.includes(b.model))
    .reduce((sum, b) => sum + b.quantity, 0);
  const totalUniqueColors = new Set(balls.map(b => b.color)).size;

  // 3. Stats from course log history
  const totalLostCount = courseLogs.filter(log => log.type === "lost").length;
  const totalFoundCount = courseLogs.filter(log => log.type === "found").length;

  // Net Course Balance
  const donationRate = totalLostCount - totalFoundCount;

  // Pristine Ratio (percentage of balls that are Brand New or Near-Mint)
  const pristineBallsCount = balls
    .filter(b => b.condition === BallCondition.NEW || b.condition === BallCondition.MINT)
    .reduce((sum, b) => sum + b.quantity, 0);

  const pristinePct = totalBalls > 0 ? Math.round((pristineBallsCount / totalBalls) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="metrics-dashboard">
      {/* Total Balls Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between shadow-md relative overflow-hidden group">
        <div className="absolute right-3 top-3 opacity-10 group-hover:scale-110 transition-transform">
          <Trophy size={48} className="text-lime-400" />
        </div>
        <div>
          <span className="text-xs font-mono text-neutral-400">BAG INVENTORY</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalBalls}</span>
            <span className="text-neutral-300 text-xs font-medium">ball{totalBalls !== 1 ? 's' : ''}</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            {totalSleevesCount} sleeve{totalSleevesCount !== 1 ? 's' : ''} + {looseBallsCount} loose ball{looseBallsCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between">
          <span className="text-[10px] uppercase font-mono text-neutral-500">Pristine State</span>
          <span className="text-xs font-bold text-lime-400">{pristinePct}%</span>
        </div>
      </div>

      {/* Vault Variety / Custom Ball Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between shadow-md relative overflow-hidden group" id="metric-vault-variety">
        <div className="absolute right-3 top-3 opacity-10 group-hover:scale-110 transition-transform">
          <Sparkles size={48} className="text-[#00f0ff]" />
        </div>
        <div>
          <span className="text-xs font-mono text-neutral-400">VAULT VARIETY</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{uniqueModelsCount}</span>
            <span className="text-neutral-300 text-xs font-medium">unique model{uniqueModelsCount !== 1 ? 's' : ''}</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            Tracking {customBallsCount} registered design{customBallsCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between">
          <span className="text-[10px] uppercase font-mono text-neutral-400">Unique Colorway styles</span>
          <span className="text-xs font-semibold text-[#00f0ff]">
            {totalUniqueColors} visual{totalUniqueColors !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Course Loss/Death Rate Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between shadow-md relative overflow-hidden group">
        <div className="absolute right-4 top-3 opacity-10 group-hover:scale-110 transition-transform">
          <Skull size={44} className="text-red-400" />
        </div>
        <div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-neutral-400">LOST ON COURSE</span>
            <span className="text-[10px] font-mono bg-red-950 text-red-400 px-1.5 py-0.5 rounded">
              RIP
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalLostCount}</span>
            <span className="text-xs text-neutral-400">balls donated</span>
          </div>
          <button
            id="quick-log-lost-ball"
            onClick={() => onTriggerQuickAction("lost")}
            className="text-[10px] text-red-400 font-mono font-bold hover:underline mt-1 bg-red-950/25 px-2 py-0.5 rounded cursor-pointer block hover:bg-red-950/50 text-left w-max"
          >
            ⚠️ Log a Ball Lost in Hazards
          </button>
        </div>
        <div className="mt-2 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-[11px]">
          <span className="text-[10px] uppercase font-mono text-neutral-500">Woods/Water Toll</span>
          <span className="text-red-300 font-bold">
            {donationRate > 0 ? `+${donationRate} Net Lost` : donationRate < 0 ? `${donationRate} Net Found` : "Perfectly Balanced"}
          </span>
        </div>
      </div>

      {/* Course Rescue Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between shadow-md relative overflow-hidden group">
        <div className="absolute right-4 top-3 opacity-10 group-hover:scale-110 transition-transform">
          <Locate size={44} className="text-emerald-400" />
        </div>
        <div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-neutral-400">GREENSIDE RESCUES</span>
            <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded">
              SAVED
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalFoundCount}</span>
            <span className="text-xs text-neutral-400">wild balls salvaged</span>
          </div>
          <button
            id="quick-log-found-ball"
            onClick={() => onTriggerQuickAction("found")}
            className="text-[10px] text-emerald-400 font-mono font-bold hover:underline mt-1 bg-emerald-950/25 px-2 py-0.5 rounded cursor-pointer block hover:bg-emerald-950/50 text-left w-max"
          >
            🌲 Log a Ball Found on Course
          </button>
        </div>
        <div className="mt-2 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-[11px]">
          <span className="text-[10px] uppercase font-mono text-neutral-500">Salvage Ratio</span>
          <span className="text-emerald-400 font-bold">
            {totalLostCount > 0 ? `${Math.round((totalFoundCount / totalLostCount) * 100)}% recovery` : "100% clean"}
          </span>
        </div>
      </div>
    </div>
  );
}
