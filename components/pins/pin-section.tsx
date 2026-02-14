"use client";
import React, { useState } from "react";
import { usePins } from "@/hooks/usePins";
import { useFlair, FlairItem } from "@/hooks/useFlair";
import {
  RARITY_ICONS,
  type Rarity,
  getTokenById,
  getFlairImagePath,
} from "@/lib/flair-data";
import { Lock, Plus, Sparkles, Zap, ExternalLink } from "lucide-react";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { formatUnits } from "viem";
import { useMinerState } from "@/hooks/useMinerState";

export const PinSection: React.FC = () => {
  const { hasPin, pinId, canMint, isMinting, pinMintPrice, mintPin } = usePins();
  const { equippedFlair } = useFlair();
  const { minerState } = useMinerState();

  const [mintedPin, setMintedPin] = useState<string>("");
  const [useDonut, setUseDonut] = useState<boolean>(false);

  const getRarityGlow = (rarity: Rarity) => {
    switch (rarity) {
      case "Bronze":
        return "glow-bronze";
      case "Silver":
        return "glow-silver";
      case "Gold":
        return "glow-gold";
      case "Platinum":
        return "glow-legendary";
      default:
        return "";
    }
  };

  const FlairSlot = ({
    flair,
    index,
  }: {
    flair: FlairItem | null;
    index: number;
  }) => {
    const tokenData = flair ? getTokenById(Number(flair.tokenId)) : null;

    if (flair && tokenData) {
      return (
        <div
          className={`flair-slot flair-slot-filled ${getRarityGlow(flair.rarity)} animate-bounce-in`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="w-10 h-10 mb-1">
            <img
              src={getFlairImagePath(tokenData.gauge, flair.rarity)}
              alt={`${tokenData.gauge} ${flair.rarity}`}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs">{RARITY_ICONS[flair.rarity]}</span>
            <span className="text-[9px] font-bold text-[#5C4A3D]">
              {flair.weight}x
            </span>
          </div>
        </div>
      );
    }

    return (
      <div
        className="flair-slot flair-slot-empty animate-scale-in"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <Plus className="w-5 h-5 text-[#A89485] mb-1" />
        <span className="text-[10px] text-[#A89485]">Slot {index + 1}</span>
      </div>
    );
  };

  const equippedCount = equippedFlair?.filter((f) => f !== null).length || 0;
  const totalWeight =
    equippedFlair?.reduce((acc, f) => acc + (f?.weight || 0), 0) || 0;

  return (
    <div className="glazed-card p-5">
      {hasPin ? (
        <div className="space-y-5">
          {/* Pin Header with Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                {/* Animated Pin Display */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#82AD94] to-[#5C946E] flex items-center justify-center shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
                  <span className="text-4xl relative z-10">📌</span>
                </div>
                {/* Soulbound indicator */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
                  <Lock className="w-3 h-3 text-[#82AD94]" />
                </div>
              </div>
              <div>
                <div className="text-xs text-[#A89485] uppercase tracking-wider font-bold">
                  Your Pin
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-[#2D2319] amatic">
                    #{pinId}
                  </div>
                  {CONTRACT_ADDRESSES.pin && (
                    <div className="flex items-center gap-1">
                      <a
                        href={`https://basescan.org/token/${CONTRACT_ADDRESSES.pin}?a=${pinId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#82AD94] hover:text-[#5C946E] transition-colors"
                        title="View on Basescan"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://opensea.io/assets/base/${CONTRACT_ADDRESSES.pin}/${pinId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#82AD94] hover:text-[#5C946E] transition-colors"
                        title="View on OpenSea"
                      >
                        <span className="text-sm">🌊</span>
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="badge-rarity badge-gold text-[9px] py-0.5 px-2">
                    Soulbound
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="text-right">
              <div className="glazed-card px-3 py-2">
                <div className="flex items-center gap-1 text-[#FFD700]">
                  <Zap className="w-4 h-4" />
                  <span className="text-lg font-bold">{totalWeight}x</span>
                </div>
                <div className="text-[10px] text-[#5C4A3D]">Total Boost</div>
              </div>
            </div>
          </div>

          {/* Equipped Flair Slots */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-[#5C4A3D] uppercase tracking-wider">
                Equipped Flair
              </div>
              <div className="text-xs text-[#A89485]">
                {equippedCount}/3 slots
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              {[0, 1, 2].map((index) => (
                <FlairSlot
                  key={index}
                  flair={equippedFlair?.[index] ?? null}
                  index={index}
                />
              ))}
            </div>
            {equippedCount === 0 && (
              <p className="text-center text-xs text-[#A89485] mt-3">
                Equip flair from your collection to boost yield
              </p>
            )}
          </div>

          {/* Benefits Display */}
          <div className="bg-gradient-to-r from-[#82AD94]/10 to-[#5C946E]/10 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-[#5C4A3D]">
              <Sparkles className="w-4 h-4 text-[#FFD700]" />
              <span>
                {equippedCount === 0 ? (
                  "Equip flair to unlock yield multipliers"
                ) : equippedCount === 3 ? (
                  <span className="text-[#82AD94] font-bold">
                    All slots filled! Maximum boost active.
                  </span>
                ) : (
                  `${3 - equippedCount} more slot${3 - equippedCount > 1 ? "s" : ""} available for extra boost`
                )}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* No Pin State */
        <div className="text-center pt-0">
          {/* Large Pin Illustration */}
          {mintedPin ? (
            <div className="relative -mx-5 -mt-6 mb-6 animate-scale-in">
              {/* Dramatic glow effect background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/40 via-[#82AD94]/30 to-[#B48EF7]/40 blur-3xl animate-pulse" />

              {/* Pin artwork - hero size */}
              <div className="relative">
                <img
                  src={mintedPin}
                  className="w-full h-auto"
                  alt="Your Minted Pin"
                />

                {/* Success badge */}
                <div className="mt-4 flex flex-col items-center justify-center gap-3">
                  <div className="badge-rarity badge-gold text-sm py-2 px-4 flex items-center gap-2 shadow-lg">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-bold">Freshly Minted!</span>
                  </div>

                  {/* View links */}
                  <div className="flex items-center gap-3 text-sm">
                    {CONTRACT_ADDRESSES.pin && pinId ? (
                      <>
                        <a
                          href={`https://basescan.org/token/${CONTRACT_ADDRESSES.pin}?a=${pinId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[#82AD94] hover:text-[#5C946E] transition-colors font-medium"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Basescan</span>
                        </a>
                        <span className="text-[#A89485]">•</span>
                        <a
                          href={`https://opensea.io/assets/base/${CONTRACT_ADDRESSES.pin}/${pinId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[#82AD94] hover:text-[#5C946E] transition-colors font-medium"
                        >
                          <span>🌊</span>
                          <span>OpenSea</span>
                        </a>
                      </>
                    ) : CONTRACT_ADDRESSES.pin ? (
                      <div className="flex items-center gap-2 text-xs text-[#A89485]">
                        <div className="w-3 h-3 border-2 border-[#A89485]/30 border-t-[#A89485] rounded-full animate-spin" />
                        <span>Waiting for blockchain confirmation...</span>
                      </div>
                    ) : (
                      <div className="text-xs text-[#A89485] px-3 py-2 bg-[#FFF8E7] rounded-lg">
                        ⚠️ On-chain minting not yet enabled
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative mx-auto w-28 h-28 mb-5">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#A89485]/20 to-[#A89485]/5 animate-pulse" />
              <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-white to-[#FFF8E7] flex items-center justify-center shadow-inner">
                <span className="text-6xl opacity-40">📌</span>
              </div>
            </div>
          )}

          {!mintedPin && (
            <>
              <h3 className="text-2xl font-bold text-[#2D2319] amatic mb-2">
                Get Your Pin
              </h3>
              <p className="text-sm text-[#5C4A3D] mb-5 max-w-[280px] mx-auto">
                Mint a soulbound Pin to unlock flair slots and boost your yield
                multipliers.
              </p>

              {/* Requirements & CTA */}
              <div className="space-y-4">
                {/* Price Display */}
                {pinMintPrice !== undefined && (
                  <div className="glazed-card px-4 py-3 max-w-[280px] mx-auto">
                    <div className="text-xs text-[#A89485] uppercase tracking-wider mb-2 text-center">
                      Mint Price
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#2D2319] amatic">
                          {useDonut && minerState?.donutPrice
                            ? `${Math.ceil(Number(pinMintPrice * 10n**18n / minerState.donutPrice) / 10**18).toLocaleString()} DONUT`
                            : `${parseFloat(formatUnits(pinMintPrice, 18))} ETH`}
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Method Toggle */}
                <div className="max-w-[280px] mx-auto">
                  <div className="text-xs text-[#A89485] uppercase tracking-wider mb-2 text-center">
                    Payment Method
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-1 glazed-card">
                    <button
                      onClick={() => setUseDonut(false)}
                      className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg transition-all ${
                        !useDonut
                          ? "bg-gradient-to-br from-[#82AD94] to-[#5C946E] text-white shadow-lg scale-105"
                          : "bg-white/50 text-[#5C4A3D] hover:bg-white/70"
                      }`}
                    >
                      <span className="text-2xl mb-1">Ξ</span>
                      <span className="text-xs font-bold">WETH</span>
                    </button>
                    <button
                      onClick={() => setUseDonut(true)}
                      className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg transition-all ${
                        useDonut
                          ? "bg-gradient-to-br from-[#82AD94] to-[#5C946E] text-white shadow-lg scale-105"
                          : "bg-white/50 text-[#5C4A3D] hover:bg-white/70"
                      }`}
                    >
                      <span className="text-2xl mb-1">🍩</span>
                      <span className="text-xs font-bold">DONUT</span>
                    </button>
                  </div>
                </div>

                {/* Benefits Breakdown */}
                <div className="glazed-card px-4 py-4 max-w-[280px] mx-auto space-y-3">
                  <div className="text-xs font-bold text-[#5C4A3D] uppercase tracking-wider text-center">
                    Where Your Payment Goes
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#82AD94]" />
                        <span className="text-[#5C4A3D]">
                          Pool Shares (You)
                        </span>
                      </div>
                      <span className="font-bold text-[#2D2319]">80%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#FFD700]" />
                        <span className="text-[#5C4A3D]">Blazery</span>
                      </div>
                      <span className="font-bold text-[#2D2319]">10%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#A89485]" />
                        <span className="text-[#5C4A3D]">Protocol Fees</span>
                      </div>
                      <span className="font-bold text-[#2D2319]">10%</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#2D2319]/10">
                    <div className="flex items-center gap-2 text-xs text-[#5C4A3D]">
                      <Sparkles className="w-4 h-4 text-[#82AD94]" />
                      <span>Equip flair to earn yield on pool assets</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    const mintedPin = await mintPin(useDonut);
                    setMintedPin(mintedPin as string);
                  }}
                  disabled={isMinting}
                  className="btn-glazed w-full max-w-[240px] flex items-center justify-center gap-2"
                >
                  {isMinting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Minting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Mint Your Pin
                    </>
                  )}
                </button>
              </div>

              {/* Benefits Preview */}
              <div className="mt-6 pt-5 border-t border-[#2D2319]/10">
                <div className="text-xs font-bold text-[#5C4A3D] uppercase tracking-wider mb-3">
                  Pin Benefits
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 flex items-center justify-center mx-auto mb-1">
                      <Zap className="w-5 h-5 text-[#FFD700]" />
                    </div>
                    <div className="text-[10px] text-[#5C4A3D]">
                      Yield Boost
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-xl bg-[#82AD94]/10 flex items-center justify-center mx-auto mb-1">
                      <span className="text-xl">🎭</span>
                    </div>
                    <div className="text-[10px] text-[#5C4A3D]">
                      Equip Flair
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-xl bg-[#B48EF7]/10 flex items-center justify-center mx-auto mb-1">
                      <span className="text-xl">⚗️</span>
                    </div>
                    <div className="text-[10px] text-[#5C4A3D]">
                      Flair Fusion
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
