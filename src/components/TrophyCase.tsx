import React, { useRef, useState } from 'react';
import { CatalogItem } from '../types';
import BallVisual from './BallVisual';
import { Camera, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';

interface TrophyCaseProps {
  uniqueBalls: CatalogItem[];
  username?: string;
}

export default function TrophyCase({ uniqueBalls, username = "My" }: TrophyCaseProps) {
  const gridItems = uniqueBalls;
  const rackRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveImage = async () => {
    if (!posterRef.current) return;
    try {
      setIsSaving(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await toPng(posterRef.current, { 
        cacheBust: true, 
        pixelRatio: 2,
        skipFonts: true,
        filter: (node) => {
          if (node instanceof HTMLElement && node.id === 'noise-overlay') return false;
          return true;
        }
      });
      
      const link = document.createElement('a');
      link.download = `vice-vault-collection.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to save image. Detailed Error:', err);
      alert(`Failed to save image. Check console for details. Error: ${err}`);
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
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Save Poster</span>
        </button>
      </div>

      {/* Rack Container (Visible UI) */}
      <div 
        ref={rackRef}
        className="w-full relative mx-auto rounded-lg shadow-2xl overflow-hidden" 
        style={{
          backgroundImage: "url('/wood-bg.png')",
          backgroundSize: '400px',
          padding: '16px',
        }}
      >
        {/* Recessed Inner Board */}
        <div className="w-full h-full relative rounded shadow-inner" style={{
          backgroundImage: "url('/wood-bg.png')",
          backgroundSize: '400px',
          boxShadow: 'inset 0 0 80px rgba(0,0,0,0.95), inset 0 20px 25px -5px rgba(0, 0, 0, 0.8)'
        }}>
          {/* Multiply darkness to make the backboard deeper than the frame */}
          <div className="absolute inset-0 bg-black/60 mix-blend-multiply pointer-events-none rounded"></div>
          
          <div className="relative z-10 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-x-4 gap-y-10 p-6 justify-items-center">
            {gridItems.map((item) => (
              <div key={item.id} className="relative flex flex-col items-center group">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 bg-black/90 blur-md rounded-full translate-y-1 scale-90"></div>
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
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex gap-3 sm:gap-4 z-30 pointer-events-none">
                    <div className="w-1.5 h-3 bg-neutral-200 rounded-full shadow-sm border border-neutral-400" style={{ boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.3)' }}></div>
                    <div className="w-1.5 h-3 bg-neutral-200 rounded-full shadow-sm border border-neutral-400" style={{ boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.3)' }}></div>
                  </div>
                </div>
                <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 flex flex-col items-center w-max max-w-[120px]">
                  <div className="bg-neutral-900 text-white text-[10px] font-bold py-1 px-2 rounded border border-neutral-700 shadow-xl text-center leading-tight whitespace-nowrap">
                    {item.name || item.model} - {item.color}
                  </div>
                  <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-neutral-900"></div>
                </div>
              </div>
            ))}
          </div>
          
          {uniqueBalls.length === 0 && (
            <div className="py-20 text-center relative z-10">
              <p className="text-amber-700/50 font-bold uppercase tracking-widest text-sm">Your rack is empty</p>
            </div>
          )}
        </div>
      </div>

      {/* HIDDEN OFF-SCREEN POSTER RENDER TARGET */}
      <div className="overflow-hidden h-0 w-0 absolute top-0 left-0 pointer-events-none opacity-0">
        <div 
          ref={posterRef} 
          className="relative flex flex-col items-center" 
          style={{ 
            width: '1350px', 
            padding: '32px', 
            backgroundImage: "url('/wood-bg.png')",
            backgroundSize: '400px'
          }}
        >
          {/* Inner Recessed Board */}
          <div className="w-full h-full relative flex flex-col items-center shadow-inner" style={{
            padding: '50px 20px',
            backgroundImage: "url('/wood-bg.png')",
            backgroundSize: '400px',
            boxShadow: 'inset 0 0 120px rgba(0,0,0,0.95), inset 0 30px 40px -10px rgba(0, 0, 0, 0.8)'
          }}>
            <div className="absolute inset-0 bg-black/60 mix-blend-multiply pointer-events-none"></div>

            <div className="mb-20 mt-4 relative z-10 text-center w-full">
              <h1 className="text-5xl uppercase tracking-[0.2em] font-serif text-[#e6d5b8]" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.6)' }}>
                {username}'S BALL COLLECTION
              </h1>
              <div className="w-32 h-[1px] bg-[#e6d5b8]/40 mx-auto mt-6"></div>
            </div>
            
            {/* 10-column Grid */}
            <div className="relative z-10 grid grid-cols-10 gap-x-8 gap-y-24 w-full justify-items-center">
              {uniqueBalls.map(item => (
                <div key={item.id} className="flex flex-col items-center w-full">
                  {/* Ball */}
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 bg-black/90 blur-xl rounded-full translate-y-3 scale-90"></div>
                    <div className="relative w-full h-full z-20">
                      <BallVisual 
                        color={item.color} 
                        model={item.model} 
                        size="lg" 
                        customImage={item.customImage}
                        customImageSleeve={item.customImageSleeve}
                        customImageBox={item.customImageBox}
                        packageType="ea" 
                      />
                    </div>
                    {/* Pegs */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-6 z-30">
                      <div className="w-2.5 h-6 bg-neutral-200 rounded-full shadow-sm border border-neutral-400" style={{ boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.3)' }}></div>
                      <div className="w-2.5 h-6 bg-neutral-200 rounded-full shadow-sm border border-neutral-400" style={{ boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.3)' }}></div>
                    </div>
                  </div>
                  {/* Name - Color Text directly underneath */}
                  <div className="text-center mt-3">
                    <span className="block text-[13px] font-bold uppercase tracking-[0.1em]" style={{ color: '#e5e5e5' }}>{item.name || item.model}</span>
                    <span className="block text-[10px] font-bold uppercase tracking-widest mt-1.5" style={{ color: '#b48a47' }}>{item.color}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
