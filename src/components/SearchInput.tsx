import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  debounceMs?: number;
}

export default function SearchInput({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  className = "",
  autoFocus = false,
  debounceMs = 150
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external value updates (e.g., cleared by parent or filter reset)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleChange = (newVal: string) => {
    // 1. Immediately update local input value so typing is 100% fluid with 0ms lag
    setLocalValue(newVal);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 2. If user cleared the input, notify parent immediately without waiting
    if (!newVal) {
      onChange("");
      return;
    }

    // 3. Debounce notifying parent to avoid heavy search calculations on every single character
    debounceTimerRef.current = setTimeout(() => {
      onChange(newVal);
    }, debounceMs);
  };

  const handleClear = () => {
    setLocalValue("");
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onChange("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      onChange(localValue);
    } else if (e.key === "Escape") {
      handleClear();
    }
  };

  return (
    <div className={`relative group ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-neutral-500 group-focus-within:text-accent transition-colors" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
        aria-label={placeholder}
        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2.5 pl-10 pr-10 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-300"
      />
      {localValue && (
        <button 
          onClick={handleClear} 
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-white transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
