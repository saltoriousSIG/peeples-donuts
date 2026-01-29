"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useAccount, useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { formatUnits, zeroAddress } from "viem";
import { getEthPrice } from "@/lib/utils";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { ERC20 } from "@/lib/abi/erc20";
import { usePool } from "@/providers/PoolProvider";
import { useOnboardingMint } from "@/hooks/useOnboardingMint";
import { useFrameContext } from "@/providers/FrameSDKProvider";
import { type FlairTokenData } from "@/lib/flair-data";
import { PageHeader, type MiniAppContext } from "@/components/page-header";
import { NavBar } from "@/components/nav-bar";
import { FlairPicker } from "./FlairPicker";
import { AmountInput } from "./AmountInput";
import { MintButton } from "./MintButton";
import { MintCelebration } from "./MintCelebration";
import { AddToFarcasterButton } from "@/components/add-to-farcaster-button";
import { Wallet, Users, TrendingUp, Shield, Sparkles, Gift } from "lucide-react";

interface OnboardingCanvasProps {
  mode: "paid" | "free";
}

export function OnboardingCanvas({ mode }: OnboardingCanvasProps) {
  const { address, isConnected } = useAccount();
  const { context: frameContext, isFrameAdded } = useFrameContext();
  const context = frameContext as MiniAppContext | null;
  const [selectedFlair, setSelectedFlair] = useState<FlairTokenData | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [mintedPinImageUrl, setMintedPinImageUrl] = useState<string>();

  const { tvl, state } = usePool();

  const { data: ethPrice = 3500 } = useQuery({
    queryKey: ["ethPrice"],
    queryFn: getEthPrice,
    staleTime: 60000,
  });

  // Get user's WETH balance
  const { data: wethBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.weth as `0x${string}`,
    abi: ERC20,
    functionName: "balanceOf",
    args: [address ?? zeroAddress],
    chainId: base.id,
    query: {
      enabled: !!address,
      refetchInterval: 10_000,
    },
  });

  const {
    isMinting,
    mintStep,
    mintProgress,
    executeOnboarding,
    executeFreeMint,
  } = useOnboardingMint();

  const formattedWethBalance = useMemo(() => {
    if (!wethBalance) return "0.0000";
    return parseFloat(formatUnits(wethBalance, 18)).toFixed(4);
  }, [wethBalance]);

  // Calculate TVL in USD
  const tvlUsd = useMemo(() => {
    if (!tvl || !ethPrice) return "0";
    const wethValue = parseFloat(formatUnits(tvl.wethTVL || 0n, 18)) * ethPrice;
    return wethValue.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }, [tvl, ethPrice]);

  const canMint = useMemo(() => {
    if (!isConnected) return false;

    if (mode === "free") return true;

    // For paid mode, need flair selection and valid deposit amount
    if (!selectedFlair) return false;
    const amount = parseFloat(depositAmount || "0");
    if (amount <= 0) return false;

    return true;
  }, [isConnected, mode, selectedFlair, depositAmount]);

  const handleMint = async () => {
    if (mode === "free") {
      const result = await executeFreeMint();
      if (result.success) {
        setMintedPinImageUrl(result.pinImageUrl);
        setShowCelebration(true);
      }
    } else {
      if (!selectedFlair) return;

      const result = await executeOnboarding({
        flairTokenId: BigInt(selectedFlair.tokenId),
        wethAmount: depositAmount,
        gauge: selectedFlair.gauge,
      });

      if (result.success) {
        setMintedPinImageUrl(result.pinImageUrl);
        setShowCelebration(true);
      }
    }
  };

  const handleCelebrationContinue = () => {
    setShowCelebration(false);
    window.location.reload();
  };

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
            subtitle={mode === "free" ? "Claim your membership Pin" : "Where you're family"}
            context={context}
          />

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto scrollbar-styled space-y-3 pb-4">
            {/* Hero Card */}
            <div className="glazed-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#E85A71] to-[#C94A5C] p-5">
                <div className="absolute top-2 right-4 w-20 h-20 rounded-full bg-white/10 blur-xl" />
                <div className="absolute bottom-0 left-4 w-12 h-12 rounded-full bg-white/5 blur-lg" />

                <div className="relative text-center">
                  {mode === "free" ? (
                    <>
                      <Gift className="w-12 h-12 mx-auto mb-3 text-white/90" />
                      <h2 className="text-2xl font-bold text-white mb-2">
                        Your Free Pin Awaits!
                      </h2>
                      <p className="text-white/80 text-sm">
                        As an existing shareholder, mint your membership Pin at no cost.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center">
                        <Image
                          src="/media/peeples_donuts.png"
                          alt="Peeples Donuts"
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        Join the Family
                      </h2>
                      <p className="text-white/80 text-sm">
                        Deposit, earn yield, and become a Peeples member.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-white/30 rounded-xl p-3 text-center">
                  <Users className="w-4 h-4 mx-auto mb-1 text-[#82AD94]" />
                  <div className="text-[10px] text-[#A89485] uppercase tracking-wide">Members</div>
                  <div className="text-lg font-bold text-[#2D2319]">{state?.numPoolParticipants ?? "0"}</div>
                </div>
                <div className="bg-white/30 rounded-xl p-3 text-center">
                  <TrendingUp className="w-4 h-4 mx-auto mb-1 text-[#E85A71]" />
                  <div className="text-[10px] text-[#A89485] uppercase tracking-wide">Pool TVL</div>
                  <div className="text-lg font-bold text-[#2D2319]">${tvlUsd}</div>
                </div>
                <div className="bg-white/30 rounded-xl p-3 text-center">
                  <Shield className="w-4 h-4 mx-auto mb-1 text-[#5B8BD4]" />
                  <div className="text-[10px] text-[#A89485] uppercase tracking-wide">Fee</div>
                  <div className="text-lg font-bold text-[#2D2319]">1%</div>
                </div>
              </div>
            </div>

            {/* Wallet Info Card */}
            {isConnected && (
              <div className="glazed-card p-4 opacity-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#82AD94]/20 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-[#82AD94]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#2D2319]">Wallet Connected</div>
                      <div className="text-xs text-[#8B7355]">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </div>
                    </div>
                  </div>
                  {mode === "paid" && (
                    <div className="text-right">
                      <div className="text-xs text-[#8B7355]">Available</div>
                      <div className="text-sm font-bold text-[#2D2319]">{formattedWethBalance} WETH</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Paid Mode: Flair Selection + Amount */}
            {mode === "paid" && (
              <>
                {/* Flair Picker Card */}
                <div className="glazed-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                  <FlairPicker
                    onSelect={setSelectedFlair}
                    selectedFlair={selectedFlair}
                    disabled={isMinting}
                  />
                </div>

                {/* Amount Input Card */}
                <div className="glazed-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <AmountInput
                    value={depositAmount}
                    onChange={setDepositAmount}
                    disabled={isMinting}
                    ethPrice={ethPrice}
                  />
                </div>
              </>
            )}

            {/* Free Mode: Simple explanation */}
            {mode === "free" && (
              <div className="glazed-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                <div className="text-center">
                  <Sparkles className="w-10 h-10 mx-auto mb-3 text-[#F4A627]" />
                  <h3 className="text-lg font-bold text-[#2D2319] mb-2">
                    You&apos;re Already Part of the Family
                  </h3>
                  <p className="text-sm text-[#5C4A3D] mb-4">
                    Your pool shares qualify you for a free membership Pin.
                    Mint your Pin to unlock Flair and start earning additional yield!
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-[#82AD94] font-medium">
                    <div className="w-2 h-2 rounded-full bg-[#82AD94]" />
                    No payment required
                  </div>
                </div>
              </div>
            )}

            {/* Mint Button Card */}
            <div className="glazed-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: '0.25s' }}>
              <MintButton
                onClick={handleMint}
                disabled={!canMint}
                isMinting={isMinting}
                mintStep={mintStep}
                mintProgress={mintProgress}
                mode={mode}
              />
            </div>

            {/* Add to Farcaster */}
            {!isFrameAdded && (
              <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <AddToFarcasterButton />
              </div>
            )}

            {/* Benefits Section */}
            <div className="glazed-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: '0.35s' }}>
              <h3 className="text-sm font-bold text-[#2D2319] mb-4">
                What You Get
              </h3>

              <div className="space-y-3">
                {[
                  {
                    icon: "🎨",
                    title: "Unique Pin NFT",
                    desc: "Your soulbound membership badge",
                    color: "#E85A71",
                  },
                  {
                    icon: "💰",
                    title: "Flair Yield",
                    desc: "Earn tokens based on your equipped Flair",
                    color: "#82AD94",
                  },
                  {
                    icon: "🗳️",
                    title: "Voting Power",
                    desc: "Help decide pool strategy each week",
                    color: "#5B8BD4",
                  },
                  {
                    icon: "✨",
                    title: "Flair Fusion",
                    desc: "Combine Flair to upgrade rarity and earnings",
                    color: "#F4A627",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-3 p-3 bg-white/40 rounded-xl"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${item.color}15` }}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-[#2D2319]">{item.title}</div>
                      <div className="text-xs text-[#8B7355]">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom spacing */}
            <div className="h-4" />
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <NavBar />

      {/* Celebration Modal */}
      <MintCelebration
        isVisible={showCelebration}
        pinImageUrl={mintedPinImageUrl}
        onShare={() => {}}
        onContinue={handleCelebrationContinue}
      />
    </main>
  );
}
