"use client";

import { useMemo } from "react";
import { useFrameContext } from "@/providers/FrameSDKProvider";
import {
  useAccount,
  useReadContract,
} from "wagmi";
import { base } from "wagmi/chains";
import { zeroAddress, formatUnits, type Address } from "viem";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { MULTICALL_ABI } from "@/lib/abi/multicall";
import { getEthPrice } from "@/lib/utils";
import { NavBar } from "@/components/nav-bar";
import { PageHeader, type MiniAppContext } from "@/components/page-header";
import { useQuery } from "@tanstack/react-query";
import { PoolPositionCard } from "./pool-position-card";
import { PinFlairSummary } from "./pin-flair-summary";
import { YieldOverview } from "./yield-overview";
import { LSGAuctionWidget } from "./lsg-auction-widget";
import { KingGlazerCard } from "./king-glazer-card";
import { QuickStats } from "./quick-stats";
import { GlazeMetrics } from "./glaze-metrics";

export type { MiniAppContext };

type MinerState = {
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
};


export default function Dashboard() {
  const { context: frameContext } = useFrameContext();
  const context = frameContext as MiniAppContext | null;

  const { data: ethUsdPrice = 3500 } = useQuery({
    queryKey: ["ethPrice"],
    queryFn: getEthPrice,
    staleTime: 60000,
    refetchInterval: 60000,
  });

  const { address } = useAccount();

  // Get miner state
  const { data: rawMinerState } = useReadContract({
    address: CONTRACT_ADDRESSES.multicall,
    abi: MULTICALL_ABI,
    functionName: "getMiner",
    args: [address ?? zeroAddress],
    chainId: base.id,
    query: {
      refetchInterval: 3_000,
    },
  });

  const minerState = useMemo(() => {
    if (!rawMinerState) return undefined;
    return rawMinerState as unknown as MinerState;
  }, [rawMinerState]);

  // Calculate DONUT price in USD
  const donutPriceUsd = useMemo(() => {
    if (!minerState?.donutPrice) return 0;
    return parseFloat(formatUnits(minerState.donutPrice, 18)) * ethUsdPrice;
  }, [minerState?.donutPrice, ethUsdPrice]);

  // Signal ready when miner state is loaded

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
            title="PEEPLES DONUTS"
            subtitle="Where you&apos;re family"
            context={context}
          />

          {/* Scrollable Dashboard Content */}
          <div className="flex-1 overflow-y-auto scrollbar-styled space-y-3 pb-4">
            {/* Pool Position Card - Full Width */}
            <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <PoolPositionCard
                ethPrice={ethUsdPrice}
                donutPrice={donutPriceUsd}
              />
            </div>

            {/* Glaze Metrics - Glaze Rate and Glaze Price */}
            <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.08s' }}>
              <GlazeMetrics
                minerState={minerState}
                ethPrice={ethUsdPrice}
              />
            </div>

            {/* Pin/Flair Summary + Yield Overview - Side by Side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <PinFlairSummary />
              </div>
              <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                <YieldOverview
                  ethPrice={ethUsdPrice}
                  donutPrice={donutPriceUsd}
                />
              </div>
            </div>

            {/* LSG Auction Widget - Full Width */}
            <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <LSGAuctionWidget
                ethPrice={ethUsdPrice}
                donutPrice={donutPriceUsd}
              />
            </div>

            {/* King Glazer Card - Smaller, De-emphasized */}
            <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.25s' }}>
              <KingGlazerCard
                minerState={minerState}
                ethPrice={ethUsdPrice}
                userAddress={address}
              />
            </div>

            {/* Quick Stats Row */}
            <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <QuickStats ethPrice={ethUsdPrice} donutPrice={donutPriceUsd} />
            </div>
          </div>
        </div>
      </div>
      <NavBar />
    </main>
  );
}
