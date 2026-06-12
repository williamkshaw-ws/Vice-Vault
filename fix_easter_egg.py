import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# 1. Update the button classes and title
old_btn = """                  <button 
                    onClick={() => {
                      if (bagTab !== "wishlist") {
                        setShowTrophyCase(!showTrophyCase);
                      }
                    }}
                    className={`w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center transition-colors ${bagTab === "wishlist" ? "bg-neutral-950 opacity-40 cursor-not-allowed" : "bg-neutral-950 hover:bg-neutral-900 cursor-pointer"}`}
                    title={bagTab === "wishlist" ? "Trophy Case is only available for your owned collection" : "Toggle Trophy Case"}
                    disabled={bagTab === "wishlist"}
                  >"""

new_btn = """                  <button 
                    onClick={() => {
                      if (bagTab !== "wishlist") {
                        setShowTrophyCase(!showTrophyCase);
                      }
                    }}
                    className={`w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center transition-colors bg-neutral-950 ${bagTab === "wishlist" ? "cursor-default" : "hover:bg-neutral-900 cursor-pointer"}`}
                    title={bagTab === "wishlist" ? "" : "Toggle Trophy Case"}
                    disabled={bagTab === "wishlist"}
                  >"""

text = text.replace(old_btn, new_btn)

# 2. Add useEffect to reset showTrophyCase when tab changes
# Let's insert it after the `showTrophyCase` state is declared.
old_state = 'const [showTrophyCase, setShowTrophyCase] = useState(false);'
new_state = """const [showTrophyCase, setShowTrophyCase] = useState(false);

  useEffect(() => {
    if (bagTab === "wishlist") {
      setShowTrophyCase(false);
    }
  }, [bagTab]);"""

text = text.replace(old_state, new_state)

with open("src/App.tsx", "w") as f:
    f.write(text)

