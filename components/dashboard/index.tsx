"use client";

import { useFrameContext } from "@/providers/FrameSDKProvider";
import { useAccount } from "wagmi";
import { useMinerState } from "@/hooks/useMinerState";
import { useDonutPriceUsd } from "@/hooks/useDonutPriceUsd";
import { PageHeader, type MiniAppContext } from "@/components/page-header";
import { PoolPositionCard } from "./pool-position-card";
import { PinFlairSummary } from "./pin-flair-summary";
import { YieldOverview } from "./yield-overview";
import { LSGAuctionWidget } from "./lsg-auction-widget";
import { KingGlazerCard } from "./king-glazer-card";
import { QuickStats } from "./quick-stats";
import { GlazeMetrics } from "./glaze-metrics";

export type { MiniAppContext };


export default function Dashboard() {
  const { context: frameContext } = useFrameContext();
  const context = frameContext as MiniAppContext | null;

  const { address } = useAccount();
  const { minerState } = useMinerState();
  const { donutPriceUsd, ethPrice: ethUsdPrice } = useDonutPriceUsd();

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
    </main>
  );
}
