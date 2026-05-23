/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { GolfBall, BallColor, BallModel, BallCondition } from "../types";
import { COLOR_STYLES, VICE_BALLS_SPECS } from "../constants";

interface ChartsPanelProps {
  balls: GolfBall[];
}

export default function ChartsPanel({ balls }: ChartsPanelProps) {
  const totalBalls = balls.reduce((sum, item) => sum + item.quantity, 0);

  // Helper for safe color styling mapping
  const getColorStyleSafe = (colorName: string) => {
    return COLOR_STYLES[colorName as BallColor] || {
      name: colorName,
      bg: "bg-neutral-800 border-neutral-600",
      isDrip: false
    };
  };

  // --- 1. Model Breakdown ---
  // Get all unique models currently in the bag, standard and custom
  const uniqueTrackedModels = Array.from(new Set(balls.map(b => b.model)));

  const modelBreakdown = uniqueTrackedModels.map(model => {
    const qty = balls
      .filter(b => b.model === model)
      .reduce((sum, b) => sum + b.quantity, 0);
    const percentage = totalBalls > 0 ? (qty / totalBalls) * 100 : 0;
    
    // Assign custom color accent for theme bars
    let themeColor = "bg-neutral-600";
    if (model === BallModel.PRO_PLUS) themeColor = "bg-rose-500 shadow-sm";
    else if (model === BallModel.PRO) themeColor = "bg-[#2563eb] text-white shadow-sm";
    else if (model === BallModel.PRO_SOFT) themeColor = "bg-[#ffd700] text-neutral-900";
    else if (model === BallModel.TOUR) themeColor = "bg-sky-400";
    else if (model === BallModel.DRIVE) themeColor = "bg-slate-400";
    else themeColor = "bg-emerald-500/80 shadow-md";

    const isCustom = !Object.values(BallModel).includes(model as BallModel);

    return { model, qty, percentage, themeColor, isCustom };
  });

  // Sort model breakdown by quantity descending
  modelBreakdown.sort((a, b) => b.qty - a.qty);

  // --- 2. Color Distribution ---
  // Get all unique colorways currently in the bag
  const uniqueTrackedColors = Array.from(new Set(balls.map(b => b.color)));

  const colorBreakdown = uniqueTrackedColors.map(color => {
    const qty = balls
      .filter(b => b.color === color)
      .reduce((sum, b) => sum + b.quantity, 0);
    const percentage = totalBalls > 0 ? (qty / totalBalls) * 100 : 0;
    return { color, qty, percentage };
  }).filter(item => item.qty > 0);

  // Sort colors descending
  colorBreakdown.sort((a, b) => b.qty - a.qty);

  // --- 3. Condition Distribution ---
  const conditionBreakdown = Object.values(BallCondition).map(condition => {
    const qty = balls
      .filter(b => b.condition === condition)
      .reduce((sum, b) => sum + b.quantity, 0);
    const percentage = totalBalls > 0 ? (qty / totalBalls) * 100 : 0;
    return { condition, qty, percentage };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="charts-panel">
      {/* Models Breakdown */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg">
        <h3 className="font-sans font-bold text-sm text-neutral-300 tracking-wider uppercase mb-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          Model Distribution
        </h3>

        {totalBalls === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-xs text-neutral-500">
            No balls in bag to plot models.
          </div>
        ) : (
          <div className="space-y-4">
            {modelBreakdown.map(item => (
              <div key={item.model} className="space-y-1" id={`chart-model-${item.model.replace(" ", "-")}`}>
                <div className="flex justify-between items-baseline text-xs text-neutral-300">
                  <span className="font-bold tracking-tight font-sans text-white">{item.model}</span>
                  <span className="text-neutral-400 font-mono">
                    {item.qty} ball{item.qty !== 1 ? 's' : ''} ({Math.round(item.percentage)}%)
                  </span>
                </div>
                {/* Visual Bar */}
                <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${item.themeColor}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-[10px] text-neutral-500 block leading-tight">
                  {item.isCustom 
                    ? "Registered database golf ball variety" 
                    : (VICE_BALLS_SPECS[item.model as BallModel]?.tagline || "High flight speed")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Colors Breakdown */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg">
        <h3 className="font-sans font-bold text-sm text-neutral-300 tracking-wider uppercase mb-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-lime-400" />
          Colors Breakdown
        </h3>

        {totalBalls === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-xs text-neutral-500">
            No balls in bag to plot colors.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Custom Vertical Stacking Chart */}
            <div className="flex h-4 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800 mb-4 font-sans text-xs">
              {colorBreakdown.map((item, index) => {
                let bgStyle = "";
                let customColorHex = "";
                if (item.color === BallColor.WHITE) bgStyle = "bg-white";
                else if (item.color === BallColor.NEON_LIME) bgStyle = "bg-[#ccff00]";
                else if (item.color === BallColor.NEON_RED) bgStyle = "bg-[#ff2d55]";
                else if (item.color === BallColor.DRIP_LIME) bgStyle = "bg-[#ccff00]/80 stripe-black";
                else if (item.color === BallColor.DRIP_RED_BLUE) bgStyle = "bg-sky-400";
                else if (item.color === BallColor.DRIP_YELLOW) bgStyle = "bg-[#ffd700]";
                else if (item.color === BallColor.GOLD) bgStyle = "bg-yellow-500";
                else if (item.color === BallColor.HUE_BLUE) bgStyle = "bg-[#00f0ff]";
                else {
                  // Fallback: stable hue variation based on name string
                  let hash = 0;
                  for (let i = 0; i < item.color.length; i++) {
                    hash = item.color.charCodeAt(i) + ((hash << 5) - hash);
                  }
                  const hue = Math.abs(hash % 360);
                  customColorHex = `hsl(${hue}, 80%, 55%)`;
                }
                
                return (
                  <div 
                    key={item.color}
                    className={`${bgStyle} h-full transition-all duration-500`}
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: customColorHex || undefined
                    }}
                    title={`${item.color}: ${item.qty} balls`}
                  />
                );
              })}
            </div>

            {/* Color Labels Grid */}
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
              {colorBreakdown.map(item => {
                const config = getColorStyleSafe(item.color);
                return (
                  <div key={item.color} className="flex items-center justify-between text-xs p-1.5 rounded bg-neutral-950/40 border border-neutral-850">
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full border ${config.bg} ${config.isDrip ? 'ring-2 ring-violet-500/30' : ''}`} />
                      <span className="text-white font-medium">{item.color}</span>
                    </div>
                    <span className="font-mono text-neutral-400">
                      {item.qty} ball{item.qty !== 1 ? 's' : ''} ({Math.round(item.percentage)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Conditions Rating */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg">
        <h3 className="font-sans font-bold text-sm text-neutral-300 tracking-wider uppercase mb-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff]" />
          Condition Quality Index
        </h3>

        {totalBalls === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-xs text-neutral-500">
            No balls in bag to assess quality.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {conditionBreakdown.map(item => {
              // Custom SVG radial representation of percentages
              const radius = 24;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset = circumference - (item.percentage / 100) * circumference;

              let ringColor = "text-lime-600 dark:text-lime-400";
              let labelStyle = "text-white";
              if (item.condition === BallCondition.NEW) ringColor = "text-lime-600 dark:text-lime-400";
              if (item.condition === BallCondition.MINT) ringColor = "text-sky-600 dark:text-sky-400";
              if (item.condition === BallCondition.PLAYED) ringColor = "text-amber-600 dark:text-amber-400";
              if (item.condition === BallCondition.SHAG) ringColor = "text-rose-600 dark:text-rose-500";

              return (
                <div key={item.condition} className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-center flex flex-col items-center justify-between" id={`condition-gauge-${item.condition.replace(/[^a-zA-Z]/g, "-")}`}>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block mb-1">
                    {item.condition.split(" ")[0]}
                  </span>
                  
                  {/* Radial Ring */}
                  <div className="relative w-14 h-14 my-1 flex items-center justify-center">
                    <svg className="w-14 h-14 transform -rotate-90">
                      <circle
                        cx="28"
                        cy="28"
                        r={radius}
                        className="text-neutral-800"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="transparent"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r={radius}
                        className={`${ringColor} transition-all duration-500`}
                        strokeWidth="3.5"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-bold font-mono text-white">
                      {Math.round(item.percentage)}%
                    </span>
                  </div>

                  <span className="text-[10px] text-neutral-400 mt-1 block">
                    {item.qty} ball{item.qty !== 1 ? 's' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
