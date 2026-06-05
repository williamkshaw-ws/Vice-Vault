import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/components/CatalogItemCard.tsx'
with open(path, 'r') as f:
    content = f.read()

target = """                            <button 
                              type="button"
                              onClick={() => {
                                const idToToggle = wishlistItems.includes(`${item.id}-pkg-box`) ? `${item.id}-pkg-box` : wishlistItems.includes(item.id) ? item.id : `${item.id}-pkg-box`;
                                onToggleWishlist?.(idToToggle); 
                              }}
                              className="text-left px-4 py-3 text-xs font-bold text-white hover:bg-neutral-800 border-b border-neutral-800 cursor-pointer flex justify-between items-center group"
                            >
                              <div className="flex flex-col">
                                <span>Entire Box</span>
                                <span className="text-[10px] text-neutral-500 font-mono font-normal">({item.groupColor ? 'Mixed Colors' : 'Mixed Variations'})</span>
                              </div>
                              <Heart className={`w-4 h-4 transition-colors shrink-0 ${wishlistItems.includes(`${item.id}-pkg-box`) || wishlistItems.includes(item.id) ? 'fill-current text-rose-500' : 'text-neutral-600 group-hover:text-rose-500'}`} />
                            </button>"""

replacement = """                            <button 
                              type="button"
                              onClick={() => {
                                onToggleWishlist?.(`${item.id}-pkg-box`); 
                              }}
                              className="text-left px-4 py-3 text-xs font-bold text-white hover:bg-neutral-800 border-b border-neutral-800 cursor-pointer flex justify-between items-center group"
                            >
                              <div className="flex flex-col">
                                <span>Entire Box</span>
                                <span className="text-[10px] text-neutral-500 font-mono font-normal">({item.groupColor ? 'Mixed Colors' : 'Mixed Variations'})</span>
                              </div>
                              <Heart className={`w-4 h-4 transition-colors shrink-0 ${wishlistItems.includes(`${item.id}-pkg-box`) ? 'fill-current text-rose-500' : 'text-neutral-600 group-hover:text-rose-500'}`} />
                            </button>"""

if target in content:
    content = content.replace(target, replacement)
    with open(path, 'w') as f:
        f.write(content)
    print("Fixed!")
else:
    print("Target not found!")
