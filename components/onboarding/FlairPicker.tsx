"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  FLAIR_TOKENS,
  type GaugeName,
  type FlairTokenData,
  getFlairImagePath,
  GAUGE_ICONS,
} from "@/lib/flair-data";

interface FlairPickerProps {
  onSelect: (flair: FlairTokenData) => void;
  selectedFlair: FlairTokenData | null;
  disabled?: boolean;
}

// Get only Bronze flair for onboarding (tokens 1, 5, 9, 13, 17)
const BRONZE_FLAIR = FLAIR_TOKENS.filter((f) => f.rarity === "Bronze");

// Yield descriptions for each gauge
const GAUGE_YIELD_INFO: Record<GaugeName, { yieldToken: string; description: string }> = {
  Donut: { yieldToken: "DONUT", description: "Earn DONUT tokens" },
  Teller: { yieldToken: "FEES", description: "Earn protocol fees" },
  "Donut wETH LP": { yieldToken: "LP", description: "Earn LP tokens" },
  Aerodrome: { yieldToken: "AERO", description: "Earn Aerodrome" },
  Clanker: { yieldToken: "CLANKER", description: "Earn Clanker tokens" },
  QR: { yieldToken: "QR", description: "Earn QR tokens" },
  USDC: { yieldToken: "USDC", description: "Earn USDC stables" },
};

export function FlairPicker({ onSelect, selectedFlair, disabled }: FlairPickerProps) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-bold text-[#5C4A3D] uppercase tracking-wider">
        Choose Your Flair
      </div>
      <p className="text-xs text-[#8B7355]">
        Your flair determines what yield you earn. Pick wisely!
      </p>

      <div className="grid grid-cols-5 gap-2">
        {BRONZE_FLAIR.map((flair) => {
          const isSelected = selectedFlair?.tokenId === flair.tokenId;
          return (
            <button
              key={flair.tokenId}
              onClick={() => !disabled && onSelect(flair)}
              disabled={disabled}
              className={cn(
                "relative flex flex-col items-center p-2 rounded-xl transition-all duration-200",
                "border-2",
                isSelected
                  ? "border-[#E85A71] bg-[#E85A71]/10 scale-105 shadow-lg"
                  : "border-[#D4915D]/20 bg-white/50 hover:bg-white/70 hover:border-[#D4915D]/40",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {/* Flair Image */}
              <div className="relative w-12 h-12 mb-1">
                <Image
                  src={getFlairImagePath(flair.gauge, flair.rarity)}
                  alt={`${flair.gauge} ${flair.rarity}`}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Icon */}
              <span className="text-lg">{GAUGE_ICONS[flair.gauge]}</span>

              {/* Gauge name */}
              <span className="text-[9px] font-semibold text-[#5C4A3D] text-center leading-tight mt-1">
                {flair.gauge === "Donut wETH LP" ? "LP" : flair.gauge}
              </span>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#E85A71] rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected flair info */}
      {selectedFlair && (
        <div className="mt-3 p-3 bg-white/50 rounded-xl border border-[#D4915D]/20">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src={getFlairImagePath(selectedFlair.gauge, selectedFlair.rarity)}
                alt={selectedFlair.gauge}
                fill
                className="object-contain"
              />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-[#2D2319]">
                {selectedFlair.gauge} {selectedFlair.rarity}
              </div>
              <div className="text-xs text-[#82AD94] font-medium">
                {GAUGE_YIELD_INFO[selectedFlair.gauge].description}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
