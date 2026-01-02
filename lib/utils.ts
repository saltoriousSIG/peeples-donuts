import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Strategy } from "@/types/pool.type";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ETH to USD price cache
let ethPriceCache: { price: number; timestamp: number } | null = null;
const CACHE_DURATION = 60_000; // 1 minute cache

/**
 * Fetches the current ETH to USD price from CoinGecko API
 * Returns cached value if available and fresh (< 1 minute old)
 */
export async function getEthPrice(): Promise<number> {
  // Return cached price if still valid
  if (ethPriceCache && Date.now() - ethPriceCache.timestamp < CACHE_DURATION) {
    return ethPriceCache.price;
  }

  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch ETH price");
    }

    const data = await response.json();
    const price = data.ethereum?.usd;

    if (typeof price !== "number") {
      throw new Error("Invalid price data");
    }

    // Update cache
    ethPriceCache = {
      price,
      timestamp: Date.now(),
    };

    return price;
  } catch (error) {
    console.error("Error fetching ETH price:", error);
    // Fallback to a reasonable default if fetch fails
    return 3500;
  }
}

export const DECAY_WINDOW = 60;
export const MAX_CAPITAL_RATIO = 1.1;

export const STRATEGY_MINUTES_BREAKEVEN: Record<Strategy, number> = {
  [Strategy.CONSERVATIVE]: 30,
  [Strategy.MODERATE]: 60,
  [Strategy.AGGRESSIVE]: 165,
  [Strategy.DEGEN]: 200,
};

export const STRATEGY_MULTIPLIER: Record<Strategy, number> = {
  [Strategy.CONSERVATIVE]: 1.0,
  [Strategy.MODERATE]: 2.51,
  [Strategy.AGGRESSIVE]: 3.0,
  [Strategy.DEGEN]: 3.5,
};

export function getBreakevenThreshold(
  glazePriceETH: number,
  poolBalanceETH: number,
  strategy: Strategy
): number {
  const capitalRatio = poolBalanceETH / glazePriceETH;
  const effectiveRatio =
    (STRATEGY_MULTIPLIER[strategy] * capitalRatio) / (capitalRatio + 1);

  return Math.floor(
    DECAY_WINDOW * effectiveRatio * STRATEGY_MULTIPLIER[strategy]
  );
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
