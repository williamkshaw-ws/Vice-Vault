import { GolfBall, BallCondition, BundleItem, CatalogItem } from "../types";

export const INITIAL_OWNED_BALLS: GolfBall[] = [];

export const DEFAULT_VARIETY_PACK_ITEMS: BundleItem[] = [
  { catalogId: 'PRO-NEON-LIME', qty: 3 },
  { catalogId: 'PRO_PLUS-NEON-LIME', qty: 3 },
  { catalogId: 'PRO_SOFT-NEON-RED', qty: 3 },
  { catalogId: 'DRIVE-STANDARD-YELLOW', qty: 3 }
];

export const DEFAULT_SELECTED_VARIETY_ITEMS: BundleItem[] = [
  { catalogId: 'PRO-STANDARD-WHITE', qty: 3 },
  { catalogId: 'PRO_PLUS-STANDARD-WHITE', qty: 3 },
  { catalogId: 'PRO_SOFT-STANDARD-WHITE', qty: 3 },
  { catalogId: 'TOUR-STANDARD-WHITE', qty: 3 }
];

/**
 * Resolves constituent bundle items for a ball, checking direct ball property,
 * catalog definition, or well-known variety pack fallbacks.
 */
export const getBundleItemsForBall = (ball: GolfBall, catalog: CatalogItem[] = []): BundleItem[] => {
  if (ball.bundleItems && ball.bundleItems.length > 0) {
    return ball.bundleItems;
  }
  const catItem = catalog.find(c => c.id === ball.catalogId || (c.model === ball.model && c.name === ball.name));
  if (catItem?.bundleItems && catItem.bundleItems.length > 0) {
    return catItem.bundleItems;
  }
  const id = ball.catalogId || '';
  const name = (ball.name || '').toLowerCase();
  const model = (ball.model || '').toLowerCase();
  const color = (ball.color || '').toLowerCase();

  if (
    id === 'MULTIPLE-VARIETY_PACK-MULTI_COLORED' ||
    name.includes('variety pack') ||
    (model === 'multiple' && (color.includes('multi') || color.includes('color')))
  ) {
    return DEFAULT_VARIETY_PACK_ITEMS;
  }
  if (
    id === 'MULTIPLE-SELECTED_VARIETY-WHITE' ||
    name.includes('selected variety') ||
    (model === 'multiple' && color.includes('white'))
  ) {
    return DEFAULT_SELECTED_VARIETY_ITEMS;
  }
  if (model === 'multiple' || name.includes('variety')) {
    return DEFAULT_SELECTED_VARIETY_ITEMS;
  }
  return [];
};

export const filterLegacyBalls = (ballsList: any[], catalog: CatalogItem[] = []): GolfBall[] => {
  if (!Array.isArray(ballsList)) return [];
  return ballsList
    .filter((b: any) => b && b.id && !/-V\d+$/.test(b.id))
    .map((b: any) => {
      let ball = { ...b };
      // Migrate legacy "Shag / Water Ball" or "Shag" conditions to "Damaged"
      if (ball.condition === "Shag / Water Ball" || ball.condition === "Shag / Practice" || ball.condition === "Shag") {
        ball.condition = BallCondition.DAMAGED;
      }
      // Ensure variety packs have bundleItems populated if missing
      if (!ball.bundleItems || ball.bundleItems.length === 0) {
        const bundle = getBundleItemsForBall(ball, catalog);
        if (bundle.length > 0) {
          ball.bundleItems = bundle;
        }
      }
      return ball;
    });
};

export const safeJSONParse = (str: string | null): any => {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    return null;
  }
};
