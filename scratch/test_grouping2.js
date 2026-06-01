const catalog = [
  { id: "1", model: "Pro Plus", name: "Letters to Troon", color: "Red", groupColor: true },
  { id: "2", model: "Pro Plus", name: "Letters to Troon", color: "Blue", groupColor: true },
  { id: "3", model: "Pro Plus", name: "Standard", color: "White" },
];

const balls = [
  { model: "Pro Plus", name: "Letters to Troon", color: "Red", packageType: "ea" },
  { model: "Pro Plus", name: "Letters to Troon", color: "", packageType: "box" },
  { model: "Pro Plus", name: "Standard", color: "White", packageType: "ea" }
];

const getHash = (model, name, color, variation, year) => {
  return `${(model||"").trim().toLowerCase()}|${(name||"").trim().toLowerCase()}|${(color||"").trim().toLowerCase()}|${(variation||"").trim().toLowerCase()}|${(year||"").trim().toLowerCase()}`;
};

const getOwnedUniqueCount = (balls, catalog) => {
  const ownedUniqueHashes = new Set();
  balls.forEach(b => {
    const isGroupBox = b.packageType === "box" && b.color === "" && catalog.some(c => 
      c.model.trim().toLowerCase() === b.model.trim().toLowerCase() &&
      (c.name || "").trim().toLowerCase() === (b.name || "").trim().toLowerCase() &&
      (c.groupColor || c.groupVariation)
    );

    if (isGroupBox) {
      catalog.filter(c => 
        c.model.trim().toLowerCase() === b.model.trim().toLowerCase() &&
        (c.name || "").trim().toLowerCase() === (b.name || "").trim().toLowerCase()
      ).forEach(c => {
        ownedUniqueHashes.add(getHash(c.model, c.name, c.color, c.variation, c.year));
      });
    } else {
      ownedUniqueHashes.add(getHash(b.model, b.name, b.color, b.variation, b.year));
    }
  });
  return ownedUniqueHashes.size;
};

console.log(getOwnedUniqueCount(balls, catalog));
