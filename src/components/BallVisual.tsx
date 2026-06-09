/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";

// Hook to convert external Firebase Storage URLs to base64 Data URLs so html-to-image never hits Safari CORS Security errors
export function useBase64Image(url?: string) {
  const [base64, setBase64] = useState<string | undefined>(url?.startsWith('data:') ? url : undefined);
  
  useEffect(() => {
    if (!url || url.startsWith('data:')) {
      setBase64(url);
      return;
    }
    
    let isMounted = true;
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (isMounted) setBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      })
      .catch(err => {
        console.error("Failed to load base64 for image", url, err);
        if (isMounted) setBase64(url); // Fallback to raw url
      });
      
    return () => { isMounted = false; };
  }, [url]);

  return base64;
}

import { BallColor, BallModel } from "../types";

interface BallVisualProps {
  color: BallColor | string;
  model: BallModel | string;
  number?: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  customImage?: string;
  customImageSleeve?: string;
  customImageBox?: string;
  packageType?: "ea" | "sleeve" | "box";
}

export default function BallVisual({
  color,
  model,
  number,
  size = "md",
  className = "",
  customImage,
  customImageSleeve,
  customImageBox,
  packageType = "ea"
}: BallVisualProps) {
  // Sizing styles
  const base64CustomImage = useBase64Image(customImage);
  const base64CustomImageBox = useBase64Image(customImageBox);
  const base64CustomImageSleeve = useBase64Image(customImageSleeve);

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

  // If a custom box image is uploaded and packageType is box, render it directly!
  if (packageType === "box" && customImageBox) {
    return (
      <div 
        className={`relative inline-flex items-center justify-center rounded-xl border border-neutral-800 shadow-md select-none overflow-hidden shrink-0 ${sizeClasses[size]} ${className} bg-neutral-950`}
        id={`golfbox-custom-${size}`}
      >
        <img 
          src={base64CustomImageBox} 
          alt="Custom Box Design" 
          className="absolute inset-0 w-full h-full object-contain"
          referrerPolicy="no-referrer" crossOrigin="anonymous"
        />
      </div>
    );
  }

  // If a custom sleeve image is uploaded and packageType is sleeve, render it directly!
  if (packageType === "sleeve" && customImageSleeve) {
    return (
      <div 
        className={`relative inline-flex items-center justify-center rounded-xl border border-neutral-800 shadow-md select-none overflow-hidden shrink-0 ${sizeClasses[size]} ${className} bg-neutral-950`}
        id={`golfsleeve-custom-${size}`}
      >
        <img 
          src={base64CustomImageSleeve} 
          alt="Custom Sleeve Design" 
          className="absolute inset-0 w-full h-full object-contain"
          referrerPolicy="no-referrer" crossOrigin="anonymous"
        />
      </div>
    );
  }

  // Helper to resolve dynamically matched light/dark theme colors based on ball color word
  const getThemeColors = () => {
    const c = (typeof color === "string" ? color : "").toLowerCase().trim();
    if (c.includes("lime") || c.includes("neon lime") || c.includes("neon_lime")) {
      return { accentLight: "#e1ff00", accentDark: "#7da200", isDark: false };
    }
    if (c.includes("red") || c.includes("coral") || c.includes("pink")) {
      return { accentLight: "#ff3b6c", accentDark: "#b3002d", isDark: true };
    }
    if (c.includes("blue") || c.includes("cyan") || c.includes("hue blue")) {
      return { accentLight: "#2ef2ff", accentDark: "#00939d", isDark: false };
    }
    if (c.includes("gold")) {
      return { accentLight: "#ffe66f", accentDark: "#997a00", isDark: false };
    }
    if (c.includes("orange")) {
      return { accentLight: "#fb923c", accentDark: "#c2410c", isDark: true };
    }
    if (c.includes("purple") || c.includes("violet")) {
      return { accentLight: "#d946ef", accentDark: "#6b21a8", isDark: true };
    }
    if (c.includes("black") || c.includes("charcoal")) {
      return { accentLight: "#4b5563", accentDark: "#111827", isDark: true };
    }
    if (c.includes("yellow")) {
      return { accentLight: "#ffea00", accentDark: "#aaaa00", isDark: false };
    }
    return { accentLight: "#ffffff", accentDark: "#cccccc", isDark: false };
  };

  const isCustomModel = !Object.values(BallModel).includes(model as BallModel);
  const brandLabel = model && model.trim().toUpperCase() === "LOGO" ? "gbv" : (isCustomModel ? (typeof model === 'string' ? model.split(" ")[0].toUpperCase().substring(0, 8) : "CUSTOM") : "gbv");

  // Get color configurations for single ball
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

    // Default to white
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

  // --- RENDER BOX PACKAGING VISUAL ---
  if (packageType === "box") {
    const { accentLight, accentDark } = getThemeColors();
    // Centered ball inside the box preview window (positioned on the left side of the wide box)
    const ballCx = 32;
    const ballCy = 60;
    const ballR = 11;

    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`} id={`golfbox-${model}-${color}-${size}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none">
          <defs>
            {/* Soft shadow filter */}
            <filter id="boxShadowBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.8" />
            </filter>

            {/* Packaging face gradients */}
            <linearGradient id="boxTopFace" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#f8fafc" />
            </linearGradient>
            <linearGradient id="boxFrontFace" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
            <linearGradient id="boxRightFace" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            {/* Dynamic theme accent for vertical stripe */}
            <linearGradient id="stripeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentLight} />
              <stop offset="100%" stopColor={accentDark} />
            </linearGradient>

            {/* Dynamic Ball Gradient inside preview window */}
            <radialGradient id="boxBallInsideGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor={accentLight === "#ffffff" ? "#ffffff" : accentLight} />
              <stop offset="55%" stopColor={accentLight === "#ffffff" ? "#eaeaea" : accentDark} />
              <stop offset="100%" stopColor={accentLight === "#ffffff" ? "#c8c8c8" : "#050505"} />
            </radialGradient>

            {/* Clip path for custom image ball previews */}
            <clipPath id="boxBallClip">
              <circle cx={ballCx} cy={ballCy} r={ballR} />
            </clipPath>
          </defs>

          {/* Under-box soft shadow (covers bottom-left 15,80 to bottom-right 75,90 to back-right 83,80) */}
          <polygon points="12,82 76,93 88,82 30,78" fill="rgba(15,23,42,0.25)" filter="url(#boxShadowBlur)" />

          {/* 3D Geometry for a wide box lying on its side */}
          {/* Top Face */}
          <polygon points="15,35 23,25 83,35 75,45" fill="url(#boxTopFace)" stroke="#475569" strokeWidth="1" strokeLinejoin="round" />
          
          {/* Right Face */}
          <polygon points="75,45 83,35 83,80 75,90" fill="url(#boxRightFace)" stroke="#475569" strokeWidth="1" strokeLinejoin="round" />
          
          {/* Front Face */}
          <polygon points="15,35 75,45 75,90 15,80" fill="url(#boxFrontFace)" stroke="#475569" strokeWidth="1" strokeLinejoin="round" />

          {/* Ball Shadow inside Box */}
          <ellipse cx={ballCx} cy={ballCy + ballR - 1.5} rx={ballR + 1} ry={2.5} fill="rgba(15,23,42,0.18)" />

          {/* Ball Preview inside Box */}
          {customImage ? (
            <g>
              <circle cx={ballCx} cy={ballCy} r={ballR} fill="#fff" stroke="#475569" strokeWidth="1" />
              <image href={customImage} x={ballCx - ballR} y={ballCy - ballR} width={ballR * 2} height={ballR * 2} clipPath="url(#boxBallClip)" />
              {/* Dimple overlay over custom image */}
              <circle cx={ballCx} cy={ballCy} r={ballR} fill="transparent" stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" strokeDasharray="1 1.5" clipPath="url(#boxBallClip)" />
            </g>
          ) : (
            <g>
              <circle cx={ballCx} cy={ballCy} r={ballR} fill="url(#boxBallInsideGrad)" stroke="#475569" strokeWidth="1" />
              <circle cx={ballCx} cy={ballCy} r={ballR} fill="transparent" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" strokeDasharray="1 1.2" />
            </g>
          )}

          {/* Vertical stripe / alignment window on the right side of front face */}
          <rect x="62" y="41" width="2.5" height="42" rx="1.25" fill="url(#stripeGrad)" stroke="#475569" strokeWidth="0.8" />
        </svg>
      </div>
    );
  }

  // --- RENDER SLEEVE PACKAGING VISUAL ---
  if (packageType === "sleeve") {
    const { accentLight, accentDark } = getThemeColors();
    // Centered ball inside the sleeve preview window
    const ballCx = 48;
    const ballCy = 64;
    const ballR = 10;

    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`} id={`golfsleeve-${model}-${color}-${size}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none">
          <defs>
            {/* Soft shadow filter */}
            <filter id="sleeveShadowBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.8" />
            </filter>

            {/* Packaging face gradients */}
            <linearGradient id="sleeveTopFace" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#f8fafc" />
            </linearGradient>
            <linearGradient id="sleeveFrontFace" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
            <linearGradient id="sleeveRightFace" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            {/* Dynamic theme accent for vertical stripe */}
            <linearGradient id="sleeveStripeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentLight} />
              <stop offset="100%" stopColor={accentDark} />
            </linearGradient>

            {/* Dynamic Ball Gradient inside preview window */}
            <radialGradient id="sleeveBallInsideGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor={accentLight === "#ffffff" ? "#ffffff" : accentLight} />
              <stop offset="55%" stopColor={accentLight === "#ffffff" ? "#eaeaea" : accentDark} />
              <stop offset="100%" stopColor={accentLight === "#ffffff" ? "#c8c8c8" : "#050505"} />
            </radialGradient>

            {/* Clip path for custom image ball previews */}
            <clipPath id="sleeveBallClip">
              <circle cx={ballCx} cy={ballCy} r={ballR} />
            </clipPath>
          </defs>

          {/* Under-sleeve soft shadow */}
          <ellipse cx="50" cy="85" rx="18" ry="5.5" fill="rgba(15,23,42,0.25)" filter="url(#sleeveShadowBlur)" />

          {/* 3D Geometry */}
          {/* Top Face */}
          <polygon points="35,15 42,10 72,15 65,20" fill="url(#sleeveTopFace)" stroke="#475569" strokeWidth="1" strokeLinejoin="round" />
          
          {/* Right Face */}
          <polygon points="65,20 72,15 72,80 65,85" fill="url(#sleeveRightFace)" stroke="#475569" strokeWidth="1" strokeLinejoin="round" />
          
          {/* Front Face */}
          <polygon points="35,15 65,20 65,85 35,80" fill="url(#sleeveFrontFace)" stroke="#475569" strokeWidth="1" strokeLinejoin="round" />

          {/* Ball Shadow inside Sleeve */}
          <ellipse cx={ballCx} cy={ballCy + ballR - 1.2} rx={ballR + 0.8} ry="2" fill="rgba(15,23,42,0.18)" />

          {/* Ball Preview inside Sleeve */}
          {customImage ? (
            <g>
              <circle cx={ballCx} cy={ballCy} r={ballR} fill="#fff" stroke="#475569" strokeWidth="1" />
              <image href={customImage} x={ballCx - ballR} y={ballCy - ballR} width={ballR * 2} height={ballR * 2} clipPath="url(#sleeveBallClip)" />
              <circle cx={ballCx} cy={ballCy} r={ballR} fill="transparent" stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" strokeDasharray="1 1.5" clipPath="url(#sleeveBallClip)" />
            </g>
          ) : (
            <g>
              <circle cx={ballCx} cy={ballCy} r={ballR} fill="url(#sleeveBallInsideGrad)" stroke="#475569" strokeWidth="1" />
              <circle cx={ballCx} cy={ballCy} r={ballR} fill="transparent" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" strokeDasharray="1 1.2" />
            </g>
          )}

          {/* Vertical stripe / alignment window on the right */}
          <rect x="58" y="24" width="2" height="42" rx="1.0" fill="url(#sleeveStripeGrad)" stroke="#475569" strokeWidth="0.8" />
        </svg>
      </div>
    );
  }

  // --- RENDER SINGLE BALL VISUAL (DEFAULT) ---
  const config = getColorConfigs();

  // If there is an uploaded custom image, render it inside a 3D physical dimple bubble!
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
          src={base64CustomImage} 
          alt="Custom ball design" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer" crossOrigin="anonymous"
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
  const getSplatterBlobs = () => {
    if (!config.hasDrips || !config.dripColors) return null;
    const colors = config.dripColors;
    
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
      
      const cx = 15 + (xSeed % 70); 
      const cy = 15 + (ySeed % 70); 
      const dist = Math.sqrt((cx - 50) ** 2 + (cy - 50) ** 2);
      
      if (dist < 43) {
        const r = 2 + (rSeed % 5.5);
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
