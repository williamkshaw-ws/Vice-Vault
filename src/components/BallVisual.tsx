/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BallColor, BallModel } from "../types";

interface BallVisualProps {
  color: BallColor | string;
  model: BallModel | string;
  number?: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  customImage?: string;
}

export default function BallVisual({
  color,
  model,
  number,
  size = "md",
  className = "",
  customImage
}: BallVisualProps) {
  // Sizing styles
  const sizeClasses = {
    sm: "w-10 h-10 text-[9px]",
    md: "w-16 h-16 text-[12px]",
    lg: "w-24 h-24 text-[16px]",
    xl: "w-36 h-36 text-[22px]"
  };

  const textSizes = {
    sm: { brand: "text-[9px] tracking-widest", num: "text-[8px]" },
    md: { brand: "text-[14px] font-extrabold tracking-widest leading-none", num: "text-[11px]" },
    lg: { brand: "text-[20px] font-black tracking-widest leading-none", num: "text-[15px]" },
    xl: { brand: "text-[30px] font-black tracking-[0.2em] leading-none mb-1", num: "text-[22px]" }
  };

  // If there is anuploaded custom image, render it inside a 3D physical dimple bubble!
  if (customImage) {
    return (
      <div 
        className={`relative inline-flex items-center justify-center rounded-full aspect-square border shadow-md select-none overflow-hidden shrink-0 ${sizeClasses[size]} ${className}`}
        id={`golfball-custom-${size}`}
        style={{
          boxShadow: size === "xl" 
            ? "inset -12px -12px 30px rgba(0,0,0,0.55), inset 12px 12px 25px rgba(255,255,255,0.45), 0 10px 20px rgba(0,0,0,0.3)" 
            : size === "lg"
            ? "inset -8px -8px 20px rgba(0,0,0,0.5), inset 8px 8px 15px rgba(255,255,255,0.4), 0 6px 12px rgba(0,0,0,0.2)"
            : "inset -4px -4px 10px rgba(0,0,0,0.45), inset 4px 4px 8px rgba(255,255,255,0.35), 0 4px 6px rgba(0,0,0,0.15)"
        }}
      >
        <img 
          src={customImage} 
          alt="Custom ball design" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        {/* Dimple overlay on top of custom photo to make it look like a 3D golf ball! */}
        <div 
          className="absolute inset-0 opacity-[0.22] rounded-full mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #000 20%, transparent 25%)`,
            backgroundSize: size === "xl" ? "12px 12px" : size === "lg" ? "8.5px 8.5px" : "6px 6px",
            backgroundPosition: "center"
          }}
        />


        {/* Shading layer */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: size === "xl" 
              ? "inset -12px -12px 30px rgba(0,0,0,0.55), inset 12px 12px 25px rgba(255,255,255,0.45)" 
              : size === "lg"
              ? "inset -8px -8px 20px rgba(0,0,0,0.5), inset 8px 8px 15px rgba(255,255,255,0.4)"
              : "inset -4px -4px 10px rgba(0,0,0,0.45), inset 4px 4px 8px rgba(255,255,255,0.35)"
          }}
        />
        {/* Sphere highlight */}
        <div 
          className="absolute top-[4%] left-[10%] w-[35%] h-[35%] rounded-full opacity-50 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 75%)"
          }}
        />
      </div>
    );
  }

  // Get color configurations
  const getColorConfigs = () => {
    const c = (typeof color === "string" ? color : "").toLowerCase().trim();

    if (c.includes("lime") || c.includes("neon lime") || c.includes("neon_lime")) {
      if (c.includes("drip") || c.includes("splash") || c.includes("splatter")) {
        return {
          bg: "radial-gradient(circle at 35% 35%, #e1ff00 0%, #a6d200 65%, #7da200 100%)",
          text: "text-black",
          border: "border-lime-500",
          lineColor: "#000",
          hasDrips: true,
          dripColors: ["#000000", "#ff007f", "#000000"]
        };
      }
      return {
        bg: "radial-gradient(circle at 35% 35%, #e1ff00 0%, #a6d200 60%, #7da200 100%)",
        text: "text-black",
        border: "border-lime-400",
        lineColor: "#000"
      };
    }

    if (c.includes("red") || c.includes("coral") || c.includes("pink") || c.includes("magenta")) {
      if (c.includes("drip") || c.includes("splash") || c.includes("splatter") || c.includes("blue")) {
        return {
          bg: "radial-gradient(circle at 35% 35%, #ffffff 0%, #f0f0f0 60%, #cccccc 100%)",
          text: "text-black",
          border: "border-gray-200",
          lineColor: "#000",
          hasDrips: true,
          dripColors: ["#3b82f6", "#ef4444", "#1d4ed8"]
        };
      }
      return {
        bg: "radial-gradient(circle at 35% 35%, #ff3b6c 0%, #e6003b 60%, #b3002d 100%)",
        text: "text-black",
        border: "border-red-400",
        lineColor: "#000"
      };
    }

    if (c.includes("yellow") || c.includes("neon yellow")) {
      const isDripMatch = c.includes("drip") || c.includes("splash") || c.includes("splatter");
      return {
        bg: "radial-gradient(circle at 35% 35%, #ffea00 0%, #e1cc00 60%, #aaaa00 100%)",
        text: "text-black",
        border: "border-yellow-400",
        lineColor: "#000",
        hasDrips: isDripMatch,
        dripColors: ["#14b8a6", "#f97316", "#0d9488"]
      };
    }

    if (c.includes("gold")) {
      return {
        bg: "radial-gradient(circle at 35% 35%, #ffe66f 0%, #cca300 50%, #997a00 85%, #665200 100%)",
        text: "text-black font-black",
        border: "border-yellow-600",
        lineColor: "#000",
        shine: true
      };
    }

    if (c.includes("blue") || c.includes("cyan") || c.includes("teal") || c.includes("aqua") || c.includes("hue blue")) {
      return {
        bg: "radial-gradient(circle at 35% 35%, #2ef2ff 0%, #00c7d4 60%, #00939d 100%)",
        text: "text-black",
        border: "border-sky-400",
        lineColor: "#000"
      };
    }

    if (c.includes("green") || c.includes("emerald") || c.includes("mint")) {
      return {
        bg: "radial-gradient(circle at 35% 35%, #4ade80 0%, #22c55e 60%, #15803d 100%)",
        text: "text-black",
        border: "border-green-400",
        lineColor: "#000"
      };
    }

    if (c.includes("orange") || c.includes("amber")) {
      return {
        bg: "radial-gradient(circle at 35% 35%, #fb923c 0%, #ea580c 60%, #c2410c 100%)",
        text: "text-black",
        border: "border-orange-400",
        lineColor: "#000"
      };
    }

    if (c.includes("silver") || c.includes("gray") || c.includes("grey") || c.includes("platinum")) {
      return {
        bg: "radial-gradient(circle at 35% 35%, #f3f4f6 0%, #d1d5db 60%, #9ca3af 100%)",
        text: "text-black",
        border: "border-gray-300",
        lineColor: "#000"
      };
    }

    if (c.includes("purple") || c.includes("violet") || c.includes("indigo") || c.includes("plum") || c.includes("lavender")) {
      return {
        bg: "radial-gradient(circle at 35% 35%, #d946ef 0%, #a855f7 65%, #6b21a8 100%)",
        text: "text-white",
        border: "border-purple-400",
        lineColor: "#fff"
      };
    }

    if (c.includes("black") || c.includes("charcoal") || c.includes("dark") || c.includes("obsidian")) {
      return {
        bg: "radial-gradient(circle at 35% 35%, #4b5563 0%, #1f2937 60%, #111827 100%)",
        text: "text-neutral-400",
        border: "border-neutral-700",
        lineColor: "#fff"
      };
    }

    if (c.includes("brown") || c.includes("bronze") || c.includes("chocolate") || c.includes("tan")) {
      return {
        bg: "radial-gradient(circle at 35% 35%, #d97706 0%, #92400e 60%, #451a03 100%)",
        text: "text-white",
        border: "border-amber-700",
        lineColor: "#fff"
      };
    }

    // Default to white or dynamic color word if parsed from selector
    const cleanColor = c.replace(/drip|splash|splatter/g, "").trim();
    const validHexOrWord = /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)$/.test(cleanColor) ? cleanColor : "white";

    if (validHexOrWord !== "white") {
      return {
        bg: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.45) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 100%), ${validHexOrWord}`,
        text: "text-black",
        border: "border-neutral-300",
        lineColor: "#000"
      };
    }

    return {
      bg: "radial-gradient(circle at 35% 35%, #ffffff 0%, #eaeaea 55%, #c8c8c8 100%)",
      text: "text-black",
      border: "border-neutral-200",
      lineColor: "#000"
    };
  };

  const config = getColorConfigs();

  const isCustomModel = !Object.values(BallModel).includes(model as BallModel);
  const brandLabel = model && model.trim().toUpperCase() === "LOGO" ? "gbv" : (isCustomModel ? (typeof model === 'string' ? model.split(" ")[0].toUpperCase().substring(0, 8) : "CUSTOM") : "gbv");

  // Alignment line text based on model
  const renderAlignmentLine = () => {
    if (!model || model.trim().toUpperCase() === "LOGO") return null;
    let lineText = `-${brandLabel.toUpperCase()}-`;
    if (model === BallModel.PRO_PLUS) lineText = "-PRO PLUS-";
    if (model === BallModel.PRO) lineText = "-PRO-";
    if (model === BallModel.PRO_SOFT) lineText = "-PRO SOFT-";
    if (model === BallModel.TOUR) lineText = "-TOUR-";
    if (model === BallModel.DRIVE) lineText = "-DRIVE-";
    else if (isCustomModel) lineText = `-${typeof model === 'string' ? model.toUpperCase().substring(0, 12) : "CUSTOM"}-`;

    const textStyle = {
      sm: "text-[3.5px] tracking-[0.05em]",
      md: "text-[5.5px] tracking-[0.08em] font-medium",
      lg: "text-[8px] tracking-[0.1em] font-semibold",
      xl: "text-[12px] tracking-[0.12em] font-bold"
    };

    return (
      <div 
        className={`absolute bottom-[23%] left-1/2 -translate-x-1/2 opacity-70 ${textStyle[size]} flex items-center justify-center whitespace-nowrap`}
        style={{ color: config.lineColor }}
      >
        {lineText}
      </div>
    );
  };

  // Generate pseudorandom coordinates for splatters
  // In React 19, we'll keep random positioning deterministic based on the model and color indexes
  const getSplatterBlobs = () => {
    if (!config.hasDrips || !config.dripColors) return null;
    const colors = config.dripColors;
    
    // Simple deterministic pseudo-random seeds
    const seedString = `${model}_${color}`;
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
    }

    const splatters = [];
    const count = size === "xl" ? 35 : size === "lg" ? 22 : 12;

    for (let i = 0; i < count; i++) {
      const xSeed = Math.abs(Math.sin(hash + i * 14)) * 100;
      const ySeed = Math.abs(Math.cos(hash + i * 19)) * 100;
      const rSeed = Math.abs(Math.sin(hash + i * 7)) * 100;
      
      // Keep splatters strictly within the circular boundary of the ball
      // Distance from center (50, 50) must be less than 44 to stay safe with radius of splatter included
      const cx = 15 + (xSeed % 70); // range 15 to 85
      const cy = 15 + (ySeed % 70); // range 15 to 85
      const dist = Math.sqrt((cx - 50) ** 2 + (cy - 50) ** 2);
      
      if (dist < 43) {
        const r = 2 + (rSeed % 5.5); // scale radius
        const blobColor = colors[i % colors.length];
        
        splatters.push(
          <circle 
            key={i} 
            cx={`${cx}%`} 
            cy={`${cy}%`} 
            r={`${r}%`} 
            fill={blobColor} 
            opacity={0.88}
          />
        );
      }
    }
    return splatters;
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center rounded-full aspect-square border shadow-md select-none overflow-hidden shrink-0 ${sizeClasses[size]} ${className}`}
      style={{ 
        background: config.bg,
        boxShadow: size === "xl" 
          ? "inset -12px -12px 30px rgba(0,0,0,0.4), inset 12px 12px 30px rgba(255,255,255,0.7), 0 10px 20px rgba(0,0,0,0.3)" 
          : size === "lg"
          ? "inset -8px -8px 20px rgba(0,0,0,0.35), inset 8px 8px 18px rgba(255,255,255,0.6), 0 6px 12px rgba(0,0,0,0.2)"
          : "inset -4px -4px 10px rgba(0,0,0,0.3), inset 4px 4px 8px rgba(255,255,255,0.5), 0 4px 6px rgba(0,0,0,0.15)"
      }}
      id={`golfball-${model}-${color}-${size}`}
    >
      {/* 3D Dimple Layer (Styled Overlay) */}
      <div 
        className="absolute inset-0 opacity-[0.16] rounded-full mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #000 20%, transparent 25%)`,
          backgroundSize: size === "xl" ? "12px 12px" : size === "lg" ? "8.5px 8.5px" : "6px 6px",
          backgroundPosition: "center"
        }}
      />

      {/* Gold Extra Shine effect */}
      {config.shine && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-40 -translate-x-[40%] -translate-y-[40%] rotate-45 pointer-events-none animate-pulse" />
      )}

      {/* Drip Splatters Layer */}
      {config.hasDrips && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {getSplatterBlobs()}
        </svg>
      )}

      {/* Sphere Soft Highlight overlay */}
      <div 
        className="absolute top-[4%] left-[10%] w-[35%] h-[35%] rounded-full opacity-60 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)"
        }}
      />

      {/* Brand Text Content */}
      <div className={`relative flex flex-col items-center justify-center select-none z-10 ${config.text}`}>
        <span className={`${isCustomModel ? 'font-sans font-black uppercase tracking-wider' : 'font-serif font-black lowercase italic tracking-wide'} ${textSizes[size].brand}`}>
          {brandLabel}
        </span>
        {number !== undefined && number !== null && (
          <span className={`font-mono font-medium -mt-1 ${textSizes[size].num}`}>
            {number}
          </span>
        )}
      </div>

      {/* Alignment / Model Casing line */}
      {renderAlignmentLine()}
    </div>
  );
}
