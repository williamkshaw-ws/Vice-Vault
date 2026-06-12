import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# Replace sharedTab conditional
shared_tab_old = """              {sharedTab === "wishlist" ? (
                <div className="space-y-3">"""
shared_tab_new = """              <AnimatePresence mode="wait">
              {sharedTab === "wishlist" ? (
                <motion.div key="shared-wishlist" initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}} transition={{ duration: 0.2 }} className="space-y-3">"""
text = text.replace(shared_tab_old, shared_tab_new)

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


# Pass index to OwnedBallCard
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

