import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# 1. Imports
text = text.replace(
    'import React, { useState, useEffect, useMemo } from "react";',
    'import React, { useState, useEffect, useMemo } from "react";\nimport { motion, AnimatePresence } from "framer-motion";'
)

# 2. Add showClearWishlistConfirm state near other states
if 'const [showClearWishlistConfirm' not in text:
    text = text.replace(
        'const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);',
        'const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);\n  const [showClearWishlistConfirm, setShowClearWishlistConfirm] = useState(false);'
    )

# 3. Animate bagTab
bag_tab_start = """                {(isAuthLoading || isLoadingCloudData) ? (
                  <div className="py-20 text-center rounded-3xl border border-neutral-850 bg-neutral-900/40 flex flex-col items-center justify-center shadow-inner">
                    <RefreshCw className="w-8 h-8 text-[#2563eb] animate-spin mb-3 opacity-80" />
                    <h4 className="font-bold text-neutral-400 text-xs uppercase tracking-wider">Loading Vault...</h4>
                  </div>
                ) : bagTab === "wishlist" ? (
                  <div className="space-y-3">"""
bag_tab_start_new = """                <AnimatePresence mode="wait">
                {(isAuthLoading || isLoadingCloudData) ? (
                  <motion.div key="loading" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} transition={{ duration: 0.2 }} className="py-20 text-center rounded-3xl border border-neutral-850 bg-neutral-900/40 flex flex-col items-center justify-center shadow-inner">
                    <RefreshCw className="w-8 h-8 text-[#2563eb] animate-spin mb-3 opacity-80" />
                    <h4 className="font-bold text-neutral-400 text-xs uppercase tracking-wider">Loading Vault...</h4>
                  </motion.div>
                ) : bagTab === "wishlist" ? (
                  <motion.div key="wishlist" initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}} transition={{ duration: 0.2 }} className="space-y-3">"""
text = text.replace(bag_tab_start, bag_tab_start_new)

bag_tab_mid = """                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">"""
bag_tab_mid_new = """                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="bag" initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: 20}} transition={{ duration: 0.2 }} className="space-y-4">"""
text = text.replace(bag_tab_mid, bag_tab_mid_new)

bag_tab_end = """                      </div>
                    )}
                  </div>
                )}
              </div>"""
bag_tab_end_new = """                      </div>
                    )}
                  </motion.div>
                )}
                </AnimatePresence>
              </div>"""
text = text.replace(bag_tab_end, bag_tab_end_new)


# 4. Animate sharedTab
shared_tab_start = """              {sharedTab === "wishlist" ? (
                <div className="space-y-3">"""
shared_tab_start_new = """              <AnimatePresence mode="wait">
              {sharedTab === "wishlist" ? (
                <motion.div key="shared-wishlist" initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}} transition={{ duration: 0.2 }} className="space-y-3">"""
text = text.replace(shared_tab_start, shared_tab_start_new)

shared_tab_mid = """                  )}
                </div>
              ) : (
                <div className="space-y-4">"""
shared_tab_mid_new = """                  )}
                </motion.div>
              ) : (
                <motion.div key="shared-owned" initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: 20}} transition={{ duration: 0.2 }} className="space-y-4">"""
text = text.replace(shared_tab_mid, shared_tab_mid_new)

shared_tab_end = """                </div>
              )}
              </div>
            )}
            </div>"""
shared_tab_end_new = """                </motion.div>
              )}
              </AnimatePresence>
              </div>
            )}
            </div>"""
text = text.replace(shared_tab_end, shared_tab_end_new)

# 5. Fix Clear Wishlist onClick inside the map for bagTab wishlist
text = text.replace(
    'onClick={() => {\n                            if (window.confirm("Are you sure you want to clear your wishlist?")) {\n                              handleClearWishlist();\n                            }\n                          }}',
    'onClick={() => setShowClearWishlistConfirm(true)}'
)

# 6. AuthModal props
auth_modal_old = """      {/* Firebase Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        currentUser={currentUser}
        userProfile={userProfile}
        theme={theme}
        onThemeChange={handleSetTheme}
        onDeleteBag={handleDeleteAllLocker}
        hasBagItems={balls.length > 0}
        onProfileUpdate={(updatedUser) => {"""
auth_modal_new = """      {/* Firebase Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        currentUser={currentUser}
        userProfile={userProfile}
        theme={theme}
        onThemeChange={handleSetTheme}
        onProfileUpdate={(updatedUser) => {"""
text = text.replace(auth_modal_old, auth_modal_new)

# 7. ImportExportModal props and Clear Wishlist modal
import_export_old = """      {/* Import/Export Modal */}
      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        onExport={handleExportData}
        onImport={handleImportData}
      />"""
import_export_new = """      {/* Import/Export Modal */}
      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        onExport={handleExportData}
        onImport={handleImportData}
        onDeleteBag={handleDeleteAllLocker}
        hasBagItems={balls.length > 0}
      />

      {/* Clear Wishlist Confirmation Modal */}
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
      </AnimatePresence>"""
text = text.replace(import_export_old, import_export_new)

# 8. Pass index to CatalogItemCard and OwnedBallCard inside .map()
text = text.replace(
    '.map(item => {\n                            if (!item) return null;\n                            return (\n                            <CatalogItemCard\n                              key={item.id}\n                              item={item}',
    '.map((item, index) => {\n                            if (!item) return null;\n                            return (\n                            <CatalogItemCard\n                              index={index}\n                              key={item.id}\n                              item={item}'
)

text = text.replace(
    '.map(({ ball }) => (\n                      <OwnedBallCard\n                        key={ball.id}',
    '.map(({ ball }, index) => (\n                      <OwnedBallCard\n                        index={index}\n                        key={ball.id}'
)

# For shared view maps
text = text.replace(
    '.map(item => {\n                          if (!item) return null;\n                          return (\n                          <CatalogItemCard\n                            key={item.id}\n                            item={item}',
    '.map((item, index) => {\n                          if (!item) return null;\n                          return (\n                          <CatalogItemCard\n                            index={index}\n                            key={item.id}\n                            item={item}'
)

text = text.replace(
    '.map((ball) => {\n                    const currentPkg = ball.packageType || "ea";',
    '.map((ball, index) => {\n                    const currentPkg = ball.packageType || "ea";'
)

text = text.replace(
    '<OwnedBallCard \n                        key={ball.id} \n                        ball={ball} \n                        catalog={catalog} \n                        readOnly={true} \n                      />',
    '<OwnedBallCard \n                        index={index}\n                        key={ball.id} \n                        ball={ball} \n                        catalog={catalog} \n                        readOnly={true} \n                      />'
)


with open("src/App.tsx", "w") as f:
    f.write(text)

