import re

with open("src/App.tsx", "r") as f:
    text = f.read()

old_logic = """                        <TrophyCase 
                          uniqueBalls={Array.from(new Set(balls.map(b => b.id.replace(/-pkg-(box|ea|sleeve)$/, ''))))
                            .map(baseId => catalog.find(c => c.id === baseId))
                            .filter(Boolean) as any}
                          username={userProfile?.username || "GOLFER"}
                        />"""

new_logic = """                        <TrophyCase 
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

text = text.replace(old_logic, new_logic)

with open("src/App.tsx", "w") as f:
    f.write(text)

