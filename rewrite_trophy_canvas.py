import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/components/TrophyCase.tsx'

content = """import React, { useRef, useState } from 'react';
import { CatalogItem } from '../types';
import BallVisual from './BallVisual';
import { Camera, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

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
      // Wait for any potential re-renders to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(rackRef.current, { 
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true
      });
      const dataUrl = canvas.toDataURL('image/png');
      
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
    <div className="flex flex-col gap-4 relative z-0">
      
      {/* Header and Save Button */}
      <div className="flex justify-between items-end px-2">
        <div>
          <h3 className="text-white font-black text-xl tracking-tight">Trophy Case</h3>
          <p className="text-neutral-500 text-sm">Your unique collection on display</p>
        </div>
        <button 
          onClick={handleSaveImage}
          disabled={isSaving || uniqueBalls.length === 0}
          className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg border border-neutral-800 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-[#2563eb]" /> : <Camera className="w-4 h-4 text-[#2563eb]" />}
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Save Image</span>
        </button>
      </div>

      {/* Rack Container */}
      <div 
        ref={rackRef}
        className="w-full relative mx-auto p-4 sm:p-6 bg-[#1a1412] rounded-lg shadow-2xl" 
        style={{
          borderTop: '12px solid #5d4037',
          borderLeft: '12px solid #5d4037',
          borderRight: '12px solid #3e2723',
          borderBottom: '12px solid #3e2723',
          boxShadow: 'inset 0 0 60px rgba(0,0,0,0.9), 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Wood grain overlay effect */}
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none rounded-sm overflow-hidden" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}></div>

        {/* Grid of balls */}
        <div className="relative z-10 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-x-4 gap-y-10 p-4 justify-items-center">
          {gridItems.map((item) => {
            return (
              <div key={item.id} className="relative flex flex-col items-center group">
                
                {/* The Ball Container */}
                <div className="relative w-16 h-16">
                  {/* Drop shadow on the back board */}
                  <div className="absolute inset-0 bg-black/90 blur-md rounded-full translate-y-1 scale-90"></div>
                  
                  {/* Ball Graphic */}
                  <div className="relative w-full h-full cursor-pointer z-20">
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

                  {/* The Pegs (Wooden Rack Pegs) */}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex gap-3 sm:gap-4 z-30 pointer-events-none">
                    <div className="w-1.5 h-3 bg-neutral-200 rounded-full shadow-sm border border-neutral-400" style={{ boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.3)' }}></div>
                    <div className="w-1.5 h-3 bg-neutral-200 rounded-full shadow-sm border border-neutral-400" style={{ boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.3)' }}></div>
                  </div>
                </div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 flex flex-col items-center w-max max-w-[120px]">
                  <div className="bg-neutral-900 text-white text-[10px] font-bold py-1 px-2 rounded border border-neutral-700 shadow-xl text-center leading-tight">
                    {item.name || item.model} - {item.color}
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
print("Rewrote TrophyCase.tsx with html2canvas and external button")
