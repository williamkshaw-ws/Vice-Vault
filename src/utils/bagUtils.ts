import { GolfBall } from "../types";

export const INITIAL_OWNED_BALLS: GolfBall[] = [];

export const filterLegacyBalls = (ballsList: any[]): GolfBall[] => {
  if (!Array.isArray(ballsList)) return [];
  return ballsList.filter((b: any) => b && b.id && !/-V\d+$/.test(b.id));
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
