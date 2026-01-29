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
  "Teller": "🏧",
  "Donut wETH LP": "💧",
  "Aerodrome": "✈️",
  "Clanker": "🤖",
  "QR": "📱",
  "USDC": "💵",
};

// Rarity icons
export const RARITY_ICONS: Record<Rarity, string> = {
  Bronze: "🥉",
  Silver: "🥈",
  Gold: "🥇",
  Platinum: "💎",
};

// All 28 flair tokens
export const FLAIR_TOKENS: FlairTokenData[] = [
  // LSG Donut (Tokens 1-4)
  { tokenId: 1, gauge: "Donut", rarity: "Bronze", weight: 1, poolFeeDiscount: 20, icon: "🍩" },
  { tokenId: 2, gauge: "Donut", rarity: "Silver", weight: 2, poolFeeDiscount: 15, icon: "🍩" },
  { tokenId: 3, gauge: "Donut", rarity: "Gold", weight: 4, poolFeeDiscount: 10, icon: "🍩" },
  { tokenId: 4, gauge: "Donut", rarity: "Platinum", weight: 8, poolFeeDiscount: 0, icon: "🍩" },

  // Teller (Tokens 5-8)
  { tokenId: 5, gauge: "Teller", rarity: "Bronze", weight: 1, poolFeeDiscount: 20, icon: "🏧" },
  { tokenId: 6, gauge: "Teller", rarity: "Silver", weight: 2, poolFeeDiscount: 15, icon: "🏧" },
  { tokenId: 7, gauge: "Teller", rarity: "Gold", weight: 4, poolFeeDiscount: 10, icon: "🏧" },
  { tokenId: 8, gauge: "Teller", rarity: "Platinum", weight: 8, poolFeeDiscount: 0, icon: "🏧" },

  // LSG Donut wETH LP (Tokens 9-12)
  { tokenId: 9, gauge: "Donut wETH LP", rarity: "Bronze", weight: 1, poolFeeDiscount: 20, icon: "💧" },
  { tokenId: 10, gauge: "Donut wETH LP", rarity: "Silver", weight: 2, poolFeeDiscount: 15, icon: "💧" },
  { tokenId: 11, gauge: "Donut wETH LP", rarity: "Gold", weight: 4, poolFeeDiscount: 10, icon: "💧" },
  { tokenId: 12, gauge: "Donut wETH LP", rarity: "Platinum", weight: 8, poolFeeDiscount: 0, icon: "💧" },

  // LSG Aerodrome (Tokens 13-16)
  { tokenId: 13, gauge: "Aerodrome", rarity: "Bronze", weight: 1, poolFeeDiscount: 20, icon: "✈️" },
  { tokenId: 14, gauge: "Aerodrome", rarity: "Silver", weight: 2, poolFeeDiscount: 15, icon: "✈️" },
  { tokenId: 15, gauge: "Aerodrome", rarity: "Gold", weight: 4, poolFeeDiscount: 10, icon: "✈️" },
  { tokenId: 16, gauge: "Aerodrome", rarity: "Platinum", weight: 8, poolFeeDiscount: 0, icon: "✈️" },

  // LSG Clanker (Tokens 17-20)
  { tokenId: 17, gauge: "Clanker", rarity: "Bronze", weight: 1, poolFeeDiscount: 20, icon: "🤖" },
  { tokenId: 18, gauge: "Clanker", rarity: "Silver", weight: 2, poolFeeDiscount: 15, icon: "🤖" },
  { tokenId: 19, gauge: "Clanker", rarity: "Gold", weight: 4, poolFeeDiscount: 10, icon: "🤖" },
  { tokenId: 20, gauge: "Clanker", rarity: "Platinum", weight: 8, poolFeeDiscount: 0, icon: "🤖" },

  // LSG QR (Tokens 21-24)
  { tokenId: 21, gauge: "QR", rarity: "Bronze", weight: 1, poolFeeDiscount: 20, icon: "📱" },
  { tokenId: 22, gauge: "QR", rarity: "Silver", weight: 2, poolFeeDiscount: 15, icon: "📱" },
  { tokenId: 23, gauge: "QR", rarity: "Gold", weight: 4, poolFeeDiscount: 10, icon: "📱" },
  { tokenId: 24, gauge: "QR", rarity: "Platinum", weight: 8, poolFeeDiscount: 0, icon: "📱" },

  // LSG USDC (Tokens 25-28)
  { tokenId: 25, gauge: "USDC", rarity: "Bronze", weight: 1, poolFeeDiscount: 20, icon: "💵" },
  { tokenId: 26, gauge: "USDC", rarity: "Silver", weight: 2, poolFeeDiscount: 15, icon: "💵" },
  { tokenId: 27, gauge: "USDC", rarity: "Gold", weight: 4, poolFeeDiscount: 10, icon: "💵" },
  { tokenId: 28, gauge: "USDC", rarity: "Platinum", weight: 8, poolFeeDiscount: 0, icon: "💵" },
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
