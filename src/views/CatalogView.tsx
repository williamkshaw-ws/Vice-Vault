import React from 'react';
import { Database, ChevronRight, ChevronDown, Heart } from 'lucide-react';
import { CatalogItem, UserProfile, BallCondition } from '../types';
import CatalogItemCard from '../components/CatalogItemCard';
import VaultFilterBar from '../components/VaultFilterBar';
import SearchInput from '../components/SearchInput';
import { useAppStore } from '../store/useAppStore';

function BallVaultIcon({ className = "w-4 h-4 text-neutral-400" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
      <path d="M6 3v18" strokeWidth="1" strokeDasharray="1 1" opacity="0.6" />
      <circle cx="12.5" cy="12" r="4.5" strokeWidth="1.5" />
      <circle cx="12.5" cy="12" r="1.5" fill="currentColor" />
      <path d="M12.5 4.5v1.5" />
      <path d="M12.5 18v1.5" />
      <path d="M5 12h1.5" />
      <path d="M18 12h1.5" />
      <path d="M8.5 12h1" />
      <path d="M15.5 12h1" />
      <path d="M12.5 8v1" />
      <path d="M12.5 15v1" />
      <circle cx="7" cy="6" r="0.5" fill="currentColor" opacity="0.7" />
      <circle cx="18" cy="6" r="0.5" fill="currentColor" opacity="0.7" />
      <circle cx="18" cy="18" r="0.5" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

interface CatalogViewProps {
  currentUser: any;
  userProfile: UserProfile | null;
  catalogLength: number;
  searchedCatalog: CatalogItem[];
  sortedCatalog: CatalogItem[];
  groupedCatalog: { primary: CatalogItem; subItems: CatalogItem[] }[];
  catalogFilters: any;
  showWishlistOnly: boolean;
  setShowWishlistOnly: (val: boolean) => void;
  setIsVaultManagerOpen: (val: boolean) => void;
  setShowXlsImporter: (val: boolean) => void;
  setEditingItem: (val: any) => void;
  handleAddBallFromCatalog: (
    model: string,
    color: string,
    qty: number,
    customNum: number,
    notes: string,
    condition: BallCondition,
    customImage?: string,
    packageType?: 'ea' | 'sleeve' | 'box',
    year?: string,
    customImageSleeve?: string,
    customImageBox?: string,
    name?: string,
    variation?: string,
    bundleItems?: { catalogId: string; qty: number }[],
    catalogId?: string
  ) => void;
  handleToggleWishlist: (item: CatalogItem) => void;
  globalCatalogStats: Record<string, number>;
}

export default function CatalogView({
  currentUser,
  userProfile,
  catalogLength,
  searchedCatalog,
  sortedCatalog,
  groupedCatalog,
  catalogFilters,
  showWishlistOnly,
  setShowWishlistOnly,
  setIsVaultManagerOpen,
  setShowXlsImporter,
  setEditingItem,
  handleAddBallFromCatalog,
  handleToggleWishlist,
  globalCatalogStats
}: CatalogViewProps) {
  const {
    mobileTab,
    catalogSortBy,
    setCatalogSortBy,
    searchQuery,
    setSearchQuery
  } = useAppStore();

  return (
    <section className={`${currentUser ? "lg:col-span-6" : "lg:col-span-12 max-w-4xl mx-auto w-full"} space-y-6 ${!currentUser || mobileTab === "catalog" ? "block" : "hidden lg:block"}`}>
      <div className="bg-neutral-950/40 border border-neutral-850 rounded-2xl shadow-md">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-850 bg-neutral-950 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <BallVaultIcon className="w-5 h-5 text-accent" />
            <span className="text-xs font-black uppercase tracking-wider text-neutral-300">
              Ball Vault ({catalogLength} Available Designs)
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {catalogLength > 0 && (
              <div className="relative">
                <select
                  value={catalogSortBy}
                  onChange={(e) => setCatalogSortBy(e.target.value)}
                  className="appearance-none bg-neutral-950/40 border border-neutral-850 text-neutral-400 hover:text-white text-[10px] font-mono py-0.5 pl-2 pr-6 rounded-md transition-all cursor-pointer focus:outline-none focus:border-accent"
                >
                  <option value="model_asc">Sort: Model (A-Z)</option>
                  <option value="model_desc">Sort: Model (Z-A)</option>
                  <option value="year_desc">Sort: Year (New)</option>
                  <option value="year_asc">Sort: Year (Old)</option>
                </select>
                <ChevronDown className="w-3 h-3 text-neutral-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            <div className="space-y-3">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search entire vault (e.g., Red, Pro, 2021...)"
              />
              <div className="flex items-center gap-2 flex-wrap">
                <VaultFilterBar items={searchedCatalog} filters={catalogFilters} showCondition={false} />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase border-b border-neutral-850 pb-2">
              <span>Showing {sortedCatalog.length} Matching Models</span>
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline">{currentUser ? "Click + to add any to your Bag" : "Login to add balls to your bag"}</span>
                {currentUser && (
                  <label className="flex items-center gap-1.5 cursor-pointer group bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-2.5 py-1 rounded-md transition-colors shadow-sm">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 group-hover:text-neutral-300 transition-colors">
                      Wishlist
                    </span>
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={showWishlistOnly}
                        onChange={(e) => setShowWishlistOnly(e.target.checked)}
                        className="appearance-none w-3.5 h-3.5 rounded-sm border border-neutral-700 bg-neutral-950 checked:bg-rose-500 checked:border-rose-500 focus:outline-none transition-all cursor-pointer"
                      />
                      <Heart size={9} className={`absolute pointer-events-none transition-opacity ${showWishlistOnly ? 'opacity-100 text-white' : 'opacity-0'}`} weight="fill" />
                    </div>
                  </label>
                )}
              </div>
            </div>

            {sortedCatalog.length === 0 ? (
              <div className="py-12 text-center rounded-xl border border-dashed border-neutral-850 bg-neutral-950/20">
                <Database className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
                <h4 className="font-bold text-neutral-400 text-sm">No balls found in the vault</h4>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1">
                  We didn't find any designs fitting "{searchQuery}".
                </p>
                {userProfile?.role === "Admin" && (
                  <button
                    onClick={() => {
                      setIsVaultManagerOpen(true);
                      setShowXlsImporter(false);
                      setEditingItem(null);
                    }}
                    className="mt-3 text-xs font-bold text-accent hover:underline inline-flex items-center gap-1"
                  >
                    Register a new one <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {groupedCatalog.map((group) => (
                  <CatalogItemCard 
                    key={group.primary.id} 
                    item={group.primary} 
                    subItems={group.subItems}
                    isReadOnly={!currentUser}
                    onAddToLocker={handleAddBallFromCatalog}
                    wishlistItems={userProfile?.wishlist || []}
                    wishlistDates={userProfile?.wishlistDates || {}}
                    onToggleWishlist={handleToggleWishlist}
                    globalOwned={globalCatalogStats[group.primary.id] || 0}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
