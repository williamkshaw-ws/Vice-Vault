import React from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export default function SearchInput({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  className = "",
  autoFocus = false
}: SearchInputProps) {
  return (
    <div className={`relative group ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-neutral-500 group-focus-within:text-accent transition-colors" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        aria-label={placeholder}
        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2.5 pl-10 pr-10 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-300"
      />
      {value && (
        <button 
          onClick={() => onChange("")} 
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-white transition-colors"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
