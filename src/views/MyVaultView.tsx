import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Trophy, Heart, X } from 'lucide-react';
import { GolfBall, CatalogItem, UserProfile } from '../types';
import OwnedBallCard from '../components/OwnedBallCard';
import TrophyCase from '../components/TrophyCase';
import VaultFilterBar from '../components/VaultFilterBar';
import SearchInput from '../components/SearchInput';
import CatalogItemCard from '../components/CatalogItemCard';
import { useAppStore } from '../store/useAppStore';

function GolfBagIcon({ className = "w-5 h-5 text-neutral-400" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 8L8.5 4M8.5 4C7.5 4 7 5 8 5" />
      <path d="M12 8L12 3M12 3C13.5 3 14 4.5 12.5 5" />
      <path d="M14 8L15.5 4M15.5 4C16.5 4 17 5 16 5" />
      <path d="M8 8 L9.5 21 C9.7 22 14.3 22 14.5 21 L16 8 Z" fill="#000" />
      <path d="M8.5 11.5 C6.5 11.5 6.5 17 9.1 17.5" fill="#070707" />
      <path d="M15.5 10 C18 11 18 16.5 14.5 18" />
    </svg>
  );
}

function GolfBallOutlineIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="8.5" cy="9.5" r="0.75" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="12" cy="8.5" r="0.75" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="15.5" cy="10.5" r="0.75" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="9.5" cy="13.5" r="0.75" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="13" cy="14.5" r="0.75" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="16.5" cy="14.5" r="0.75" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="11.5" cy="18" r="0.75" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="14.5" cy="17" r="0.75" fill="currentColor" stroke="none" opacity="0.8" />
    </svg>
  );
}

function GolfBallStackIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8.5" r="5" fill="#000" />
      <circle cx="10.5" cy="7.5" r="0.5" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="13" cy="7.5" r="0.5" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="12" cy="10" r="0.5" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="7.5" cy="15.5" r="5" fill="#000" />
      <circle cx="6.5" cy="14.5" r="0.5" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="8.5" cy="14.5" r="0.5" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="7.5" cy="17" r="0.5" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="16.5" cy="15.5" r="5" fill="#000" />
      <circle cx="15.5" cy="14.5" r="0.5" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="17.5" cy="14.5" r="0.5" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="16.5" cy="17" r="0.5" fill="currentColor" stroke="none" opacity="0.8" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

interface MyVaultViewProps {
  currentUser: any;
  userProfile: UserProfile | null;
  catalog: CatalogItem[];
  totalUniqueModels: number;
  totalOwnedCount: number;
  showTrophyCase: boolean;
  setShowTrophyCase: (val: boolean) => void;
  balls: GolfBall[];
  bagFilter: 'ea' | 'sleeve' | 'box' | null;
  setBagFilter: (val: 'ea' | 'sleeve' | 'box' | null) => void;
  eaCount: number;
  sleeveCount: number;
  boxCount: number;
  isAuthLoading: boolean;
  isLoadingCloudData: boolean;
  wishlistFilters: any;
  setShowClearWishlistConfirm: (val: boolean) => void;
  bagFilters: any;
  uniqueTrophyBalls: CatalogItem[];
  handleAddBallFromCatalog: (item: CatalogItem, qty: number, pkgType: "ea" | "sleeve" | "box") => void;
  handleToggleWishlist: (item: CatalogItem) => void;
  handleUpdateBall: (id: string, updates: Partial<GolfBall>) => void;
  handleDeleteBall: (id: string) => void;
  bFilterModel: string;
  bFilterColor: string;
  bFilterVariation: string;
  bFilterYear: string;
  bFilterName: string;
  bFilterCondition: string;
  wFilterModel: string;
  wFilterColor: string;
  wFilterVariation: string;
  wFilterYear: string;
  wFilterName: string;
}

export default function MyVaultView({
  currentUser,
  userProfile,
  catalog,
  totalUniqueModels,
  totalOwnedCount,
  showTrophyCase,
  setShowTrophyCase,
  balls,
  bagFilter,
  setBagFilter,
  eaCount,
  sleeveCount,
  boxCount,
  isAuthLoading,
  isLoadingCloudData,
  wishlistFilters,
  setShowClearWishlistConfirm,
  bagFilters,
  uniqueTrophyBalls,
  handleAddBallFromCatalog,
  handleToggleWishlist,
  handleUpdateBall,
  handleDeleteBall,
  bFilterModel,
  bFilterColor,
  bFilterVariation,
  bFilterYear,
  bFilterName,
  bFilterCondition,
  wFilterModel,
  wFilterColor,
  wFilterVariation,
  wFilterYear,
  wFilterName,
}: MyVaultViewProps) {
  const {
    mobileTab,
    bagTab,
    setBagTab,
    bagSortBy,
    setBagSortBy,
    bagSearchQuery,
    setBagSearchQuery,
    wishlistSearchQuery,
    setWishlistSearchQuery
  } = useAppStore();

  if (!currentUser) return null;

  return (
    <section className={`lg:col-span-6 space-y-6 ${mobileTab === "bag" ? "block" : "hidden lg:block"}`}>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-neutral-500 uppercase block tracking-wider">
              Unique Balls
            </span>
            <span className="font-sans font-black text-2xl text-white tracking-tight">
              {totalUniqueModels}
              <span className="text-sm text-neutral-500 ml-1">/ {catalog.length}</span>
            </span>
          </div>
          <button 
            onClick={() => {
              if (bagTab !== "wishlist") {
                setShowTrophyCase(!showTrophyCase);
              }
            }}
            className={`w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center transition-colors bg-neutral-950 ${bagTab === "wishlist" ? "cursor-default" : "hover:bg-neutral-900 cursor-pointer"}`}
            title={bagTab === "wishlist" ? "" : "Toggle Trophy Case"}
            disabled={bagTab === "wishlist"}
          >
            <AnimatePresence mode="wait">
              {showTrophyCase ? (
                <motion.div key="trophy" initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Trophy className="w-5 h-5 text-yellow-500" />
                </motion.div>
              ) : (
                <motion.div key="ball" initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <GolfBallOutlineIcon className="w-5 h-5 text-accent" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-neutral-500 uppercase block tracking-wider">
              Total Owned Balls
            </span>
            <span className="font-sans font-black text-2xl text-white tracking-tight">
              {totalOwnedCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full border border-neutral-800 bg-neutral-950 flex items-center justify-center text-accent">
            <GolfBallStackIcon className="w-[22px] h-[22px]" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-850 pb-2 gap-2">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setBagTab("owned")}
              className={`flex items-center gap-2 cursor-pointer pb-2 -mb-2.5 transition-colors border-b-2 ${
                bagTab === "owned"
                  ? "border-accent text-white"
                  : "border-transparent text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <GolfBagIcon className={`w-5 h-5 ${bagTab === "owned" ? "text-neutral-400" : ""}`} />
              <h2 className="font-sans font-black text-sm sm:text-base uppercase tracking-wider whitespace-nowrap">
                My Bag
              </h2>
            </button>
            
            {userProfile && (
              <button
                onClick={() => setBagTab("wishlist")}
                className={`flex items-center gap-2 cursor-pointer pb-2 -mb-2.5 transition-colors border-b-2 ${
                  bagTab === "wishlist"
                    ? "border-white text-white"
                    : "border-transparent text-neutral-500 hover:text-neutral-300"
                }`}
              >
                <Heart className={`w-4 h-4 ${bagTab === "wishlist" ? "fill-current" : ""}`} />
                <h2 className="font-sans font-black text-base uppercase tracking-wider whitespace-nowrap">
                  Wishlist
                </h2>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {balls.length > 0 && (
              <div className="relative">
                <select
                  value={bagSortBy}
                  onChange={(e) => setBagSortBy(e.target.value)}
                  className="appearance-none bg-neutral-950/40 border border-neutral-850 text-neutral-400 hover:text-white text-[10px] font-mono py-0.5 pl-2 pr-6 rounded-md transition-all cursor-pointer focus:outline-none focus:border-accent"
                >
                  <option value="added_desc">Sort: Added (New)</option>
                  <option value="added_asc">Sort: Added (Old)</option>
                  <option value="model_asc">Sort: Model (A-Z)</option>
                  <option value="model_desc">Sort: Model (Z-A)</option>
                  {bagTab !== "wishlist" && <option value="qty_desc">Sort: Qty (High-Low)</option>}
                  {bagTab !== "wishlist" && <option value="qty_asc">Sort: Qty (Low-High)</option>}
                  <option value="year_desc">Sort: Year (New)</option>
                  <option value="year_asc">Sort: Year (Old)</option>
                </select>
                <ChevronDown className="w-3 h-3 text-neutral-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
          </div>
        </div>

        {balls.length > 0 && (
          <div className="grid grid-cols-3 gap-2 bg-neutral-950 p-2 rounded-xl border border-neutral-850/70 text-center text-xs font-mono">
            <button 
              type="button"
              onClick={() => setBagFilter(bagFilter === 'ea' ? null : 'ea')}
              className={`flex flex-col p-1.5 rounded-lg transition-all cursor-pointer border ${bagFilter === 'ea' ? 'bg-neutral-900 border-neutral-350 shadow-md' : 'bg-neutral-900/50 hover:bg-neutral-800/50 border-transparent'}`}
            >
              <span className={`text-[9px] uppercase tracking-wider transition-colors ${bagFilter === 'ea' ? 'text-neutral-400 font-bold' : 'text-neutral-500'}`}>Balls</span>
              <span className="text-white font-black text-sm mt-0.5">{eaCount}</span>
            </button>
            <button 
              type="button"
              onClick={() => setBagFilter(bagFilter === 'sleeve' ? null : 'sleeve')}
              className={`flex flex-col p-1.5 rounded-lg transition-all cursor-pointer border ${bagFilter === 'sleeve' ? 'bg-neutral-900 border-neutral-350 shadow-md' : 'bg-neutral-900/50 hover:bg-neutral-800/50 border-transparent'}`}
            >
              <span className={`text-[9px] uppercase tracking-wider transition-colors ${bagFilter === 'sleeve' ? 'text-neutral-400 font-bold' : 'text-neutral-500'}`}>Sleeves</span>
              <span className="text-white font-black text-sm mt-0.5">{sleeveCount}</span>
            </button>
            <button 
              type="button"
              onClick={() => setBagFilter(bagFilter === 'box' ? null : 'box')}
              className={`flex flex-col p-1.5 rounded-lg transition-all cursor-pointer border ${bagFilter === 'box' ? 'bg-neutral-900 border-neutral-350 shadow-md' : 'bg-neutral-900/50 hover:bg-neutral-800/50 border-transparent'}`}
            >
              <span className={`text-[9px] uppercase tracking-wider transition-colors ${bagFilter === 'box' ? 'text-neutral-400 font-bold' : 'text-neutral-500'}`}>Boxes/Bundles</span>
              <span className="text-white font-black text-sm mt-0.5">{boxCount}</span>
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
        {(isAuthLoading || (isLoadingCloudData && balls.length === 0 && !localStorage.getItem("vice_vault_bag_" + userProfile?.uid))) ? (
          <motion.div key="loading" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} transition={{ duration: 0.2 }} className="py-20 text-center rounded-3xl border border-neutral-850 bg-neutral-900/40 flex flex-col items-center justify-center shadow-inner">
            <RefreshCw className="w-8 h-8 text-accent animate-spin mb-3 opacity-80" />
            <h4 className="font-bold text-neutral-400 text-xs uppercase tracking-wider">Loading Vault...</h4>
          </motion.div>
        ) : bagTab === "wishlist" ? (
          <motion.div key="wishlist" initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}} transition={{ duration: 0.2 }} className="space-y-3">
            {userProfile?.wishlist?.length > 0 && (
              <div className="flex flex-col gap-3">
                <SearchInput
                  value={wishlistSearchQuery}
                  onChange={setWishlistSearchQuery}
                  placeholder="Search wishlist (e.g., Red, Pro, 2021...)"
                />
                <VaultFilterBar items={catalog.filter(c => userProfile.wishlist.some(w => w === c.id || w.startsWith(`${c.id}-pkg-`)))} filters={wishlistFilters} showCondition={false}>
                  <button
                    onClick={() => setShowClearWishlistConfirm(true)}
                    className="shrink-0 text-[10px] uppercase font-bold text-rose-500 hover:text-rose-400 transition-colors cursor-pointer inline-flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg border border-rose-500/20 whitespace-nowrap"
                  >
                    <X className="w-3 h-3" /> Clear Wishlist
                  </button>
                </VaultFilterBar>
              </div>
            )}
            {!userProfile?.wishlist?.length ? (
              <div className="py-20 text-center rounded-3xl border-2 border-dashed border-neutral-850 bg-neutral-950/10 text-neutral-400">
                <Heart className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                <h4 className="font-bold text-neutral-350 text-sm">Your wishlist is empty</h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 leading-relaxed">
                  Click the heart icon on any catalog item to add it to your wishlist.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from(new Set(userProfile.wishlist.map(id => id.replace(/-pkg-(box|ea)$/, ""))))
                  .map(baseId => catalog.find(c => c.id === baseId))
                  .filter(item => {
                    if (!item) return false;
                    
                    if (wishlistSearchQuery) {
                      const q = wishlistSearchQuery.toLowerCase();
                      const matchesSearch = 
                        item.model.toLowerCase().includes(q) || 
                        item.color.toLowerCase().includes(q) ||
                        (item.name && item.name.toLowerCase().includes(q)) ||
                        (item.variation && item.variation.toLowerCase().includes(q)) ||
                        (item.notes && item.notes.toLowerCase().includes(q)) ||
                        (item.year && item.year.toLowerCase().includes(q));
                      if (!matchesSearch) return false;
                    }

                    const matchesAdvancedModel = !wFilterModel || item.model === wFilterModel;
                    const matchesAdvancedColor = !wFilterColor || item.color === wFilterColor;
                    const matchesAdvancedVariation = !wFilterVariation || item.variation === wFilterVariation;
                    const matchesAdvancedYear = !wFilterYear || item.year === wFilterYear;
                    const matchesAdvancedName = !wFilterName || item.name === wFilterName;
                    return matchesAdvancedModel && matchesAdvancedColor && matchesAdvancedVariation && matchesAdvancedYear && matchesAdvancedName;
                  })
                  .sort((a, b) => {
                    if (!a || !b) return 0;
                    switch (bagSortBy) {
                      case 'added_desc': {
                        const dA = new Date(userProfile?.wishlistDates?.[a.id] || userProfile?.wishlistDates?.[`${a.id}-pkg-box`] || userProfile?.wishlistDates?.[`${a.id}-pkg-ea`] || 0).getTime();
                        const dB = new Date(userProfile?.wishlistDates?.[b.id] || userProfile?.wishlistDates?.[`${b.id}-pkg-box`] || userProfile?.wishlistDates?.[`${b.id}-pkg-ea`] || 0).getTime();
                        return dB - dA;
                      }
                      case 'added_asc': {
                        const dA = new Date(userProfile?.wishlistDates?.[a.id] || userProfile?.wishlistDates?.[`${a.id}-pkg-box`] || userProfile?.wishlistDates?.[`${a.id}-pkg-ea`] || 0).getTime();
                        const dB = new Date(userProfile?.wishlistDates?.[b.id] || userProfile?.wishlistDates?.[`${b.id}-pkg-box`] || userProfile?.wishlistDates?.[`${b.id}-pkg-ea`] || 0).getTime();
                        return dA - dB;
                      }
                      case 'model_asc': return a.model.localeCompare(b.model) || (a.name || "").localeCompare(b.name || "");
                      case 'model_desc': return b.model.localeCompare(a.model) || (b.name || "").localeCompare(a.name || "");
                      case 'year_desc': return (b.year || "").localeCompare(a.year || "");
                      case 'year_asc': return (a.year || "").localeCompare(b.year || "");
                      default: return 0;
                    }
                  })
                  .map((item, index) => {
                    if (!item) return null;
                    return (
                    <CatalogItemCard
                      index={index}
                      key={`${item.id}-wishlist`}
                      item={item}
                      isReadOnly={!currentUser}
                      onAddToLocker={handleAddBallFromCatalog}
                      wishlistItems={userProfile.wishlist}
                      wishlistDates={userProfile.wishlistDates || {}}
                      onToggleWishlist={handleToggleWishlist}
                      variant="wishlist"
                    />
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="bag" initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: 20}} transition={{ duration: 0.2 }} className="space-y-4">
            <AnimatePresence mode="wait" initial={false}>
            {showTrophyCase ? (
              <motion.div key="trophycase" initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: -90, opacity: 0 }} transition={{ duration: 0.3 }} style={{ perspective: 1000 }}>
                <TrophyCase 
                  uniqueBalls={uniqueTrophyBalls}
                  username={userProfile?.username || "GOLFER"}
                />
              </motion.div>
            ) : (
              <motion.div key="gridcase" initial={{ rotateY: -90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: 90, opacity: 0 }} transition={{ duration: 0.3 }} style={{ perspective: 1000 }}>
            {balls.length > 0 && (
              <div className="flex flex-col gap-3">
                <SearchInput
                  value={bagSearchQuery}
                  onChange={setBagSearchQuery}
                  placeholder="Search bag (e.g., Red, Pro, 2021...)"
                />
                <VaultFilterBar items={balls} filters={bagFilters} showCondition={true} />
              </div>
            )}
            {balls.length === 0 ? (
              <div className="py-20 text-center rounded-3xl border-2 border-dashed border-neutral-850 bg-neutral-950/10 text-neutral-400">
                <GolfBagIcon className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                <h4 className="font-bold text-neutral-350 text-sm">Your bag is currently empty</h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 leading-relaxed">
                  You don't have any balls recorded in your inventory. Explore the database on the left to locate and log your balls!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4" id="owned-list-container">
                {balls
                  .map((ball, index) => ({ ball, index }))
                  .filter(({ ball }) => !bagFilter || ball.packageType === bagFilter || (!ball.packageType && bagFilter === 'ea'))
                  .filter(({ ball }) => {
                    if (bagSearchQuery) {
                      const q = bagSearchQuery.toLowerCase();
                      const matchesSearch = 
                        ball.model.toLowerCase().includes(q) || 
                        ball.color.toLowerCase().includes(q) ||
                        (ball.name && ball.name.toLowerCase().includes(q)) ||
                        (ball.variation && ball.variation.toLowerCase().includes(q)) ||
                        (ball.notes && ball.notes.toLowerCase().includes(q)) ||
                        (ball.year && ball.year.toLowerCase().includes(q));
                      if (!matchesSearch) return false;
                    }

                    const matchesAdvancedModel = !bFilterModel || ball.model === bFilterModel;
                    const matchesAdvancedColor = !bFilterColor || ball.color === bFilterColor;
                    const matchesAdvancedVariation = !bFilterVariation || ball.variation === bFilterVariation;
                    const matchesAdvancedYear = !bFilterYear || ball.year === bFilterYear;
                    const matchesAdvancedName = !bFilterName || ball.name === bFilterName;
                    const matchesAdvancedCondition = !bFilterCondition || ball.condition === bFilterCondition;
                    return matchesAdvancedModel && matchesAdvancedColor && matchesAdvancedVariation && matchesAdvancedYear && matchesAdvancedName && matchesAdvancedCondition;
                  })
                  .sort((a, b) => {
                    switch (bagSortBy) {
                      case 'added_desc': return a.index - b.index;
                      case 'added_asc': return b.index - a.index;
                  case 'model_asc': return a.ball.model.localeCompare(b.ball.model) || (a.ball.name || "").localeCompare(b.ball.name || "");
                  case 'model_desc': return b.ball.model.localeCompare(a.ball.model) || (b.ball.name || "").localeCompare(a.ball.name || "");
                  case 'qty_desc': return b.ball.quantity - a.ball.quantity;
                  case 'qty_asc': return a.ball.quantity - b.ball.quantity;
                  case 'year_desc': return (b.ball.year || "").localeCompare(a.ball.year || "");
                  case 'year_asc': return (a.ball.year || "").localeCompare(b.ball.year || "");
                  default: return a.index - b.index;
                }
              })
              .map(({ ball }, index) => (
              <OwnedBallCard
                index={index}
                key={ball.id}
                ball={ball}
                catalog={catalog}
                onUpdateBall={handleUpdateBall}
                onDelete={handleDeleteBall}
              />
            ))}
          </div>
        )}
              </motion.div>
            )}
            </AnimatePresence>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

    </section>
  );
}
