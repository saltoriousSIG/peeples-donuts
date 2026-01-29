// Flair Token Data
// Token IDs 1-20: 5 gauges x 4 rarities each

export type Rarity = "Bronze" | "Silver" | "Gold" | "Platinum";

export type GaugeName = "Donut" | "Donut/WETH LP" | "USDC" | "QR" | "Aero";

export interface FlairTokenData {
  tokenId: number;
  gauge: GaugeName;
  rarity: Rarity;
  weight: number;
  poolFeeDiscount: number; // percentage (0 = no fee, 20 = 20% fee)
  icon: string;
}

// Rarity configuration
export const RARITY_CONFIG: Record<Rarity, { weight: number; poolFeeDiscount: number; color: string }> = {
  Bronze: { weight: 1, poolFeeDiscount: 20, color: "bg-amber-100 text-amber-700 border-amber-300" },
  Silver: { weight: 2, poolFeeDiscount: 15, color: "bg-gray-200 text-gray-700 border-gray-400" },
  Gold: { weight: 4, poolFeeDiscount: 10, color: "bg-yellow-100 text-yellow-700 border-yellow-400" },
  Platinum: { weight: 8, poolFeeDiscount: 0, color: "bg-purple-100 text-purple-700 border-purple-400" },
};

// Gauge icons
export const GAUGE_ICONS: Record<GaugeName, string> = {
  "Donut": "🍩",
  "Donut/WETH LP": "💧",
  "USDC": "💵",
  "QR": "📱",
  "Aero": "✈️",
};

// Rarity icons
export const RARITY_ICONS: Record<Rarity, string> = {
  Bronze: "🥉",
  Silver: "🥈",
  Gold: "🥇",
  Platinum: "💎",
};

// All 20 flair tokens
export const FLAIR_TOKENS: FlairTokenData[] = [
  // Donut (Tokens 1-4)
  { tokenId: 1, gauge: "Donut", rarity: "Bronze", weight: 1, poolFeeDiscount: 20, icon: "🍩" },
  { tokenId: 2, gauge: "Donut", rarity: "Silver", weight: 2, poolFeeDiscount: 15, icon: "🍩" },
  { tokenId: 3, gauge: "Donut", rarity: "Gold", weight: 4, poolFeeDiscount: 10, icon: "🍩" },
  { tokenId: 4, gauge: "Donut", rarity: "Platinum", weight: 8, poolFeeDiscount: 0, icon: "🍩" },

  // Donut/WETH LP (Tokens 5-8)
  { tokenId: 5, gauge: "Donut/WETH LP", rarity: "Bronze", weight: 1, poolFeeDiscount: 20, icon: "💧" },
  { tokenId: 6, gauge: "Donut/WETH LP", rarity: "Silver", weight: 2, poolFeeDiscount: 15, icon: "💧" },
  { tokenId: 7, gauge: "Donut/WETH LP", rarity: "Gold", weight: 4, poolFeeDiscount: 10, icon: "💧" },
  { tokenId: 8, gauge: "Donut/WETH LP", rarity: "Platinum", weight: 8, poolFeeDiscount: 0, icon: "💧" },

  // USDC (Tokens 9-12)
  { tokenId: 9, gauge: "USDC", rarity: "Bronze", weight: 1, poolFeeDiscount: 20, icon: "💵" },
  { tokenId: 10, gauge: "USDC", rarity: "Silver", weight: 2, poolFeeDiscount: 15, icon: "💵" },
  { tokenId: 11, gauge: "USDC", rarity: "Gold", weight: 4, poolFeeDiscount: 10, icon: "💵" },
  { tokenId: 12, gauge: "USDC", rarity: "Platinum", weight: 8, poolFeeDiscount: 0, icon: "💵" },

  // QR (Tokens 13-16)
  { tokenId: 13, gauge: "QR", rarity: "Bronze", weight: 1, poolFeeDiscount: 20, icon: "📱" },
  { tokenId: 14, gauge: "QR", rarity: "Silver", weight: 2, poolFeeDiscount: 15, icon: "📱" },
  { tokenId: 15, gauge: "QR", rarity: "Gold", weight: 4, poolFeeDiscount: 10, icon: "📱" },
  { tokenId: 16, gauge: "QR", rarity: "Platinum", weight: 8, poolFeeDiscount: 0, icon: "📱" },

  // Aero (Tokens 17-20)
  { tokenId: 17, gauge: "Aero", rarity: "Bronze", weight: 1, poolFeeDiscount: 20, icon: "✈️" },
  { tokenId: 18, gauge: "Aero", rarity: "Silver", weight: 2, poolFeeDiscount: 15, icon: "✈️" },
  { tokenId: 19, gauge: "Aero", rarity: "Gold", weight: 4, poolFeeDiscount: 10, icon: "✈️" },
  { tokenId: 20, gauge: "Aero", rarity: "Platinum", weight: 8, poolFeeDiscount: 0, icon: "✈️" },
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
export const GAUGES: GaugeName[] = ["Donut", "Donut/WETH LP", "USDC", "QR", "Aero"];

// Get all rarities in order
export const RARITIES: Rarity[] = ["Bronze", "Silver", "Gold", "Platinum"];

// Get flair image path
export const getFlairImagePath = (gauge: GaugeName, rarity: Rarity): string => {
  const gaugeMap: Record<GaugeName, string> = {
    "Donut": "donut",
    "Donut/WETH LP": "donut_weth_lp",
    "USDC": "usdc",
    "QR": "qr",
    "Aero": "aero",
  };

  const rarityMap: Record<Rarity, string> = {
    "Bronze": "bronze",
    "Silver": "silver",
    "Gold": "gold",
    "Platinum": "plat",
  };

  const gaugePrefix = gaugeMap[gauge];
  const raritySuffix = rarityMap[rarity];

  return `/media/flair/${gaugePrefix}_${raritySuffix}.png`;
};
