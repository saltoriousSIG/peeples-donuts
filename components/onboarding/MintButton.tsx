"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface MintButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isMinting: boolean;
  mintStep: string;
  mintProgress: number;
  mode: "paid" | "free";
}

const STEP_LABELS: Record<string, string> = {
  idle: "Mint & Join",
  approving: "Approving WETH...",
  depositing: "Depositing...",
  minting_pin: "Minting Pin...",
  buying_flair: "Buying Flair...",
  equipping: "Equipping Flair...",
  complete: "Complete!",
};

export function MintButton({
  onClick,
  disabled,
  isMinting,
  mintStep,
  mintProgress,
  mode,
}: MintButtonProps) {
  const label = isMinting
    ? STEP_LABELS[mintStep] || "Processing..."
    : mode === "free"
    ? "Claim Your Free Pin"
    : "Mint & Join";

  return (
    <div className="space-y-2">
      <button
        onClick={onClick}
        disabled={disabled || isMinting}
        className={cn(
          "relative w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300",
          "overflow-hidden",
          isMinting
            ? "bg-[#D4915D] cursor-wait"
            : disabled
            ? "bg-[#D4915D]/40 cursor-not-allowed"
            : "bg-gradient-to-r from-[#E85A71] to-[#C94A5C] hover:from-[#D14A61] hover:to-[#B93A4C]",
          "text-white shadow-lg hover:shadow-xl",
          "hover:scale-[1.02] active:scale-[0.98]",
          disabled && "hover:scale-100 active:scale-100"
        )}
      >
        {/* Progress bar background */}
        {isMinting && (
          <div
            className="absolute inset-0 bg-[#82AD94] transition-all duration-500 ease-out"
            style={{ width: `${mintProgress}%` }}
          />
        )}

        {/* Button content */}
        <span className="relative flex items-center justify-center gap-2">
          {isMinting && <Loader2 className="w-5 h-5 animate-spin" />}
          {label}
        </span>
      </button>

      {/* Progress indicator */}
      {isMinting && (
        <div className="flex items-center justify-center gap-2">
          <div className="h-1.5 flex-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#82AD94] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${mintProgress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-[#5C4A3D] min-w-[3ch]">
            {mintProgress}%
          </span>
        </div>
      )}
    </div>
  );
}
