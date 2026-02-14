// Flair Token Data
// Token IDs 1-28: 7 gauges x 4 rarities each

export type Rarity = "Bronze" | "Silver" | "Gold" | "Platinum";

export type GaugeName = "Donut" | "Teller" | "Donut wETH LP" | "Aerodrome" | "Clanker" | "QR" | "USDC";

export interface FlairTokenData {
  tokenId: number;
  gauge: GaugeName;
  rarity: Rarity;
  weight: number;
  poolFeeDiscount: number; // percentage (0 = no fee, 20 = 20% fee)
  image: string;
}

// Rarity configuration
export const RARITY_CONFIG: Record<Rarity, { weight: number; poolFeeDiscount: number; color: string }> = {
  Bronze: { weight: 1, poolFeeDiscount: 20, color: "bg-amber-100 text-amber-700 border-amber-300" },
  Silver: { weight: 2, poolFeeDiscount: 15, color: "bg-gray-200 text-gray-700 border-gray-400" },
  Gold: { weight: 4, poolFeeDiscount: 10, color: "bg-yellow-100 text-yellow-700 border-yellow-400" },
  Platinum: { weight: 8, poolFeeDiscount: 0, color: "bg-purple-100 text-purple-700 border-purple-400" },
};

// Rarity icons
export const RARITY_ICONS: Record<Rarity, string> = {
  Bronze: "🥉",
  Silver: "🥈",
  Gold: "🥇",
  Platinum: "💎",
};

// Get flair image path
export const getFlairImagePath = (gauge: GaugeName, rarity: Rarity): string => {
  const gaugeMap: Record<GaugeName, string> = {
    "Donut": "donut",
    "Teller": "teller",
    "Donut wETH LP": "donut_weth_lp",
    "Aerodrome": "aero",
    "Clanker": "clanker",
    "QR": "qr",
    "USDC": "usdc",
  };

  const rarityMap: Record<Rarity, string> = {
    "Bronze": "bronze",
    "Silver": "silver",
    "Gold": "gold",
    "Platinum": "plat",
  };

  const gaugePrefix = gaugeMap[gauge];
  let raritySuffix = rarityMap[rarity];

  // Special case: clanker_platinum uses full "platinum" not "plat"
  if (gauge === "Clanker" && rarity === "Platinum") {
    raritySuffix = "platinum";
  }

  return `/media/flair/${gaugePrefix}_${raritySuffix}.png`;
};

// All 28 flair tokens
export const FLAIR_TOKENS: FlairTokenData[] = [
  // LSG Donut (Tokens 1-4)
  { tokenId: 1, gauge: "Donut", rarity: "Bronze", weight: 1, poolFeeDiscount: 20, image: getFlairImagePath("Donut", "Bronze") },
  { tokenId: 2, gauge: "Donut", rarity: "Silver", weight: 2, poolFeeDiscount: 15, image: getFlairImagePath("Donut", "Silver") },
  { tokenId: 3, gauge: "Donut", rarity: "Gold", weight: 4, poolFeeDiscount: 10, image: getFlairImagePath("Donut", "Gold") },
  { tokenId: 4, gauge: "Donut", rarity: "Platinum", weight: 8, poolFeeDiscount: 0, image: getFlairImagePath("Donut", "Platinum") },

  // Teller (Tokens 5-8)
  { tokenId: 5, gauge: "Teller", rarity: "Bronze", weight: 1, poolFeeDiscount: 20, image: getFlairImagePath("Teller", "Bronze") },
  { tokenId: 6, gauge: "Teller", rarity: "Silver", weight: 2, poolFeeDiscount: 15, image: getFlairImagePath("Teller", "Silver") },
  { tokenId: 7, gauge: "Teller", rarity: "Gold", weight: 4, poolFeeDiscount: 10, image: getFlairImagePath("Teller", "Gold") },
  { tokenId: 8, gauge: "Teller", rarity: "Platinum", weight: 8, poolFeeDiscount: 0, image: getFlairImagePath("Teller", "Platinum") },

  // LSG Donut wETH LP (Tokens 9-12)
  { tokenId: 9, gauge: "Donut wETH LP", rarity: "Bronze", weight: 1, poolFeeDiscount: 20, image: getFlairImagePath("Donut wETH LP", "Bronze") },
  { tokenId: 10, gauge: "Donut wETH LP", rarity: "Silver", weight: 2, poolFeeDiscount: 15, image: getFlairImagePath("Donut wETH LP", "Silver") },
  { tokenId: 11, gauge: "Donut wETH LP", rarity: "Gold", weight: 4, poolFeeDiscount: 10, image: getFlairImagePath("Donut wETH LP", "Gold") },
  { tokenId: 12, gauge: "Donut wETH LP", rarity: "Platinum", weight: 8, poolFeeDiscount: 0, image: getFlairImagePath("Donut wETH LP", "Platinum") },

  // LSG Aerodrome (Tokens 13-16)
  { tokenId: 13, gauge: "Aerodrome", rarity: "Bronze", weight: 1, poolFeeDiscount: 20, image: getFlairImagePath("Aerodrome", "Bronze") },
  { tokenId: 14, gauge: "Aerodrome", rarity: "Silver", weight: 2, poolFeeDiscount: 15, image: getFlairImagePath("Aerodrome", "Silver") },
  { tokenId: 15, gauge: "Aerodrome", rarity: "Gold", weight: 4, poolFeeDiscount: 10, image: getFlairImagePath("Aerodrome", "Gold") },
  { tokenId: 16, gauge: "Aerodrome", rarity: "Platinum", weight: 8, poolFeeDiscount: 0, image: getFlairImagePath("Aerodrome", "Platinum") },

  // LSG Clanker (Tokens 17-20)
  { tokenId: 17, gauge: "Clanker", rarity: "Bronze", weight: 1, poolFeeDiscount: 20, image: getFlairImagePath("Clanker", "Bronze") },
  { tokenId: 18, gauge: "Clanker", rarity: "Silver", weight: 2, poolFeeDiscount: 15, image: getFlairImagePath("Clanker", "Silver") },
  { tokenId: 19, gauge: "Clanker", rarity: "Gold", weight: 4, poolFeeDiscount: 10, image: getFlairImagePath("Clanker", "Gold") },
  { tokenId: 20, gauge: "Clanker", rarity: "Platinum", weight: 8, poolFeeDiscount: 0, image: getFlairImagePath("Clanker", "Platinum") },

  // LSG QR (Tokens 21-24)
  { tokenId: 21, gauge: "QR", rarity: "Bronze", weight: 1, poolFeeDiscount: 20, image: getFlairImagePath("QR", "Bronze") },
  { tokenId: 22, gauge: "QR", rarity: "Silver", weight: 2, poolFeeDiscount: 15, image: getFlairImagePath("QR", "Silver") },
  { tokenId: 23, gauge: "QR", rarity: "Gold", weight: 4, poolFeeDiscount: 10, image: getFlairImagePath("QR", "Gold") },
  { tokenId: 24, gauge: "QR", rarity: "Platinum", weight: 8, poolFeeDiscount: 0, image: getFlairImagePath("QR", "Platinum") },

  // LSG USDC (Tokens 25-28)
  { tokenId: 25, gauge: "USDC", rarity: "Bronze", weight: 1, poolFeeDiscount: 20, image: getFlairImagePath("USDC", "Bronze") },
  { tokenId: 26, gauge: "USDC", rarity: "Silver", weight: 2, poolFeeDiscount: 15, image: getFlairImagePath("USDC", "Silver") },
  { tokenId: 27, gauge: "USDC", rarity: "Gold", weight: 4, poolFeeDiscount: 10, image: getFlairImagePath("USDC", "Gold") },
  { tokenId: 28, gauge: "USDC", rarity: "Platinum", weight: 8, poolFeeDiscount: 0, image: getFlairImagePath("USDC", "Platinum") },
];

// Get tokens by gauge
export const getTokensByGauge = (gauge: GaugeName): FlairTokenData[] => {
  return FLAIR_TOKENS.filter((token) => token.gauge === gauge);
};

// Get token by ID
export const getTokenById = (tokenId: number): FlairTokenData | undefined => {
  return FLAIR_TOKENS.find((token) => token.tokenId === tokenId);
};

// Get all gauges
export const GAUGES: GaugeName[] = ["Donut", "Teller", "Donut wETH LP", "Aerodrome", "Clanker", "QR", "USDC"];

// Get all rarities in order
export const RARITIES: Rarity[] = ["Bronze", "Silver", "Gold", "Platinum"];
