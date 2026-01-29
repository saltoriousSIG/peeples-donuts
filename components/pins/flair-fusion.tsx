"use client";

import React, { useState, useMemo } from "react";
import { useFlair, FlairItem } from "@/hooks/useFlair";
import {
  RARITY_ICONS,
  RARITIES,
  GAUGE_ICONS,
  getTokenById,
  getFlairImagePath,
  type Rarity,
} from "@/lib/flair-data";
import { Sparkles, ArrowRight, Zap, FlaskConical, AlertCircle } from "lucide-react";
import { useReadContract, useAccount } from "wagmi";
import { base } from "wagmi/chains";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { DATA } from "@/lib/abi/data";
import { ERC20 } from "@/lib/abi/erc20";
import { formatUnits, zeroAddress, parseUnits } from "viem";
import { toast } from "sonner";

// DONUT cost for fusion (fallback values)
const FALLBACK_FUSION_COSTS: Record<Rarity, number> = {
  Bronze: 100,
  Silver: 500,
  Gold: 2500,
  Platinum: 0, // Can't upgrade Platinum
};

export const FlairFusion: React.FC = () => {
  const { address } = useAccount();
  const { ownedFlair, fuseFlair, isFusing } = useFlair();
  const [selectedFlair, setSelectedFlair] = useState<FlairItem | null>(null);

  // Fetch user's DONUT balance
  const { data: donutBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.donut as `0x${string}`,
    abi: ERC20,
    functionName: "balanceOf",
    args: [address ?? zeroAddress],
    chainId: base.id,
    query: {
      enabled: !!address,
      refetchInterval: 10_000,
    },
  });

  // Fetch fusion costs from contract for each rarity
  const { data: bronzeCostData } = useReadContract({
    address: CONTRACT_ADDRESSES.pool as `0x${string}`,
    abi: DATA,
    functionName: "getRarityFusionCost",
    args: [0], // 0 = Bronze (COMMON)
    chainId: base.id,
    query: {
      enabled: !!CONTRACT_ADDRESSES.pool,
      refetchInterval: 30_000,
    },
  });

  const { data: silverCostData } = useReadContract({
    address: CONTRACT_ADDRESSES.pool as `0x${string}`,
    abi: DATA,
    functionName: "getRarityFusionCost",
    args: [1], // 1 = Silver (UNCOMMON)
    chainId: base.id,
    query: {
      enabled: !!CONTRACT_ADDRESSES.pool,
      refetchInterval: 30_000,
    },
  });

  const { data: goldCostData } = useReadContract({
    address: CONTRACT_ADDRESSES.pool as `0x${string}`,
    abi: DATA,
    functionName: "getRarityFusionCost",
    args: [2], // 2 = Gold (RARE)
    chainId: base.id,
    query: {
      enabled: !!CONTRACT_ADDRESSES.pool,
      refetchInterval: 30_000,
    },
  });

  // Parse fusion costs or use fallbacks
  const fusionCosts = useMemo((): Record<Rarity, number> => {
    return {
      Bronze: bronzeCostData && typeof bronzeCostData === 'bigint'
        ? Number(formatUnits(bronzeCostData, 18))
        : FALLBACK_FUSION_COSTS.Bronze,
      Silver: silverCostData && typeof silverCostData === 'bigint'
        ? Number(formatUnits(silverCostData, 18))
        : FALLBACK_FUSION_COSTS.Silver,
      Gold: goldCostData && typeof goldCostData === 'bigint'
        ? Number(formatUnits(goldCostData, 18))
        : FALLBACK_FUSION_COSTS.Gold,
      Platinum: 0,
    };
  }, [bronzeCostData, silverCostData, goldCostData]);

  // Only show flair that can be upgraded (not Platinum)
  const upgradableFlair = ownedFlair.filter(
    (flair) => flair.rarity !== "Platinum"
  );

  const getNextRarity = (currentRarity: string): Rarity | null => {
    const currentIndex = RARITIES.indexOf(currentRarity as Rarity);
    if (currentIndex === -1 || currentIndex >= RARITIES.length - 1) {
      return null;
    }
    return RARITIES[currentIndex + 1];
  };

  const handleFuse = async () => {
    if (!selectedFlair) return;

    // Validate before attempting fusion
    if (!canFuse.valid) {
      toast.error("Cannot fuse", { description: canFuse.reason });
      return;
    }

    const oldWeight = selectedFlair.weight;
    const newWeight = nextRarity === "Silver" ? 2 : nextRarity === "Gold" ? 4 : nextRarity === "Platinum" ? 8 : 1;

    try {
      await fuseFlair(selectedFlair.tokenId);

      // Success feedback with before/after stats
      toast.success(`Flair upgraded to ${nextRarity}!`, {
        description: `${selectedFlair.gauge}: ${oldWeight}x → ${newWeight}x boost`,
      });

      setSelectedFlair(null);
    } catch (error) {
      // Error already handled by useFlair hook
    }
  };

  const selectedRarity = (selectedFlair?.rarity as Rarity) || "Bronze";
  const nextRarity = selectedFlair ? getNextRarity(selectedFlair.rarity) : null;
  const fusionCost = selectedFlair ? fusionCosts[selectedRarity] : 0;

  // Validation: Check if user has enough flair of same type to fuse
  const canFuse = useMemo(() => {
    if (!selectedFlair) return { valid: false, reason: "" };

    // Check for Platinum (can't upgrade)
    if (selectedFlair.rarity === "Platinum") {
      return { valid: false, reason: "Platinum is the highest rarity" };
    }

    // Count how many of the same gauge + rarity the user owns
    const sameTypeCount = ownedFlair.filter(
      (f) => f.gauge === selectedFlair.gauge && f.rarity === selectedFlair.rarity
    ).length;

    if (sameTypeCount < 2) {
      return {
        valid: false,
        reason: `You need 2 ${selectedFlair.gauge} ${selectedFlair.rarity} flair to fuse`,
      };
    }

    // Check DONUT balance
    const userDonutBalance = donutBalance ? Number(formatUnits(donutBalance as bigint, 18)) : 0;
    if (userDonutBalance < fusionCost) {
      return {
        valid: false,
        reason: `Insufficient DONUT (need ${fusionCost}, have ${userDonutBalance.toFixed(2)})`,
      };
    }

    return { valid: true, reason: "" };
  }, [selectedFlair, ownedFlair, fusionCost, donutBalance]);

  const getRarityGlow = (rarity: Rarity) => {
    switch (rarity) {
      case "Bronze": return "glow-bronze";
      case "Silver": return "glow-silver";
      case "Gold": return "glow-gold";
      case "Platinum": return "glow-legendary";
      default: return "";
    }
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

  const getRarityGradient = (rarity: Rarity) => {
    switch (rarity) {
      case "Bronze": return "from-[#CD7F32] to-[#B87333]";
      case "Silver": return "from-[#E8E8E8] to-[#C0C0C0]";
      case "Gold": return "from-[#FFD700] to-[#FFA500]";
      case "Platinum": return "from-[#B48EF7] to-[#8B5CF6]";
      default: return "";
    }
  };

  return (
    <div className="glazed-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <FlaskConical className="w-5 h-5 text-[#B48EF7]" />
        <h2 className="text-lg font-bold text-[#2D2319]">Flair Fusion</h2>
      </div>

      {upgradableFlair.length > 0 ? (
        <div className="space-y-4">
          {/* Flair Selection */}
          <div>
            <div className="text-xs font-bold text-[#5C4A3D] uppercase tracking-wider mb-3">
              Select Flair to Upgrade
            </div>
            <div className="grid grid-cols-4 gap-2">
              {upgradableFlair.map((flair, index) => {
                const tokenData = getTokenById(Number(flair.tokenId));
                const rarity = (flair.rarity as Rarity) || "Bronze";

                return (
                  <button
                    key={flair.id}
                    onClick={() => setSelectedFlair(flair)}
                    className={`glazed-card glazed-card-interactive p-2 animate-scale-in ${
                      selectedFlair?.id === flair.id
                        ? `ring-2 ring-[#B48EF7] ${getRarityGlow(rarity)}`
                        : ""
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {tokenData && (
                      <div className="w-8 h-8 mx-auto mb-1">
                        <img
                          src={getFlairImagePath(tokenData.gauge, rarity)}
                          alt={`${tokenData.gauge} ${rarity}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="text-xs text-center mb-1">{RARITY_ICONS[rarity]}</div>
                    <div className="text-[8px] text-[#5C4A3D] text-center truncate">
                      {rarity}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fusion Preview */}
          {selectedFlair && nextRarity && (
            <div className={`glazed-card p-5 opacity-0 animate-slide-up ${getRarityGlow(nextRarity)}`}>
              {/* Fusion Visual */}
              <div className="flex items-center justify-center gap-3 mb-4">
                {/* Current */}
                <div className="text-center">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getRarityGradient(selectedRarity)} flex items-center justify-center text-2xl shadow-lg mb-2`}>
                    {RARITY_ICONS[selectedRarity]}
                  </div>
                  <span className={`badge-rarity ${getRarityBadgeClass(selectedRarity)} text-[9px]`}>
                    {selectedRarity}
                  </span>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B48EF7] to-[#8B5CF6] flex items-center justify-center shadow-lg">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                  <Sparkles className="w-4 h-4 text-[#B48EF7] mt-1 animate-bounce" />
                </div>

                {/* Result */}
                <div className="text-center">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getRarityGradient(nextRarity)} flex items-center justify-center text-2xl shadow-lg mb-2 animate-pulse`}>
                    {RARITY_ICONS[nextRarity]}
                  </div>
                  <span className={`badge-rarity ${getRarityBadgeClass(nextRarity)} text-[9px]`}>
                    {nextRarity}
                  </span>
                </div>
              </div>

              {/* Benefits Comparison */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/50 rounded-xl p-3 text-center">
                  <div className="text-xs text-[#A89485] mb-1">Current Boost</div>
                  <div className="flex items-center justify-center gap-1 text-[#5C4A3D]">
                    <Zap className="w-4 h-4 text-[#FFD700]" />
                    <span className="text-lg font-bold">{selectedFlair.weight}x</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#B48EF7]/20 to-[#8B5CF6]/20 rounded-xl p-3 text-center">
                  <div className="text-xs text-[#8B5CF6] mb-1">New Boost</div>
                  <div className="flex items-center justify-center gap-1 text-[#8B5CF6]">
                    <Zap className="w-4 h-4" />
                    <span className="text-lg font-bold">
                      {nextRarity === "Silver" ? 2 :
                       nextRarity === "Gold" ? 4 :
                       nextRarity === "Platinum" ? 8 : 1}x
                    </span>
                  </div>
                </div>
              </div>

              {/* Cost & Fuse Button */}
              <div className="bg-white/30 rounded-xl p-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#5C4A3D]">Fusion Cost</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🍩</span>
                    <span className="text-lg font-bold text-[#2D2319]">
                      {fusionCost} DONUT
                    </span>
                  </div>
                </div>
              </div>

              {/* Validation Error */}
              {!canFuse.valid && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-red-700">{canFuse.reason}</div>
                </div>
              )}

              <button
                onClick={handleFuse}
                disabled={isFusing || !canFuse.valid}
                className="btn-glazed btn-strawberry w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #B48EF7 0%, #8B5CF6 100%)",
                }}
              >
                {isFusing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Fusing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Fuse Now
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-white to-[#FFF8E7] flex items-center justify-center shadow-inner">
            <span className="text-4xl opacity-40">⚗️</span>
          </div>
          <h3 className="text-lg font-bold text-[#2D2319] mb-2">No Flair to Upgrade</h3>
          <p className="text-sm text-[#5C4A3D] mb-4">
            Buy Bronze flair from the shop, then fuse 2 of the same tier to upgrade
          </p>

          {/* Fusion Path Preview */}
          <div className="flex items-center justify-center gap-2">
            {["🥉", "🥈", "🥇", "💎"].map((icon, i) => (
              <React.Fragment key={i}>
                <div className="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center text-lg opacity-50">
                  {icon}
                </div>
                {i < 3 && <ArrowRight className="w-3 h-3 text-[#A89485] opacity-50" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-[#2D2319]/10">
        <p className="text-[10px] text-[#A89485] text-center">
          Fuse 2 lower tier flairs + DONUT to upgrade: Bronze → Silver → Gold → Platinum
        </p>
      </div>
    </div>
  );
};
