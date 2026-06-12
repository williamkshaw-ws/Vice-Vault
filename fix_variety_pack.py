import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# Add getUniqueCatalogItems after getOwnedUniqueCount
get_unique_func = """  return ownedUniqueHashes.size;
};

const getUniqueCatalogItems = (balls: GolfBall[], catalog: CatalogItem[]): CatalogItem[] => {
  const uniqueItems = new Map<string, CatalogItem>();
  
  balls.forEach(b => {
    const isGroupBox = b.packageType === "box" && (b.color === "Mixed" || b.color === "" || b.variation === "Mixed" || b.variation === "") && catalog.some(c => 
      c.model.trim().toLowerCase() === b.model.trim().toLowerCase() &&
      (c.name || "").trim().toLowerCase() === (b.name || "").trim().toLowerCase() &&
      (c.groupColor || c.groupVariation)
    );

    if (b.bundleItems && b.bundleItems.length > 0) {
      b.bundleItems.forEach(item => {
        const c = catalog.find(cat => cat.id === item.catalogId);
        if (c) {
          uniqueItems.set(c.id, c);
        }
      });
    } else if (isGroupBox) {
      catalog.filter(c => 
        c.model.trim().toLowerCase() === b.model.trim().toLowerCase() &&
        (c.name || "").trim().toLowerCase() === (b.name || "").trim().toLowerCase()
      ).forEach(c => {
        uniqueItems.set(c.id, c);
      });
    } else {
      const c = catalog.find(cat => 
        cat.model.trim().toLowerCase() === b.model.trim().toLowerCase() &&
        (cat.name || cat.model).trim().toLowerCase() === (b.name || b.model).trim().toLowerCase() &&
        cat.color.trim().toLowerCase() === b.color.trim().toLowerCase() &&
        (cat.variation || "").trim().toLowerCase() === (b.variation || "").trim().toLowerCase() &&
        (cat.year || "").trim().toLowerCase() === (b.year || "").trim().toLowerCase()
      );
      if (c) {
        uniqueItems.set(c.id, c);
      }
    }
  });
  
  return Array.from(uniqueItems.values());
};"""

text = text.replace("  return ownedUniqueHashes.size;\n};", get_unique_func)

# Replace TrophyCase uniqueBalls prop
old_trophycase = """                        <TrophyCase 
                          uniqueBalls={Array.from(new Set(balls.map(b => {
                            const cat = catalog.find(c => 
                              c.model.trim().toLowerCase() === b.model.trim().toLowerCase() &&
                              (c.name || c.model).trim().toLowerCase() === (b.name || b.model).trim().toLowerCase() &&
                              c.color.trim().toLowerCase() === b.color.trim().toLowerCase() &&
                              (c.variation || "").trim().toLowerCase() === (b.variation || "").trim().toLowerCase() &&
                              (c.year || "").trim().toLowerCase() === (b.year || "").trim().toLowerCase()
                            );
                            return cat?.id;
                          }).filter(Boolean))).map(id => catalog.find(c => c.id === id)).filter(Boolean) as any}
                          username={userProfile?.username || "GOLFER"}
                        />"""

new_trophycase = """                        <TrophyCase 
                          uniqueBalls={getUniqueCatalogItems(balls, catalog)}
                          username={userProfile?.username || "GOLFER"}
                        />"""

text = text.replace(old_trophycase, new_trophycase)

with open("src/App.tsx", "w") as f:
    f.write(text)

