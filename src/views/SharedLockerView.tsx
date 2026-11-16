import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, AlertTriangle, ShoppingBag, Heart } from "lucide-react";
import { GolfBall, CatalogItem, UserProfile } from "../types";
import { AvatarRenderer } from "../components/AuthModal";
import VaultFilterBar from "../components/VaultFilterBar";
import CatalogItemCard from "../components/CatalogItemCard";
import OwnedBallCard from "../components/OwnedBallCard";

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

interface SharedLockerViewProps {
  accentColor: string;
  isSharedViewLoading: boolean;
  sharedLockerError: string | null;
  sharedLockerOwner: UserProfile | null;
  sharedLockerBalls: GolfBall[];
  catalog: CatalogItem[];
  friendBagUsername: string | null;
  onCloseFriendBag: () => void;
  globalCatalogStats: Record<string, number>;
  getOwnedUniqueCount: (balls: GolfBall[], catalog: CatalogItem[]) => number;
}

export default function SharedLockerView({
  accentColor,
  isSharedViewLoading,
  sharedLockerError,
  sharedLockerOwner,
  sharedLockerBalls,
  catalog,
  friendBagUsername,
  onCloseFriendBag,
  globalCatalogStats,
  getOwnedUniqueCount
}: SharedLockerViewProps) {
  const [sharedTab, setSharedTab] = useState<"owned" | "wishlist">("owned");

  const [sFilterModel, setSFilterModel] = useState<string>("");
  const [sFilterColor, setSFilterColor] = useState<string>("");
  const [sFilterVariation, setSFilterVariation] = useState<string>("");
  const [sFilterYear, setSFilterYear] = useState<string>("");
  const [sFilterName, setSFilterName] = useState<string>("");
  const [sFilterCondition, setSFilterCondition] = useState<string>("");
  const [sFilterRarity, setSFilterRarity] = useState<string>("");

  const sharedFilters = useMemo(() => ({
    model: sFilterModel, setModel: setSFilterModel,
    color: sFilterColor, setColor: setSFilterColor,
    variation: sFilterVariation, setVariation: setSFilterVariation,
    year: sFilterYear, setYear: setSFilterYear,
    name: sFilterName, setName: setSFilterName,
    condition: sFilterCondition, setCondition: setSFilterCondition,
    rarity: sFilterRarity, setRarity: setSFilterRarity
  }), [sFilterModel, sFilterColor, sFilterVariation, sFilterYear, sFilterName, sFilterCondition, sFilterRarity]);

  const [swFilterModel, setSwFilterModel] = useState<string>("");
  const [swFilterColor, setSwFilterColor] = useState<string>("");
  const [swFilterVariation, setSwFilterVariation] = useState<string>("");
  const [swFilterYear, setSwFilterYear] = useState<string>("");
  const [swFilterName, setSwFilterName] = useState<string>("");
  const [swFilterRarity, setSwFilterRarity] = useState<string>("");

  const sharedWishlistFilters = useMemo(() => ({
    model: swFilterModel, setModel: setSwFilterModel,
    color: swFilterColor, setColor: setSwFilterColor,
    variation: swFilterVariation, setVariation: setSwFilterVariation,
    year: swFilterYear, setYear: setSwFilterYear,
    name: swFilterName, setName: setSwFilterName,
    condition: "", setCondition: () => {},
    rarity: swFilterRarity, setRarity: setSwFilterRarity
  }), [swFilterModel, swFilterColor, swFilterVariation, swFilterYear, swFilterName, swFilterRarity]);

  const sharedLockerBallsWithRarity = useMemo(() => {
    if (!Array.isArray(sharedLockerBalls)) return [];
    const catList = Array.isArray(catalog) ? catalog : [];
    return sharedLockerBalls.map(ball => ({
      ...ball,
      rarity: catList.find(c => c.id === (ball.catalogId || ball.id))?.rarity || ball.rarity || 'common'
    }));
  }, [sharedLockerBalls, catalog]);

  if (isSharedViewLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4">
        <div className="text-center space-y-3 font-mono text-xs text-neutral-500">
          <RefreshCw className="animate-spin text-accent mx-auto" size={24} />
          <span>Loading shared bag...</span>
        </div>
      </div>
    );
  }

  if (sharedLockerError) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-rose-950/40 border border-rose-900/60 flex items-center justify-center text-rose-500 mx-auto">
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-2">
            <h3 className="font-sans font-black text-white text-lg uppercase tracking-wider">Bag Access Blocked</h3>
            <p className="text-xs text-neutral-400 font-mono leading-relaxed">
              {sharedLockerError === "Locker not found or set to private" ? "This bag is private or does not exist." : sharedLockerError}
            </p>
          </div>
          <a
            href="/"
            className="block w-full py-2.5 bg-accent hover:bg-[#3b82f6] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all text-center font-mono"
          >
            Go to Golf Ball Vault
          </a>
        </div>
      </div>
    );
  }

  if (!sharedLockerOwner) return null;

  return (
    <div style={{ "--theme-accent-color": accentColor } as React.CSSProperties} className="min-h-screen transition-all duration-300 font-sans bg-black text-neutral-100 selection:bg-accent selection:text-black flex flex-col" id="shared-locker-view">
      <header className="sticky top-0 z-30 shadow-sm border-b border-neutral-850 bg-neutral-950">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent"></span>
            <span className="font-sans font-black text-sm text-white uppercase tracking-widest">Golf Ball Vault</span>
          </div>
          {friendBagUsername ? (
            <button
              onClick={onCloseFriendBag}
              className="text-[10px] font-mono font-black uppercase text-neutral-400 hover:text-white px-3 py-1.5 border border-neutral-800 hover:border-neutral-750 bg-neutral-900 rounded-lg transition-colors cursor-pointer"
            >
              Return to My Vault
            </button>
          ) : (
            <a
              href="/"
              className="text-[10px] font-mono font-black uppercase text-neutral-400 hover:text-white px-3 py-1.5 border border-neutral-800 hover:border-neutral-750 bg-neutral-900 rounded-lg transition-colors"
            >
              Return to My Vault
            </a>
          )}
        </div>
      </header>

      <main id="main-content" className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Owner Banner */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl flex items-center gap-4 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
          <AvatarRenderer avatarUrl={sharedLockerOwner.avatarUrl} name={sharedLockerOwner.displayName || "User"} size="lg" color={sharedLockerOwner.preferredColor || "#2563eb"} />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-black text-white truncate leading-tight font-sans">{sharedLockerOwner.displayName}'s Bag</h2>
            <p className="text-xs text-neutral-400 font-mono mt-0.5 font-bold">@{sharedLockerOwner.username}</p>
            <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[9px] font-mono font-bold text-accent uppercase tracking-wider">
              {friendBagUsername ? "Friend's Bag" : "Public Share View"}
            </div>
          </div>
        </div>

        {/* Quick Metrics display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-neutral-500 uppercase block tracking-wider font-bold">Unique Balls</span>
              <span className="font-sans font-black text-2xl text-white tracking-tight">
                {getOwnedUniqueCount(sharedLockerBalls, catalog)}
                <span className="text-sm text-neutral-500 ml-1">/ {catalog.length}</span>
              </span>
            </div>
            <div className="w-10 h-10 rounded-full border border-neutral-800 bg-neutral-950 flex items-center justify-center text-accent">
              <GolfBallOutlineIcon className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-neutral-500 uppercase block tracking-wider font-bold">Total Owned Balls</span>
              <span className="font-sans font-black text-2xl text-white tracking-tight">
                {sharedLockerBalls.reduce((sum, b) => sum + b.quantity, 0)}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full border border-neutral-800 bg-neutral-950 flex items-center justify-center text-accent">
              <GolfBallStackIcon className="w-[22px] h-[22px]" />
            </div>
          </div>
        </div>

        {/* Shared Inventory / Wishlist Container */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-850 pb-2 gap-2">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSharedTab("owned")}
                className={`flex items-center gap-2 cursor-pointer pb-2 -mb-2.5 transition-colors border-b-2 ${
                  sharedTab === "owned"
                    ? "border-accent text-white"
                    : "border-transparent text-neutral-500 hover:text-neutral-300"
                }`}
              >
                <ShoppingBag className={`w-4 h-4 ${sharedTab === "owned" ? "text-neutral-400" : ""}`} />
                <h2 className="font-sans font-black text-sm uppercase tracking-wider">
                  Bag Inventory
                </h2>
              </button>
              
              {sharedLockerOwner?.wishlist && (
                <button
                  onClick={() => setSharedTab("wishlist")}
                  className={`flex items-center gap-2 cursor-pointer pb-2 -mb-2.5 transition-colors border-b-2 ${
                    sharedTab === "wishlist"
                      ? "border-white text-white"
                      : "border-transparent text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${sharedTab === "wishlist" ? "fill-current text-rose-500" : ""}`} />
                  <h2 className="font-sans font-black text-sm uppercase tracking-wider">
                    Wishlist
                  </h2>
                </button>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
          {sharedTab === "wishlist" ? (
            <motion.div key="shared-wishlist" initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}} transition={{ duration: 0.2 }} className="space-y-3">
              {sharedLockerOwner?.wishlist?.length > 0 && (
                <VaultFilterBar items={catalog.filter(c => sharedLockerOwner.wishlist!.some(w => w === c.id || w.startsWith(`${c.id}-pkg-`)))} filters={sharedWishlistFilters} showCondition={false} />
              )}
              {!sharedLockerOwner?.wishlist?.length ? (
                <div className="py-20 text-center rounded-3xl border-2 border-dashed border-neutral-850 bg-neutral-950/10 text-neutral-400">
                  <Heart className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                  <h4 className="font-bold text-neutral-350 text-sm">This wishlist is empty</h4>
                </div>
              ) : (
                <div className="space-y-3">
                  {Array.from(new Set(sharedLockerOwner.wishlist.map(id => id.replace(/-pkg-(box|ea)$/, ""))))
                    .map(baseId => catalog.find(c => c.id === baseId))
                    .filter(item => {
                      if (!item) return false;
                      const matchesAdvancedModel = !swFilterModel || item.model === swFilterModel;
                      const matchesAdvancedColor = !swFilterColor || item.color === swFilterColor;
                      const matchesAdvancedVariation = !swFilterVariation || item.variation === swFilterVariation;
                      const matchesAdvancedYear = !swFilterYear || item.year === swFilterYear;
                      const matchesAdvancedName = !swFilterName || item.name === swFilterName;
                      const matchesAdvancedRarity = !swFilterRarity || (item.rarity || 'common').toLowerCase() === swFilterRarity.toLowerCase();
                      return matchesAdvancedModel && matchesAdvancedColor && matchesAdvancedVariation && matchesAdvancedYear && matchesAdvancedName && matchesAdvancedRarity;
                    })
                    .map((item, index) => {
                      if (!item) return null;
                      return (
                      <CatalogItemCard
                        index={index}
                        key={item.id}
                        item={item}
                        isReadOnly={true}
                        wishlistItems={sharedLockerOwner.wishlist}
                        wishlistDates={sharedLockerOwner.wishlistDates || {}}
                        variant="wishlist"
                        onAddToLocker={() => {}}
                        globalOwned={globalCatalogStats[item.id] || 0}
                      />
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="shared-owned" initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: 20}} transition={{ duration: 0.2 }} className="space-y-4">
              {sharedLockerBalls.length > 0 && (
                <VaultFilterBar items={sharedLockerBallsWithRarity} filters={sharedFilters} showCondition={true} />
              )}

              {sharedLockerBalls.length === 0 ? (
                <div className="py-20 text-center rounded-3xl border border-neutral-850 bg-neutral-950/20 text-neutral-500 font-mono text-xs">
                  This user's bag is empty.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {sharedLockerBalls
                    .filter((ball) => {
                  const matchesAdvancedModel = !sFilterModel || ball.model === sFilterModel;
                  const matchesAdvancedColor = !sFilterColor || ball.color === sFilterColor;
                  const matchesAdvancedVariation = !sFilterVariation || ball.variation === sFilterVariation;
                  const matchesAdvancedYear = !sFilterYear || ball.year === sFilterYear;
                  const matchesAdvancedName = !sFilterName || ball.name === sFilterName;
                  const matchesAdvancedCondition = !sFilterCondition || ball.condition === sFilterCondition;
                  const ballRarity = (catalog.find(c => c.id === (ball.catalogId || ball.id))?.rarity || ball.rarity || 'common').toLowerCase();
                  const matchesAdvancedRarity = !sFilterRarity || ballRarity === sFilterRarity.toLowerCase();
                  return matchesAdvancedModel && matchesAdvancedColor && matchesAdvancedVariation && matchesAdvancedYear && matchesAdvancedName && matchesAdvancedCondition && matchesAdvancedRarity;
                })
                .map((ball, index) => (
                  <OwnedBallCard 
                    index={index}
                    key={ball.id} 
                    ball={ball} 
                    catalog={catalog} 
                    readOnly={true} 
                  />
                ))}
            </div>
          )}
          </motion.div>
        )}
        </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
