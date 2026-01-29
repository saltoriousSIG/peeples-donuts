"use client";

import React, { useMemo, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { Zap, TrendingUp, TrendingDown, Info, Code, ArrowRight, Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface LSGAuction {
  id: string;
  payAmount: bigint; // DONUT required
  getAmount: bigint; // WETH reward
  deadline: number;
}

interface LSGAuctionWidgetProps {
  ethPrice?: number;
  donutPrice?: number;
}

// Mock data - replace with actual contract reads
const MOCK_AUCTIONS: LSGAuction[] = [
  {
    id: "1",
    payAmount: parseUnits("1000", 18),
    getAmount: parseUnits("0.35", 18),
    deadline: Date.now() + 3600000,
  }
];

export const LSGAuctionWidget: React.FC<LSGAuctionWidgetProps> = ({
  ethPrice = 3500,
  donutPrice = 0,
}) => {
  const [isExecuting, setIsExecuting] = useState<string | null>(null);
  const [showDevSection, setShowDevSection] = useState(false);

  // Calculate profit for each auction
  const auctionsWithProfit = useMemo(() => {
    return MOCK_AUCTIONS.map((auction) => {
      const payAmountNum = parseFloat(formatUnits(auction.payAmount, 18));
      const getAmountNum = parseFloat(formatUnits(auction.getAmount, 18));

      const payValueUsd = payAmountNum * donutPrice;
      const getValueUsd = getAmountNum * ethPrice;

      // Estimate fees: 0.3% flash loan fee + ~$2 gas + 0.5% swap slippage
      const flashLoanFee = payValueUsd * 0.003;
      const gasCost = 2;
      const swapSlippage = getValueUsd * 0.005;
      const totalFees = flashLoanFee + gasCost + swapSlippage;

      const netProfitUsd = getValueUsd - payValueUsd - totalFees;
      const isProfitable = netProfitUsd > 0;

      return {
        ...auction,
        payAmountNum,
        getAmountNum,
        payValueUsd,
        getValueUsd,
        netProfitUsd,
        isProfitable,
        totalFees,
      };
    });
  }, [donutPrice, ethPrice]);

  const handleExecute = async (auctionId: string) => {
    setIsExecuting(auctionId);
    try {
      // TODO: Call contract function to execute flash loan arbitrage
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error("Failed to execute auction:", error);
    } finally {
      setIsExecuting(null);
    }
  };

  return (
    <div className="glazed-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center shadow-md">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#2D2319]">LSG Auctions</h3>
            <p className="text-[10px] text-[#A89485]">No capital needed</p>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="w-6 h-6 rounded-full bg-white/50 flex items-center justify-center">
                <Info className="w-3.5 h-3.5 text-[#A89485]" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-[280px] text-xs bg-[#2D2319] text-white border-0">
              <p className="font-bold mb-1">How it works:</p>
              <p>Borrow DONUT from the pool, claim the LSG auction reward, keep the profit. We handle everything in one transaction.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Tagline */}
      <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 rounded-lg px-3 py-2 mb-4 border border-[#FFD700]/20">
        <p className="text-xs text-[#2D2319] font-medium text-center flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
          Borrow DONUT, claim the reward, keep the profit
          <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
        </p>
      </div>

      {/* Auction List */}
      <div className="space-y-3 mb-4">
        {auctionsWithProfit.length === 0 ? (
          <div className="text-center py-8 text-[#A89485] text-sm">
            No auctions available right now. Check back soon!
          </div>
        ) : (
          auctionsWithProfit.map((auction) => (
            <div
              key={auction.id}
              className={cn(
                "rounded-xl p-4 border-2 transition-all",
                auction.isProfitable
                  ? "bg-green-50/50 border-green-200"
                  : "bg-red-50/30 border-red-200/50 opacity-60"
              )}
            >
              {/* Auction Details */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* PAY Side */}
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-[#5C4A3D] mb-1">
                    PAY
                  </div>
                  <div className="text-lg font-bold text-[#2D2319] flex items-center gap-1">
                    🍩 {auction.payAmountNum.toFixed(0)}
                  </div>
                  <div className="text-[10px] text-[#A89485]">
                    ${auction.payValueUsd.toFixed(2)}
                  </div>
                </div>

                {/* GET Side */}
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-[#5C4A3D] mb-1">
                    GET
                  </div>
                  <div className="text-lg font-bold text-[#2D2319] flex items-center gap-1">
                    Ξ {auction.getAmountNum.toFixed(4)}
                  </div>
                  <div className="text-[10px] text-[#A89485]">
                    ${auction.getValueUsd.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Profit/Loss Display */}
              <div
                className={cn(
                  "rounded-lg p-2.5 mb-3 flex items-center justify-between",
                  auction.isProfitable
                    ? "bg-green-100/70 border border-green-200"
                    : "bg-red-100/50 border border-red-200"
                )}
              >
                <div className="flex items-center gap-1.5">
                  {auction.isProfitable ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-xs font-bold text-[#2D2319]">
                    {auction.isProfitable ? "Profit" : "Loss"}
                  </span>
                </div>
                <div className="text-right">
                  <div
                    className={cn(
                      "text-lg font-bold",
                      auction.isProfitable ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {auction.isProfitable ? "+" : ""}$
                    {Math.abs(auction.netProfitUsd).toFixed(2)}
                  </div>
                  <div className="text-[9px] text-[#A89485]">
                    After fees (~${auction.totalFees.toFixed(2)})
                  </div>
                </div>
              </div>

              {/* Execute Button */}
              <button
                onClick={() => handleExecute(auction.id)}
                disabled={!auction.isProfitable || isExecuting !== null}
                className={cn(
                  "w-full py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2",
                  auction.isProfitable
                    ? "bg-gradient-to-r from-[#82AD94] to-[#5C946E] text-white hover:shadow-md disabled:opacity-50"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                {isExecuting === auction.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Executing...
                  </>
                ) : auction.isProfitable ? (
                  <>
                    <Zap className="w-4 h-4" />
                    Claim ${Math.abs(auction.netProfitUsd).toFixed(2)}
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  "Not Profitable"
                )}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Developer Section Toggle */}
      <button
        onClick={() => setShowDevSection(!showDevSection)}
        className="w-full text-xs text-[#82AD94] hover:text-[#5C946E] font-semibold flex items-center justify-center gap-1.5 py-2 transition-colors"
      >
        <Code className="w-3.5 h-3.5" />
        {showDevSection ? "Hide" : "Show"} Developer Info
      </button>

      {/* Developer Section */}
      {showDevSection && (
        <div className="mt-3 bg-[#2D2319]/5 rounded-lg p-4 border border-[#2D2319]/10">
          <h4 className="text-sm font-bold text-[#2D2319] mb-2 flex items-center gap-2">
            <Code className="w-4 h-4" />
            Custom Flash Loans
          </h4>
          <div className="text-xs text-[#5C4A3D] space-y-2">
            <p>
              Want to build your own flash loan strategies? The Peeples pool
              holds <span className="font-semibold">WETH, DONUT, and PEEPLES</span>.
            </p>
            <p>
              You can write custom contracts that borrow any of these assets,
              execute your strategy, and repay within the same transaction.
            </p>
            <div className="bg-white/50 rounded p-2 mt-2 font-mono text-[10px] text-[#2D2319]">
              <div>Max available for flash loans:</div>
              <div className="mt-1 space-y-0.5 pl-2">
                <div>• WETH: Check pool balance</div>
                <div>• DONUT: Check pool balance</div>
                <div>• PEEPLES: Check pool balance</div>
              </div>
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-1 text-[#82AD94] hover:text-[#5C946E] font-semibold mt-2 transition-colors"
            >
              View documentation
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
