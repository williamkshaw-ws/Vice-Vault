import React, { useMemo } from 'react';
import { Filter } from 'lucide-react';
import SearchableDropdown from './SearchableDropdown';

export interface FilterState {
  model: string;
  setModel: (v: string) => void;
  color: string;
  setColor: (v: string) => void;
  variation: string;
  setVariation: (v: string) => void;
  year: string;
  setYear: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  condition: string;
  setCondition: (v: string) => void;
}

interface VaultFilterBarProps {
  items: any[];
  filters: FilterState;
  showCondition?: boolean;
  children?: React.ReactNode;
}

export default function VaultFilterBar({ items, filters, showCondition = true, children }: VaultFilterBarProps) {
  const { model, setModel, color, setColor, variation, setVariation, year, setYear, name, setName, condition, setCondition } = filters;

  const { uniqueModels, uniqueColors, uniqueVariations, uniqueYears, uniqueNames, uniqueConditions } = useMemo(() => {
    const availableForModel = items
      .filter(b => (!color || b.color === color))
      .filter(b => (!condition || b.condition === condition))
      .filter(b => (!year || b.year === year))
      .filter(b => (!variation || b.variation === variation))
      .filter(b => (!name || b.name === name));

    const availableForColor = items
      .filter(b => (!model || b.model === model))
      .filter(b => (!condition || b.condition === condition))
      .filter(b => (!year || b.year === year))
      .filter(b => (!variation || b.variation === variation))
      .filter(b => (!name || b.name === name));

    const availableForCondition = items
      .filter(b => (!model || b.model === model))
      .filter(b => (!color || b.color === color))
      .filter(b => (!year || b.year === year))
      .filter(b => (!variation || b.variation === variation))
      .filter(b => (!name || b.name === name));

    const availableForYear = items
      .filter(b => (!model || b.model === model))
      .filter(b => (!color || b.color === color))
      .filter(b => (!condition || b.condition === condition))
      .filter(b => (!variation || b.variation === variation))
      .filter(b => (!name || b.name === name));

    const availableForVariation = items
      .filter(b => (!model || b.model === model))
      .filter(b => (!color || b.color === color))
      .filter(b => (!condition || b.condition === condition))
      .filter(b => (!year || b.year === year))
      .filter(b => (!name || b.name === name));

    const availableForName = items
      .filter(b => (!model || b.model === model))
      .filter(b => (!color || b.color === color))
      .filter(b => (!condition || b.condition === condition))
      .filter(b => (!year || b.year === year))
      .filter(b => (!variation || b.variation === variation));

    return {
      uniqueModels: Array.from(new Set(availableForModel.map(b => b.model).filter(Boolean))).sort(),
      uniqueColors: Array.from(new Set(availableForColor.map(b => b.color).filter(Boolean))).sort(),
      uniqueConditions: Array.from(new Set(availableForCondition.map(b => b.condition).filter(Boolean))).sort(),
      uniqueYears: Array.from(new Set(availableForYear.map(b => b.year).filter(Boolean))).sort(),
      uniqueVariations: Array.from(new Set(availableForVariation.map(b => b.variation).filter(Boolean))).sort(),
      uniqueNames: Array.from(new Set(availableForName.map(b => b.name).filter(Boolean))).sort()
    };
  }, [items, model, color, condition, year, variation, name]);

  const hasActiveFilters = model || color || condition || year || variation || name;

  const clearFilters = () => {
    setModel?.("");
    setColor?.("");
    setCondition?.("");
    setYear?.("");
    setVariation?.("");
    setName?.("");
  };

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 font-mono">
      <div className="flex flex-wrap items-center gap-2 pb-2 w-full">
        <div className="flex items-center justify-center shrink-0 pr-1 pl-1">
          <Filter className={`w-4 h-4 ${hasActiveFilters ? "text-[#2563eb]" : "text-neutral-500"}`} />
        </div>
        
        {uniqueModels.length > 0 && (
          <div className="shrink-0">
            <SearchableDropdown
              value={model}
              options={uniqueModels as string[]}
              onChange={setModel}
              placeholder="Model"
            />
          </div>
        )}

        {uniqueNames.length > 0 && (
          <div className="shrink-0">
            <SearchableDropdown
              value={name}
              options={uniqueNames as string[]}
              onChange={setName}
              placeholder="Name"
            />
          </div>
        )}

        {uniqueColors.length > 0 && (
          <div className="shrink-0">
            <SearchableDropdown
              value={color}
              options={uniqueColors as string[]}
              onChange={setColor}
              placeholder="Color"
            />
          </div>
        )}
        
        {uniqueVariations.length > 0 && (
          <div className="shrink-0">
            <SearchableDropdown
              value={variation}
              options={uniqueVariations as string[]}
              onChange={setVariation}
              placeholder="Variation"
            />
          </div>
        )}

        {uniqueYears.length > 0 && (
          <div className="shrink-0">
            <SearchableDropdown
              value={year}
              options={uniqueYears as string[]}
              onChange={setYear}
              placeholder="Year"
            />
          </div>
        )}

        {showCondition && uniqueConditions.length > 0 && (
          <div className="shrink-0">
            <SearchableDropdown
              value={condition}
              options={uniqueConditions as string[]}
              onChange={setCondition}
              placeholder="Condition"
            />
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="shrink-0 text-[10px] font-black uppercase tracking-wider text-rose-500 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg transition-colors border border-rose-500/20 whitespace-nowrap"
          >
            Clear
          </button>
        )}
        
        {children && (
          <div className="shrink-0 pl-2 pr-2 flex items-center ml-auto">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
