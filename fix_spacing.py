import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/components/CatalogItemCard.tsx'
with open(path, 'r') as f:
    content = f.read()

target = """              {!isReadOnly && (
                !isOpen ? (
                  <>
                  <button
                    ref={wishlistBtnRef}"""

replacement = """              {!isReadOnly && (
                !isOpen ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    ref={wishlistBtnRef}"""

content = content.replace(target, replacement)

target2 = """                    className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer mr-2 ${"""
replacement2 = """                    className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer ${"""

content = content.replace(target2, replacement2)

target3 = """                  {variant !== 'wishlist' && (
                    <button
                      type="button"
                      onClick={startAdding}
                      className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-[#2563eb] hover:bg-[#2563eb]/80 text-black transition-colors cursor-pointer"
                      id={`btn-open-add-${item.id}`}
                      title="Add to Bag"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                  </>
                ) : ("""

replacement3 = """                  {variant !== 'wishlist' && (
                    <button
                      type="button"
                      onClick={startAdding}
                      className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-[#2563eb] hover:bg-[#2563eb]/80 text-black transition-colors cursor-pointer"
                      id={`btn-open-add-${item.id}`}
                      title="Add to Bag"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                  </div>
                ) : ("""

content = content.replace(target3, replacement3)

with open(path, 'w') as f:
    f.write(content)

print("Spacing fixed!")
