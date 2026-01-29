"use client";

import { useState, useMemo } from "react";
import { useFrameContext } from "@/providers/FrameSDKProvider";
import { useAccount, useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { zeroAddress, formatUnits } from "viem";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { MULTICALL_ABI } from "@/lib/abi/multicall";
import { getEthPrice } from "@/lib/utils";
import { NavBar } from "@/components/nav-bar";
import { PageHeader, type MiniAppContext } from "@/components/page-header";
import { PoolProvider } from "@/providers/PoolProvider";
import { useQuery } from "@tanstack/react-query";
import { PinSection } from "@/components/pins/pin-section";
import { FlairShop } from "@/components/pins/flair-shop";
import { FlairInventory } from "@/components/pins/flair-inventory";
import { FlairFusion } from "@/components/pins/flair-fusion";
import { YieldClaiming } from "@/components/pins/yield-claiming";
import { Sparkles, ChevronDown } from "lucide-react";

type MinerState = {
  donutPrice: bigint;
};

function PinsPageContent() {
  const { context: frameContext } = useFrameContext();
  const context = frameContext as MiniAppContext | null;
  const [activeSection, setActiveSection] = useState<string>("pin");

  const { data: ethUsdPrice = 3500 } = useQuery({
    queryKey: ["ethPrice"],
    queryFn: getEthPrice,
    staleTime: 60000,
    refetchInterval: 60000,
  });

  const { address } = useAccount();

  // Get miner state for donut price
  const { data: rawMinerState } = useReadContract({
    address: CONTRACT_ADDRESSES.multicall,
    abi: MULTICALL_ABI,
    functionName: "getMiner",
    args: [address ?? zeroAddress],
    chainId: base.id,
    query: {
      refetchInterval: 30_000,
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

  const sections = [
    { id: "pin", label: "Your Pin", icon: "📌" },
    { id: "yield", label: "Rewards", icon: "💰" },
    { id: "inventory", label: "Collection", icon: "🎭" },
    { id: "shop", label: "Shop", icon: "🛒" },
    { id: "fusion", label: "Fusion", icon: "⚗️" },
  ];

  return (
    <main className="flex h-screen w-screen justify-center overflow-hidden bg-gradient-to-b from-[#FDF6E3] via-[#FAF0DC] to-[#F5E6C8]">
      <div
        className="relative flex h-full w-full max-w-[520px] flex-1 flex-col overflow-hidden"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 80px)",
        }}
      >
        {/* Premium Header */}
        <div className="px-4 mb-4 opacity-0 animate-slide-up">
          <PageHeader
            title="PINS & FLAIR"
            subtitle="Collect, equip & earn"
            titleExtra={<Sparkles className="w-5 h-5 text-[#F4A627] animate-wiggle" />}
            context={context}
          />
        </div>

        {/* Section Navigation Pills */}
        <div className="px-4 mb-4 animate-slide-up stagger-1">
          <div className="flex gap-2 overflow-x-auto scrollbar-horizontal pb-2">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`gauge-pill whitespace-nowrap animate-scale-in ${
                  activeSection === section.id
                    ? "gauge-pill-active"
                    : "gauge-pill-inactive"
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span>{section.icon}</span>
                <span>{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 space-y-4 pb-4">
          {activeSection === "pin" && (
            <div className="animate-scale-in">
              <PinSection />
            </div>
          )}

          {activeSection === "yield" && (
            <div className="animate-scale-in">
              <YieldClaiming ethPrice={ethUsdPrice} donutPrice={donutPriceUsd} />
            </div>
          )}

          {activeSection === "inventory" && (
            <div className="animate-scale-in">
              <FlairInventory />
            </div>
          )}

          {activeSection === "shop" && (
            <div className="animate-scale-in">
              <FlairShop />
            </div>
          )}

          {activeSection === "fusion" && (
            <div className="animate-scale-in">
              <FlairFusion />
            </div>
          )}

          {/* Quick Tips - Always Visible */}
          <div className="glazed-card p-4 animate-slide-up stagger-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFB5BA] to-[#E8919A] flex items-center justify-center text-xl shadow-sm">
                💡
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#2D2319] mb-1">Quick Tips</h3>
                <ul className="text-xs text-[#5C4A3D] space-y-1">
                  <li className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#82AD94]" />
                    Mint a Pin to unlock flair bonuses
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700]" />
                    Higher rarity = bigger yield multiplier
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B48EF7]" />
                    Fuse flair to upgrade rarity
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="flex justify-center py-2 opacity-40">
            <ChevronDown className="w-5 h-5 text-[#5C4A3D] animate-bounce" />
          </div>
        </div>
      </div>
      <NavBar />
    </main>
  );
}

export default function PinsPage() {
  return (
    <PoolProvider>
      <PinsPageContent />
    </PoolProvider>
  );
}
