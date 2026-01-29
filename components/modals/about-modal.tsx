"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, Pickaxe, Coins, Clock, Flame, Code } from "lucide-react";
import { AddToFarcasterButton } from "@/components/add-to-farcaster-button";
import { DuneDashboardButton } from "@/components/dune-dashboard-button";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50",
          "bg-gradient-to-b from-[#FDF6E3] via-[#FAF0DC] to-[#F5E6C8]",
          "rounded-t-3xl shadow-2xl",
          "animate-in slide-in-from-bottom duration-300",
          "max-h-[85vh] overflow-hidden flex flex-col"
        )}
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-12 h-1 rounded-full bg-[#D4915D]/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[#2D2319]">About Donut</h2>
            <p className="text-xs text-[#8B7355]">Learn how it works</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#D4915D]/10 flex items-center justify-center text-[#5C4A3D] hover:bg-[#D4915D]/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scrollbar-styled">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <AddToFarcasterButton variant="default" />
            <DuneDashboardButton variant="default" />
          </div>

          {/* Info Sections */}
          {sections.map((section, sectionIndex) => (
            <div
              key={section.title}
              className="glazed-card p-4 animate-slide-up"
              style={{ animationDelay: `${sectionIndex * 0.05}s` }}
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
          <div className="glazed-card p-4 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#FFB5BA] to-[#E8919A] flex items-center justify-center shadow-lg animate-spin-slow">
              <div className="w-6 h-6 rounded-full bg-[#FFF8E7]" />
            </div>
            <p className="text-xs text-[#A89485]">
              Made with 🍩 by the Peeples Donuts team
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
