"use client";
import { Button } from "@/components/ui/button";
import { useCanBuyGlaze } from "@/hooks/useCanBuyGlaze";
import { Badge } from "@/components/ui/badge";
import { usePool } from "@/providers/PoolProvider";
import { formatUnits } from "viem";

interface BuyKingGlazerProps {}

export function BuyKingGlazer({}: BuyKingGlazerProps) {
  const { canBuy, currentBreakEven, targetBreakEven } = useCanBuyGlaze();
  const { config, buyKingGlazer, state } = usePool();
  if (state?.isActive) {
    return (
      <div className="bg-gradient-to-br from-[#5C946E] via-[#4ECDC4] to-[#5C946E] rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-4 -mb-4" />

        <div className="relative space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="inline-block px-2 py-0.5 rounded bg-white/25 mb-1.5">
                <span className="text-[9px] font-bold text-white tracking-widest">
                  KING GLAZER
                </span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                The Pool Wears the Crown
              </h3>
              <p className="text-xs text-white/80 mt-1">
                Earning <span className="font-bold">$DONUT</span> for all pool
                members
              </p>
            </div>

            <div className="px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider border bg-white/30 text-white border-white/40 flex-shrink-0 animate-pulse">
              REIGNING
            </div>
          </div>

          <p className="text-[10px] text-white/70 leading-relaxed px-1">
            Hold the crown as long as possible to maximize pool rewards. Another
            buyer can take it anytime!
          </p>

          <div className="w-full bg-white/20 text-white font-bold text-sm tracking-wide h-10 rounded-lg flex items-center justify-center">
            DEFENDING THE CROWN
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-gradient-to-br from-[#F4A259] via-[#F4A259] to-[#BC4B51] rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-500" />

      <div className="relative space-y-3">
        {/* Header with badge and title */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="inline-block px-2 py-0.5 rounded bg-white/25 mb-1.5">
              <span className="text-[11px] font-bold text-black tracking-widest">
                POOL REWARD
              </span>
            </div>
            <h3 className="text-base font-bold text-black tracking-tight">
              Buy King Glazer for the Pool
            </h3>
            <span className="text-sm text-black/80 mt-1">
              Trigger the purchase and earn{" "}
              <Badge className="font-bold flex items-center justify-center bg-green-500 w-fit text-black p-0 pt-1 px-1">
                +{formatUnits(config?.reward?.peeplesReward || 0n, 18)} $PEEPLES
              </Badge>
            </span>
          </div>

          {/* Status Badge */}
          <div
            className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider border flex-shrink-0 ${
              canBuy
                ? "bg-green-400/30 text-black border-white/30"
                : "bg-white/20 text-black/60 border-white/20"
            }`}
          >
            {canBuy ? "✓ ACTIVE" : "INACTIVE"}
          </div>
        </div>

        {/* Break-even metrics */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/15 backdrop-blur-sm border border-white/20">
          <div className="flex-1 text-center">
            <div className="text-[11px] text-black/60 font-semibold tracking-wide mb-0.5">
              CURRENT
            </div>
            <div className="text-xl font-bold text-black tabular-nums">
              {currentBreakEven}m
            </div>
          </div>
          <div className="text-black/30 text-lg">≤</div>
          <div className="flex-1 text-center">
            <div className="text-[11px] text-black/60 font-semibold tracking-wide mb-0.5">
              THRESHOLD
            </div>
            <div className="text-xl font-bold text-black tabular-nums">
              {targetBreakEven}m
            </div>
          </div>
        </div>

        {/* Explanation text */}
        <p className="text-[12px] text-black/70 leading-relaxed px-1">
          Buy becomes active when current break-even time is at or below the
          threshold. Anyone can trigger for rewards!
        </p>

        {/* Action button */}
        <Button
          onClick={buyKingGlazer}
          disabled={!canBuy}
          className="w-full bg-white text-[#BC4B51] hover:bg-white/95 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-bold text-sm tracking-wide h-10 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          {canBuy ? "BUY KING GLAZER" : "WAITING FOR CONDITIONS"}
        </Button>
      </div>
    </div>
  );
}
