"use client";

import React from "react";
import { formatEther, formatUnits, type Address } from "viem";
import { Zap, TrendingUp } from "lucide-react";

interface MinerState {
  epochId: bigint | number;
  initPrice: bigint;
  startTime: bigint | number;
  glazed: bigint;
  price: bigint;
  dps: bigint;
  nextDps: bigint;
  donutPrice: bigint;
  miner: Address;
  uri: string;
  ethBalance: bigint;
  wethBalance: bigint;
  donutBalance: bigint;
}

interface GlazeMetricsProps {
  minerState: MinerState | undefined;
  ethPrice: number;
}

const formatTokenAmount = (
  value: bigint,
  decimals: number,
  maximumFractionDigits = 2
) => {
  if (value === 0n) return "0";
  const asNumber = Number(formatUnits(value, decimals));
  if (!Number.isFinite(asNumber)) {
    return formatUnits(value, decimals);
  }
  return asNumber.toLocaleString(undefined, {
    maximumFractionDigits,
  });
};

export const GlazeMetrics: React.FC<GlazeMetricsProps> = ({
  minerState,
  ethPrice,
}) => {
  // Glaze Rate (emissions)
  const glazeRate = minerState?.nextDps ?? 0n;
  const glazeRateDisplay = formatTokenAmount(glazeRate, 18, 4);

  // Calculate glaze rate USD value
  const glazeRateUsdValue = minerState?.donutPrice
    ? (
        Number(formatUnits(minerState.nextDps, 18)) *
        Number(formatEther(minerState.donutPrice)) *
        ethPrice
      ).toFixed(4)
    : "0.0000";

  // Glaze Price
  const glazePrice = minerState?.price ?? 0n;
  const glazePriceEth = parseFloat(formatEther(glazePrice));
  const glazePriceDisplay = glazePriceEth.toFixed(glazePrice === 0n ? 0 : 5);

  // Calculate glaze price USD value
  const glazePriceUsd = (glazePriceEth * ethPrice).toFixed(2);

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Glaze Rate Card */}
      <div className="glazed-card p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#82AD94] to-[#6B9B7A] flex items-center justify-center shadow-sm">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#5C4A3D]">
            Glaze Rate
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-[#82AD94]">
              🍩{glazeRateDisplay}
            </span>
            <span className="text-xs text-[#5C4A3D]/70 font-medium">/s</span>
          </div>
          <div className="text-xs text-[#5C4A3D]/70">
            ${glazeRateUsdValue}/s
          </div>
        </div>
      </div>

      {/* Glaze Price Card */}
      <div className="glazed-card p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#E8A44C] to-[#D4933C] flex items-center justify-center shadow-sm">
            <TrendingUp className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#5C4A3D]">
            Glaze Price
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-[#E8A44C]">
            Ξ{glazePriceDisplay}
          </div>
          <div className="text-xs text-[#5C4A3D]/70">
            ${glazePriceUsd}
          </div>
        </div>
      </div>
    </div>
  );
};
