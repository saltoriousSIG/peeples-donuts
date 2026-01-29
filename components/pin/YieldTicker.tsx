"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useFlairYield } from "@/hooks/useFlairYield";
import { TrendingUp, Coins } from "lucide-react";

interface YieldTickerProps {
  compact?: boolean;
}

export function YieldTicker({ compact = false }: YieldTickerProps) {
  const { claimableYield, hasClaimableYield, isLoading } = useFlairYield();
  const [displayValues, setDisplayValues] = useState<Record<string, number>>({});

  // Animate values counting up
  useEffect(() => {
    if (!claimableYield?.tokens) return;

    const targets: Record<string, number> = {};
    claimableYield.tokens.forEach((token) => {
      targets[token.symbol] = token.formattedAmount;
    });

    // Animate each value
    const duration = 1500;
    const fps = 30;
    const frames = (duration / 1000) * fps;
    let frame = 0;

    const interval = setInterval(() => {
      frame++;
      const progress = Math.min(frame / frames, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      const newValues: Record<string, number> = {};
      Object.entries(targets).forEach(([symbol, target]) => {
        const current = displayValues[symbol] || 0;
        newValues[symbol] = current + (target - current) * eased;
      });

      setDisplayValues(newValues);

      if (progress >= 1) {
        clearInterval(interval);
        setDisplayValues(targets);
      }
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [claimableYield]);

  if (isLoading) {
    return (
      <div className={cn("animate-pulse", compact ? "h-8" : "h-16", "bg-white/30 rounded-xl")} />
    );
  }

  if (!hasClaimableYield || !claimableYield) {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-2 rounded-xl",
          compact ? "p-2 bg-white/20" : "p-4 bg-white/30"
        )}
      >
        <TrendingUp className={cn("text-[#8B7355]", compact ? "w-4 h-4" : "w-5 h-5")} />
        <span className={cn("text-[#8B7355]", compact ? "text-xs" : "text-sm")}>
          Earning yield...
        </span>
      </div>
    );
  }

  if (compact) {
    // Compact mode: single line with total value
    const totalUsd = claimableYield.tokens.reduce(
      (sum, t) => sum + (displayValues[t.symbol] || 0),
      0
    );

    return (
      <div className="flex items-center gap-2 p-2 bg-[#82AD94]/10 rounded-xl">
        <Coins className="w-4 h-4 text-[#82AD94]" />
        <span className="text-sm font-bold text-[#82AD94]">
          ${totalUsd.toFixed(4)} claimable
        </span>
      </div>
    );
  }

  // Full mode: show each token
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-bold text-[#5C4A3D] uppercase tracking-wider">
        <TrendingUp className="w-3 h-3" />
        Claimable Yield
      </div>

      <div className="grid grid-cols-2 gap-2">
        {claimableYield.tokens.map((token) => (
          <div
            key={token.symbol}
            className="flex items-center justify-between p-3 bg-white/40 rounded-xl"
          >
            <span className="text-sm font-medium text-[#5C4A3D]">{token.symbol}</span>
            <span className="text-lg font-bold text-[#82AD94] tabular-nums">
              {(displayValues[token.symbol] || 0).toFixed(
                token.decimals > 6 ? 6 : token.decimals
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
