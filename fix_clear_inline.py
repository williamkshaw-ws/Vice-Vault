import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/App.tsx'
with open(path, 'r') as f:
    content = f.read()

target = """                ) : bagTab === "wishlist" ? (
                  <div className="space-y-3">
                    {userProfile?.wishlist?.length > 0 && (
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              if (window.confirm("Are you sure you want to clear your wishlist?")) {
                                handleClearWishlist();
                              }
                            }}
                            className="text-[10px] uppercase font-bold text-rose-500 hover:text-rose-400 hover:underline transition-colors cursor-pointer inline-flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded-md border border-rose-500/20"
                          >
                            <X className="w-3 h-3" /> Clear Wishlist
                          </button>
                        </div>
                        <VaultFilterBar items={catalog.filter(c => userProfile.wishlist.some(w => w === c.id || w.startsWith(`${c.id}-pkg-`)))} filters={wishlistFilters} showCondition={false} />
                      </div>
                    )}"""

replacement = """                ) : bagTab === "wishlist" ? (
                  <div className="space-y-3">
                    {userProfile?.wishlist?.length > 0 && (
                      <VaultFilterBar items={catalog.filter(c => userProfile.wishlist.some(w => w === c.id || w.startsWith(`${c.id}-pkg-`)))} filters={wishlistFilters} showCondition={false}>
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to clear your wishlist?")) {
                              handleClearWishlist();
                            }
                          }}
                          className="shrink-0 text-[10px] uppercase font-bold text-rose-500 hover:text-rose-400 transition-colors cursor-pointer inline-flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg border border-rose-500/20 whitespace-nowrap"
                        >
                          <X className="w-3 h-3" /> Clear Wishlist
                        </button>
                      </VaultFilterBar>
                    )}"""

if target in content:
    content = content.replace(target, replacement)
    with open(path, 'w') as f:
        f.write(content)
    print("Fixed!")
else:
    print("Target not found!")
