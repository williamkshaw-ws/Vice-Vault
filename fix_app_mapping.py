import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/App.tsx'
with open(path, 'r') as f:
    content = f.read()

target = """                      <TrophyCase 
                        uniqueBalls={Array.from(new Set(balls.map(b => b.catalogId)))
                          .map(id => catalog.find(c => c.id === id))
                          .filter((item): item is CatalogItem => item !== undefined)
                          .sort((a, b) => a.name.localeCompare(b.name))} 
                      />"""

replacement = """                      <TrophyCase 
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

content = content.replace(target, replacement)

with open(path, 'w') as f:
    f.write(content)
print("Fixed App.tsx mapping!")
