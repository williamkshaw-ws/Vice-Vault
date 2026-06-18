const originalItem = {
  id: "PRO-COSMIC-AURORA_FIELDS",
  model: "PRO",
  name: "Cosmic",
  color: "Aurora Fields",
  groupColor: true,
  groupVariation: false,
  variation: undefined,
  year: "2025"
};

const ball = {
  id: "OWNED-PRO-MIXED-2025-BRAND_NEW-BOX-ABCD",
  model: "PRO",
  color: "Mixed",
  name: "Cosmic",
  variation: undefined,
  year: "2025",
  packageType: "box"
};

const normalize = (s) => (s || "").replace(/[^a-z0-9]/gi, "").toLowerCase();
const modelMatch = normalize(ball.model) === normalize(originalItem.model);

const colorMatch = normalize(ball.color) === normalize(originalItem.color);
const nameAsColorMatch = normalize(ball.color) === normalize(originalItem.name) && normalize(originalItem.name) !== "";
const isGroupColorMatch = originalItem.groupColor && normalize(ball.color) === normalize("Mixed");
const finalColorMatch = colorMatch || nameAsColorMatch || isGroupColorMatch;

const varMatch = normalize(ball.variation) === normalize(originalItem.variation);
const isGroupVarMatch = originalItem.groupVariation && normalize(ball.variation) === normalize("Mixed");
const finalVarMatch = varMatch || isGroupVarMatch;

const nameMatch = normalize(ball.name) === normalize(originalItem.name);
const isNameValid = nameMatch || !ball.name || nameAsColorMatch;

const isStringMatch = modelMatch && finalColorMatch && finalVarMatch && isNameValid;

console.log({
  modelMatch,
  colorMatch,
  nameAsColorMatch,
  isGroupColorMatch,
  finalColorMatch,
  varMatch,
  isGroupVarMatch,
  finalVarMatch,
  nameMatch,
  isNameValid,
  isStringMatch
});
