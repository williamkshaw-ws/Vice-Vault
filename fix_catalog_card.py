import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/components/CatalogItemCard.tsx'
with open(path, 'r') as f:
    content = f.read()

target1 = """      className={`relative rounded-xl border p-4 transition-all duration-300 ${
        isOpen 
          ? "bg-neutral-900 border-[#2563eb]/50 shadow-md shadow-[#2563eb]/10" 
          : "bg-neutral-900/60 hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700 hover:shadow-sm"
      }`}"""
replacement1 = """      className={`relative rounded-xl border p-4 transition-all duration-300 ${
        isOpen 
          ? "bg-neutral-900 border-[#2563eb]/50 shadow-md shadow-[#2563eb]/10" 
          : "bg-neutral-900/60 hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700 hover:shadow-sm"
      } ${showWishlistPrompt ? "z-[60]" : ""}`}"""

content = content.replace(target1, replacement1)

target2 = """                  {showWishlistPrompt && createPortal(
                    <div className="fixed inset-0 z-40" style={{ pointerEvents: 'auto' }} onClick={() => setShowWishlistPrompt(false)}>
                      <div 
                        className={`absolute w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in duration-150 flex flex-col ${wishlistCoords.openUpwards ? 'slide-in-from-bottom-2' : 'mt-2 slide-in-from-top-2'}`}
                        style={{
                          top: wishlistCoords.top,
                          left: wishlistCoords.left,
                          transform: wishlistCoords.openUpwards ? "translateY(calc(-100% - 8px))" : "none"
                        }}
                        onClick={e => e.stopPropagation()}
                      >"""
replacement2 = """                  {showWishlistPrompt && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowWishlistPrompt(false); }} />
                      <div 
                        className={`absolute right-0 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in duration-150 flex flex-col ${wishlistCoords.openUpwards ? 'bottom-full mb-2 slide-in-from-bottom-2' : 'top-full mt-2 slide-in-from-top-2'}`}
                        onClick={e => e.stopPropagation()}
                      >"""

content = content.replace(target2, replacement2)

target3 = """                        {subItems.length > 1 ? (
                          <div className="flex flex-col">"""
replacement3 = """                        {subItems.length > 0 ? (
                          <div className="flex flex-col">"""

content = content.replace(target3, replacement3)

target4 = """                          </div>
                        ) : null}
                      </div>
                    </div>,
                    document.body
                  )}"""
replacement4 = """                          </div>
                        ) : null}
                      </div>
                    </>
                  )}"""

content = content.replace(target4, replacement4)

with open(path, 'w') as f:
    f.write(content)
print("Fixed!")

