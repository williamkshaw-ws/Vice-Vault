import React, { forwardRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { GolfBall, CatalogItem } from "../types";
import BallVisual from "./BallVisual";

interface TradingCardRendererProps {
  ball: GolfBall;
  catalogItem?: CatalogItem;
  exportCustomImage?: string;
  exportCustomImageBox?: string;
  exportCustomImageSleeve?: string;
  isDarkTheme?: boolean;
}

const TradingCardRendererComponent = ({ ball, catalogItem, exportCustomImage, exportCustomImageBox, exportCustomImageSleeve, isDarkTheme }: TradingCardRendererProps, ref: React.Ref<HTMLDivElement>) => {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
      setMounted(true);
    }, []);

    const content = (
      <div className={`${isDarkTheme ? "dark" : ""} fixed top-[-10000px] left-[-10000px] pointer-events-none z-[-9999]`}>
        <div 
          ref={ref}
          className="w-[500px] h-[700px] bg-neutral-950 p-8 flex flex-col relative overflow-hidden rounded-3xl"
        >
          {/* Header Section */}
          <div className="flex justify-between items-start mb-6 z-10 shrink-0">
            <div className="flex flex-col min-w-0">
              <h2 className="text-[26px] font-black text-white tracking-[0.15em] uppercase leading-none whitespace-nowrap">
                GOLF BALL VAULT
              </h2>
              <p className="text-[10px] font-bold text-[#cca300] uppercase tracking-[0.2em] mt-1.5">
                Official Collection
              </p>
            </div>
            
            {/* Authenticity Stamp */}
            <div className="w-11 h-11 rounded-full border-2 border-[#cca300] flex items-center justify-center shrink-0">
              <span className="text-[#cca300] font-black text-xl font-serif leading-none">G</span>
            </div>
          </div>

          {/* Main Visual Window */}
          {/* min-h-0 is absolutely critical here to prevent tall portrait images from stretching the flex column! */}
          <div className="flex-1 min-h-0 flex items-center justify-center bg-neutral-900 border border-neutral-800 rounded-2xl mb-6 p-2">
            <BallVisual 
              size="xl" 
              color={ball.color} 
              model={ball.model}
              number={ball.customNumber}
              packageType={ball.packageType}
              customImage={ball.packageType === 'ea' ? (exportCustomImage || ball.customImage || ball.customImageBox || ball.customImageSleeve || catalogItem?.customImage) : undefined}
              customImageSleeve={ball.packageType === 'sleeve' ? (exportCustomImageSleeve || ball.customImageSleeve || ball.customImage || ball.customImageBox || catalogItem?.customImageSleeve || catalogItem?.customImage) : undefined}
              customImageBox={ball.packageType === 'box' ? (exportCustomImageBox || ball.customImageBox || ball.customImage || ball.customImageSleeve || catalogItem?.customImageBox || catalogItem?.customImage) : undefined}
              className="!w-full !h-full object-contain !bg-transparent !border-none !shadow-none" 
            />
          </div>

          {/* Player/Item Info */}
          <div className="z-10 shrink-0 min-w-0">
            <h1 className="text-[42px] font-black text-[#cca300] uppercase tracking-tight leading-none mb-1 font-sans whitespace-nowrap truncate">
              {ball.name || catalogItem?.name || ball.color}
            </h1>
            <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-5">
              {ball.model}
            </h3>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
                <span className="block text-[10px] text-neutral-500 font-bold tracking-widest uppercase mb-1">Color</span>
                <span className="block text-[15px] text-white font-black leading-none">{ball.color}</span>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
                <span className="block text-[10px] text-neutral-500 font-bold tracking-widest uppercase mb-1">Condition</span>
                <span className="block text-[15px] text-white font-black leading-none">{ball.condition}</span>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
                <span className="block text-[10px] text-neutral-500 font-bold tracking-widest uppercase mb-1">Variation</span>
                <span className="block text-[15px] text-white font-black leading-none truncate">{ball.variation || catalogItem?.variation || "-"}</span>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
                <span className="block text-[10px] text-neutral-500 font-bold tracking-widest uppercase mb-1">Year</span>
                <span className="block text-[15px] text-white font-black leading-none">{ball.year || catalogItem?.year || "-"}</span>
              </div>
            </div>
            
            {/* Footer */}
            <div className="mt-5 pt-4 border-t border-neutral-800 flex justify-between items-center opacity-75">
              <span className="text-[10px] font-mono text-neutral-500 whitespace-nowrap">GOLF BALL VAULT</span>
              <span className="text-[10px] font-mono text-neutral-500 whitespace-nowrap">1 OF 1 MINT</span>
            </div>
          </div>
        </div>
      </div>
    );

    if (!mounted) return null;
    return createPortal(content, document.body);
  };

export const TradingCardRenderer = forwardRef(TradingCardRendererComponent);
