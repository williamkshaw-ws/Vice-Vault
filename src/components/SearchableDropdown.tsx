import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, Check } from 'lucide-react';

interface SearchableDropdownProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
}

export default function SearchableDropdown({ value, options, onChange, placeholder, icon }: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; openUpwards: boolean } | null>(null);

  const updateCoords = () => {
    if (!dropdownRef.current) return null;
    const rect = dropdownRef.current.getBoundingClientRect();
    const popupHeight = 260; // Estimated max height of popup
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    const openUpwards = spaceBelow < popupHeight && spaceAbove > spaceBelow;
    
    const newCoords = {
      top: openUpwards ? rect.top + window.scrollY : rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: 192, // Fixed w-48 width
      openUpwards
    };
    setCoords(newCoords);
    return newCoords;
  };

  const handleToggle = () => {
    if (!isOpen) {
      updateCoords();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        const portal = document.getElementById('dropdown-portal-root');
        if (portal && portal.contains(event.target as Node)) return;
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useLayoutEffect(() => {
    if (isOpen) {
      updateCoords();
      const timer = setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 0);
      return () => clearTimeout(timer);
    } else {
      setSearch("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleScrollOrResize = () => {
      updateCoords();
    };
    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

  // Ensure portal root exists
  useEffect(() => {
    let div = document.getElementById('dropdown-portal-root');
    let created = false;
    if (!div) {
      div = document.createElement('div');
      div.id = 'dropdown-portal-root';
      document.body.appendChild(div);
      created = true;
    }
    return () => {
      if (created && div && div.parentNode) {
        div.parentNode.removeChild(div);
      }
    };
  }, []);

  return (
    <div className="relative inline-block text-left shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className={`flex items-center gap-1.5 bg-neutral-900 border hover:text-white text-[10px] font-mono py-1.5 px-2.5 rounded-lg transition-all cursor-pointer outline-none focus:border-accent ${value ? 'border-neutral-700 text-white shadow-sm' : 'border-neutral-800 text-neutral-400'}`}
      >
        {icon && <span className="text-neutral-500 shrink-0">{icon}</span>}
        <span className="truncate max-w-[120px]">{value || placeholder}</span>
        <ChevronDown size={12} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180 text-white' : 'text-neutral-500'}`} />
      </button>

      {isOpen && coords && createPortal(
        <div 
          className={`absolute z-50 rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl p-1 animate-in fade-in duration-150 flex flex-col gap-0 ${coords.openUpwards ? 'slide-in-from-bottom-2' : 'mt-1 slide-in-from-top-2'}`}
          style={{ 
            top: coords.top, 
            left: coords.left, 
            width: coords.width,
            transform: coords.openUpwards ? "translateY(calc(-100% - 4px))" : "none"
          }}
        >
          <div className={`flex items-center gap-2 px-2 py-1.5 bg-neutral-900/50 rounded-lg border border-neutral-850 ${coords.openUpwards ? 'order-last mt-1' : 'mb-1'}`}>
            <Search size={10} className="text-neutral-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              className="bg-transparent border-none outline-none text-[10px] text-white w-full placeholder-neutral-500"
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="max-h-48 overflow-y-auto no-scrollbar flex flex-col gap-0.5">
            <button
              onClick={() => { onChange(""); setIsOpen(false); }}
              className={`text-left px-2 py-1.5 text-[10px] rounded flex items-center justify-between group transition-colors ${value === "" ? "bg-accent/20 text-white font-bold" : "text-neutral-400 hover:bg-neutral-900 hover:text-white"}`}
            >
              <span>{placeholder}</span>
              {value === "" && <Check size={10} className="text-accent" />}
            </button>
            
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-3 text-center text-[9px] text-neutral-600 font-mono">No matches</div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { onChange(opt); setIsOpen(false); }}
                  className={`text-left px-2 py-1.5 text-[10px] rounded flex items-center justify-between group transition-colors ${value === opt ? "bg-accent/20 text-white font-bold" : "text-neutral-400 hover:bg-neutral-900 hover:text-white"}`}
                >
                  <span className="truncate">{opt}</span>
                  {value === opt && <Check size={10} className="text-accent" />}
                </button>
              ))
            )}
          </div>
        </div>,
        document.getElementById('dropdown-portal-root') || document.body
      )}
    </div>
  );
}
