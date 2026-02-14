"use client";

import React, { useState } from "react";
import { useFlair } from "@/hooks/useFlair";
import { usePins } from "@/hooks/usePins";
import { useMinerState } from "@/hooks/useMinerState";
import {
  FLAIR_TOKENS,
  RARITY_ICONS,
  getFlairImagePath,
  type Rarity,
  type FlairTokenData,
} from "@/lib/flair-data";
import { getPaymentAmount } from "@/lib/token-utils";
import { Zap, ShoppingCart } from "lucide-react";
import { formatUnits } from "viem";

export const FlairShop: React.FC = () => {
  const [purchasingTokenId, setPurchasingTokenId] = useState<number | null>(null);
  const [useDonut, setUseDonut] = useState(false);
  const { buyFlair, isBuying } = useFlair();
  const { flairMintPrice } = usePins();
  const { minerState } = useMinerState();

  const bronzePrice = flairMintPrice ?? 0n;

  // Get all Bronze tier flair (one per gauge)
  const bronzeTokens = FLAIR_TOKENS.filter((t) => t.rarity === "Bronze");

  const handleBuy = async (token: FlairTokenData) => {
    setPurchasingTokenId(token.tokenId);
    const approvalAmount = getPaymentAmount(bronzePrice, useDonut, minerState?.donutPrice);
    await buyFlair(BigInt(token.tokenId), approvalAmount, useDonut);
    setPurchasingTokenId(null);
  };

  const formatPrice = () => {
    const amount = getPaymentAmount(bronzePrice, useDonut, minerState?.donutPrice);
    const label = useDonut ? "DONUT" : "WETH";
    return `${parseFloat(formatUnits(amount, 18)).toLocaleString()} ${label}`;
  };

  const getRarityGlow = (rarity: Rarity) => {
    switch (rarity) {
      case "Bronze": return "ring-[#CD7F32]/40";
      case "Silver": return "ring-gray-400/40";
      case "Gold": return "ring-[#FFD700]/40";
      case "Platinum": return "ring-[#B48EF7]/40";
      default: return "";
    }
  };

  return (
    <div className="space-y-3">
      {/* Payment toggle + price */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 p-0.5 bg-white/50 rounded-lg">
          <button
            onClick={() => setUseDonut(false)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
              !useDonut
                ? "bg-[#3D2914] text-white shadow-sm"
                : "text-[#8B7355] hover:bg-white/60"
            }`}
          >
            WETH
          </button>
          <button
            onClick={() => setUseDonut(true)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
              useDonut
                ? "bg-[#3D2914] text-white shadow-sm"
                : "text-[#8B7355] hover:bg-white/60"
            }`}
          >
            DONUT
          </button>
        </div>
        <span className="text-xs font-bold text-[#3D2914]">{formatPrice()} each</span>
      </div>

      {/* Flair grid */}
      <div className="grid grid-cols-1 gap-2">
        {bronzeTokens.map((token) => {
          const isPurchasing = purchasingTokenId === token.tokenId;
          return (
            <div
              key={token.tokenId}
              className="flex items-center gap-3 p-3 bg-white/60 rounded-xl"
            >
              {/* Flair image */}
              <div className={`w-12 h-12 rounded-lg bg-white flex items-center justify-center p-1.5 ring-2 ${getRarityGlow(token.rarity)}`}>
                <img
                  src={getFlairImagePath(token.gauge, token.rarity)}
                  alt={token.gauge}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-[#2D2319]">{token.gauge}</div>
                <div className="flex items-center gap-1 text-[10px] text-[#8B7355]">
                  <span>{RARITY_ICONS[token.rarity]}</span>
                  <span>Bronze</span>
                  <span className="text-[#D4915D]">•</span>
                  <Zap className="w-3 h-3 text-[#FFD700]" />
                  <span>{token.weight}x boost</span>
                </div>
              </div>

              {/* Buy button */}
              <button
                onClick={() => handleBuy(token)}
                disabled={isBuying || isPurchasing}
                className="px-3 py-2 rounded-lg bg-[#3D2914] text-white text-xs font-bold hover:bg-[#2D1F0F] transition-colors disabled:opacity-50"
              >
                {isPurchasing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Tip */}
      <p className="text-[10px] text-[#8B7355] text-center px-4">
        Fuse 2 of the same flair to upgrade rarity
      </p>
    </div>
  );
};
