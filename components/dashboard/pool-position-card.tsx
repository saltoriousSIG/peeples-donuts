"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePool } from "@/providers/PoolProvider";
import { formatUnits } from "viem";
import { Droplets, TrendingUp, ArrowRight, Coins } from "lucide-react";

interface PoolPositionCardProps {
  ethPrice: number;
  donutPrice: number;
}

export const PoolPositionCard: React.FC<PoolPositionCardProps> = ({
  ethPrice,
  donutPrice,
}) => {
  const router = useRouter();
  const { tvl, shareTokenBalance, shareTokenTotalSupply, state } = usePool();

  const sharePercentage =
    shareTokenBalance && shareTokenTotalSupply && shareTokenTotalSupply > 0n
      ? (
          (parseFloat(shareTokenBalance.toString()) /
            parseFloat(shareTokenTotalSupply.toString())) *
          100
        ).toFixed(2)
      : "0.00";

  const hasPosition = shareTokenBalance && shareTokenBalance > 0n;

  // Calculate user's share value
  const userWethValue =
    hasPosition && tvl?.wethTVL
      ? (parseFloat(formatUnits(tvl.wethTVL, 18)) *
          parseFloat(sharePercentage)) /
        100
      : 0;

  const userDonutValue =
    hasPosition && tvl?.donutTVL
      ? (parseFloat(formatUnits(tvl.donutTVL, 18)) *
          parseFloat(sharePercentage)) /
        100
      : 0;

  const userTotalUsdValue =
    userWethValue * ethPrice + userDonutValue * donutPrice;

  return (
    <div className="glazed-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-[#82AD94]" />
          <h3 className="text-lg font-bold text-[#2D2319]">Pool Position</h3>
        </div>
        <span className="text-[10px] text-[#A89485] bg-white/50 px-2 py-1 rounded-full">
          {state?.numPoolParticipants?.toString() ?? "0"} bakers
        </span>
      </div>

      {hasPosition ? (
        <>
          {/* Hero Stats */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#82AD94] to-[#5C946E] p-5 mb-4">
            <div className="absolute top-2 right-4 w-16 h-16 rounded-full bg-white/10 blur-xl" />
            <div className="absolute bottom-0 left-4 w-12 h-12 rounded-full bg-white/5 blur-lg" />

            <div className="relative">
              <div className="text-white/70 text-xs mb-1 flex items-center gap-1">
                <Coins className="w-3 h-3" />
                Total Value
              </div>
              <div className="text-3xl font-bold text-white coming-soon">
                ${userTotalUsdValue.toFixed(2)}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="bg-white/20 rounded-lg px-2 py-1">
                  <span className="text-[10px] text-white/70">Share</span>
                  <div className="text-sm font-bold text-white">{sharePercentage}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white/30 rounded-xl p-3 mb-4">
            <div className="flex justify-between items-center py-1.5 border-b border-[#2D2319]/10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#5C946E] to-[#82AD94] flex items-center justify-center text-[10px]">
                  Ξ
                </div>
                <span className="text-xs text-[#5C4A3D]">{userWethValue.toFixed(4)} WETH</span>
              </div>
              <span className="text-xs font-semibold text-[#5C4A3D]">
                ${(userWethValue * ethPrice).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FFB5BA] to-[#E8919A] flex items-center justify-center text-[10px]">
                  🍩
                </div>
                <span className="text-xs text-[#5C4A3D]">{userDonutValue.toFixed(2)} DONUT</span>
              </div>
              <span className="text-xs font-semibold text-[#5C4A3D]">
                ${(userDonutValue * donutPrice).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/pool")}
              className="btn-glazed flex-1 py-2.5 text-xs"
            >
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              Deposit
            </button>
            <button
              onClick={() => router.push("/pool")}
              className="btn-glazed btn-strawberry flex-1 py-2.5 text-xs"
            >
              Withdraw
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-white to-[#FFF8E7] flex items-center justify-center shadow-inner">
            <span className="text-4xl">🏊</span>
          </div>
          <h3 className="text-lg font-bold text-[#2D2319] mb-2">Join the Pool</h3>
          <p className="text-sm text-[#5C4A3D] mb-4 max-w-[200px] mx-auto">
            Pool together, earn together. Deposit WETH to start earning.
          </p>
          <button
            onClick={() => router.push("/pool")}
            className="btn-glazed w-full py-3 text-sm"
          >
            <Droplets className="w-4 h-4 mr-2" />
            Join the Pool
          </button>
        </div>
      )}
    </div>
  );
};
