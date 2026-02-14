"use client";

import { useState, useMemo, useEffect } from "react";
import { formatUnits, parseUnits, zeroAddress } from "viem";
import { useReadContracts, useAccount } from "wagmi";
import { base } from "wagmi/chains";
import { cn } from "@/lib/utils";
import { X, Users, Percent, ArrowDownToLine, ArrowUpFromLine, Coins, Info, Crown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePool } from "@/providers/PoolProvider";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { DATA } from "@/lib/abi/data";
import { ERC20 } from "@/lib/abi/erc20";
import { useMinerState } from "@/hooks/useMinerState";
import { useDonutPriceUsd } from "@/hooks/useDonutPriceUsd";
import { useQuery } from "@tanstack/react-query";
import { PoolVoting } from "@/components/pool-voting";
import { BuyKingGlazer } from "@/components/buy-king-glazer";
import { PendingClaim } from "@/components/pending-claim";
import { RebalanceCard } from "@/components/pool/rebalance-card";
import { ShareModal, ShareAction } from "@/components/share-modal";

interface PoolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PoolModal({ isOpen, onClose }: PoolModalProps) {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [useDonut, setUseDonut] = useState(false);
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
    pendingClaim,
    claim,
    buyKingGlazer,
    vote,
    voteEpoch,
    votes,
    hasUserVoted,
  } = usePool();

  const { minerState: rawMinerState } = useMinerState();

  const { data: modalBatch } = useReadContracts({
    contracts: [
      {
        address: CONTRACT_ADDRESSES.pool,
        abi: DATA,
        functionName: "calculateWithdrawalAmounts",
        args: [shareTokenBalance as bigint],
        chainId: base.id,
      },
      {
        address: CONTRACT_ADDRESSES.donut as `0x${string}`,
        abi: ERC20,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
        chainId: base.id,
      },
    ],
    query: {
      enabled: !!address,
    },
  });

  const withdrawalAmounts = modalBatch?.[0]?.result as { wethOut: bigint; donutOut: bigint } | undefined;
  const donutBalance = modalBatch?.[1]?.result as bigint | undefined;

  const { donutPriceUsd, ethPrice } = useDonutPriceUsd();

  // King Glazer info
  const minerAddress = rawMinerState?.miner ?? zeroAddress;
  const hasMiner = minerAddress !== zeroAddress;

  const { data: kingGlazerUser } = useQuery<{
    user: {
      fid: number | null;
      username: string | null;
      displayName: string | null;
      pfpUrl: string | null;
    } | null;
  }>({
    queryKey: ["neynar-user", minerAddress],
    queryFn: async () => {
      const res = await fetch(`/api/neynar/user?address=${encodeURIComponent(minerAddress)}`);
      if (!res.ok) throw new Error("Failed to load profile");
      return await res.json();
    },
    enabled: hasMiner,
    staleTime: 60_000,
  });

  const kingDisplayName = kingGlazerUser?.user?.displayName ??
    kingGlazerUser?.user?.username ??
    (hasMiner ? `${minerAddress.slice(0, 6)}...${minerAddress.slice(-4)}` : "No one");

  const kingAvatarUrl = kingGlazerUser?.user?.pfpUrl ??
    `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(minerAddress.toLowerCase())}`;

  const glazePrice = rawMinerState?.price ?? 0n;
  const glazePriceEth = parseFloat(formatUnits(glazePrice, 18));
  const purchasePrice = rawMinerState?.initPrice ? rawMinerState.initPrice / 2n : 0n;
  const purchasePriceEth = parseFloat(formatUnits(purchasePrice, 18));

  const isUserKing = address && minerAddress.toLowerCase() === address.toLowerCase();

  const { wethUsdValue, donutUsdValue } = useMemo(() => {
    if (!ethPrice || !tvl) {
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
        parseFloat(formatUnits(tvl.donutTVL, 18)) * donutPriceUsd
      ).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    };
  }, [ethPrice, donutPriceUsd, tvl]);

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
          "max-h-[90vh] overflow-hidden flex flex-col"
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
            <h2 className="text-lg font-bold text-[#2D2319]">Family Pool</h2>
            <p className="text-xs text-[#8B7355]">Pool together, earn together</p>
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
          {/* King Glazer Status */}
          <div className="glazed-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-[#FFD700]" />
              <h3 className="text-sm font-bold text-[#2D2319]">King Glazer</h3>
              {isUserKing && (
                <span className="text-[9px] font-bold text-[#FFD700] bg-[#FFD700]/20 px-2 py-0.5 rounded-full">
                  You!
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-[#FFD700]/30">
                <AvatarImage src={kingAvatarUrl} alt={kingDisplayName} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-white text-xs">
                  {kingDisplayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[#2D2319] truncate">{kingDisplayName}</div>
                <div className="flex items-center gap-3 text-[10px] text-[#8B7355]">
                  <span>Current: <strong className="text-[#2D2319]">Ξ{glazePriceEth.toFixed(5)}</strong></span>
                  <span>Paid: <strong className="text-[#2D2319]">Ξ{purchasePriceEth.toFixed(5)}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* TVL Hero Card */}
          <div className="glazed-card p-5">
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
            ethPrice={ethPrice}
            donutPrice={donutPriceUsd}
            pendingClaim={pendingClaim}
            claim={claim}
          />

          {/* Deposit/Withdraw Card */}
          <div className="glazed-card p-5">
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

            {mode === "deposit" && (
              <div className="flex gap-2 p-1.5 bg-white/30 rounded-xl mb-4">
                <button
                  onClick={() => setUseDonut(false)}
                  className={`flex-1 px-3 py-2 rounded-lg font-bold text-xs transition-all ${
                    !useDonut
                      ? "bg-white/70 text-[#2D2319] shadow-sm"
                      : "text-[#5C4A3D] hover:bg-white/40"
                  }`}
                >
                  WETH
                </button>
                <button
                  onClick={() => setUseDonut(true)}
                  className={`flex-1 px-3 py-2 rounded-lg font-bold text-xs transition-all ${
                    useDonut
                      ? "bg-white/70 text-[#2D2319] shadow-sm"
                      : "text-[#5C4A3D] hover:bg-white/40"
                  }`}
                >
                  DONUT
                </button>
              </div>
            )}

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
                    {mode === "deposit" ? (useDonut ? "DONUT" : "WETH") : "SPEEP"}
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
                        mode === "deposit" ? (useDonut ? donutBalance : wethBalance) : shareTokenBalance;
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
                        {useDonut
                          ? `${parseFloat(formatUnits(donutBalance ?? 0n, 18)).toFixed(2)} DONUT`
                          : `${parseFloat(formatUnits(wethBalance ?? 0n, 18)).toFixed(4)} WETH`}
                      </span>
                    </div>
                    {!useDonut && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#5C4A3D]">Min. Deposit</span>
                        <span className="font-bold text-[#2D2319]">
                          {config
                            ? parseFloat(formatUnits(config.minDeposit, 18)).toFixed(4)
                            : "0"} WETH
                        </span>
                      </div>
                    )}
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
                      parseInt(parseUnits(amount || "0", 18).toString()),
                      useDonut
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
            config={config}
            buyKingGlazer={buyKingGlazer}
            state={state}
          />

          <PoolVoting
            vote={vote}
            voteEpoch={voteEpoch}
            votes={votes}
            hasUserVoted={hasUserVoted}
            config={config}
          />

          <RebalanceCard />

          {/* Rules Card */}
          <div className="glazed-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-[#82AD94]" />
              <h3 className="text-lg font-bold text-[#2D2319]">Pool Rules</h3>
            </div>

            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.num} className="flex gap-3">
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
      </div>

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
    </>
  );
}
