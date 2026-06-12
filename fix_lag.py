import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# Add useMemo for uniqueTrophyBalls
new_memo = """  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  const uniqueTrophyBalls = useMemo(() => getUniqueCatalogItems(balls, catalog), [balls, catalog]);"""
text = text.replace('  const [showWishlistOnly, setShowWishlistOnly] = useState(false);', new_memo)

# Use it in TrophyCase
old_trophycase = """                        <TrophyCase 
                          uniqueBalls={getUniqueCatalogItems(balls, catalog)}
                          username={userProfile?.username || "GOLFER"}
                        />"""

new_trophycase = """                        <TrophyCase 
                          uniqueBalls={uniqueTrophyBalls}
                          username={userProfile?.username || "GOLFER"}
                        />"""
text = text.replace(old_trophycase, new_trophycase)

with open("src/App.tsx", "w") as f:
    f.write(text)

