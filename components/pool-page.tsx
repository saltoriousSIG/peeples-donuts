"use client";
import React, { useState, useMemo } from "react";
import { NavBar } from "@/components/nav-bar";
import { PageHeader, type MiniAppContext } from "@/components/page-header";
import { useFrameContext } from "@/providers/FrameSDKProvider";
import { usePool } from "@/providers/PoolProvider";
import { formatUnits } from "viem";
import { useReadContract } from "wagmi";
import { PoolVoting } from "./pool-voting";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { DATA } from "@/lib/abi/data";
import { MULTICALL_ABI } from "@/lib/abi/multicall";
import { base } from "wagmi/chains";
import { BuyKingGlazer } from "./buy-king-glazer";
import { getEthPrice } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { PendingClaim } from "./pending-claim";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";
import { ShareModal, ShareAction } from "./share-modal";
import { zeroAddress } from "viem";
import { Users, Percent, ArrowDownToLine, ArrowUpFromLine, Coins, Info } from "lucide-react";
import { RebalanceCard } from "./pool/rebalance-card";

interface PoolsPageProps {}

const PoolsPage: React.FC<PoolsPageProps> = () => {
  const [amount, setAmount] = useState("");
  const { context: frameContext } = useFrameContext();
  const context = frameContext as MiniAppContext | null;
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [shareAction, setShareAction] = useState<ShareAction>();
  const [shareDetails, setShareActionDetails] = useState<{
    embed: string;
    message: string;
  }>({
    message: "",
    embed: "",
  });

  const { address } = useAccount();

  const {
    tvl,
    state,
    shareTokenTotalSupply,
    config,
    wethBalance,
    shareTokenBalance,
    deposit,
    withdraw,
  } = usePool();

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

  const { data: withdrawalAmounts } =
    useReadContract({
      address: CONTRACT_ADDRESSES.pool,
      abi: DATA,
      functionName: "calculateWithdrawalAmounts",
      args: [shareTokenBalance as bigint],
      chainId: base.id,
    });

  const { data: ethPrice } = useQuery({
    queryKey: ["ethPrice"],
    queryFn: getEthPrice,
    staleTime: 60000,
    refetchInterval: 60000,
  });

  const { wethUsdValue, donutUsdValue } = useMemo(() => {
    if (!ethPrice || !rawMinerState || !tvl) {
      return { wethUsdValue: "0", donutUsdValue: "0" };
    }
    return {
      wethUsdValue: (
        parseFloat(formatUnits(tvl?.wethTVL || 0n, 18)) * ethPrice
      ).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      donutUsdValue: (
        parseFloat(formatUnits(tvl.donutTVL, 18)) *
        parseFloat(formatUnits(rawMinerState?.donutPrice || 0n, 18)) *
        ethPrice
      ).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    };
  }, [ethPrice, rawMinerState, tvl]);

  const totalTvlUsd = useMemo(() => {
    return (
      parseFloat(wethUsdValue.replace(/,/g, "")) +
      parseFloat(donutUsdValue.replace(/,/g, ""))
    ).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [wethUsdValue, donutUsdValue]);

  const rules = [
    {
      num: 1,
      icon: "💰",
      color: "#82AD94",
      title: "Deposit & Shares",
      desc: "Deposit WETH to receive share tokens. Your shares represent your % ownership of all pool WETH and DONUT.",
    },
    {
      num: 2,
      icon: "🏧",
      color: "#FFB5BA",
      title: "Withdraw Anytime",
      desc: "Pool idle? Get instant withdrawal. Pool mining? Queue your withdrawal and collect after the cycle ends.",
    },
    {
      num: 3,
      icon: "👑",
      color: "#FFD700",
      title: "Buying Strategy",
      desc: "King Glazer is available when target price hits. Anyone can trigger the buy for $PEEPLES reward.",
    },
    {
      num: 4,
      icon: "🗳️",
      color: "#B48EF7",
      title: "Weekly Votes",
      desc: "Hold 10M $PEEPLES to vote on pool risk strategy. Choose Conservative, Moderate, Aggressive, or Degen.",
    },
    {
      num: 5,
      icon: "📊",
      color: "#82AD94",
      title: "Simple Fees",
      desc: "Only 1% protocol fee on mining earnings. No deposit or withdrawal fees. Shares are ERC20 transferable.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF6E3] via-[#FAF0DC] to-[#F5E6C8]">
      {/* Decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-4 h-4 rounded-full bg-[#6B9B7A] opacity-25 animate-bounce-in" style={{ animationDelay: '0.1s' }} />
        <div className="absolute top-[20%] right-[8%] w-3 h-3 rounded-full bg-[#E85A71] opacity-20 animate-bounce-in" style={{ animationDelay: '0.2s' }} />
        <div className="absolute bottom-[40%] left-[10%] w-2 h-2 rounded-full bg-[#F4A627] opacity-25 animate-bounce-in" style={{ animationDelay: '0.3s' }} />
      </div>

      <div className="flex flex-1 flex-col text-[#3D2914] p-3">
        <PageHeader
          title="FAMILY POOL"
          subtitle="Pool together, earn together"
          context={context}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-36 space-y-4 h-[calc(100vh-100px)] overflow-y-auto scrollbar-styled">
        {/* TVL Hero Card */}
        <div className="glazed-card p-5 opacity-0 animate-slide-up">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#82AD94] to-[#5C946E] p-5">
            <div className="absolute top-2 right-4 w-20 h-20 rounded-full bg-white/10 blur-xl" />
            <div className="absolute bottom-0 left-4 w-12 h-12 rounded-full bg-white/5 blur-lg" />

            <div className="relative">
              <div className="text-white/70 text-xs mb-1 flex items-center gap-1">
                <Coins className="w-3 h-3" />
                Total Value Locked
              </div>
              <div className="text-4xl font-bold text-white coming-soon mb-3">
                ${totalTvlUsd}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/20 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">Ξ</span>
                    <div>
                      <div className="text-sm font-bold text-white">
                        {parseFloat(formatUnits(tvl?.wethTVL || 0n, 18)).toFixed(4)}
                      </div>
                      <div className="text-[10px] text-white/70">${wethUsdValue}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/20 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🍩</span>
                    <div>
                      <div className="text-sm font-bold text-white">
                        {parseFloat(formatUnits(tvl?.donutTVL || 0n, 18)).toLocaleString("en-US", { maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-white/70">${donutUsdValue}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/30 rounded-xl p-3 text-center">
              <Users className="w-5 h-5 mx-auto mb-1 text-[#82AD94]" />
              <div className="text-[10px] text-[#A89485] uppercase tracking-wide">Bakers</div>
              <div className="text-lg font-bold text-[#2D2319]">{state?.numPoolParticipants ?? "0"}</div>
            </div>
            <div className="bg-white/30 rounded-xl p-3 text-center">
              <Percent className="w-5 h-5 mx-auto mb-1 text-[#FFB5BA]" />
              <div className="text-[10px] text-[#A89485] uppercase tracking-wide">Your Share</div>
              <div className="text-lg font-bold text-[#2D2319]">
                {shareTokenBalance && shareTokenTotalSupply
                  ? `${((parseFloat(shareTokenBalance.toString()) / parseFloat(shareTokenTotalSupply.toString())) * 100).toFixed(2)}%`
                  : `0%`}
              </div>
            </div>
          </div>
        </div>

        <PendingClaim
          ethPrice={ethPrice as number}
          donutPrice={
            ethPrice
              ? parseFloat(formatUnits(rawMinerState?.donutPrice || 0n, 18)) *
                ethPrice
              : 0
          }
        />

        {/* Deposit/Withdraw Card */}
        <div className="glazed-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-5 p-1.5 bg-white/30 rounded-xl">
            <button
              onClick={() => setMode("deposit")}
              className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                mode === "deposit"
                  ? "bg-gradient-to-r from-[#82AD94] to-[#5C946E] text-white shadow-lg"
                  : "text-[#5C4A3D] hover:bg-white/50"
              }`}
            >
              <ArrowDownToLine className="w-4 h-4" />
              Deposit
            </button>
            <button
              onClick={() => setMode("withdraw")}
              className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                mode === "withdraw"
                  ? "bg-gradient-to-r from-[#FFB5BA] to-[#E8919A] text-white shadow-lg"
                  : "text-[#5C4A3D] hover:bg-white/50"
              }`}
            >
              <ArrowUpFromLine className="w-4 h-4" />
              Withdraw
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold text-[#5C4A3D] uppercase tracking-wider mb-2">
                Amount
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full bg-white/70 text-[#2D2319] border-2 rounded-xl px-4 py-4 text-lg font-semibold placeholder:text-[#A89485]/50 focus:outline-none transition-all ${
                    mode === "deposit"
                      ? "border-transparent focus:border-[#82AD94]"
                      : "border-transparent focus:border-[#FFB5BA]"
                  }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#A89485] font-semibold">
                  ${mode === "deposit" ? "WETH" : "SPEEP"}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {["25%", "50%", "MAX"].map((pct) => (
                <button
                  key={pct}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/50 hover:bg-white/70 text-xs font-bold text-[#5C4A3D] transition-all hover:scale-105 active:scale-95"
                  onClick={() => {
                    const balance =
                      mode === "deposit" ? wethBalance : shareTokenBalance;
                    if (!balance) {
                      return setAmount("0");
                    }
                    if (pct === "MAX") {
                      setAmount(
                        balance
                          ? parseFloat(formatUnits(balance, 18)).toString()
                          : "0"
                      );
                      return;
                    }
                    let val = 0;
                    if (pct === "25%") {
                      val = parseFloat(formatUnits(balance, 18)) * 0.25;
                    } else if (pct === "50%") {
                      val = parseFloat(formatUnits(balance, 18)) * 0.5;
                    }
                    setAmount(val.toFixed(4));
                  }}
                >
                  {pct}
                </button>
              ))}
            </div>

            <div className="bg-white/30 rounded-xl p-3 space-y-2">
              {mode === "deposit" ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5C4A3D]">Available Balance</span>
                    <span className="font-bold text-[#2D2319]">
                      {parseFloat(formatUnits(wethBalance ?? 0n, 18)).toFixed(4)} WETH
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5C4A3D]">Min. Deposit</span>
                    <span className="font-bold text-[#2D2319]">
                      {config
                        ? parseFloat(formatUnits(config.minDeposit, 18)).toFixed(4)
                        : "0"} WETH
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5C4A3D]">Your Shares</span>
                    <span className="font-bold text-[#2D2319]">
                      {parseFloat(formatUnits(shareTokenBalance ?? 0n, 18)).toFixed(4)} SPEEP
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5C4A3D]">Earned Rewards</span>
                    <span className="font-bold text-[#82AD94]">
                      {withdrawalAmounts
                        ? `${parseFloat(formatUnits(withdrawalAmounts.wethOut, 18)).toFixed(4)} WETH + ${parseFloat(formatUnits(withdrawalAmounts.donutOut, 18)).toFixed(2)} DONUT`
                        : "0 WETH + 0 DONUT"}
                    </span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={async () => {
                if (mode === "deposit") {
                  await deposit(
                    parseInt(parseUnits(amount || "0", 18).toString())
                  );
                  setShareAction("deposit");
                  setShareActionDetails({
                    message: `I just joined the Peeples Donuts Family Pool! 🍩👑 Let's get glazed together`,
                    embed: "https://peeplesdonuts.com/pool",
                  });
                  setShareModalOpen(true);
                } else if (mode === "withdraw") {
                  withdraw(parseInt(parseUnits(amount || "0", 18).toString()));
                }
              }}
              className={`btn-glazed w-full py-3.5 text-sm ${
                mode === "withdraw" ? "btn-strawberry" : ""
              }`}
            >
              {mode === "deposit" ? (
                <>
                  <ArrowDownToLine className="w-4 h-4 mr-2" />
                  DEPOSIT TO POOL
                </>
              ) : (
                <>
                  <ArrowUpFromLine className="w-4 h-4 mr-2" />
                  WITHDRAW FROM POOL
                </>
              )}
            </button>
          </div>
        </div>

        <BuyKingGlazer
          onBuy={() => {
            setShareAction("king-glazer");
            setShareActionDetails({
              message: `I just bought King Glazer for the Peeples Pool, and earned 25K $PEEPLES 🍩👑 Let's get glazed together`,
              embed: "https://peeplesdonuts.com/pool",
            });
            setShareModalOpen(true);
          }}
        />

        <PoolVoting />

        <RebalanceCard />

        {/* Rules Card */}
        <div className="glazed-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-[#82AD94]" />
            <h3 className="text-lg font-bold text-[#2D2319]">Pool Rules</h3>
          </div>

          <div className="space-y-4">
            {rules.map((rule, index) => (
              <div
                key={rule.num}
                className="flex gap-3 opacity-0 animate-slide-up"
                style={{ animationDelay: `${0.3 + index * 0.05}s` }}
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm"
                  style={{ backgroundColor: `${rule.color}20` }}
                >
                  {rule.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[#2D2319] mb-0.5">
                    {rule.title}
                  </h4>
                  <p className="text-xs text-[#5C4A3D] leading-relaxed">
                    {rule.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <NavBar />
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          setShareAction(undefined);
          setShareActionDetails({ embed: "", message: "" });
        }}
        action={shareAction as ShareAction}
        details={shareDetails}
      />
    </div>
  );
};

export default PoolsPage;
