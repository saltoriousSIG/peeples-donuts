"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatUnits } from "viem";
import { cn } from "@/lib/utils";
import { getEthPrice } from "@/lib/utils";
import { useUserState } from "@/hooks/useUserState";
import { usePool } from "@/providers/PoolProvider";
import { PinDisplay } from "./PinDisplay";
import { YieldTicker } from "./YieldTicker";
import { ClaimButton } from "./ClaimButton";
import { PowerDrawer, type FeatureType } from "@/components/discovery/PowerDrawer";
import { FusionHint } from "@/components/discovery/FusionHint";
import { PageHeader, type MiniAppContext } from "@/components/page-header";
import { AddToFarcasterButton } from "@/components/add-to-farcaster-button";
import { useFrameContext } from "@/providers/FrameSDKProvider";
import { ShoppingBag, Sparkles, TrendingUp, Percent, ChevronUp } from "lucide-react";
import {
  AboutModal,
  AuctionModal,
  FlairModal,
  PoolModal,
  type ModalType,
} from "@/components/modals";

export function PinCanvas() {
  const { context: frameContext, isFrameAdded } = useFrameContext();
  const context = frameContext as MiniAppContext | null;
  const { hasEquippedFlair, canFuse, shareBalance } = useUserState();
  const { tvl, shareTokenTotalSupply } = usePool();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const handleOpenFeature = (feature: FeatureType) => {
    setActiveModal(feature);
  };

  const { data: ethPrice = 3500 } = useQuery({
    queryKey: ["ethPrice"],
    queryFn: getEthPrice,
    staleTime: 60000,
  });

  // Calculate user's share percentage
  const sharePercentage = useMemo(() => {
    if (!shareBalance || !shareTokenTotalSupply || shareTokenTotalSupply === 0n) {
      return "0.00";
    }
    const percentage = (Number(shareBalance) / Number(shareTokenTotalSupply)) * 100;
    return percentage.toFixed(2);
  }, [shareBalance, shareTokenTotalSupply]);

  // Calculate TVL in USD
  const tvlUsd = useMemo(() => {
    if (!tvl || !ethPrice) return "0";
    const wethValue = parseFloat(formatUnits(tvl.wethTVL || 0n, 18)) * ethPrice;
    return wethValue.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }, [tvl, ethPrice]);

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
          {/* Page Header with Peeples branding */}
          <PageHeader
            title="PEEPLES DONUTS"
            subtitle="Where you're family"
            context={context}
          />

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto scrollbar-styled space-y-3 pb-4">
            {/* Pin Display Card */}
            <div className="glazed-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#2D2319]">My Pin</h2>
                <button
                  onClick={() => setActiveModal("flair")}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                    "bg-[#D4915D]/10 hover:bg-[#D4915D]/20",
                    "text-xs font-semibold text-[#C67B30]",
                    "transition-all duration-200"
                  )}
                >
                  <ShoppingBag className="w-3 h-3" />
                  Flair Shop
                </button>
              </div>

              <PinDisplay
                onEmptySlotClick={() => {
                  setActiveModal("flair");
                }}
              />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3 opacity-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="glazed-card p-4 text-center">
                <TrendingUp className="w-5 h-5 mx-auto mb-2 text-[#82AD94]" />
                <div className="text-[10px] text-[#A89485] uppercase tracking-wide">Pool TVL</div>
                <div className="text-xl font-bold text-[#2D2319]">${tvlUsd}</div>
              </div>
              <div className="glazed-card p-4 text-center">
                <Percent className="w-5 h-5 mx-auto mb-2 text-[#E85A71]" />
                <div className="text-[10px] text-[#A89485] uppercase tracking-wide">Your Share</div>
                <div className="text-xl font-bold text-[#2D2319]">{sharePercentage}%</div>
              </div>
            </div>

            {/* Yield Section */}
            <div className="glazed-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <h3 className="text-sm font-bold text-[#2D2319] mb-3">Flair Yield</h3>
              <YieldTicker />

              {/* Claim Button or No Flair Prompt */}
              <div className="mt-4">
                {hasEquippedFlair ? (
                  <ClaimButton />
                ) : (
                  <button
                    onClick={() => setActiveModal("flair")}
                    className={cn(
                      "block w-full p-4 rounded-2xl",
                      "bg-gradient-to-r from-[#F4A627]/10 to-[#E85A71]/10",
                      "border border-[#D4915D]/20",
                      "text-center"
                    )}
                  >
                    <Sparkles className="w-6 h-6 mx-auto mb-2 text-[#F4A627]" />
                    <p className="text-sm font-bold text-[#2D2319]">
                      Equip Flair to Start Earning
                    </p>
                    <p className="text-xs text-[#8B7355] mt-1">
                      Visit the Flair Shop to activate your yield
                    </p>
                  </button>
                )}
              </div>
            </div>

            {/* Fusion Hint */}
            {canFuse && (
              <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <FusionHint />
              </div>
            )}

            {/* Add to Farcaster */}
            {!isFrameAdded && (
              <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.25s' }}>
                <AddToFarcasterButton />
              </div>
            )}

            {/* Power Features Teaser */}
            <div className="glazed-card p-4 opacity-0 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="w-full flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-bold text-[#2D2319]">More Features</div>
                  <div className="text-xs text-[#8B7355]">Pool, Auction, Voting & more</div>
                </div>
                <ChevronUp className="w-5 h-5 text-[#D4915D]" />
              </button>
            </div>

            {/* Bottom spacing */}
            <div className="h-4" />
          </div>
        </div>
      </div>

      {/* Power Drawer */}
      <PowerDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenFeature={handleOpenFeature}
      />

      {/* Feature Modals */}
      <PoolModal
        isOpen={activeModal === "pool"}
        onClose={() => setActiveModal(null)}
      />
      <AuctionModal
        isOpen={activeModal === "auction"}
        onClose={() => setActiveModal(null)}
      />
      <FlairModal
        isOpen={activeModal === "flair"}
        onClose={() => setActiveModal(null)}
      />
      <AboutModal
        isOpen={activeModal === "about"}
        onClose={() => setActiveModal(null)}
      />
    </main>
  );
}
