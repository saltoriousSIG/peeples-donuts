"use client";

import React, { useState } from "react";

interface AuctionTabsProps {
  blazeryContent: React.ReactNode;
  auctionContent: React.ReactNode;
}

export const AuctionTabs: React.FC<AuctionTabsProps> = ({
  blazeryContent,
  auctionContent,
}) => {
  const [activeTab, setActiveTab] = useState<"blazery" | "auction">("auction");

  return (
    <div className="space-y-4">
      {/* Tab Buttons */}
      <div className="flex gap-2 p-1 bg-[#3D405B]/5 rounded-xl">
        <button
          onClick={() => setActiveTab("blazery")}
          className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
            activeTab === "blazery"
              ? "bg-[#F4A259] text-white shadow-lg shadow-[#F4A259]/20 scale-[1.02]"
              : "text-[#3D405B]/60 hover:text-[#3D405B] hover:bg-[#3D405B]/5"
          }`}
        >
          Blazery
        </button>
        <button
          onClick={() => setActiveTab("auction")}
          className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
            activeTab === "auction"
              ? "bg-[#BC4B51] text-white shadow-lg shadow-[#BC4B51]/20 scale-[1.02]"
              : "text-[#3D405B]/60 hover:text-[#3D405B] hover:bg-[#3D405B]/5"
          }`}
        >
          Auction
        </button>
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-300">
        {activeTab === "blazery" ? blazeryContent : auctionContent}
      </div>
    </div>
  );
};
