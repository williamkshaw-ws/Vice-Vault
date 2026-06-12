import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# 1. Add Trophy to lucide-react imports
text = text.replace(
    '  Heart\n} from "lucide-react";',
    '  Heart,\n  Trophy\n} from "lucide-react";'
)

# 2. Import TrophyCase
text = text.replace(
    'import OwnedBallCard from "./components/OwnedBallCard";',
    'import OwnedBallCard from "./components/OwnedBallCard";\nimport TrophyCase from "./components/TrophyCase";'
)

# 3. Add showTrophyCase state
text = text.replace(
    'const [showClearWishlistConfirm, setShowClearWishlistConfirm] = useState(false);',
    'const [showClearWishlistConfirm, setShowClearWishlistConfirm] = useState(false);\n  const [showTrophyCase, setShowTrophyCase] = useState(false);'
)

# 4. Make Unique Balls icon a button
old_unique_icon = """                  <div className="w-10 h-10 rounded-full border border-neutral-800 bg-neutral-950 flex items-center justify-center text-[#2563eb]">
                    <GolfBallOutlineIcon className="w-5 h-5" />
                  </div>"""
new_unique_icon = """                  <button 
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
text = text.replace(old_unique_icon, new_unique_icon)

# 5. Conditionally render TrophyCase
# We need to wrap the contents of bag inside <motion.div key="bag"...>
# Let's find the start of that div:
bag_content_start = """                  <motion.div key="bag" initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: 20}} transition={{ duration: 0.2 }} className="space-y-4">
                    {balls.length > 0 && ("""

bag_content_start_new = """                  <motion.div key="bag" initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: 20}} transition={{ duration: 0.2 }} className="space-y-4">
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
text = text.replace(bag_content_start, bag_content_start_new)

# Find the end of the map:
bag_content_end = """                        onDelete={handleDeleteBall}
                      />
                    ))}
                  </div>
                )}
                  </motion.div>"""
bag_content_end_new = """                        onDelete={handleDeleteBall}
                      />
                    ))}
                  </div>
                )}
                      </>
                    )}
                  </motion.div>"""
text = text.replace(bag_content_end, bag_content_end_new)

with open("src/App.tsx", "w") as f:
    f.write(text)

