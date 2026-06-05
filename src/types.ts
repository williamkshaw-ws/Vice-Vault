/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum BallModel {
  PRO_PLUS = "PRO PLUS",
  PRO = "PRO",
  PRO_SOFT = "PRO SOFT",
  PRO_AIR = "PRO AIR",
  PRO_JUNIOR = "PRO JUNIOR",
  TOUR = "TOUR",
  TOUR_JUNIOR = "TOUR TOUR JUNIOR",
  DRIVE = "DRIVE"
}

export enum BallColor {
  WHITE = "White",
  NEON_LIME = "Neon Lime",
  NEON_RED = "Neon Red",
  DRIP_LIME = "Drip Lime/Black",
  DRIP_RED_BLUE = "Drip Red/Blue",
  DRIP_YELLOW = "Drip Yellow",
  GOLD = "Limited Gold",
  HUE_BLUE = "Hue Blue"
}

export enum BallCondition {
  NEW = "Brand New",
  MINT = "Near-Mint / Scuffed-0",
  PLAYED = "Played / Scuffed-1",
  SHAG = "Shag / Water Ball"
}

export interface GolfBall {
  id: string;
  model: BallModel | string;
  color: BallColor | string;
  quantity: number; // Total individual balls owned
  condition: BallCondition;
  packageType?: 'ea' | 'sleeve' | 'box'; // Package style
  customNumber: number; // Ball play-number (e.g., 1, 2, 3, 4, 77)
  notes: string;
  version?: string; // Ball version/edition (e.g. Standard Edition)
  year?: string; // Optional year (e.g. 2026)
  dateAdded: string;
  customImage?: string; // Custom uploaded base64 image representation
  customImageSleeve?: string; // Custom uploaded sleeve image
  customImageBox?: string; // Custom uploaded box image
  name?: string;
  variation?: string;
  bundleItems?: BundleItem[];
}

export interface CourseLog {
  id: string;
  date: string;
  type: "lost" | "found";
  model: BallModel | string;
  color: BallColor | string;
  condition?: BallCondition;
  courseName: string;
  holeNumber?: number;
  notes?: string;
}

export interface BundleItem {
  catalogId: string;
  qty: number;
}

export interface CatalogItem {
  id: string; // e.g. "PRO-WHITE" or "PRO-PLUS-WHITE-DRIP"
  model: string; // e.g. "PRO", "PRO PLUS"
  name?: string; // Optional: e.g. "Ice", "Nicklaus"
  color: string; // e.g. "White", "Neon Red", "Mixed"
  variation?: string; // e.g. "drip", "shade"
  notes?: string; // e.g. "Matte finish"
  year?: string;
  groupColor?: boolean; 
  groupVariation?: boolean;
  customImage?: string; // Custom Base64 image
  customImageSleeve?: string; // Custom Base64 image for sleeve
  customImageBox?: string; // Custom Base64 image for box
  bundleItems?: BundleItem[]; // Sub-items contained within this item
}

export interface BallStock {
  model: string | boolean;
  name?: string;
  color: string | boolean;
  variation?: string; // Added variation to individual balls
  packageType: string;
  qty: number;
  condition: "New" | "Used";
  year?: string;
  notes?: string; // Optional design/logo notes
  customImage?: string; // User's personal image of the ball
  customImageSleeve?: string; // Custom Base64 image for sleeve
  customImageBox?: string; // Custom Base64 image for box
  bundleItems?: BundleItem[]; // Sub-items contained within this item if logged as a bundle
}

export interface FittingRecommendation {
  model: BallModel;
  title: string;
  reason: string;
  specs: {
    compression: number;
    layers: number;
    cover: string;
    feel: string;
    swingSpeed: string;
    driverDistance: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  role: "Admin" | "User";
  preferredColor: string;
  avatarUrl?: string;
  shareBag?: boolean;
  shareToken?: string;
  wishlist?: string[]; // Array of catalog item IDs
  createdAt: string;
}
