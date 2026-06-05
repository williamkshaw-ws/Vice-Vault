import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/App.tsx'
with open(path, 'r') as f:
    content = f.read()

target = """  // Group catalog items dynamically based on groupColor and groupVariation flags
  const groupedCatalog = useMemo(() => {
    const groups: { primary: CatalogItem; subItems: CatalogItem[] }[] = [];
    const visited = new Set<string>();

    for (const item of sortedCatalog) {
      if (visited.has(item.id)) continue;

      const shouldGroup = (item.groupColor || item.groupVariation) && dbPanelTab !== "wishlist";
      if (shouldGroup && item.name) {
        const matching = sortedCatalog.filter(i => {"""

replacement = """  // Group catalog items dynamically based on groupColor and groupVariation flags
  const groupedCatalog = useMemo(() => {
    const groups: { primary: CatalogItem; subItems: CatalogItem[] }[] = [];
    const visited = new Set<string>();

    for (const item of sortedCatalog) {
      if (visited.has(item.id)) continue;

      const shouldGroup = (item.groupColor || item.groupVariation) && dbPanelTab !== "wishlist";
      if (shouldGroup && item.name) {
        const matching = catalog.filter(i => {"""

if target in content:
    content = content.replace(target, replacement)
    
    target2 = """    return groups;
  }, [sortedCatalog]);"""
    replacement2 = """    return groups;
  }, [sortedCatalog, catalog]);"""
    
    if target2 in content:
        content = content.replace(target2, replacement2)
        with open(path, 'w') as f:
            f.write(content)
        print("Fixed groupedCatalog to use full catalog for subItems!")
    else:
        print("Target 2 not found!")
else:
    print("Target 1 not found!")

