"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePins } from "@/hooks/usePins";
import { useFlair, FlairItem } from "@/hooks/useFlair";
import { GAUGE_ICONS, type Rarity } from "@/lib/flair-data";
import { Sparkles, ArrowRight, Lock } from "lucide-react";

export const PinFlairSummary: React.FC = () => {
  const router = useRouter();
  const { hasPin, pinId, isLoading: isPinLoading } = usePins();
  const { equippedFlair, isLoading: isFlairLoading } = useFlair();

  const isLoading = isPinLoading || isFlairLoading;

  const getRarityGlow = (rarity: Rarity) => {
    switch (rarity) {
      case "Bronze": return "glow-bronze";
      case "Silver": return "glow-silver";
      case "Gold": return "glow-gold";
      case "Platinum": return "glow-legendary";
      default: return "";
    }
  };

  // Flair slot component
  const FlairSlot = ({ flair, index }: { flair?: FlairItem | null; index: number }) => (
    <div
      className={`flair-slot w-10 h-10 ${
        flair ? `${getRarityGlow(flair.rarity as Rarity)} flair-slot-filled` : ""
      }`}
    >
      {flair ? (
        <span className="text-lg" title={`${flair.gauge} ${flair.rarity}`}>
          {GAUGE_ICONS[flair.gauge]}
        </span>
      ) : (
        <span className="text-[#A89485] text-xs font-bold">{index + 1}</span>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="glazed-card p-4 h-full">
        <div className="animate-pulse">
          <div className="h-4 w-20 bg-[#A89485]/20 rounded-lg mb-3"></div>
          <div className="h-10 w-full bg-[#A89485]/10 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Count equipped flair (non-null entries)
  const equippedCount = equippedFlair.filter(f => f !== null).length;

  return (
    <div className="glazed-card p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#B48EF7]" />
          <h3 className="text-sm font-bold text-[#2D2319]">Flair</h3>
        </div>
        {hasPin && (
          <div className="flex items-center gap-1 bg-[#82AD94]/10 px-2 py-0.5 rounded-full">
            <Lock className="w-2.5 h-2.5 text-[#82AD94]" />
            <span className="text-[9px] font-bold text-[#82AD94]">Pin #{pinId}</span>
          </div>
        )}
      </div>

      {hasPin ? (
        <div className="flex-1 flex flex-col">
          <div className="flex justify-center gap-2 mb-2">
            {[0, 1, 2].map((index) => (
              <FlairSlot
                key={index}
                flair={equippedFlair?.[index]}
                index={index}
              />
            ))}
          </div>

          <p className="text-[10px] text-[#A89485] text-center mb-3">
            {equippedCount > 0
              ? `${equippedCount}/3 equipped`
              : "Equip flair to boost yield"
            }
          </p>

          <button
            onClick={() => router.push("/?feature=flair")}
            className="mt-auto w-full py-2 rounded-xl text-[10px] font-bold bg-[#B48EF7]/10 text-[#8B5CF6] hover:bg-[#B48EF7]/20 transition-all flex items-center justify-center gap-1"
          >
            Manage <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white to-[#FFF8E7] flex items-center justify-center shadow-inner mb-2">
            <span className="text-2xl">📌</span>
          </div>
          <p className="text-[10px] text-[#5C4A3D] mb-2">
            Mint a pin to unlock flair
          </p>
          <button
            onClick={() => router.push("/?feature=flair")}
            className="w-full py-2 rounded-xl text-[10px] font-bold bg-[#82AD94]/10 text-[#5C946E] hover:bg-[#82AD94]/20 transition-all"
          >
            Get Your Pin
          </button>
        </div>
      )}
    </div>
  );
};
