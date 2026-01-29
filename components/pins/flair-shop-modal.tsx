"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useFlair } from "@/hooks/useFlair";
import {
  FLAIR_TOKENS,
  RARITY_ICONS,
  RARITIES,
  getFlairImagePath,
  type Rarity,
  type FlairTokenData,
} from "@/lib/flair-data";
import { ShoppingBag, Zap, Shield, Star, Sparkles, ShoppingCart } from "lucide-react";
import { useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { DATA } from "@/lib/abi/data";
import { formatUnits } from "viem";

// Fallback prices (in PEEPLES) if contract not available
const FALLBACK_FLAIR_PRICES: Record<Rarity, bigint> = {
  Bronze: 1000n * 10n ** 18n,
  Silver: 2500n * 10n ** 18n,
  Gold: 5000n * 10n ** 18n,
  Platinum: 10000n * 10n ** 18n,
};

interface FlairShopModalProps {
  trigger?: React.ReactNode;
}

export const FlairShopModal: React.FC<FlairShopModalProps> = ({ trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [purchasingTokenId, setPurchasingTokenId] = useState<number | null>(null);
  const { buyFlair, isBuying } = useFlair();

  // Fetch flair mint price from contract
  const { data: bronzePriceData } = useReadContract({
    address: CONTRACT_ADDRESSES.pool as `0x${string}`,
    abi: DATA,
    functionName: "getFlairMintPrice",
    chainId: base.id,
    query: {
      enabled: !!CONTRACT_ADDRESSES.pool,
      refetchInterval: 30_000,
    },
  });

  // Parse price or use fallback
  const bronzePrice = useMemo(() => {
    if (bronzePriceData && typeof bronzePriceData === 'bigint') {
      return bronzePriceData;
    }
    return FALLBACK_FLAIR_PRICES.Bronze;
  }, [bronzePriceData]);

  // Get all Bronze tier flair (one per gauge)
  const bronzeTokens = FLAIR_TOKENS.filter((t) => t.rarity === "Bronze");

  const handleBuy = async (token: FlairTokenData) => {
    setPurchasingTokenId(token.tokenId);
    await buyFlair(BigInt(token.tokenId), bronzePrice);
    setPurchasingTokenId(null);
  };

  const formatPrice = () => {
    return (Number(bronzePrice) / 10 ** 18).toLocaleString();
  };

  const getRarityBadgeClass = (rarity: Rarity) => {
    switch (rarity) {
      case "Bronze": return "badge-bronze";
      case "Silver": return "badge-silver";
      case "Gold": return "badge-gold";
      case "Platinum": return "badge-legendary";
      default: return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="btn-glazed flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <span>Open Flair Shop</span>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[95%] max-h-[90vh] overflow-hidden p-0 bg-gradient-to-b from-[#FFF8E7] to-[#FFFDF5] border-0 shadow-2xl rounded-3xl m-auto">
        {/* Header with gradient */}
        <div className="relative px-4 pt-5 pb-3.5 bg-gradient-to-r from-[#82AD94] to-[#5C946E] rounded-t-3xl">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-4 w-2 h-2 rounded-full bg-white" />
            <div className="absolute top-6 right-8 w-1.5 h-1.5 rounded-full bg-white" />
            <div className="absolute bottom-4 left-12 w-1 h-1 rounded-full bg-white" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white amatic tracking-wide flex items-center gap-2">
              <span className="text-2xl">🛒</span>
              Flair Shop
            </DialogTitle>
            <p className="text-white/90 text-xs mt-1">
              {formatPrice()} PEEPLES each
            </p>
          </DialogHeader>
        </div>

        <div className="px-3.5 py-3.5 space-y-3.5 overflow-y-auto max-h-[calc(90vh-140px)] scrollbar-styled">
          {/* All Bronze Flair in Grid */}
          <div>
            <div className="text-xs font-bold text-[#5C4A3D] uppercase tracking-wider mb-3">
              Choose Your Pin
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {bronzeTokens.map((token, index) => {
                const isPurchasing = purchasingTokenId === token.tokenId;
                return (
                  <div
                    key={token.tokenId}
                    className="glazed-card p-3 animate-scale-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Top Row: Icon + Title + Badge */}
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-white to-[#FFF8E7] flex items-center justify-center shadow-sm p-2 flex-shrink-0">
                        <img
                          src={getFlairImagePath(token.gauge, token.rarity)}
                          alt={`${token.gauge} pin`}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-[#2D2319] mb-0.5">
                          {token.gauge}
                        </div>
                        <span className={`badge-rarity ${getRarityBadgeClass(token.rarity)} text-[9px] px-1.5 py-0.5 inline-block`}>
                          {RARITY_ICONS[token.rarity]} Bronze
                        </span>
                      </div>
                    </div>

                    {/* Benefits Row - Compact horizontal layout */}
                    <div className="flex items-center gap-3 mb-2.5 px-0.5">
                      <div className="flex items-center gap-1 text-[11px] text-[#5C4A3D]">
                        <Zap className="w-3 h-3 text-[#FFD700] flex-shrink-0" />
                        <span><strong className="text-[#2D2319]">{token.weight}x</strong> rewards</span>
                      </div>
                      <div className="w-px h-3 bg-[#5C4A3D]/20"></div>
                      <div className="flex items-center gap-1 text-[11px] text-[#5C4A3D]">
                        <Shield className="w-3 h-3 text-[#82AD94] flex-shrink-0" />
                        <span><strong className="text-[#2D2319]">{token.poolFeeDiscount}%</strong> fee</span>
                      </div>
                    </div>

                    {/* Buy Button - Full Width */}
                    <button
                      onClick={() => handleBuy(token)}
                      disabled={isBuying || isPurchasing}
                      className="btn-glazed w-full h-10 flex items-center justify-center gap-2 text-sm font-bold"
                    >
                      {isPurchasing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Buying...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          <span>Buy Now</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Footer */}
          <div className="glazed-card p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Star className="w-3.5 h-3.5 text-[#FFD700]" />
              <span className="font-bold text-xs text-[#2D2319]">How Pins Work</span>
            </div>
            <div className="space-y-2 text-[11px] leading-snug text-[#5C4A3D]">
              <div className="flex items-start gap-1.5">
                <Zap className="w-3 h-3 mt-0.5 text-[#FFD700] flex-shrink-0" />
                <span>Buy a pin for your pool to <strong className="text-[#2D2319]">multiply rewards</strong></span>
              </div>
              <div className="flex items-start gap-1.5">
                <Shield className="w-3 h-3 mt-0.5 text-[#82AD94] flex-shrink-0" />
                <span>Each pin <strong className="text-[#2D2319]">reduces withdrawal fees</strong></span>
              </div>
              <div className="flex items-start gap-1.5">
                <Sparkles className="w-3 h-3 mt-0.5 text-[#B48EF7] flex-shrink-0" />
                <span><strong className="text-[#2D2319]">Upgrade:</strong> Combine Bronze pins for Silver, Gold, and Platinum</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
