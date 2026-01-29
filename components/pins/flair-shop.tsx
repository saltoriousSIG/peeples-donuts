"use client";

import React from "react";
import { FlairShopModal } from "./flair-shop-modal";
import { ShoppingBag, Zap, ArrowRight } from "lucide-react";
import { getFlairImagePath, type Rarity } from "@/lib/flair-data";

export const FlairShop: React.FC = () => {
  const rarities: Array<{ name: Rarity; weight: string }> = [
    { name: "Bronze", weight: "1x" },
    { name: "Silver", weight: "2x" },
    { name: "Gold", weight: "4x" },
    { name: "Platinum", weight: "8x" },
  ];

  return (
    <div className="glazed-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="w-5 h-5 text-[#82AD94]" />
        <h2 className="text-lg font-bold text-[#2D2319]">Flair Shop</h2>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFB5BA] to-[#E8919A] p-5 mb-4">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-xl" />
        <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/20" />

        <div className="relative">
          <h3 className="text-xl font-bold text-white amatic mb-2">
            Boost Your Yield!
          </h3>
          <p className="text-white/80 text-sm mb-4 max-w-[200px]">
            Buy Bronze flair with $PEEPLES. Fuse to unlock higher rarities.
          </p>

          <FlairShopModal
            trigger={
              <button className="btn-glazed bg-white/90 text-[#E8919A] hover:bg-white flex items-center gap-2 text-sm py-2 px-4">
                <span>Browse Collection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            }
          />
        </div>
      </div>

      {/* Rarity Preview Grid */}
      <div className="mb-4">
        <div className="text-xs font-bold text-[#5C4A3D] uppercase tracking-wider mb-3">
          Rarity Tiers & Fusion Path
        </div>
        <div className="grid grid-cols-4 gap-2">
          {rarities.map((rarity, index) => (
            <div
              key={rarity.name}
              className="glazed-card p-2 text-center animate-scale-in relative"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {index === 0 && (
                <div className="absolute -top-1 -right-1 bg-[#82AD94] text-white text-[7px] px-1.5 py-0.5 rounded-full font-bold">
                  BUY
                </div>
              )}
              <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-white to-[#FFF8E7] flex items-center justify-center shadow-md mb-1 p-1">
                <img
                  src={getFlairImagePath("Donut", rarity.name)}
                  alt={`${rarity.name} tier`}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-[9px] font-bold text-[#5C4A3D]">{rarity.name}</div>
              <div className="flex items-center justify-center gap-0.5 text-[10px] text-[#FFD700]">
                <Zap className="w-2.5 h-2.5" />
                <span className="font-bold">{rarity.weight}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-[#A89485] text-center mt-2">
          🥉 Bronze is purchasable • Higher tiers via Fusion ⚗️
        </p>
      </div>

      {/* Gauges Preview */}
      <div className="bg-white/30 rounded-xl p-3">
        <div className="text-xs font-bold text-[#5C4A3D] uppercase tracking-wider mb-2">
          Available Gauges
        </div>
        <div className="flex justify-center gap-3">
          {[
            { gauge: "Donut" as const, name: "Donut" },
            { gauge: "Donut/WETH LP" as const, name: "LP" },
            { gauge: "USDC" as const, name: "USDC" },
            { gauge: "QR" as const, name: "QR" },
            { gauge: "Aero" as const, name: "Aero" },
          ].map((item, i) => (
            <div
              key={item.name}
              className="text-center animate-bounce-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center shadow-sm mb-1 p-1">
                <img
                  src={getFlairImagePath(item.gauge, "Platinum")}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-[8px] text-[#5C4A3D]">{item.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
