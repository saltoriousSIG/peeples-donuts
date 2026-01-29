"use client";

import React, { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatEther, formatUnits, zeroAddress, type Address } from "viem";
import { useQuery } from "@tanstack/react-query";
import { Crown, Sparkles } from "lucide-react";

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

interface KingGlazerCardProps {
  minerState: MinerState | undefined;
  ethPrice?: number;
  userAddress?: Address;
}

const formatAddress = (addr?: string) => {
  if (!addr) return "—";
  const normalized = addr.toLowerCase();
  if (normalized === zeroAddress) return "No miner";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
};

const initialsFrom = (label?: string) => {
  if (!label) return "";
  const stripped = label.replace(/[^a-zA-Z0-9]/g, "");
  if (!stripped) return label.slice(0, 2).toUpperCase();
  return stripped.slice(0, 2).toUpperCase();
};

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

export const KingGlazerCard: React.FC<KingGlazerCardProps> = ({
  minerState,
  ethPrice,
  userAddress,
}) => {
  const minerAddress = minerState?.miner ?? zeroAddress;
  const hasMiner = minerAddress !== zeroAddress;

  const { data: neynarUser } = useQuery<{
    user: {
      fid: number | null;
      username: string | null;
      displayName: string | null;
      pfpUrl: string | null;
    } | null;
  }>({
    queryKey: ["neynar-user", minerAddress],
    queryFn: async () => {
      const res = await fetch(
        `/api/neynar/user?address=${encodeURIComponent(minerAddress)}`
      );
      if (!res.ok) throw new Error("Failed to load Farcaster profile.");
      return await res.json();
    },
    enabled: hasMiner,
    staleTime: 60_000,
    retry: false,
  });

  const isYou = useMemo(() => {
    return (
      !!userAddress &&
      minerAddress.toLowerCase() === userAddress.toLowerCase()
    );
  }, [minerAddress, userAddress]);

  const displayName = neynarUser?.user?.displayName ??
    neynarUser?.user?.username ??
    formatAddress(minerAddress);

  const avatarUrl = neynarUser?.user?.pfpUrl ??
    `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(minerAddress.toLowerCase())}`;

  const glazePrice = minerState?.price ?? 0n;
  const glazePriceEth = parseFloat(formatEther(glazePrice));

  const dps = minerState?.nextDps ?? 0n;
  const dpsDisplay = formatTokenAmount(dps, 18, 4);

  // Calculate purchase price
  const purchasePrice = minerState?.initPrice ? minerState.initPrice / 2n : 0n;
  const purchasePriceEth = parseFloat(formatEther(purchasePrice));
  const purchasePriceUsd = ethPrice ? (purchasePriceEth * ethPrice).toFixed(2) : "0.00";

  return (
    <div className="glazed-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center shadow-md">
            <Crown className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-bold text-[#2D2319]">King Glazer</h3>
        </div>
        {isYou && (
          <div className="flex items-center gap-1 bg-[#FFD700]/20 px-2 py-0.5 rounded-full">
            <Sparkles className="w-2.5 h-2.5 text-[#FFD700]" />
            <span className="text-[9px] font-bold text-[#CD7F32]">You!</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-[#FFD700]/30">
          <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
          <AvatarFallback className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-white text-xs">
            {initialsFrom(displayName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-[#2D2319] truncate">
            {displayName}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#5C4A3D]">
            <div className="flex items-center gap-1">
              <span className="text-base">🍩</span>
              <span className="font-semibold">{dpsDisplay}/s</span>
            </div>
            <div className="w-px h-3 bg-[#A89485]/30" />
            <div className="flex items-center gap-1">
              <span className="text-[#82AD94] font-semibold">Ξ{glazePriceEth.toFixed(5)}</span>
            </div>
          </div>
          <div className="text-[10px] text-[#5C4A3D]/60 mt-1">
            Purchased for: Ξ{purchasePriceEth.toFixed(5)} (${purchasePriceUsd})
          </div>
        </div>
      </div>
    </div>
  );
};
