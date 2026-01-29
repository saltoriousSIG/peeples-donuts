"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { usePins } from "@/hooks/usePins";
import { useFlair } from "@/hooks/useFlair";
import { FlairSlot } from "./FlairSlot";
import { useFrameContext } from "@/providers/FrameSDKProvider";
import { Loader2 } from "lucide-react";

interface PinDisplayProps {
  onEmptySlotClick?: () => void;
}

export function PinDisplay({ onEmptySlotClick }: PinDisplayProps) {
  const { hasPin, pinId, isLoading: isPinLoading } = usePins();
  const { equippedFlair, isLoading: isFlairLoading } = useFlair();
  const { fUser } = useFrameContext();

  const isLoading = isPinLoading || isFlairLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="w-8 h-8 text-[#D4915D] animate-spin" />
        <p className="text-sm text-[#8B7355] mt-2">Loading your Pin...</p>
      </div>
    );
  }

  if (!hasPin) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-24 h-24 rounded-full bg-[#D4915D]/10 flex items-center justify-center">
          <span className="text-4xl opacity-50">🍩</span>
        </div>
        <p className="text-sm text-[#8B7355] mt-4">No Pin found</p>
      </div>
    );
  }

  // Construct pin image URL
  // In a real implementation, this would come from the pin metadata
  const pinImageUrl = fUser?.pfpUrl || "/media/pin-placeholder.png";

  return (
    <div className="flex flex-col items-center">
      {/* Main Pin Display */}
      <div className="relative">
        {/* Pin Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E85A71]/20 to-[#F4A627]/20 rounded-3xl blur-xl scale-110" />

        {/* Pin Card */}
        <div
          className={cn(
            "relative w-48 h-48 rounded-3xl overflow-hidden",
            "bg-gradient-to-br from-[#FFFDD0] to-[#FAF0DC]",
            "border-4 border-[#D4915D]/30",
            "shadow-2xl"
          )}
        >
          {/* Pin Image/Avatar */}
          <div className="relative w-full h-full">
            <Image
              src={pinImageUrl}
              alt="Your Pin"
              fill
              className="object-cover"
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#3D2914]/30 to-transparent" />
          </div>

          {/* Pin ID Badge */}
          <div className="absolute top-2 left-2 px-2 py-1 bg-black/30 backdrop-blur-sm rounded-lg">
            <span className="text-xs font-bold text-white">#{pinId}</span>
          </div>

          {/* Decorative donut hole */}
          <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full border-4 border-[#E85A71]/30" />
        </div>

        {/* Floating Flair Slots */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {equippedFlair.map((flair, index) => (
            <FlairSlot
              key={index}
              flair={flair}
              slotIndex={index}
              onEmptyClick={onEmptySlotClick}
            />
          ))}
        </div>
      </div>

      {/* Username */}
      {fUser && (
        <div className="mt-8 text-center">
          <p className="text-lg font-bold text-[#2D2319]">
            @{(fUser as any).username || "Anonymous"}
          </p>
          <p className="text-xs text-[#8B7355]">Peeples Donuts Member</p>
        </div>
      )}

      {/* Flair count indicator */}
      <div className="mt-3 flex items-center gap-2">
        {equippedFlair.map((flair, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              flair ? "bg-[#82AD94]" : "bg-[#D4915D]/30"
            )}
          />
        ))}
        <span className="text-[10px] text-[#8B7355] ml-1">
          {equippedFlair.filter((f) => f !== null).length}/3 Flair equipped
        </span>
      </div>
    </div>
  );
}
