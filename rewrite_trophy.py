import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/components/TrophyCase.tsx'

content = """import React, { useRef, useState } from 'react';
import { CatalogItem } from '../types';
import BallVisual from './BallVisual';
import { Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';

interface TrophyCaseProps {
  uniqueBalls: CatalogItem[];
}

export default function TrophyCase({ uniqueBalls }: TrophyCaseProps) {
  const gridItems = uniqueBalls;
  const rackRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveImage = async () => {
    if (!rackRef.current) return;
    try {
      setIsSaving(true);
      // Generate image
      const dataUrl = await toPng(rackRef.current, { cacheBust: true, pixelRatio: 2 });
      // Download it
      const link = document.createElement('a');
      link.download = `vice-vault-trophy-case.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to save image', err);
      alert('Failed to save image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative group/rack">
      {/* Save Button (shows on hover) */}
      <button 
        onClick={handleSaveImage}
        disabled={isSaving || uniqueBalls.length === 0}
        className="absolute top-4 right-4 z-50 bg-neutral-900/80 hover:bg-[#2563eb] text-white p-2 rounded-lg backdrop-blur-sm border border-white/10 shadow-xl opacity-0 group-hover/rack:opacity-100 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
        title="Save Image"
      >
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Save Image</span>
      </button>

      {/* Rack Container */}
      <div 
        ref={rackRef}
        className="w-full relative mx-auto p-4 sm:p-6 bg-[#1a1412] rounded-lg shadow-2xl overflow-hidden" 
        style={{
          borderTop: '12px solid #5d4037',
          borderLeft: '12px solid #5d4037',
          borderRight: '12px solid #3e2723',
          borderBottom: '12px solid #3e2723',
          boxShadow: 'inset 0 0 60px rgba(0,0,0,0.9), 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Wood grain overlay effect */}
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}></div>

        {/* Grid of balls */}
        <div className="relative z-10 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-x-4 gap-y-16 p-4 justify-items-center">
          {gridItems.map((item) => {
            return (
              <div key={item.id} className="relative flex flex-col items-center group">
                
                {/* The Ball Container (Fixed height to ensure pegs always align perfectly underneath) */}
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-end justify-center mb-1">
                  {/* Drop shadow on the back board */}
                  <div className="absolute inset-0 bg-black/80 blur-md rounded-full translate-y-2 translate-x-1"></div>
                  
                  {/* Ball Graphic */}
                  <div className="relative w-full h-full transition-transform duration-300 group-hover:scale-125 group-hover:-translate-y-4 group-hover:z-20 cursor-pointer">
                    <BallVisual 
                      color={item.color} 
                      model={item.model} 
                      size="md" 
                      customImage={item.customImage}
                      customImageSleeve={item.customImageSleeve}
                      customImageBox={item.customImageBox}
                      packageType="ea" 
                    />
                  </div>
                </div>

                {/* The Pegs (Wooden Rack Pegs) */}
                <div className="flex gap-4 relative z-10">
                  <div className="w-1.5 h-3 bg-neutral-200 rounded-full shadow-sm border border-neutral-400" style={{ boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.3)' }}></div>
                  <div className="w-1.5 h-3 bg-neutral-200 rounded-full shadow-sm border border-neutral-400" style={{ boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.3)' }}></div>
                </div>

                {/* The Plaque */}
                <div className="mt-3 bg-gradient-to-b from-[#b8860b] to-[#8b6508] p-[1px] rounded shadow-lg">
                  <div className="bg-[#1a1412] px-2 py-0.5 rounded-sm">
                    <span className="block text-[7px] sm:text-[8px] uppercase font-mono tracking-widest text-[#d4af37] text-center whitespace-nowrap leading-tight">
                      {item.model}
                    </span>
                  </div>
                </div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30 flex flex-col items-center w-max max-w-[120px]">
                  <div className="bg-neutral-900 text-white text-[10px] font-bold py-1 px-2 rounded border border-neutral-700 shadow-xl text-center leading-tight">
                    {item.year && `${item.year} `}{item.model} {item.color}
                    {item.variation && <span className="block text-neutral-400 font-mono italic mt-0.5">{item.variation}</span>}
                  </div>
                  <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-neutral-900"></div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Empty State if no balls */}
        {uniqueBalls.length === 0 && (
          <div className="py-20 text-center relative z-10">
            <p className="text-amber-700/50 font-bold uppercase tracking-widest text-sm">Your rack is empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
"""

with open(path, 'w') as f:
    f.write(content)
print("Rewritten TrophyCase.tsx")
