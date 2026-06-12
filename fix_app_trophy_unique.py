import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/App.tsx'
with open(path, 'r') as f:
    content = f.read()

# Insert the helper function right after getOwnedUniqueCount
helper_code = """
const getOwnedUniqueCatalogItems = (balls: GolfBall[], catalog: CatalogItem[]) => {
  const map = new Map<string, CatalogItem>();
  
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
          map.set(getHash(c.model, c.name || "", c.color, c.variation || "", c.year || ""), c);
        }
      });
    } else if (isGroupBox) {
      catalog.filter(c => 
        c.model.trim().toLowerCase() === b.model.trim().toLowerCase() &&
        (c.name || "").trim().toLowerCase() === (b.name || "").trim().toLowerCase()
      ).forEach(c => {
        map.set(getHash(c.model, c.name || "", c.color, c.variation || "", c.year || ""), c);
      });
    } else {
      const hash = getHash(b.model as string, b.name || "", b.color as string, b.variation || "", b.year || "");
      if (!map.has(hash)) {
        const matchedCatalogItem = catalog.find(c => 
          c.model.trim().toLowerCase() === b.model.trim().toLowerCase() && 
          c.color.trim().toLowerCase() === b.color.trim().toLowerCase() && 
          (c.variation || '').trim().toLowerCase() === (b.variation || '').trim().toLowerCase() && 
          (c.name || '').trim().toLowerCase() === (b.name || '').trim().toLowerCase() &&
          (c.year || '').trim().toLowerCase() === (b.year || '').trim().toLowerCase()
        );
        if (matchedCatalogItem) {
          map.set(hash, matchedCatalogItem);
        } else {
          const fallback = catalog.find(c => 
            c.model.trim().toLowerCase() === b.model.trim().toLowerCase() && 
            c.color.trim().toLowerCase() === b.color.trim().toLowerCase() && 
            (c.variation || '').trim().toLowerCase() === (b.variation || '').trim().toLowerCase() && 
            (c.name || '').trim().toLowerCase() === (b.name || '').trim().toLowerCase()
          );
          if (fallback) map.set(hash, fallback);
        }
      }
    }
  });
  
  return Array.from(map.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
};
"""

target_func_end = """  return ownedUniqueHashes.size;
};"""

replacement_func_end = target_func_end + "\n" + helper_code

if target_func_end in content:
    content = content.replace(target_func_end, replacement_func_end)

# Update TrophyCase props
old_trophy_render = """                      <TrophyCase 
                        uniqueBalls={(() => {
                          const uniqueCatalogIds = new Set<string>();
                          balls.forEach(ball => {
                            if (ball.bundleItems && ball.bundleItems.length > 0) {
                              ball.bundleItems.forEach(bItem => uniqueCatalogIds.add(bItem.catalogId));
                            } else {
                              const matchedCatalogItem = catalog.find(c => 
                                c.model === ball.model && 
                                c.color === ball.color && 
                                (c.variation || '') === (ball.variation || '') && 
                                (c.name || '') === (ball.name || '') &&
                                (c.year || '') === (ball.year || '')
                              );
                              if (matchedCatalogItem) {
                                uniqueCatalogIds.add(matchedCatalogItem.id);
                              } else {
                                const fallback = catalog.find(c => c.model === ball.model && c.color === ball.color && (c.variation || '') === (ball.variation || ''));
                                if (fallback) uniqueCatalogIds.add(fallback.id);
                              }
                            }
                          });
                          return Array.from(uniqueCatalogIds)
                            .map(id => catalog.find(c => c.id === id))
                            .filter((item): item is CatalogItem => item !== undefined)
                            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                        })()} 
                      />"""

new_trophy_render = """                      <TrophyCase 
                        uniqueBalls={getOwnedUniqueCatalogItems(balls, catalog)} 
                      />"""

if old_trophy_render in content:
    content = content.replace(old_trophy_render, new_trophy_render)

with open(path, 'w') as f:
    f.write(content)
print("Fixed App.tsx!")
