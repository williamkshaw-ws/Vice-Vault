import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/components/CatalogItemCard.tsx'
with open(path, 'r') as f:
    content = f.read()

target = """                    onClick={(e) => {
                      e.stopPropagation();
                      const isWishlisted = wishlistItems.some(w => w === item.id || w.startsWith(`${item.id}-pkg-`));
                      if (isWishlisted) {
                        const idToToggle = wishlistItems.includes(`${item.id}-pkg-box`) ? `${item.id}-pkg-box` : wishlistItems.includes(item.id) ? item.id : `${item.id}-pkg-box`;
                        onToggleWishlist?.(idToToggle);
                      } else if (isBundle) {
                        const idToToggle = wishlistItems.includes(`${item.id}-pkg-box`) ? `${item.id}-pkg-box` : wishlistItems.includes(item.id) ? item.id : `${item.id}-pkg-box`;
                        onToggleWishlist?.(idToToggle);
                      } else {
                        setShowWishlistPrompt(!showWishlistPrompt);
                      }
                    }}"""

replacement = """                    onClick={(e) => {
                      e.stopPropagation();
                      if (subItems.length > 0) {
                        // For grouped items, always show the dropdown to let them pick which ball/box
                        setShowWishlistPrompt(!showWishlistPrompt);
                      } else {
                        // For single items or bundles, just toggle the specific item ID directly
                        onToggleWishlist?.(item.id);
                      }
                    }}"""

if target in content:
    content = content.replace(target, replacement)
    
    target2 = """                        ) : (
                          <div className="flex flex-col">
                            <button 
                              type="button"
                              onClick={() => {
                                const idToToggle = wishlistItems.includes(`${item.id}-pkg-box`) ? `${item.id}-pkg-box` : wishlistItems.includes(item.id) ? item.id : `${item.id}-pkg-box`;
                                onToggleWishlist?.(idToToggle); 
                              }}
                              className="text-left px-4 py-3 text-xs font-bold text-white hover:bg-neutral-800 border-b border-neutral-800 cursor-pointer flex justify-between items-center group"
                            >
                              <div className="flex flex-col">
                                <span>Entire Box</span>
                                <span className="text-[10px] text-neutral-500 font-mono font-normal">({item.color})</span>
                              </div>
                              <Heart className={`w-4 h-4 transition-colors shrink-0 ${wishlistItems.includes(`${item.id}-pkg-box`) ? 'fill-current text-rose-500' : 'text-neutral-600 group-hover:text-rose-500'}`} />
                            </button>
                            <button
                              type="button"
                              onClick={() => { onToggleWishlist?.(item.id); }}
                              className="w-full text-left px-4 py-3 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 border-b border-neutral-800/50 cursor-pointer flex justify-between items-center group"
                            >
                              <div className="flex flex-col">
                                <span>Single Ball</span>
                                <span className="text-[10px] text-neutral-500 font-mono italic max-w-[140px] truncate">{item.variation || item.notes}</span>
                              </div>
                              <Heart className={`w-4 h-4 transition-colors shrink-0 ${wishlistItems.includes(item.id) && !wishlistItems.includes(`${item.id}-pkg-box`) ? 'fill-current text-rose-500' : 'text-neutral-600 group-hover:text-rose-500'}`} />
                            </button>
                          </div>
                        )}"""
    
    replacement2 = """                        ) : null}"""
    
    if target2 in content:
        content = content.replace(target2, replacement2)
        with open(path, 'w') as f:
            f.write(content)
        print("Fixed!")
    else:
        print("Target 2 not found!")
else:
    print("Target 1 not found!")
