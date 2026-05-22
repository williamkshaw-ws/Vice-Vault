/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BallModel, BallColor, FittingRecommendation, CatalogItem } from "./types";

export interface BallSpecs {
  model: BallModel;
  tagline: string;
  description: string;
  layers: number;
  cover: string;
  feel: "Extra Soft" | "Soft" | "Medium-Soft" | "Firm" | "Extra Firm";
  compression: number;
  msrpPerDozen: number;
  availableColors: BallColor[];
  targetSwingSpeed: string;
  targetDriverDistance: string;
  spinProfile: string;
}

export const VICE_BALLS_SPECS: Record<BallModel, BallSpecs> = {
  [BallModel.PRO_PLUS]: {
    model: BallModel.PRO_PLUS,
    tagline: "Maximum distance, high spin & ultimate speed",
    description: "Built for golfers with high swing speeds seeking maximum distance from the tee while retaining brilliant control and backspin on green approach shots.",
    layers: 4,
    cover: "Cast Urethane (Extra-Thin BJ13)",
    feel: "Firm",
    compression: 105,
    msrpPerDozen: 43.99,
    availableColors: [
      BallColor.WHITE,
      BallColor.NEON_LIME,
      BallColor.NEON_RED,
      BallColor.DRIP_LIME,
      BallColor.DRIP_RED_BLUE,
      BallColor.GOLD
    ],
    targetSwingSpeed: "> 110 mph",
    targetDriverDistance: "> 250 yds",
    spinProfile: "Low driver spin, maximum green-side wedges spin"
  },
  [BallModel.PRO]: {
    model: BallModel.PRO,
    tagline: "Optimized flight, premium spin & softest urethane feel",
    description: "The classic tour-caliber flagship ball. Provides excellent distance off the tee with an incredibly responsive, buttery feel on chips and wedges.",
    layers: 3,
    cover: "Cast Urethane (Extra-Thin BJ13)",
    feel: "Soft",
    compression: 95,
    msrpPerDozen: 41.99,
    availableColors: [
      BallColor.WHITE,
      BallColor.NEON_LIME,
      BallColor.NEON_RED,
      BallColor.DRIP_LIME,
      BallColor.DRIP_RED_BLUE,
      BallColor.HUE_BLUE,
      BallColor.GOLD
    ],
    targetSwingSpeed: "95 - 110 mph",
    targetDriverDistance: "220 - 250 yds",
    spinProfile: "Low-to-medium driver spin, exceptional wedge spin"
  },
  [BallModel.PRO_SOFT]: {
    model: BallModel.PRO_SOFT,
    tagline: "Extra quiet core, magnificent matte visual series",
    description: "The world's first matte cast urethane ball, designed for golfers with medium-to-low swing speeds wanting tour performance feel with a highly visible matte cover.",
    layers: 3,
    cover: "Matte Cast Urethane",
    feel: "Extra Soft",
    compression: 80,
    msrpPerDozen: 39.99,
    availableColors: [
      BallColor.WHITE,
      BallColor.NEON_LIME,
      BallColor.NEON_RED,
      BallColor.DRIP_YELLOW
    ],
    targetSwingSpeed: "< 95 mph",
    targetDriverDistance: "< 220 yds",
    spinProfile: "Ultra-low driver spin, high greenside grip"
  },
  [BallModel.TOUR]: {
    model: BallModel.TOUR,
    tagline: "Balanced premium play & indestructible durability",
    description: "Featuring a 3-piece Surlyn construction, this ball provides high durability combined with great overall distance and soft feel for golfers of all handicaps.",
    layers: 3,
    cover: "Surlyn (DuPont Surlyn)",
    feel: "Medium-Soft",
    compression: 90,
    msrpPerDozen: 24.99,
    availableColors: [
      BallColor.WHITE,
      BallColor.NEON_LIME
    ],
    targetSwingSpeed: "All speeds",
    targetDriverDistance: "All distances",
    spinProfile: "Balanced spin, forgiving flight path"
  },
  [BallModel.DRIVE]: {
    model: BallModel.DRIVE,
    tagline: "Maximum core energy & indestructible distance",
    description: "An entry-level, highly durable 2-piece distance powerhouse designed to optimize ball speed and fly completely straight, even on off-center hits.",
    layers: 2,
    cover: "Surlyn toughness shell",
    feel: "Firm",
    compression: 95,
    msrpPerDozen: 15.99,
    availableColors: [
      BallColor.WHITE,
      BallColor.NEON_LIME
    ],
    targetSwingSpeed: "Low-to-Medium",
    targetDriverDistance: "Optimizes shorter drives",
    spinProfile: "Lowest spin for maximum hook/slice correction"
  },
  [BallModel.PRO_AIR]: {
    model: BallModel.PRO_AIR,
    tagline: "Ultra lightweight core, high launch & optimized speed",
    description: "Specifically engineered with a light premium core and soft cover for maximum speed and launch control at standard swing speeds.",
    layers: 3,
    cover: "Cast Urethane (Extra-Thin BJ13)",
    feel: "Soft",
    compression: 85,
    msrpPerDozen: 41.99,
    availableColors: [
      BallColor.WHITE,
      BallColor.NEON_LIME
    ],
    targetSwingSpeed: "90 - 105 mph",
    targetDriverDistance: "210 - 240 yds",
    spinProfile: "High launch, moderate approach spin"
  },
  [BallModel.PRO_JUNIOR]: {
    model: BallModel.PRO_JUNIOR,
    tagline: "Specially formulated core for junior swing speeds",
    description: "A high-performance tour-caliber formulation optimized for junior swing dynamics, providing incredible feel, high flight, and excellent greenside reaction.",
    layers: 3,
    cover: "Soft Cast Urethane",
    feel: "Extra Soft",
    compression: 65,
    msrpPerDozen: 29.99,
    availableColors: [
      BallColor.WHITE,
      BallColor.NEON_LIME,
      BallColor.NEON_RED
    ],
    targetSwingSpeed: "< 85 mph",
    targetDriverDistance: "< 180 yds",
    spinProfile: "Low spin off driver, high spin on approach shots"
  },
  [BallModel.TOUR_JUNIOR]: {
    model: BallModel.TOUR_JUNIOR,
    tagline: "Durable Surlyn construction with ultra-soft compression",
    description: "Engineered specifically for junior and aspiring golfers seeking balanced tour distance, maximum durability, and a highly responsive feel.",
    layers: 2,
    cover: "Surlyn Tough Case",
    feel: "Medium-Soft",
    compression: 70,
    msrpPerDozen: 19.99,
    availableColors: [
      BallColor.WHITE,
      BallColor.NEON_LIME
    ],
    targetSwingSpeed: "< 80 mph",
    targetDriverDistance: "< 160 yds",
    spinProfile: "Ultra straight flight with maximum forgiveness"
  }
};

export const COLOR_STYLES: Record<BallColor, { bg: string; text: string; name: string; ringColor: string; isMatte?: boolean; isDrip?: boolean }> = {
  [BallColor.WHITE]: {
    bg: "bg-white border-gray-300",
    text: "text-gray-900",
    name: "Pure Gloss White",
    ringColor: "ring-gray-300"
  },
  [BallColor.NEON_LIME]: {
    bg: "bg-[#ccff00]",
    text: "text-black",
    name: "Neon Gloss Lime",
    ringColor: "ring-[#ccff00]"
  },
  [BallColor.NEON_RED]: {
    bg: "bg-[#ff2d55]",
    text: "text-white",
    name: "Neon Gloss Red",
    ringColor: "ring-[#ff2d55]"
  },
  [BallColor.DRIP_LIME]: {
    bg: "bg-[#ccff00]",
    text: "text-black",
    name: "Lime/Black Drip Splatter",
    ringColor: "ring-black",
    isDrip: true
  },
  [BallColor.DRIP_RED_BLUE]: {
    bg: "bg-white",
    text: "text-[#ff2d55]",
    name: "Red/Blue Drip Splatter",
    ringColor: "ring-blue-500",
    isDrip: true
  },
  [BallColor.DRIP_YELLOW]: {
    bg: "bg-[#ffd700]",
    text: "text-slate-800",
    name: "Yellow / Teal Drip Splatter",
    ringColor: "ring-[#ffd700]",
    isDrip: true
  },
  [BallColor.GOLD]: {
    bg: "bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-600",
    text: "text-amber-900",
    name: "Limited Edition Gold",
    ringColor: "ring-yellow-400"
  },
  [BallColor.HUE_BLUE]: {
    bg: "bg-[#00f0ff]",
    text: "text-[#0d1b2a]",
    name: "Shining Hue Blue",
    ringColor: "ring-[#00f0ff]"
  }
};

export function getFittingRecommendation(
  distance: string,
  priority: string,
  finish: string
): FittingRecommendation {
  if (distance === "long") {
    // Pro Plus or Pro
    if (priority === "spin" || finish === "gloss") {
      return {
        model: BallModel.PRO_PLUS,
        title: "VICE PRO PLUS",
        reason: "Your high speed and big drives require a high-tier 4-layer urethane shield. You'll gain ultimate piercing trajectory and tour-level backspin on greens.",
        specs: {
          compression: 105,
          layers: 4,
          cover: "Cast Urethane",
          feel: "Firm Tour Control",
          swingSpeed: ">110 mph",
          driverDistance: ">250 yds"
        }
      };
    } else {
      return {
        model: BallModel.PRO,
        title: "VICE PRO",
        reason: "The quintessential pro ball. You get peak speed off the tee, combined with a slightly softer 3-piece cast urethane casing for delicate wedges.",
        specs: {
          compression: 95,
          layers: 3,
          cover: "Cast Urethane",
          feel: "Soft Tour Control",
          swingSpeed: "95 - 110 mph",
          driverDistance: "220 - 250 yds"
        }
      };
    }
  } else if (distance === "medium") {
    if (priority === "feel" || finish === "matte") {
      return {
        model: BallModel.PRO_SOFT,
        title: "VICE PRO SOFT",
        reason: "Specifically engineered for moderate swing speeds. This 3-layer matte cast urethane offers outstanding distance coupled with an ultra-soft sensation.",
        specs: {
          compression: 80,
          layers: 3,
          cover: "Matte Cast Urethane",
          feel: "Extra Soft Response",
          swingSpeed: "< 95 mph",
          driverDistance: "180 - 220 yds"
        }
      };
    } else if (priority === "spin") {
      return {
        model: BallModel.PRO,
        title: "VICE PRO",
        reason: "Optimizes premium urethane performance at average speeds. High green-side spin while keeping driver spin minimal for straighter flight paths.",
        specs: {
          compression: 95,
          layers: 3,
          cover: "Cast Urethane",
          feel: "Soft Tour Control",
          swingSpeed: "95 - 110 mph",
          driverDistance: "220 - 250 yds"
        }
      };
    } else {
      return {
        model: BallModel.TOUR,
        title: "VICE TOUR",
        reason: "The ultimate all-rounder. Durable Surlyn structure keeps flight stable while keeping retail costs competitive and endurance elite.",
        specs: {
          compression: 90,
          layers: 3,
          cover: "DuPont Surlyn",
          feel: "Medium-Soft Balanced",
          swingSpeed: "All Speeds",
          driverDistance: "All Distances"
        }
      };
    }
  } else {
    // short
    if (priority === "spin" || priority === "feel") {
      return {
        model: BallModel.PRO_SOFT,
        title: "VICE PRO SOFT",
        reason: "For swing speeds optimized under 95mph. Low compression lets your speed fully flex the core, generating outstanding yardage and soft green responsiveness.",
        specs: {
          compression: 80,
          layers: 3,
          cover: "Matte Cast Urethane",
          feel: "Extra Soft Response",
          swingSpeed: "< 95 mph",
          driverDistance: "< 220 yds"
        }
      };
    } else {
      return {
        model: BallModel.DRIVE,
        title: "VICE DRIVE",
        reason: "Our specialized dual-layer engine maximize straight rollouts for slower swing speeds. Bulletproof Surlyn outer stays clean even after heavy course action.",
        specs: {
          compression: 95,
          layers: 2,
          cover: "Surlyn Tough Shell",
          feel: "Firm & Piercing",
          swingSpeed: "Low-to-Medium",
          driverDistance: "Optimizes shorter swings"
        }
      };
    }
  }
}

export const SCRAPED_BALLS: CatalogItem[] = [
  {
    id: "PRO_PLUS-PURE_GLOSS_WHITE",
    model: "PRO PLUS",
    color: "Pure Gloss White",
    notes: "Maximum distance, high spin & ultimate speed",
    customImage: "https://cdn.shopify.com/s/files/1/0563/0227/2645/files/vicegolf_ball_pro_white_th_acadea3d-cc1d-4376-a696-0bd93d44cd49.png?v=1762199211&width=100&height=100&crop=center"
  },
  {
    id: "PRO-PURE_GLOSS_WHITE",
    model: "PRO",
    color: "Pure Gloss White",
    notes: "Optimized flight, premium spin & softest urethane feel",
    customImage: "https://cdn.shopify.com/s/files/1/0835/8445/0850/files/vicegolf_ball_pro_white_th_35dcf74c-c5a3-4467-aa5a-c9adf7b01bc0.png?v=1711374990"
  },
  {
    id: "PRO_AIR-PURE_GLOSS_WHITE",
    model: "PRO AIR",
    color: "Pure Gloss White",
    notes: "Ultra lightweight core, high launch & optimized speed",
    customImage: "https://cdn.shopify.com/s/files/1/0832/9235/6897/files/PDP_Pro_Air_White_Front_Zoom.jpg?v=1709810992"
  },
  {
    id: "TOUR-PURE_GLOSS_WHITE",
    model: "TOUR",
    color: "Pure Gloss White",
    notes: "Balanced premium play & indestructible durability",
    customImage: "https://cdn.shopify.com/s/files/1/0835/8445/0850/files/vice-golf-PDP-Tour-White-Front.jpg?v=1716672682"
  },
  {
    id: "DRIVE-PURE_GLOSS_WHITE",
    model: "DRIVE",
    color: "Pure Gloss White",
    notes: "Maximum core energy & indestructible distance",
    customImage: "https://cdn.shopify.com/s/files/1/0832/9235/6897/files/PDP_Drive_White_Front_Zoom.jpg?v=1709810929"
  },
  {
    id: "PRO_AIR-LIME_BLACK_DRIP_SPLATTER",
    model: "PRO AIR",
    color: "Lime/Black Drip Splatter",
    notes: "Ultra lightweight core, high launch & optimized speed",
    customImage: "https://cdn.shopify.com/s/files/1/0835/8445/0850/files/Vice-Golf-Pro-Air-Neon-Drip-Ball-Front-Cut.png?v=1726668730"
  },
  {
    id: "PRO_PLUS-NEON_GLOSS_LIME",
    model: "PRO PLUS",
    color: "Neon Gloss Lime",
    notes: "Maximum distance, high spin & ultimate speed",
    customImage: "https://cdn.shopify.com/s/files/1/0832/9235/6897/files/PDP_Pro_Plus_Neon_Lime_Front_Zoom.jpg?v=1709811032"
  },
  {
    id: "PRO_PLUS-LIME_BLACK_DRIP_SPLATTER",
    model: "PRO PLUS",
    color: "Lime/Black Drip Splatter",
    notes: "Maximum distance, high spin & ultimate speed",
    customImage: "https://cdn.shopify.com/s/files/1/0835/8445/0850/files/New-Ball-PDP-ProPlus-Drip-Lime-Front.png?v=1760630522"
  },
  {
    id: "PRO_PLUS-LIMITED_EDITION_GOLD",
    model: "PRO PLUS",
    color: "Limited Edition Gold",
    notes: "Maximum distance, high spin & ultimate speed",
    customImage: "https://cdn.shopify.com/s/files/1/0835/8445/0850/files/Vice_Pro-Plus_Gold-4.png?v=1752227365"
  },
  {
    id: "PRO-NEON_GLOSS_LIME",
    model: "PRO",
    color: "Neon Gloss Lime",
    notes: "Optimized flight, premium spin & softest urethane feel",
    customImage: "https://cdn.shopify.com/s/files/1/0832/9235/6897/files/PDP_Pro_Neon_Lime_Front_Zoom.jpg?v=1709811015"
  },
  {
    id: "PRO_SOFT-PURE_GLOSS_WHITE",
    model: "PRO SOFT",
    color: "Pure Gloss White",
    notes: "Extra quiet core, magnificent matte visual series",
    customImage: "https://cdn.shopify.com/s/files/1/0835/8445/0850/files/pro_soft_white.png?v=1774447514"
  },
  {
    id: "PRO_SOFT-NEON_GLOSS_LIME",
    model: "PRO SOFT",
    color: "Neon Gloss Lime",
    notes: "Extra quiet core, magnificent matte visual series",
    customImage: "https://cdn.shopify.com/s/files/1/0835/8445/0850/files/vicegolf_ball_pro_soft_lime_exploded.jpg?v=1774352579"
  },
  {
    id: "PRO-RED_BLUE_DRIP_SPLATTER",
    model: "PRO",
    color: "Red/Blue Drip Splatter",
    notes: "Optimized flight, premium spin & softest urethane feel",
    customImage: "https://cdn.shopify.com/s/files/1/0835/8445/0850/files/New-Ball-PDP-Pro-Drip-Red-Blue-Front.png?v=1760629724"
  },
  {
    id: "PRO-LIME_BLACK_DRIP_SPLATTER",
    model: "PRO",
    color: "Lime/Black Drip Splatter",
    notes: "Optimized flight, premium spin & softest urethane feel",
    customImage: "https://cdn.shopify.com/s/files/1/0835/8445/0850/files/New-Ball-PDP-Pro-Drip-Lime-Front_1.png?v=1760629446"
  },
  {
    id: "PRO_AIR-NEON_GLOSS_LIME",
    model: "PRO AIR",
    color: "Neon Gloss Lime",
    notes: "Ultra lightweight core, high launch & optimized speed",
    customImage: "https://cdn.shopify.com/s/files/1/0832/9235/6897/files/PDP_Pro_Air_Neon_Lime_Front_Zoom.jpg?v=1709810992"
  },
  {
    id: "PRO-NEON_GLOSS_RED",
    model: "PRO",
    color: "Neon Gloss Red",
    notes: "Optimized flight, premium spin & softest urethane feel",
    customImage: "https://cdn.shopify.com/s/files/1/0835/8445/0850/files/vicegolf_ball_neon_red_th_ecb9923b-f473-478e-bfa3-8fa1e5a76358.png?v=1711374486"
  },
  {
    id: "PRO-SHINING_HUE_BLUE",
    model: "PRO",
    color: "Shining Hue Blue",
    notes: "Optimized flight, premium spin & softest urethane feel",
    customImage: "https://cdn.shopify.com/s/files/1/0835/8445/0850/files/vicegolf_ball_pro_ice_blue_frontalView.jpg?v=1774431946"
  },
  {
    id: "PRO-YELLOW_TEAL_DRIP_SPLATTER",
    model: "PRO",
    color: "Yellow / Teal Drip Splatter",
    notes: "Optimized flight, premium spin & softest urethane feel",
    customImage: "https://cdn.shopify.com/s/files/1/0835/8445/0850/files/vicegolf_ball_pro_drip_yellow_green_sashimi.png?v=1774433556"
  },
  {
    id: "PRO_SOFT-NEON_GLOSS_RED",
    model: "PRO SOFT",
    color: "Neon Gloss Red",
    notes: "Extra quiet core, magnificent matte visual series",
    customImage: "https://cdn.shopify.com/s/files/1/0835/8445/0850/files/pro_soft_red_3.png?v=1774447120"
  }
];
