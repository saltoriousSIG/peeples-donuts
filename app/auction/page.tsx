"use client";

import { useState, useMemo, useCallback } from "react";
import { useFrameContext } from "@/providers/FrameSDKProvider";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAccount, useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { zeroAddress, formatUnits, parseUnits } from "viem";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { ERC20 } from "@/lib/abi/erc20";
import { getEthPrice } from "@/lib/utils";
import { NavBar } from "@/components/nav-bar";
import { PageHeader, type MiniAppContext } from "@/components/page-header";
import { PoolProvider, usePool } from "@/providers/PoolProvider";
import { AuctionTabs } from "@/components/auction/auction-tabs";
import { BlazeryContent } from "@/components/auction/blazery-content";
import { Countdown } from "@/components/countdown";
import { toast } from "sonner";

const formatBidAmount = (amount: number): string => {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(2)}B`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(2)}K`;
  }
  return amount.toLocaleString();
};

function AuctionContent() {
  const [bidAmount, setBidAmount] = useState("");
  const { currentAuction, minAuctionBid, auctionBid, config } = usePool();
  const { address } = useAccount();
  const [feeRecipientAddress, setFeeRecipientAddress] = useState<string>(address as string);

  const isAuctionActive = useMemo(() => {
    return currentAuction && currentAuction.highestBidder !== "0x0000000000000000000000000000000000000000";
  }, [currentAuction]);

  const { data: currentFeeRecipient } = useQuery({
    queryKey: ['currentFeeRecipient', config?.feeRecipient],
    enabled: !!config?.feeRecipient,
    queryFn: async () => {
      const { data: { user } } = await axios.get(`/api/neynar/user?address=${config?.feeRecipient}`);
      return {
        avatar: user.pfpUrl,
        name: user.displayName,
        handle: user.username,
      };
    },
    staleTime: 60000,
  });

  const { data: highestBidderData } = useQuery({
    queryKey: ['highestBidder', currentAuction?.highestBidder],
    enabled: !!currentAuction?.highestBidder && currentAuction.highestBidder !== zeroAddress,
    queryFn: async () => {
      const { data: { user } } = await axios.get(`/api/neynar/user?address=${currentAuction?.highestBidder}`);
      return {
        avatar: user.pfpUrl,
        name: user.displayName,
        handle: user.username,
      };
    },
    staleTime: 60000,
  });

  const { data: userPeeplesBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.peeples,
    abi: ERC20,
    functionName: 'balanceOf',
    args: [address || zeroAddress],
    chainId: base.id
  });

  const bidValue = Number.parseFloat(bidAmount) || 0;
  const isValidBid = bidValue >= parseFloat(formatUnits(minAuctionBid || 0n, 18));

  const handleBidSubmit = useCallback(async () => {
    if (!isValidBid) return toast.error("Invalid bid amount");
    if (!feeRecipientAddress || feeRecipientAddress.length !== 42) return toast.error("Invalid fee recipient address");
    try {
      await auctionBid(parseUnits(bidAmount || "0", 18), feeRecipientAddress as `0x${string}`);
    } catch (e: unknown) {
      console.error("Bid submission failed:", e);
    }
  }, [auctionBid, feeRecipientAddress, bidAmount, isValidBid]);

  return (
    <div className="space-y-4">
      {/* Current Head Baker */}
      <div className="bg-gradient-to-r from-[#5C946E] to-[#4ECDC4] rounded-full px-4 py-2 relative overflow-hidden shadow-sm">
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-7 w-7 ring-2 ring-white/40">
              <AvatarImage src={currentFeeRecipient?.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-xs bg-white/20 text-white">
                {currentFeeRecipient?.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-semibold">{currentFeeRecipient?.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-white/25 text-white/90 text-[10px] font-bold uppercase tracking-wider">
                Head Baker
              </span>
            </div>
          </div>
          <Countdown endTime={Number(currentAuction?.endTime || 0) * 1000} className="text-white/80 text-xs font-medium whitespace-nowrap" />
        </div>
      </div>

      {/* Current Leader / No Bids */}
      {isAuctionActive ? (
        <div className="bg-gradient-to-br from-[#F4A259] to-[#BC4B51] rounded-2xl p-5 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-6 -mt-6" />
          <div className="relative space-y-3">
            <div className="flex items-center justify-between">
              <div className="px-2 py-0.5 rounded-full bg-white/30 backdrop-blur-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white">Leading Bid</span>
              </div>
              <div className="text-xs text-white/90 font-semibold">
                <Countdown endTime={Number(currentAuction?.endTime || 0) * 1000} /> left
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-4 ring-white/40 flex-shrink-0">
                <AvatarImage src={highestBidderData?.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-sm">{highestBidderData?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-bold truncate">{highestBidderData?.name}</div>
                <div className="text-white/80 text-xs truncate">{highestBidderData?.handle}</div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <div className="text-2xl font-bold text-white tabular-nums">
                {formatBidAmount(Number.parseFloat(formatUnits(currentAuction?.highestBid || 0n, 18)))}
              </div>
              <div className="text-[10px] text-white/70">
                {Number.parseFloat(formatUnits(currentAuction?.highestBid || 0n, 18)).toLocaleString()} $PEEPLES
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-[#F4A259] to-[#BC4B51] rounded-2xl p-5 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-6 -mt-6" />
          <div className="relative space-y-3">
            <div className="flex items-center justify-between">
              <div className="px-2 py-0.5 rounded-full bg-white/30 backdrop-blur-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white">Auction Open</span>
              </div>
              <Countdown endTime={Number(currentAuction?.endTime || 0) * 1000} className="text-white/80 text-xs font-medium whitespace-nowrap" />
            </div>
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 ring-4 ring-white/30">
                <div className="text-3xl">🍩</div>
              </div>
              <div className="text-white text-xl font-bold mb-1">No Bids Yet</div>
              <div className="text-white/80 text-xs max-w-xs">
                Be the first to bid and secure 90% of protocol fees for 3 days
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bid Form */}
      <div className="glazed-card p-5">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-[#3D2914]/60 uppercase tracking-[0.12em] mb-2 block font-semibold">
              Your Bid
            </label>
            <div className="relative">
              <input
                type="text"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-white text-black border-2 border-[#BC4B51]/20 rounded-xl px-4 py-3 text-base placeholder:text-[#3D2914]/30 focus:outline-none focus:ring-4 focus:border-[#BC4B51] focus:ring-[#BC4B51]/10 transition-all tabular-nums font-semibold"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#3D2914]/40 font-semibold">
                $PEEPLES
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#3D2914]/60 uppercase tracking-[0.12em] mb-2 block font-semibold">
              Fee Recipient Address
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={feeRecipientAddress}
                onChange={(e) => setFeeRecipientAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-white text-black border-2 border-[#5C946E]/20 rounded-xl px-4 py-2.5 placeholder:text-[#3D2914]/30 focus:outline-none focus:ring-4 focus:border-[#5C946E] focus:ring-[#5C946E]/10 transition-all font-mono text-xs"
              />
              <button
                onClick={() => setFeeRecipientAddress(address || "")}
                className="text-[10px] text-[#5C946E] hover:text-[#5C946E]/80 font-semibold uppercase tracking-wider transition-colors"
              >
                Use Connected Wallet ({address?.slice(0, 6)}...{address?.slice(-4)})
              </button>
            </div>
          </div>

          <div className="pt-2 space-y-2 border-t border-[#5C4A3D]/5">
            <div className="flex justify-between text-xs">
              <span className="text-[#3D2914]/50 font-medium">Your Balance</span>
              <span className="font-bold text-[#3D2914] tabular-nums">{parseFloat(formatUnits(userPeeplesBalance || 0n, 18)).toLocaleString()} $PEEPLES</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#3D2914]/50 font-medium">Minimum Bid</span>
              <span className="font-bold text-[#BC4B51] tabular-nums">{parseFloat(formatUnits(minAuctionBid || 0n, 18)).toLocaleString()} $PEEPLES</span>
            </div>
          </div>

          <button
            onClick={handleBidSubmit}
            disabled={!isValidBid}
            className="w-full bg-[#BC4B51] hover:bg-[#BC4B51]/90 text-white font-bold text-sm tracking-wide h-11 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:bg-[#5C4A3D]/20 disabled:text-[#3D2914]/40 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {isAuctionActive
              ? isValidBid
                ? "PLACE BID"
                : `Minimum ${parseFloat(formatUnits(minAuctionBid || 0n, 18)).toLocaleString()} $PEEPLES`
              : isValidBid
                ? "BE THE FIRST TO BID"
                : "ENTER BID AMOUNT"}
          </button>
        </div>
      </div>

      {/* What You Win */}
      <div className="glazed-card p-5">
        <h3 className="text-sm font-bold text-[#3D2914] mb-4 tracking-tight">What You Win</h3>
        <div className="space-y-3">
          {[
            { num: 1, color: "#F4A259", title: "90% of Protocol Fees", desc: "Earn $DONUT and $WETH for 3 days" },
            { num: 2, color: "#5C946E", title: "3-Day Exclusive Rights", desc: "Rights begin immediately after auction ends" },
            { num: 3, color: "#BC4B51", title: "Blazery Boost", desc: "Your bid flows into blazery for LP burning" },
          ].map((benefit) => (
            <div key={benefit.num} className="flex gap-3 group">
              <div
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ backgroundColor: `${benefit.color}15`, border: `2px solid ${benefit.color}30`, color: benefit.color }}
              >
                {benefit.num}
              </div>
              <div className="flex-1 pt-0.5">
                <h4 className="text-xs font-bold text-[#3D2914] mb-0.5">{benefit.title}</h4>
                <p className="text-[10px] text-[#3D2914]/60 leading-relaxed">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuctionPageContent() {
  const { context: frameContext } = useFrameContext();
  const context = frameContext as MiniAppContext | null;

  const { data: ethUsdPrice = 3500 } = useQuery({
    queryKey: ["ethPrice"],
    queryFn: getEthPrice,
    staleTime: 60000,
    refetchInterval: 60000,
  });

  return (
    <main className="flex h-screen w-screen justify-center overflow-hidden bg-gradient-to-b from-[#FDF6E3] via-[#FAF0DC] to-[#F5E6C8] text-[#3D2914]">
      {/* Decorative floating sprinkles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] left-[8%] w-3 h-3 rounded-full bg-[#E85A71] opacity-30 animate-bounce-in" style={{ animationDelay: '0.1s' }} />
        <div className="absolute top-[12%] right-[12%] w-2 h-2 rounded-full bg-[#6B9B7A] opacity-35 animate-bounce-in" style={{ animationDelay: '0.2s' }} />
        <div className="absolute top-[25%] left-[5%] w-2 h-2 rounded-full bg-[#5B8BD4] opacity-25 animate-bounce-in" style={{ animationDelay: '0.3s' }} />
        <div className="absolute bottom-[30%] right-[8%] w-2.5 h-2.5 rounded-full bg-[#F4A627] opacity-30 animate-bounce-in" style={{ animationDelay: '0.4s' }} />
      </div>

      <div
        className="relative flex h-full w-full max-w-[520px] flex-1 flex-col overflow-hidden px-3 pb-4"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 80px)",
        }}
      >
        <div className="flex flex-1 flex-col overflow-hidden">
          <PageHeader
            title="BLAZERY & AUCTION"
            subtitle="Bid to become the Head Baker"
            context={context}
          />

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto scrollbar-styled pb-4">
            <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <AuctionTabs
                blazeryContent={<BlazeryContent ethUsdPrice={ethUsdPrice} />}
                auctionContent={<AuctionContent />}
              />
            </div>
          </div>
        </div>
      </div>
      <NavBar />
    </main>
  );
}

export default function AuctionPage() {
  return (
    <PoolProvider>
      <AuctionPageContent />
    </PoolProvider>
  );
}
