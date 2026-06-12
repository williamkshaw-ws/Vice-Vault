import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Add imports
content = content.replace(
    'import React, { useState, useEffect, useMemo } from "react";',
    'import React, { useState, useEffect, useMemo } from "react";\nimport { motion, AnimatePresence } from "framer-motion";'
)

# Replace bagTab transition
bag_tab_block = """                {(isAuthLoading || isLoadingCloudData) ? (
                  <div className="py-20 text-center rounded-3xl border border-neutral-850 bg-neutral-900/40 flex flex-col items-center justify-center shadow-inner">
                    <RefreshCw className="w-8 h-8 text-[#2563eb] animate-spin mb-3 opacity-80" />
                    <h4 className="font-bold text-neutral-400 text-xs uppercase tracking-wider">Loading Vault...</h4>
                  </div>
                ) : bagTab === "wishlist" ? (
                  <div className="space-y-3">"""

bag_tab_replace = """                <AnimatePresence mode="wait">
                {(isAuthLoading || isLoadingCloudData) ? (
                  <motion.div key="loading" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} transition={{ duration: 0.2 }} className="py-20 text-center rounded-3xl border border-neutral-850 bg-neutral-900/40 flex flex-col items-center justify-center shadow-inner">
                    <RefreshCw className="w-8 h-8 text-[#2563eb] animate-spin mb-3 opacity-80" />
                    <h4 className="font-bold text-neutral-400 text-xs uppercase tracking-wider">Loading Vault...</h4>
                  </motion.div>
                ) : bagTab === "wishlist" ? (
                  <motion.div key="wishlist" initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}} transition={{ duration: 0.2 }} className="space-y-3">"""

content = content.replace(bag_tab_block, bag_tab_replace)

bag_tab_mid = """                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">"""
bag_tab_mid_replace = """                        })}
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="bag" initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: 20}} transition={{ duration: 0.2 }} className="space-y-4">"""

content = content.replace(bag_tab_mid, bag_tab_mid_replace)

bag_tab_end = """                      </div>
                    )}
                  </div>
                )}"""
bag_tab_end_replace = """                      </div>
                    )}
                  </motion.div>
                )}
                </AnimatePresence>"""
content = content.replace(bag_tab_end, bag_tab_end_replace)

# Clear Wishlist Modal
clear_wish_old = """      {/* Clear Wishlist Confirmation Modal */}
      {showClearWishlistConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-neutral-900 border border-rose-900/50 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl animate-scale-in relative">"""
clear_wish_new = """      {/* Clear Wishlist Confirmation Modal */}
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
          >"""
content = content.replace(clear_wish_old, clear_wish_new)

clear_wish_end = """              >
                Yes, Clear
              </button>
            </div>
          </div>
        </div>
      )}

       {/* Toast Notification */}"""
clear_wish_end_new = """              >
                Yes, Clear
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

       {/* Toast Notification */}"""
content = content.replace(clear_wish_end, clear_wish_end_new)


with open("src/App.tsx", "w") as f:
    f.write(content)

