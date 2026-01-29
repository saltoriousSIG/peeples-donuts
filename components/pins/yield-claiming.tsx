"use client";

import React from "react";
import { useFlairYield } from "@/hooks/useFlairYield";
import { TrendingUp, Coins, Sparkles } from "lucide-react";

interface YieldClaimingProps {
  ethPrice: number;
  donutPrice: number;
}

export const YieldClaiming: React.FC<YieldClaimingProps> = ({
  ethPrice,
  donutPrice,
}) => {
  const { claimableYield, hasClaimableYield, claimYield, isClaiming, isLoading } = useFlairYield();

  // Extract WETH and DONUT amounts from tokens array
  const wethToken = claimableYield?.tokens.find(t => t.symbol === "WETH");
  const donutToken = claimableYield?.tokens.find(t => t.symbol === "DONUT");
  const totalWethClaimable = wethToken?.formattedAmount ?? 0;
  const totalDonutClaimable = donutToken?.formattedAmount ?? 0;

  const totalUsdValue =
    totalWethClaimable * ethPrice + totalDonutClaimable * donutPrice;

  return (
    <div className="glazed-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-[#82AD94]" />
        <h2 className="text-lg font-bold text-[#2D2319]">Your Rewards</h2>
      </div>

      {/* Total Claimable - Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#82AD94] to-[#5C946E] p-5 mb-4">
        {/* Decorative elements */}
        <div className="absolute top-2 right-4 w-16 h-16 rounded-full bg-white/10 blur-xl" />
        <div className="absolute bottom-0 left-4 w-12 h-12 rounded-full bg-white/5 blur-lg" />

        <div className="relative">
          <div className="text-white/70 text-sm mb-1 flex items-center gap-1">
            <Coins className="w-4 h-4" />
            Total Claimable
          </div>
          <div className="text-4xl font-bold text-white amatic">
            ${totalUsdValue.toFixed(2)}
          </div>

          {/* Show all claimable tokens */}
          {claimableYield && claimableYield.tokens.length > 0 && (
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {claimableYield.tokens.map((token, index) => (
                <React.Fragment key={token.address}>
                  {index > 0 && <div className="text-white/50">+</div>}
                  <div className="bg-white/20 rounded-lg px-3 py-1.5">
                    <span className="text-xs text-white/70">{token.symbol}</span>
                    <div className="text-sm font-bold text-white">
                      {token.formattedAmount.toFixed(token.symbol === "WETH" ? 6 : 2)}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}

          {(!claimableYield || claimableYield.tokens.length === 0) && (
            <div className="flex items-center gap-3 mt-3">
              <div className="bg-white/20 rounded-lg px-3 py-1.5">
                <span className="text-xs text-white/70">WETH</span>
                <div className="text-sm font-bold text-white">0.000000</div>
              </div>
              <div className="text-white/50">+</div>
              <div className="bg-white/20 rounded-lg px-3 py-1.5">
                <span className="text-xs text-white/70">DONUT</span>
                <div className="text-sm font-bold text-white">0.00</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Claim All Button */}
      <button
        onClick={claimYield}
        disabled={!hasClaimableYield || isClaiming}
        className={`btn-glazed w-full flex items-center justify-center gap-2 ${
          !hasClaimableYield ? "opacity-50" : ""
        }`}
      >
        {isClaiming ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Claiming...
          </>
        ) : hasClaimableYield ? (
          <>
            <Sparkles className="w-5 h-5" />
            Claim All Rewards
          </>
        ) : (
          <>
            <Coins className="w-5 h-5" />
            Nothing to Claim
          </>
        )}
      </button>

      {/* Info footer */}
      <div className="mt-4 pt-4 border-t border-[#2D2319]/10">
        <div className="flex justify-between text-xs text-[#A89485]">
          <span>Yield from equipped flair</span>
          <span className="text-[#5C4A3D] font-semibold">
            {claimableYield?.totalCount ?? 0} token{(claimableYield?.totalCount ?? 0) !== 1 ? 's' : ''} available
          </span>
        </div>
      </div>
    </div>
  );
};
