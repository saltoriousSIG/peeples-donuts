"use client";

import React, { useState } from "react";
import { useFlair } from "@/hooks/useFlair";
import { usePins } from "@/hooks/usePins";
import {
  RARITY_ICONS,
  GAUGE_ICONS,
  getTokenById,
  getFlairImagePath,
  type Rarity,
} from "@/lib/flair-data";
import { Check, X, Zap, Package } from "lucide-react";
import { useFrameContext } from "@/providers/FrameSDKProvider";
import generate_pin from "@/lib/server_functions/generate_pin";
import { toast } from "sonner";

export const FlairInventory: React.FC = () => {
  const { hasPin } = usePins();
  const { ownedFlair, equipFlair, unequipFlair, isEquipping, isLoading } = useFlair();
  const { fUser } = useFrameContext();
  const [isGeneratingCid, setIsGeneratingCid] = useState(false);

  const handleEquip = async (flairId: bigint) => {
    if (!fUser?.fid) {
      toast.error("Frame user not available");
      return;
    }

    setIsGeneratingCid(true);
    try {
      // Generate new pin metadata with flair equipped
      const pinData = await generate_pin(fUser.fid);
      await equipFlair(flairId, pinData.cid);
    } catch (error) {
      // Error already handled by equipFlair
    } finally {
      setIsGeneratingCid(false);
    }
  };

  const handleUnequip = async (flairId: bigint) => {
    if (!fUser?.fid) {
      toast.error("Frame user not available");
      return;
    }

    setIsGeneratingCid(true);
    try {
      // Generate new pin metadata with flair unequipped
      const pinData = await generate_pin(fUser.fid);
      await unequipFlair(flairId, pinData.cid);
    } catch (error) {
      // Error already handled by unequipFlair
    } finally {
      setIsGeneratingCid(false);
    }
  };

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

  //if (isLoading) {
  //  return (
  //    <div className="glazed-card p-5">
  //      <div className="animate-pulse">
  //        <div className="h-6 w-32 bg-[#A89485]/20 rounded-lg mb-4"></div>
  //        <div className="grid grid-cols-3 gap-3">
  //          {[1, 2, 3].map((i) => (
  //            <div key={i} className="h-28 bg-[#A89485]/10 rounded-2xl"></div>
  //          ))}
  //        </div>
  //      </div>
  //    </div>
  //  );
  //}

  return (
    <div className="glazed-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-[#82AD94]" />
          <h2 className="text-lg font-bold text-[#2D2319]">Your Collection</h2>
        </div>
        <span className="text-xs text-[#A89485] bg-white/50 px-2 py-1 rounded-full">
          {ownedFlair.length} owned
        </span>
      </div>

      {ownedFlair.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {ownedFlair.map((flair, index) => {
            const tokenData = getTokenById(Number(flair.tokenId));
            const rarity = (flair.rarity as Rarity) || "Bronze";
            const gaugeIcon = tokenData ? GAUGE_ICONS[tokenData.gauge] : "?";

            return (
              <div
                key={flair.id}
                className={`glazed-card glazed-card-interactive p-3 animate-scale-in ${
                  flair.isEquipped ? getRarityGlow(rarity) : ""
                } ${flair.isEquipped ? "ring-2 ring-[#82AD94]" : ""}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Equipped Badge */}
                {flair.isEquipped && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#82AD94] flex items-center justify-center shadow-sm">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* Icon & Rarity */}
                <div className="text-center mb-2">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-white to-[#FFF8E7] flex items-center justify-center shadow-inner mb-2 p-1">
                    {tokenData && (
                      <img
                        src={getFlairImagePath(tokenData.gauge, rarity)}
                        alt={`${tokenData.gauge} ${rarity}`}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  <span className={`badge-rarity ${getRarityBadgeClass(rarity)} text-[8px] py-0.5`}>
                    {RARITY_ICONS[rarity]} {rarity}
                  </span>
                </div>

                {/* Gauge Name */}
                <div className="text-[10px] text-[#5C4A3D] text-center mb-1 truncate">
                  {tokenData?.gauge || "Unknown"}
                </div>

                {/* Weight */}
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Zap className="w-3 h-3 text-[#FFD700]" />
                  <span className="text-xs font-bold text-[#2D2319]">
                    {flair.weight}x
                  </span>
                </div>

                {/* Action Button */}
                {hasPin && (
                  <button
                    onClick={() =>
                      flair.isEquipped
                        ? handleUnequip(flair.tokenId)
                        : handleEquip(flair.tokenId)
                    }
                    disabled={isEquipping || isGeneratingCid}
                    className={`w-full py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      flair.isEquipped
                        ? "bg-[#FFB5BA]/20 text-[#E8919A] hover:bg-[#FFB5BA]/30"
                        : "bg-[#82AD94]/20 text-[#5C946E] hover:bg-[#82AD94]/30"
                    }`}
                  >
                    {flair.isEquipped ? (
                      <span className="flex items-center justify-center gap-1">
                        <X className="w-3 h-3" /> Unequip
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1">
                        <Check className="w-3 h-3" /> Equip
                      </span>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-white to-[#FFF8E7] flex items-center justify-center shadow-inner">
            <span className="text-4xl opacity-40">🎭</span>
          </div>
          <h3 className="text-lg font-bold text-[#2D2319] mb-2">No Flair Yet</h3>
          <p className="text-sm text-[#5C4A3D] mb-4">
            Buy flair from the shop to boost your yield
          </p>
          <div className="flex justify-center gap-2">
            {["🥉", "🥈", "🥇", "💎"].map((icon, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center text-lg opacity-50"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {icon}
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasPin && ownedFlair.length > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-[#FFB5BA]/10 text-center">
          <p className="text-xs text-[#E8919A]">
            Mint a Pin to equip your flair
          </p>
        </div>
      )}
    </div>
  );
};
