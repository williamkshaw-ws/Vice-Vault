let catalog = [
  {
    "id": "PRO-COSMIC_COLLECTIONS-AURORA_FIELDS",
    "model": "PRO",
    "name": "Cosmic Collections",
    "color": "Aurora Fields",
    "year": "2025",
    "groupColor": true,
    "groupVariation": false
  }
];

let balls = [
  {
    "id": "BAG-1",
    "catalogId": "PRO-COSMIC-AURORA_FIELDS",
    "model": "PRO",
    "name": "Cosmic Collections",
    "color": "Mixed",
    "packageType": "box",
    "year": "2025"
  }
];

const newBalls = balls.map(b => {
  const normalize = (s) => (s || "").replace(/[^a-z0-9]/gi, "").toLowerCase();
  
  let match;
  if (b.catalogId) {
    match = catalog.find(c => c.id === b.catalogId);
  }
  
  if (!match) {
    match = catalog.find(c => {
      const modelMatch = normalize(c.model) === normalize(b.model);
      if (!modelMatch) return false;

      const colorMatch = normalize(c.color) === normalize(b.color);
      const nameAsColorMatch = normalize(c.name) === normalize(b.color) && normalize(c.name) !== "";
      const isGroupColorMatch = c.groupColor && normalize(b.color) === normalize("Mixed");
      const finalColorMatch = colorMatch || nameAsColorMatch || isGroupColorMatch;
      
      const nameMatch = normalize(c.name) === normalize(b.name);
      
      const varMatch = normalize(c.variation) === normalize(b.variation);
      const isGroupVarMatch = c.groupVariation && normalize(b.variation) === normalize("Mixed");
      const finalVarMatch = varMatch || isGroupVarMatch;

      const isNameValid = nameMatch || !b.name || nameAsColorMatch;

      return finalColorMatch && finalVarMatch && isNameValid;
    });
  }

  if (match) {
    let updatedB = { ...b };
    let localChanged = false;
    
    if (b.name !== match.name) {
      updatedB.name = match.name;
      localChanged = true;
    }
    
    if (b.year !== match.year) {
      updatedB.year = match.year;
      localChanged = true;
    }

    const correctColor = (b.packageType === 'box' && match.groupColor) ? "Mixed" : match.color;
    if (b.color !== correctColor) {
      updatedB.color = correctColor;
      localChanged = true;
    }

    const correctVar = (b.packageType === 'box' && match.groupVariation) ? "Mixed" : (match.variation || undefined);
    if (b.variation !== correctVar) {
      updatedB.variation = correctVar;
      localChanged = true;
    }
    
    if (localChanged) {
      return updatedB;
    }
  }
  return b;
});

console.log(JSON.stringify(newBalls, null, 2));
