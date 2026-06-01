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
const getUniqueId = (b, cat) => {
  const match = cat.find(c => 
    c.model === b.model && c.name === b.name && 
    (c.color === b.color || (b.packageType === "box" && b.color === "" && (c.groupColor || c.groupVariation)))
  );
  if (match) {
    if (match.groupColor || match.groupVariation) {
      return `${match.model}|${match.name}`;
    }
    return `${match.model}|${match.name}|${match.color}|${match.variation || ""}|${match.year || ""}`;
  }
  return `${b.model}|${b.name}|${b.color}|${b.variation || ""}|${b.year || ""}`;
};
const uniqueIds = new Set(balls.map(b => getUniqueId(b, catalog)));
console.log(uniqueIds);
