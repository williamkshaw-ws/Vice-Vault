with open("src/App.tsx", "r") as f:
    lines = f.readlines()

# 1. Fix Clear Wishlist Confirm (Lines 2684-2688)
# Look for window.confirm
for i, line in enumerate(lines):
    if 'window.confirm("Are you sure you want to clear your wishlist?")' in line:
        lines[i-1] = '                          onClick={() => setShowClearWishlistConfirm(true)}\n'
        lines[i] = ''
        lines[i+1] = ''
        lines[i+2] = ''
        lines[i+3] = ''
        break

# 2. Fix ImportExportModal props (Lines 4094-4100)
for i, line in enumerate(lines):
    if '<ImportExportModal' in line:
        # found the tag, we can inject props before '/>'
        for j in range(i, i+10):
            if '/>' in lines[j]:
                lines[j] = '        onDeleteBag={handleDeleteAllLocker}\n        hasBagItems={balls.length > 0}\n      />\n'
                break
        break

# 3. Add Clear Wishlist Modal BEFORE {/* Toast Notification */}
for i, line in enumerate(lines):
    if '{/* Toast Notification */}' in line:
        modal_code = """      {/* Clear Wishlist Confirmation Modal */}
      <AnimatePresence>
      {showClearWishlistConfirm && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 10 }}
            className="bg-neutral-900 border border-rose-900/50 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl relative"
          >
            <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto animate-pulse" />
            <h4 className="text-white font-sans font-black text-base uppercase tracking-wider">
              Clear Wishlist
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed font-mono">
              Are you sure you want to remove all items from your wishlist? This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-6 pt-2 w-full">
              <button
                type="button"
                onClick={() => setShowClearWishlistConfirm(false)}
                className="flex-1 py-2.5 px-3 bg-neutral-950 border border-neutral-800 hover:bg-neutral-900 text-neutral-400 font-mono text-[10px] uppercase font-bold tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleClearWishlist();
                  setShowClearWishlistConfirm(false);
                }}
                className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-mono text-[10px] uppercase font-extrabold tracking-wider rounded-xl transition-all cursor-pointer border-none"
              >
                Yes, Clear
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>\n\n"""
        lines.insert(i, modal_code)
        break

# 4. Fix shared view animations
# Find {sharedTab === "wishlist" ? (
for i, line in enumerate(lines):
    if '{sharedTab === "wishlist" ? (' in line:
        lines[i] = '              <AnimatePresence mode="wait">\n              {sharedTab === "wishlist" ? (\n'
        for j in range(i+1, i+5):
            if '<div className="space-y-3">' in lines[j]:
                lines[j] = '                <motion.div key="shared-wishlist" initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}} transition={{ duration: 0.2 }} className="space-y-3">\n'
                break
        
        # Now find the else branch
        for j in range(i+10, i+100):
            if ') : (' in lines[j] and '<div className="space-y-4">' in lines[j+1]:
                lines[j] = '                </motion.div>\n              ) : (\n'
                lines[j+1] = '                <motion.div key="shared-owned" initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: 20}} transition={{ duration: 0.2 }} className="space-y-4">\n'
                break
        
        # Now find the end of the shared view
        for j in range(i+60, i+120):
            if '              )}' in lines[j] and '              </div>' in lines[j+1] and '            )}' in lines[j+2]:
                lines[j] = '                </div>\n              )}\n              </motion.div>\n              )}\n              </AnimatePresence>\n'
                lines[j+1] = ''
                break
        break

# 5. Pass index to CatalogItemCard and OwnedBallCard in shared view
catalog_map_found = False
owned_map_found = False
for i, line in enumerate(lines):
    if 'return matchesAdvancedModel && matchesAdvancedColor && matchesAdvancedVariation && matchesAdvancedYear && matchesAdvancedName;' in line:
        if '.map(item => {' in lines[i+1]:
            lines[i+1] = '                        .map((item, index) => {\n'
            for j in range(i+1, i+10):
                if '<CatalogItemCard' in lines[j]:
                    lines[j] = '                          <CatalogItemCard\n                            index={index}\n'
                    catalog_map_found = True
                    break
                    
    if 'return matchesAdvancedModel && matchesAdvancedColor && matchesAdvancedVariation && matchesAdvancedYear && matchesAdvancedName && matchesAdvancedCondition;' in line:
        if '                    .map((ball) => {' in lines[i+2]:
            lines[i+2] = '                    .map((ball, index) => {\n'
            for j in range(i+2, i+15):
                if '<OwnedBallCard' in lines[j]:
                    lines[j] = '                      <OwnedBallCard \n                        index={index}\n'
                    owned_map_found = True
                    break

with open("src/App.tsx", "w") as f:
    f.writelines(lines)

