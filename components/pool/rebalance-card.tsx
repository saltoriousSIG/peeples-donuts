"use client";

import React, { useState } from "react";
import { useReadContract, useAccount } from "wagmi";
import { base } from "wagmi/chains";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { DATA } from "@/lib/abi/data";
import { RefreshCw, Clock, User, TrendingUp } from "lucide-react";
import { formatUnits } from "viem";
import { toast } from "sonner";
import useContract, { ExecutionType } from "@/hooks/useContract";

export const RebalanceCard: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [isRebalancing, setIsRebalancing] = useState(false);

  // Get rebalance info from contract
  const { data: rebalanceInfo, refetch: refetchRebalanceInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.pool as `0x${string}`,
    abi: DATA,
    functionName: "getRebalanceInfo",
    args: [],
    chainId: base.id,
    query: {
      enabled: !!CONTRACT_ADDRESSES.pool,
      refetchInterval: 10_000,
    },
  });

  // Contract execution hook - adjust function name if needed (could be "checkAndFinalize" or "rebalance")
  const executeRebalance = useContract(ExecutionType.WRITABLE, "Manage", "rebalance");

  // Parse rebalance info
  const rebalanceData = React.useMemo(() => {
    if (!rebalanceInfo || !Array.isArray(rebalanceInfo)) {
      return {
        thresholdBps: 0,
        lastRebalanceTime: 0,
        lastRebalancer: "0x0",
        lastDonutSwapped: 0,
      };
    }

    return {
      thresholdBps: Number(rebalanceInfo[0]) / 100, // Convert basis points to percentage
      lastRebalanceTime: Number(rebalanceInfo[1]),
      lastRebalancer: rebalanceInfo[2] as string,
      lastDonutSwapped: parseFloat(formatUnits(rebalanceInfo[3] as bigint, 18)),
    };
  }, [rebalanceInfo]);

  // Calculate time since last rebalance
  const timeSinceRebalance = React.useMemo(() => {
    if (!rebalanceData.lastRebalanceTime) return "Never";

    const now = Math.floor(Date.now() / 1000);
    const diff = now - rebalanceData.lastRebalanceTime;

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }, [rebalanceData.lastRebalanceTime]);

  const handleRebalance = async () => {
    if (!isConnected || !address) {
      toast.error("Wallet not connected");
      return;
    }

    setIsRebalancing(true);
    try {
      await executeRebalance([]);
      toast.success("Pool rebalanced successfully!");

      // Refetch rebalance info after successful rebalance
      setTimeout(() => {
        refetchRebalanceInfo();
      }, 2000);
    } catch (error: any) {
      toast.error("Rebalance failed", {
        description: error.message || "An error occurred while rebalancing",
      });
    } finally {
      setIsRebalancing(false);
    }
  };

  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr || addr === "0x0") return "N/A";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="glazed-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#82AD94] to-[#5C946E] flex items-center justify-center shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2D2319]">Pool Rebalance</h2>
            <p className="text-sm text-[#5C4A3D]">Optimize strategy allocations</p>
          </div>
        </div>
      </div>

      {/* Rebalance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Threshold */}
        <div className="bg-gradient-to-br from-white to-[#FFF8E7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="w-4 h-4 text-[#82AD94]" />
            <span className="text-xs font-bold text-[#5C4A3D] uppercase tracking-wider">
              Threshold
            </span>
          </div>
          <div className="text-2xl font-bold text-[#2D2319]">
            {rebalanceData.thresholdBps}%
          </div>
          <p className="text-xs text-[#A89485] mt-1">Rebalance trigger</p>
        </div>

        {/* Last Rebalance */}
        <div className="bg-gradient-to-br from-white to-[#FFF8E7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-[#82AD94]" />
            <span className="text-xs font-bold text-[#5C4A3D] uppercase tracking-wider">
              Last Rebalance
            </span>
          </div>
          <div className="text-2xl font-bold text-[#2D2319]">
            {timeSinceRebalance}
          </div>
          <p className="text-xs text-[#A89485] mt-1">
            {rebalanceData.lastRebalanceTime
              ? new Date(rebalanceData.lastRebalanceTime * 1000).toLocaleDateString()
              : "Never"}
          </p>
        </div>

        {/* Last Rebalancer */}
        <div className="bg-gradient-to-br from-white to-[#FFF8E7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-[#82AD94]" />
            <span className="text-xs font-bold text-[#5C4A3D] uppercase tracking-wider">
              Last Rebalancer
            </span>
          </div>
          <div className="text-lg font-bold text-[#2D2319] font-mono">
            {formatAddress(rebalanceData.lastRebalancer)}
          </div>
          <p className="text-xs text-[#A89485] mt-1">Address</p>
        </div>
      </div>

      {/* DONUT Swapped Info */}
      {rebalanceData.lastDonutSwapped > 0 && (
        <div className="bg-gradient-to-r from-[#82AD94]/10 to-[#5C946E]/10 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#2D2319]">
              Last Swap Amount
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍩</span>
              <span className="text-lg font-bold text-[#2D2319]">
                {rebalanceData.lastDonutSwapped.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}{" "}
                DONUT
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Rebalance Button */}
      <button
        onClick={handleRebalance}
        disabled={isRebalancing || !isConnected}
        className="btn-glazed w-full h-14 flex items-center justify-center gap-3 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: "linear-gradient(135deg, #82AD94 0%, #5C946E 100%)",
        }}
      >
        {isRebalancing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Rebalancing...
          </>
        ) : (
          <>
            <RefreshCw className="w-5 h-5" />
            Trigger Rebalance
          </>
        )}
      </button>

      {/* Info Footer */}
      <div className="mt-4 pt-4 border-t border-[#2D2319]/10">
        <p className="text-xs text-[#A89485] text-center leading-relaxed">
          Rebalancing optimizes the distribution of assets across strategies based on
          voting results and performance metrics. Anyone can trigger a rebalance when
          the threshold is met.
        </p>
      </div>
    </div>
  );
};
