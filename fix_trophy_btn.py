import re

with open("src/App.tsx", "r") as f:
    text = f.read()

old_btn = """                  <button 
                    onClick={() => setShowTrophyCase(!showTrophyCase)}
                    className="w-10 h-10 rounded-full border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 transition-colors cursor-pointer flex items-center justify-center"
                    title="Toggle Trophy Case"
                  >"""

new_btn = """                  <button 
                    onClick={() => {
                      if (bagTab !== "wishlist") {
                        setShowTrophyCase(!showTrophyCase);
                      }
                    }}
                    className={`w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center transition-colors ${bagTab === "wishlist" ? "bg-neutral-950 opacity-40 cursor-not-allowed" : "bg-neutral-950 hover:bg-neutral-900 cursor-pointer"}`}
                    title={bagTab === "wishlist" ? "Trophy Case is only available for your owned collection" : "Toggle Trophy Case"}
                    disabled={bagTab === "wishlist"}
                  >"""

text = text.replace(old_btn, new_btn)

# ALSO, we need to make sure that if the user switches to wishlist while TrophyCase is open, it automatically closes!
# So we can add an effect or just handle it when they switch tabs.
# The tab switch buttons are around line 2650. Let's find "setBagTab".

with open("src/App.tsx", "w") as f:
    f.write(text)

