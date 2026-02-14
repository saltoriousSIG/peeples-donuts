"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useAccount, useReadContracts } from "wagmi";
import { base } from "wagmi/chains";
import { formatUnits, parseEther, zeroAddress } from "viem";
import { getEthPrice } from "@/lib/utils";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { ERC20 } from "@/lib/abi/erc20";
import { usePool } from "@/providers/PoolProvider";
import { useOnboardingMint } from "@/hooks/useOnboardingMint";
import { usePins } from "@/hooks/usePins";
import { useMinerState } from "@/hooks/useMinerState";
import { useFrameContext } from "@/providers/FrameSDKProvider";
import { type FlairTokenData } from "@/lib/flair-data";
import { PageHeader, type MiniAppContext } from "@/components/page-header";
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
  const [selectedCurrency, setSelectedCurrency] = useState<"ETH" | "DONUT">("ETH");
  const [depositAmount, setDepositAmount] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [mintedPinImageUrl, setMintedPinImageUrl] = useState<string>();

  const { tvl, state } = usePool();
  const { hasPin } = usePins();

  const { data: ethPrice = 3500 } = useQuery({
    queryKey: ["ethPrice"],
    queryFn: getEthPrice,
    staleTime: 60000,
  });

  // Batch WETH + DONUT balance reads
  const { data: balanceBatch } = useReadContracts({
    contracts: [
      {
        address: CONTRACT_ADDRESSES.weth as `0x${string}`,
        abi: ERC20,
        functionName: "balanceOf",
        args: [address ?? zeroAddress],
        chainId: base.id,
      },
      {
        address: CONTRACT_ADDRESSES.donut as `0x${string}`,
        abi: ERC20,
        functionName: "balanceOf",
        args: [address ?? zeroAddress],
        chainId: base.id,
      },
    ],
    query: {
      enabled: !!address,
      refetchInterval: 10_000,
    },
  });

  const wethBalance = balanceBatch?.[0]?.result as bigint | undefined;
  const donutBalance = balanceBatch?.[1]?.result as bigint | undefined;

  const {
    isMinting,
    mintStep,
    mintProgress,
    executeOnboarding,
    executeFreeMint,
  } = useOnboardingMint();

  const { pinMintPrice, flairMintPrice } = usePins();
  const { minerState } = useMinerState();

  const formattedBalance = useMemo(() => {
    const bal = selectedCurrency === "DONUT" ? donutBalance : wethBalance;
    if (!bal) return "0.0000";
    return parseFloat(formatUnits(bal, 18)).toFixed(selectedCurrency === "DONUT" ? 0 : 4);
  }, [wethBalance, donutBalance, selectedCurrency]);

  // Calculate TVL in USD
  const tvlUsd = useMemo(() => {
    if (!tvl || !ethPrice) return "0";
    const wethValue = parseFloat(formatUnits(tvl.wethTVL || 0n, 18)) * ethPrice;
    return wethValue.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }, [tvl, ethPrice]);

  const canMint = useMemo(() => {
    if (!isConnected) return false;

    // Both modes require flair selection
    if (!selectedFlair) return false;

    if (mode === "free") return true;

    // For paid mode, also need valid deposit amount
    const amount = parseFloat(depositAmount || "0");
    if (amount <= 0) return false;

    return true;
  }, [isConnected, mode, selectedFlair, depositAmount]);

  const handleMint = async () => {
    if (!selectedFlair) return;

    if (mode === "free") {
      const result = await executeFreeMint({
        flairTokenId: BigInt(selectedFlair.tokenId),
        currency: selectedCurrency,
        flairPrice: flairMintPrice ?? 0n,
      });
      if (result.success) {
        setMintedPinImageUrl(result.pinImageUrl);
        setShowCelebration(true);
      }
    } else {
      const result = await executeOnboarding({
        flairTokenId: BigInt(selectedFlair.tokenId),
        wethAmount: parseEther(depositAmount || "0"),
        gauge: selectedFlair.gauge,
        currency: selectedCurrency,
        mintPrice: pinMintPrice ?? 0n,
        flairPrice: flairMintPrice ?? 0n,
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

  // User already has a pin — don't show onboarding
  if (hasPin && !showCelebration) {
    return null;
  }

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
                      <h2 className="text-2xl font-bold text-black mb-2">
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
                      <div className="text-sm font-bold text-[#2D2319]">
                        {formattedBalance} {selectedCurrency === "DONUT" ? "DONUT" : "WETH"}
                      </div>
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
                    currency={selectedCurrency}
                    onCurrencyChange={(c) => { setSelectedCurrency(c); setDepositAmount(""); }}
                    pinMintPrice={pinMintPrice}
                    donutPrice={minerState?.donutPrice}
                  />
                </div>
              </>
            )}

            {/* Free Mode: Explanation + Flair picker + Currency toggle */}
            {mode === "free" && (
              <>
                <div className="glazed-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                  <div className="text-center">
                    <Sparkles className="w-10 h-10 mx-auto mb-3 text-[#F4A627]" />
                    <h3 className="text-lg font-bold text-[#2D2319] mb-2">
                      You&apos;re Already Part of the Family
                    </h3>
                    <p className="text-sm text-[#5C4A3D] mb-4">
                      Your pool shares qualify you for a free membership Pin.
                      Choose your Flair below to start earning additional yield!
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-[#82AD94] font-medium">
                      <div className="w-2 h-2 rounded-full bg-[#82AD94]" />
                      Free Pin + Flair purchase
                    </div>
                  </div>
                </div>

                <div className="glazed-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <FlairPicker
                    onSelect={setSelectedFlair}
                    selectedFlair={selectedFlair}
                    disabled={isMinting}
                  />
                </div>

                {/* Currency toggle for flair payment */}
                <div className="glazed-card p-4 opacity-0 animate-slide-up" style={{ animationDelay: '0.25s' }}>
                  <div className="text-xs font-bold text-[#5C4A3D] uppercase tracking-wider mb-3">
                    Pay for Flair with
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => !isMinting && setSelectedCurrency("ETH")}
                      disabled={isMinting}
                      className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
                        selectedCurrency === "ETH"
                          ? "bg-[#627EEA] text-white shadow-md"
                          : "bg-white/50 text-[#5C4A3D] hover:bg-white/70"
                      } ${isMinting ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      WETH
                    </button>
                    <button
                      onClick={() => !isMinting && setSelectedCurrency("DONUT")}
                      disabled={isMinting}
                      className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
                        selectedCurrency === "DONUT"
                          ? "bg-[#D4915D] text-white shadow-md"
                          : "bg-white/50 text-[#5C4A3D] hover:bg-white/70"
                      } ${isMinting ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      DONUT
                    </button>
                  </div>
                  {flairMintPrice && (
                    <div className="mt-2 text-xs text-[#8B7355] text-center">
                      Flair cost: {selectedCurrency === "DONUT" && minerState?.donutPrice
                        ? `${Math.ceil(Number(flairMintPrice * 10n**18n / minerState.donutPrice) / 10**18).toLocaleString()} DONUT`
                        : `${parseFloat(formatUnits(flairMintPrice, 18))} WETH`}
                    </div>
                  )}
                </div>
              </>
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
