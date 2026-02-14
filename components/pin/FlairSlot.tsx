"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import {
  getFlairImagePath,
  RARITY_CONFIG,
} from "@/lib/flair-data";
import { type FlairItem } from "@/hooks/useFlair";

interface FlairSlotProps {
  flair: FlairItem | null;
  slotIndex: number;
  onEmptyClick?: () => void;
  disabled?: boolean;
}

export function FlairSlot({ flair, slotIndex, onEmptyClick, disabled }: FlairSlotProps) {
  if (!flair) {
    return (
      <button
        onClick={onEmptyClick}
        disabled={disabled}
        className={cn(
          "w-16 h-16 rounded-2xl border-2 border-dashed border-[#D4915D]/30",
          "bg-white/20 backdrop-blur-sm",
          "flex flex-col items-center justify-center gap-1",
          "transition-all duration-200",
          "hover:border-[#D4915D]/50 hover:bg-white/30",
          "hover:scale-105 active:scale-95",
          disabled && "opacity-50 cursor-not-allowed hover:scale-100"
        )}
      >
        <Plus className="w-5 h-5 text-[#D4915D]/50" />
        <span className="text-[8px] text-[#8B7355] font-medium">Slot {slotIndex + 1}</span>
      </button>
    );
  }

  const rarityStyle = RARITY_CONFIG[flair.rarity];

  return (
    <div
      className={cn(
        "relative w-16 h-16 rounded-2xl overflow-hidden",
        "border-2 shadow-md",
        "transition-all duration-200 hover:scale-105",
        rarityStyle.color.split(" ")[2] // Get border color
      )}
      style={{
        backgroundColor: rarityStyle.color.includes("amber")
          ? "#FEF3C7"
          : rarityStyle.color.includes("gray")
          ? "#F3F4F6"
          : rarityStyle.color.includes("yellow")
          ? "#FEF9C3"
          : "#F3E8FF",
      }}
    >
      {/* Flair Image */}
      <div className="relative w-full h-full">
        <Image
          src={getFlairImagePath(flair.gauge, flair.rarity)}
          alt={`${flair.gauge} ${flair.rarity}`}
          fill
          className="object-contain p-1"
        />
      </div>

      {/* Rarity indicator */}
      <div
        className={cn(
          "absolute top-0.5 left-0.5 px-1 rounded text-[6px] font-bold uppercase",
          rarityStyle.color
        )}
      >
        {flair.rarity.charAt(0)}
      </div>
    </div>
  );
}
