import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# 1. Update the toggle button logic with AnimatePresence
old_btn = """                  <button 
                    onClick={() => setShowTrophyCase(!showTrophyCase)}
                    className="w-10 h-10 rounded-full border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 transition-colors cursor-pointer flex items-center justify-center"
                    title="Toggle Trophy Case"
                  >
                    {showTrophyCase ? (
                      <Trophy className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <GolfBallOutlineIcon className="w-5 h-5 text-[#2563eb]" />
                    )}
                  </button>"""
new_btn = """                  <button 
                    onClick={() => setShowTrophyCase(!showTrophyCase)}
                    className="w-10 h-10 rounded-full border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 transition-colors cursor-pointer flex items-center justify-center"
                    title="Toggle Trophy Case"
                  >
                    <AnimatePresence mode="wait">
                      {showTrophyCase ? (
                        <motion.div key="trophy" initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                          <Trophy className="w-5 h-5 text-yellow-500" />
                        </motion.div>
                      ) : (
                        <motion.div key="ball" initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                          <GolfBallOutlineIcon className="w-5 h-5 text-[#2563eb]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>"""
text = text.replace(old_btn, new_btn)

# 2. Update the TrophyCase conditionally rendered view
old_trophy_render_start = """                  <motion.div key="bag" initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: 20}} transition={{ duration: 0.2 }} className="space-y-4">
                    {showTrophyCase ? (
                      <TrophyCase 
                        uniqueBalls={Array.from(new Set(balls.map(b => b.catalogId)))
                          .map(catalogId => catalog.find(c => c.id === catalogId))
                          .filter(Boolean) as any}
                        username={userProfile?.username || "GOLFER"}
                      />
                    ) : (
                      <>
                    {balls.length > 0 && ("""
new_trophy_render_start = """                  <motion.div key="bag" initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: 20}} transition={{ duration: 0.2 }} className="space-y-4">
                    <AnimatePresence mode="wait">
                    {showTrophyCase ? (
                      <motion.div key="trophycase" initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: -90, opacity: 0 }} transition={{ duration: 0.3 }} style={{ perspective: 1000 }}>
                        <TrophyCase 
                          uniqueBalls={Array.from(new Set(balls.map(b => b.id.replace(/-pkg-(box|ea|sleeve)$/, ''))))
                            .map(baseId => catalog.find(c => c.id === baseId))
                            .filter(Boolean) as any}
                          username={userProfile?.username || "GOLFER"}
                        />
                      </motion.div>
                    ) : (
                      <motion.div key="gridcase" initial={{ rotateY: -90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: 90, opacity: 0 }} transition={{ duration: 0.3 }} style={{ perspective: 1000 }}>
                    {balls.length > 0 && ("""
text = text.replace(old_trophy_render_start, new_trophy_render_start)

# 3. Update the closing tags for the gridcase
old_trophy_render_end = """                        onDelete={handleDeleteBall}
                      />
                    ))}
                  </div>
                )}
                      </>
                    )}
                  </motion.div>"""
new_trophy_render_end = """                        onDelete={handleDeleteBall}
                      />
                    ))}
                  </div>
                )}
                      </motion.div>
                    )}
                    </AnimatePresence>
                  </motion.div>"""
text = text.replace(old_trophy_render_end, new_trophy_render_end)

with open("src/App.tsx", "w") as f:
    f.write(text)

