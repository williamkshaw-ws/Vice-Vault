import fs from 'fs';

// Mock state
let catalog = [
  {
    "id": "PRO-COSMIC-AURORA_FIELDS",
    "model": "PRO",
    "name": "Cosmic",
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
    "name": "Cosmic",
    "color": "Mixed",
    "packageType": "box"
  }
];

const id = "PRO-COSMIC-AURORA_FIELDS";
const updatedModel = "PRO";
const updatedColor = "Aurora Fields";
const updatedName = "Cosmic Collections";
const updatedVariation = null;
const updatedFields = { year: "2025" };

const originalItem = catalog.find((i) => i.id === id);

const newBalls = balls.map((ball) => {
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

  const isExactMatch = ball.catalogId === originalItem.id;
  const isStringMatch = modelMatch && finalColorMatch && finalVarMatch && isNameValid;

  if (isExactMatch || isStringMatch) {
    return {
      ...ball,
      model: updatedModel.toUpperCase(),
      color: (ball.packageType === 'box' && (updatedFields.groupColor !== undefined ? updatedFields.groupColor : originalItem.groupColor)) ? "Mixed" : updatedColor,
      name: updatedName || undefined,
      variation: (ball.packageType === 'box' && (updatedFields.groupVariation !== undefined ? updatedFields.groupVariation : originalItem.groupVariation)) ? "Mixed" : (updatedVariation === null ? undefined : updatedVariation),
      year: updatedFields.year === null ? undefined : updatedFields.year,
    };
  }
  return ball;
});

console.log(JSON.stringify(newBalls, null, 2));
