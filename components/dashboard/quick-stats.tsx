"use client";

import React from "react";
import { usePool } from "@/providers/PoolProvider";
import { formatUnits } from "viem";
import { SundayCountdown } from "@/components/sunday-countdown";
import { TrendingUp, Target, Award, Clock } from "lucide-react";

interface QuickStatsProps {
  ethPrice: number;
  donutPrice: number;
}

const STRATEGY_NAMES: Record<number, string> = {
  0: "Conservative",
  1: "Moderate",
  2: "Aggressive",
  3: "Degen",
};

export const QuickStats: React.FC<QuickStatsProps> = ({
  ethPrice,
  donutPrice,
}) => {
  const { tvl, config, shareTokenBalance, shareTokenTotalSupply } = usePool();

  // Calculate total TVL in USD
  const wethTvlUsd = tvl?.wethTVL
    ? parseFloat(formatUnits(tvl.wethTVL, 18)) * ethPrice
    : 0;
  const donutTvlUsd = tvl?.donutTVL
    ? parseFloat(formatUnits(tvl.donutTVL, 18)) * donutPrice
    : 0;
  const totalTvlUsd = wethTvlUsd + donutTvlUsd;

  // Current strategy
  const strategyId = config?.strategy ?? 0;
  const strategyName = STRATEGY_NAMES[strategyId] ?? "Unknown";

  // User rank (simplified - based on share percentage)
  const userRank = (() => {
    if (!shareTokenBalance || !shareTokenTotalSupply || shareTokenTotalSupply === 0n) {
      return "—";
    }
    const sharePercent =
      (parseFloat(shareTokenBalance.toString()) /
        parseFloat(shareTokenTotalSupply.toString())) *
      100;
    if (sharePercent >= 10) return "Whale";
    if (sharePercent >= 5) return "Baker";
    if (sharePercent >= 1) return "Regular";
    return "Newbie";
  })();

  const stats = [
    {
      label: "Pool TVL",
      value: `$${totalTvlUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      color: "text-[#82AD94]",
    },
    {
      label: "Strategy",
      value: strategyName,
      icon: Target,
      color: "text-[#FFD700]",
    },
    {
      label: "Your Rank",
      value: userRank,
      icon: Award,
      color: "text-[#B48EF7]",
    },
    {
      label: "Next Epoch",
      value: <SundayCountdown compact />,
      icon: Clock,
      color: "text-[#FFB5BA]",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="glazed-card p-2.5 text-center animate-scale-in"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <stat.icon className={`w-4 h-4 mx-auto mb-1.5 ${stat.color}`} />
          <div className="text-[9px] font-bold uppercase tracking-wide text-[#A89485] mb-0.5">
            {stat.label}
          </div>
          <div className="text-xs font-bold text-[#2D2319]">
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
};
