"use client";

import React from "react";
import { useFlairYield } from "@/hooks/useFlairYield";
import { TrendingUp, Sparkles, Coins } from "lucide-react";

interface YieldOverviewProps {
  ethPrice: number;
  donutPrice: number;
}

export const YieldOverview: React.FC<YieldOverviewProps> = ({
  ethPrice,
  donutPrice,
}) => {
  const { claimableYield, claimYield, isLoading, isClaiming } = useFlairYield();

  // Extract WETH and DONUT amounts from the tokens array
  const wethToken = claimableYield?.tokens.find(t => t.symbol === "WETH");
  const donutToken = claimableYield?.tokens.find(t => t.symbol === "DONUT");
  const totalWethClaimable = wethToken?.formattedAmount ?? 0;
  const totalDonutClaimable = donutToken?.formattedAmount ?? 0;

  const totalUsdValue =
    totalWethClaimable * ethPrice + totalDonutClaimable * donutPrice;

  const hasClaimable = totalWethClaimable > 0 || totalDonutClaimable > 0;

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

  return (
    <div className="glazed-card p-4 h-full flex flex-col">
      <div className="flex items-center gap-1.5 mb-3">
        <TrendingUp className="w-4 h-4 text-[#82AD94]" />
        <h3 className="text-sm font-bold text-[#2D2319]">Rewards</h3>
      </div>

      <div className="flex-1">
        <div className="text-center mb-3">
          <div className="text-[10px] text-[#A89485] mb-0.5 flex items-center justify-center gap-1">
            <Coins className="w-3 h-3" />
            Claimable
          </div>
          <div className={`text-2xl font-bold amatic ${hasClaimable ? 'text-[#82AD94]' : 'text-[#5C4A3D]'}`}>
            ${totalUsdValue.toFixed(2)}
          </div>
        </div>

        {hasClaimable && (
          <div className="bg-white/30 rounded-lg p-2 mb-3 space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-[#5C4A3D]">{totalWethClaimable.toFixed(6)} WETH</span>
              <span className="text-[#A89485]">${(totalWethClaimable * ethPrice).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-[#5C4A3D]">{totalDonutClaimable.toFixed(2)} DONUT</span>
              <span className="text-[#A89485]">${(totalDonutClaimable * donutPrice).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={claimYield}
        disabled={!hasClaimable || isClaiming}
        className={`w-full py-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${
          hasClaimable
            ? 'bg-[#82AD94]/10 text-[#5C946E] hover:bg-[#82AD94]/20'
            : 'bg-[#A89485]/10 text-[#A89485] cursor-not-allowed'
        }`}
      >
        {isClaiming ? (
          <>
            <div className="w-3 h-3 border-2 border-[#5C946E]/30 border-t-[#5C946E] rounded-full animate-spin" />
            Claiming...
          </>
        ) : hasClaimable ? (
          <>
            <Sparkles className="w-3 h-3" />
            Claim All
          </>
        ) : (
          "Nothing to Claim"
        )}
      </button>
    </div>
  );
};
