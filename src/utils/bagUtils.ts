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

  // Check if ball is a box of a product whose catalog items are grouped by color or variation (e.g. Winner Winner, Beastin')
  if (ball.packageType === 'box' && ball.model && ball.name && catalog && catalog.length > 0) {
    const candidates = catalog.filter(c => 
      c.model.trim().toLowerCase() === ball.model.trim().toLowerCase() &&
      (c.name || '').trim().toLowerCase() === ball.name.trim().toLowerCase() &&
      (c.groupColor || c.groupVariation)
    );
    if (candidates.length > 1) {
      const perItemQty = Math.max(1, Math.floor(ball.quantity / candidates.length));
      return candidates.map(c => ({
        catalogId: c.id,
        qty: perItemQty
      }));
    }
  }

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

/**
 * Checks whether a ball is a box grouped by Variation where all constituent balls share the same color
 * (e.g. Winner Winner, Good Sundays where sleeves/variations differ but all balls are White).
 * These are excluded from Round Mode ball selection.
 */
export const isGroupVariationSameColorBox = (ball: GolfBall, catalog: CatalogItem[] = []): boolean => {
  if (ball.packageType !== 'box') return false;

  // 1. Check matching candidates in catalog
  if (ball.model && ball.name && catalog && catalog.length > 0) {
    const candidates = catalog.filter(c =>
      c.model.trim().toLowerCase() === ball.model.trim().toLowerCase() &&
      (c.name || '').trim().toLowerCase() === ball.name.trim().toLowerCase() &&
      (c.groupColor || c.groupVariation)
    );

    if (candidates.length > 1) {
      const hasGroupVariation = candidates.some(c => c.groupVariation);
      const candidateColors = new Set(candidates.map(c => (c.color || '').trim().toLowerCase()).filter(Boolean));
      if (hasGroupVariation && candidateColors.size <= 1) {
        return true;
      }
    }
  }

  // 2. Also check if ball has bundleItems
  if (ball.bundleItems && ball.bundleItems.length > 1 && catalog && catalog.length > 0) {
    const bundleCatalogItems = ball.bundleItems
      .map(bi => catalog.find(c => c.id === bi.catalogId))
      .filter((c): c is CatalogItem => !!c);

    if (bundleCatalogItems.length > 1) {
      const hasGroupVariation = bundleCatalogItems.some(c => c.groupVariation);
      const bundleColors = new Set(bundleCatalogItems.map(c => (c.color || '').trim().toLowerCase()).filter(Boolean));
      if (hasGroupVariation && bundleColors.size <= 1) {
        return true;
      }
    }
  }

  // 3. Check direct catalog item
  const catItem = catalog.find(c => c.id === ball.catalogId || (c.model === ball.model && c.name === ball.name));
  if (catItem?.groupVariation && !catItem?.groupColor) {
    return true;
  }

  // 4. Check if ball itself has variation "Mixed" but color is NOT "Mixed" and matches a catalog item with groupVariation
  if (ball.variation?.toLowerCase() === 'mixed' && ball.color?.toLowerCase() !== 'mixed') {
    if (catItem?.groupVariation) return true;
  }

  return false;
};
