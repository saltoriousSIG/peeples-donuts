"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useFlairYield } from "@/hooks/useFlairYield";
import { useFrameContext } from "@/providers/FrameSDKProvider";
import { Loader2, Coins, Share2 } from "lucide-react";

interface ClaimButtonProps {
  onClaimSuccess?: () => void;
}

export function ClaimButton({ onClaimSuccess }: ClaimButtonProps) {
  const { sdk, fUser } = useFrameContext();
  const { hasClaimableYield, claimableYield, isClaiming, claimYield } = useFlairYield();
  const [showSharePrompt, setShowSharePrompt] = useState(false);
  const shareEmbed = `${typeof window !== "undefined" ? window.location.origin : "https://peeplesdonuts.com"}/?fid=${fUser?.fid || ""}`;

  const handleClaim = async () => {
    await claimYield();
    setShowSharePrompt(true);
    onClaimSuccess?.();
  };

  const handleShare = () => {
    const yieldSummary = claimableYield?.tokens
      .map((t) => `${t.formattedAmount.toFixed(4)} ${t.symbol}`)
      .join(", ");

    sdk.actions.composeCast({
      text: `Just claimed my yield from Peeples Donuts: ${yieldSummary}! The glazed life is good.`,
      embeds: [shareEmbed],
    });
    setShowSharePrompt(false);
  };

  if (!hasClaimableYield) {
    return (
      <div className="p-4 bg-white/30 rounded-2xl text-center">
        <Coins className="w-6 h-6 mx-auto mb-2 text-[#D4915D]/50" />
        <p className="text-sm text-[#8B7355]">
          Your flair is earning yield...
        </p>
        <p className="text-xs text-[#A89485] mt-1">
          Check back soon to claim
        </p>
      </div>
    );
  }

  // Share prompt after claim
  if (showSharePrompt) {
    return (
      <div className="p-4 bg-[#82AD94]/10 rounded-2xl space-y-3">
        <div className="text-center">
          <span className="text-2xl">🎉</span>
          <p className="text-sm font-bold text-[#2D2319] mt-1">Yield Claimed!</p>
        </div>

        <button
          onClick={handleShare}
          className={cn(
            "w-full py-3 rounded-xl font-bold text-sm",
            "bg-gradient-to-r from-[#E85A71] to-[#C94A5C]",
            "text-white shadow-md hover:shadow-lg",
            "hover:scale-[1.02] active:scale-[0.98]",
            "transition-all duration-200",
            "flex items-center justify-center gap-2"
          )}
        >
          <Share2 className="w-4 h-4" />
          Share Your Claim
        </button>

        <button
          onClick={() => setShowSharePrompt(false)}
          className="w-full py-2 text-xs text-[#8B7355] hover:text-[#5C4A3D]"
        >
          Maybe later
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleClaim}
      disabled={isClaiming}
      className={cn(
        "relative w-full py-4 rounded-2xl font-bold text-lg",
        "bg-gradient-to-r from-[#82AD94] to-[#5C946E]",
        "text-white shadow-lg hover:shadow-xl",
        "hover:scale-[1.02] active:scale-[0.98]",
        "transition-all duration-200",
        "flex items-center justify-center gap-2",
        // Pulse animation when yield is available
        !isClaiming && "animate-pulse-subtle",
        isClaiming && "opacity-80 cursor-wait"
      )}
    >
      {isClaiming ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Claiming...
        </>
      ) : (
        <>
          <Coins className="w-5 h-5" />
          Claim Yield
        </>
      )}

      {/* Glow effect */}
      {!isClaiming && (
        <div className="absolute inset-0 rounded-2xl bg-[#82AD94]/20 blur-xl -z-10 animate-pulse" />
      )}
    </button>
  );
}
