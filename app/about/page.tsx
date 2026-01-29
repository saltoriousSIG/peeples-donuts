"use client";

import { useFrameContext } from "@/providers/FrameSDKProvider";
import { NavBar } from "@/components/nav-bar";
import { PageHeader, type MiniAppContext } from "@/components/page-header";
import { AddToFarcasterButton } from "@/components/add-to-farcaster-button";
import { DuneDashboardButton } from "@/components/dune-dashboard-button";
import { Pickaxe, Coins, Clock, Flame, Code } from "lucide-react";

export default function AboutPage() {
  const { context: frameContext } = useFrameContext();
  const context = frameContext as MiniAppContext | null;

  const sections = [
    {
      icon: "🍩",
      iconBg: "#FFB5BA",
      title: "What Is $DONUT",
      items: [
        "$DONUT is a store-of-value token on Base",
        "Mined through a continuous Dutch auction instead of proof-of-work or staking",
        "Auction revenue increases $DONUT's liquidity and scarcity",
      ],
    },
    {
      icon: Pickaxe,
      iconBg: "#82AD94",
      title: "How Mining Works",
      items: [
        "Only one active miner at a time, called the King Glazer",
        "The right to mine is bought with ETH through a continuous Dutch auction:",
        "→ Price doubles after each purchase",
        "→ Then decays to 0 over one hour",
        "→ Anyone can purchase control at the current price",
      ],
    },
    {
      icon: Coins,
      iconBg: "#FFD700",
      title: "Revenue Split",
      items: [
        "80% → previous King Glazer",
        "15% → treasury (Blazery)",
        "5% → provider (frontend host)",
      ],
    },
    {
      icon: Clock,
      iconBg: "#B48EF7",
      title: "Emission Schedule",
      items: [
        "Starts at 4 DONUT / sec",
        "Halving every 30 days",
        "Tail emission: 0.01 DONUT / sec (forever)",
      ],
    },
    {
      icon: "⚡",
      iconBg: "#FFB5BA",
      title: "Proof of Just-In-Time Stake",
      items: [
        "ETH is 'staked' only while controlling emissions",
        "Profit if the next purchase pays more",
        "Lose if it pays less",
        "Earn $DONUT the entire time you hold control",
      ],
    },
    {
      icon: Flame,
      iconBg: "#82AD94",
      title: "Treasury",
      items: [
        "Treasury ETH is used to buy and burn DONUT-WETH LP in the Blazery",
        "Governance can upgrade to buy/burn DONUT directly or acquire other assets",
      ],
    },
    {
      icon: Code,
      iconBg: "#FFD700",
      title: "Builder Codes",
      items: [
        "Anyone can host their own Donut Shop",
        "Add your builder code to earn 5% of all purchases",
        "Official shops: GlazeCorp (@heesh), Pinky Glazer (@bigbroc), Peeples Donuts (@saltorious)",
      ],
    },
  ];

  return (
    <main className="flex h-screen w-screen justify-center overflow-hidden bg-gradient-to-b from-[#FDF6E3] via-[#FAF0DC] to-[#F5E6C8] text-[#3D2914]">
      {/* Decorative floating sprinkles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] left-[8%] w-3 h-3 rounded-full bg-[#E85A71] opacity-25 animate-bounce-in" style={{ animationDelay: '0.1s' }} />
        <div className="absolute top-[12%] right-[12%] w-2 h-2 rounded-full bg-[#6B9B7A] opacity-30 animate-bounce-in" style={{ animationDelay: '0.2s' }} />
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
            title="ABOUT DONUT"
            subtitle="Learn how it works"
            context={context}
          />

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-styled space-y-4 pb-4">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 opacity-0 animate-slide-up">
              <AddToFarcasterButton variant="default" />
              <DuneDashboardButton variant="default" />
            </div>

            {/* Info Sections */}
            {sections.map((section, sectionIndex) => (
              <div
                key={section.title}
                className="glazed-card p-4 opacity-0 animate-slide-up"
                style={{ animationDelay: `${(sectionIndex + 1) * 0.05}s` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: `${section.iconBg}20` }}
                  >
                    {typeof section.icon === "string" ? (
                      <span className="text-xl">{section.icon}</span>
                    ) : (
                      <section.icon className="w-5 h-5" style={{ color: section.iconBg }} />
                    )}
                  </div>
                  <h2 className="text-base font-bold text-[#2D2319]">{section.title}</h2>
                </div>

                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className={`text-sm text-[#5C4A3D] leading-relaxed flex items-start gap-2 ${
                        item.startsWith("→") ? "pl-4" : ""
                      }`}
                    >
                      {!item.startsWith("→") && (
                        <span className="text-[#A89485] mt-1.5">•</span>
                      )}
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Footer */}
            <div className="glazed-card p-4 text-center opacity-0 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#FFB5BA] to-[#E8919A] flex items-center justify-center shadow-lg animate-spin-slow">
                <div className="w-6 h-6 rounded-full bg-[#FFF8E7]" />
              </div>
              <p className="text-xs text-[#A89485]">
                Made with 🍩 by the Peeples Donuts team
              </p>
            </div>
          </div>
        </div>
      </div>
      <NavBar />
    </main>
  );
}
