import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/App.tsx'
with open(path, 'r') as f:
    content = f.read()

target1 = """  const [sharedTab, setSharedTab] = useState<"owned" | "wishlist">("owned");
  const [sFilterModel, setSFilterModel] = useState<string>("");"""

# wait, I didn't add sharedTab yet!
target1_alt = """  const [sFilterModel, setSFilterModel] = useState<string>("");"""

replacement1 = """  const [sharedTab, setSharedTab] = useState<"owned" | "wishlist">("owned");

  const [sFilterModel, setSFilterModel] = useState<string>("");
  const [sFilterColor, setSFilterColor] = useState<string>("");
  const [sFilterVariation, setSFilterVariation] = useState<string>("");
  const [sFilterYear, setSFilterYear] = useState<string>("");
  const [sFilterName, setSFilterName] = useState<string>("");
  const [sFilterCondition, setSFilterCondition] = useState<string>("");

  const sharedFilters = useMemo(() => ({
    model: sFilterModel, setModel: setSFilterModel,
    color: sFilterColor, setColor: setSFilterColor,
    variation: sFilterVariation, setVariation: setSFilterVariation,
    year: sFilterYear, setYear: setSFilterYear,
    name: sFilterName, setName: setSFilterName,
    condition: sFilterCondition, setCondition: setSFilterCondition
  }), [sFilterModel, sFilterColor, sFilterVariation, sFilterYear, sFilterName, sFilterCondition]);

  const [swFilterModel, setSwFilterModel] = useState<string>("");
  const [swFilterColor, setSwFilterColor] = useState<string>("");
  const [swFilterVariation, setSwFilterVariation] = useState<string>("");
  const [swFilterYear, setSwFilterYear] = useState<string>("");
  const [swFilterName, setSwFilterName] = useState<string>("");

  const sharedWishlistFilters = useMemo(() => ({
    model: swFilterModel, setModel: setSwFilterModel,
    color: swFilterColor, setColor: setSwFilterColor,
    variation: swFilterVariation, setVariation: setSwFilterVariation,
    year: swFilterYear, setYear: setSwFilterYear,
    name: swFilterName, setName: setSwFilterName,
  }), [swFilterModel, swFilterColor, swFilterVariation, swFilterYear, swFilterName]);

  const dummyTarget = """

# Replace the block up to the original sharedFilters declaration. We need a careful regex.
import re
content = re.sub(
    r'  const \[sFilterModel, setSFilterModel\] = useState<string>\(""\);\n.*?\n  \}\), \[sFilterModel, sFilterColor, sFilterVariation, sFilterYear, sFilterName, sFilterCondition\]\);',
    replacement1.strip(),
    content,
    flags=re.DOTALL
)

target2 = """            {/* Bag Inventory */}
            <div className="space-y-4">
              <h3 className="font-sans font-black text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-neutral-400" />
                Bag Inventory ({sharedLockerBalls.length} Items)
              </h3>

              {sharedLockerBalls.length > 0 && (
                <VaultFilterBar items={sharedLockerBalls} filters={sharedFilters} showCondition={true} />
              )}

              {sharedLockerBalls.length === 0 ? (
                <div className="py-20 text-center rounded-3xl border border-neutral-850 bg-neutral-950/20 text-neutral-500 font-mono text-xs">
                  This user's bag is empty.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {sharedLockerBalls
                    .filter((ball) => {"""

replacement2 = """            {/* Shared Inventory / Wishlist Container */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-850 pb-2 gap-2">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setSharedTab("owned")}
                    className={`flex items-center gap-2 cursor-pointer pb-2 -mb-2.5 transition-colors border-b-2 ${
                      sharedTab === "owned"
                        ? "border-[#2563eb] text-white"
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

              {sharedTab === "wishlist" ? (
                <div className="space-y-3">
                  {sharedLockerOwner?.wishlist?.length > 0 && (
                    <VaultFilterBar items={catalog.filter(c => sharedLockerOwner.wishlist.some(w => w === c.id || w.startsWith(`${c.id}-pkg-`)))} filters={sharedWishlistFilters} showCondition={false} />
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
                          return matchesAdvancedModel && matchesAdvancedColor && matchesAdvancedVariation && matchesAdvancedYear && matchesAdvancedName;
                        })
                        .map(item => {
                          if (!item) return null;
                          return (
                          <CatalogItemCard
                            key={item.id}
                            item={item}
                            isReadOnly={true}
                            wishlistItems={sharedLockerOwner.wishlist}
                            variant="wishlist"
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {sharedLockerBalls.length > 0 && (
                    <VaultFilterBar items={sharedLockerBalls} filters={sharedFilters} showCondition={true} />
                  )}

                  {sharedLockerBalls.length === 0 ? (
                    <div className="py-20 text-center rounded-3xl border border-neutral-850 bg-neutral-950/20 text-neutral-500 font-mono text-xs">
                      This user's bag is empty.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {sharedLockerBalls
                        .filter((ball) => {"""

content = content.replace(target2, replacement2)

with open(path, 'w') as f:
    f.write(content)

print("Finished shared wishlist injection!")
