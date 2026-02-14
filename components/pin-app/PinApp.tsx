"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserState } from "@/hooks/useUserState";
import { useOnboardingMint } from "@/hooks/useOnboardingMint";
import { useFlair } from "@/hooks/useFlair";
import { useFlairYield } from "@/hooks/useFlairYield";
import { usePins } from "@/hooks/usePins";
import { useFrameContext } from "@/providers/FrameSDKProvider";
import { usePool } from "@/providers/PoolProvider";
import { ShareModal, type ShareAction } from "@/components/share-modal";
import { formatUnits, parseEther } from "viem";
import { useMinerState } from "@/hooks/useMinerState";
import { useDonutPriceUsd } from "@/hooks/useDonutPriceUsd";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import {
  FLAIR_TOKENS,
  getFlairImagePath,
  type FlairTokenData,
  type GaugeName,
} from "@/lib/flair-data";
import {
  AboutModal,
  AuctionModal,
  FlairModal,
  FlashLoanModal,
  PoolModal,
  type ModalType,
} from "@/components/modals";

// Bronze flair options for onboarding
const BRONZE_FLAIR = FLAIR_TOKENS.filter((f) => f.rarity === "Bronze");

// Role descriptions for each flair type - you're joining the team!
const ROLE_INFO: Record<GaugeName, { title: string; description: string }> = {
  "Donut": { title: "Baker", description: "Earn $DONUT" },
  "Teller": { title: "Teller", description: "Earn fees" },
  "Donut wETH LP": { title: "Manager", description: "Earn LP fees" },
  "Aerodrome": { title: "Pilot", description: "Earn $AERO" },
  "Clanker": { title: "Engineer", description: "Earn $CLANKER" },
  "QR": { title: "Promoter", description: "Earn $QR" },
  "USDC": { title: "Cashier", description: "Earn $USDC" },
};

interface PinAppProps {
  initialModal?: ModalType;
}

// The donut - a living, breathing companion
export function PinApp({ initialModal = null }: PinAppProps) {
  const { segment, hasPin, hasShares, hasEquippedFlair } = useUserState();
  const { fUser } = useFrameContext();
  const { equippedFlair } = useFlair();
  const { pinId, pinImageUrl, pinMintPrice, flairMintPrice, refetchPinData } = usePins();
  const { claimableYield, hasClaimableYield, claimYield, isClaiming } = useFlairYield();
  const { isMinting, mintProgress, executeOnboarding, executeFreeMint } = useOnboardingMint();
  const { tvl, shareTokenBalance, shareTokenTotalSupply } = usePool();
  const { minerState } = useMinerState();
  const { donutPriceUsd, ethPrice } = useDonutPriceUsd();

  // Interaction states
  const [phase, setPhase] = useState<"idle" | "awakening" | "choosing" | "feeding" | "birthing" | "celebrating">("idle");
  const [selectedFlair, setSelectedFlair] = useState<FlairTokenData | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<string>("0.01");
  const [selectedCurrency, setSelectedCurrency] = useState<"ETH" | "DONUT">("ETH");

  // Track if user just minted (for mock mode - overrides hasPin/hasFlair)
  const [justMinted, setJustMinted] = useState(false);
  const [justEquippedFlair, setJustEquippedFlair] = useState(false);

  // Share modal
  const [shareOpen, setShareOpen] = useState(false);
  const [shareAction, setShareAction] = useState<ShareAction>("mint-pin");
  const shareEmbed = `${typeof window !== "undefined" ? window.location.origin : "https://peeplesdonuts.com"}/?fid=${fUser?.fid || ""}`;
  const [shareDetails, setShareDetails] = useState({ message: "", embed: shareEmbed });

  // If hasPin becomes true mid-onboarding (e.g. data loaded late), reset to idle
  useEffect(() => {
    if (hasPin && phase !== "idle" && phase !== "celebrating") {
      setPhase("idle");
    }
  }, [hasPin, phase]);

  // Bottom drawer for power features
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Modal state for power features
  const [activeModal, setActiveModal] = useState<ModalType>(initialModal);

  // Animation states
  const [ripples, setRipples] = useState<number[]>([]);
  const donutRef = useRef<HTMLDivElement>(null);



  // Calculate total claimable yield in USD
  const totalYieldUsd = useMemo(() => {
    if (!claimableYield?.tokens.length || !ethPrice) return 0;
    return claimableYield.tokens.reduce((sum, t) => {
      const addr = t.address.toLowerCase();
      if (addr === CONTRACT_ADDRESSES.weth.toLowerCase()) {
        return sum + t.formattedAmount * ethPrice;
      }
      if (addr === CONTRACT_ADDRESSES.donut.toLowerCase()) {
        return sum + t.formattedAmount * donutPriceUsd;
      }
      // Unknown tokens — skip in USD total
      return sum;
    }, 0);
  }, [claimableYield, ethPrice, donutPriceUsd]);

  // Calculate yield power from equipped flair (sum of weights)
  const yieldPower = useMemo(() => {
    return equippedFlair.reduce((sum, flair) => {
      if (!flair) return sum;
      return sum + (flair.weight || 1);
    }, 0);
  }, [equippedFlair]);

  // Calculate pool position value in ETH
  const poolPositionEth = useMemo(() => {
    if (!shareTokenBalance || !shareTokenTotalSupply || shareTokenTotalSupply === 0n || !tvl) {
      return 0;
    }
    const sharePercent = Number(shareTokenBalance) / Number(shareTokenTotalSupply);
    const wethValue = parseFloat(formatUnits(tvl.wethTVL || 0n, 18)) * sharePercent;
    return wethValue;
  }, [shareTokenBalance, shareTokenTotalSupply, tvl]);

  // Get primary role from first equipped flair
  const primaryRole = useMemo(() => {
    const firstFlair = equippedFlair.find(f => f !== null);
    if (firstFlair) {
      return ROLE_INFO[firstFlair.gauge as GaugeName]?.title || "Member";
    }
    return "Member";
  }, [equippedFlair]);

  // Donut tap handler
  const handleDonutTap = useCallback(() => {
    // Add ripple effect
    setRipples((r) => [...r, Date.now()]);
    setTimeout(() => setRipples((r) => r.slice(1)), 1000);

    const userHasPin = hasPin || justMinted;
    if (!userHasPin) {
      // Start the awakening ritual (mint flow)
      if (phase === "idle") {
        setPhase("awakening");
        setTimeout(() => setPhase("choosing"), 800);
      }
    } else if (hasClaimableYield && phase === "idle") {
      // Will trigger claim - but we need claimYield directly here
      claimYield().then(() => {
        setShareAction("claim-yield");
        setShareDetails({
          message: `Payday at Peeples! Just collected $${totalYieldUsd.toFixed(2)} from my shift 🍩💰`,
          embed: shareEmbed,
        });
        setShareOpen(true);
      });
    }
  }, [hasPin, justMinted, hasClaimableYield, phase, claimYield, totalYieldUsd]);

  // Flair selection
  const handleFlairSelect = useCallback((flair: FlairTokenData) => {
    setSelectedFlair(flair);
    setPhase("feeding");
  }, []);

  // Amount selection and mint
  const handleAmountSelect = useCallback((amount: string) => {
    setSelectedAmount(amount);
  }, []);

  // Birth the donut (mint)
  const handleBirth = useCallback(async () => {
    if (!selectedFlair) return;

    setPhase("birthing");

    const result = hasShares && !hasPin
      ? await executeFreeMint({
          flairTokenId: BigInt(selectedFlair.tokenId),
          currency: selectedCurrency,
          flairPrice: flairMintPrice ?? 0n,
        })
      : await executeOnboarding({
          flairTokenId: BigInt(selectedFlair.tokenId),
          wethAmount: parseEther(selectedAmount || "0"),
          gauge: selectedFlair.gauge,
          currency: selectedCurrency,
          mintPrice: pinMintPrice ?? 0n,
          flairPrice: flairMintPrice ?? 0n,
        });

    if (result?.success) {
      // Mark as minted (for mock mode state tracking)
      setJustMinted(true);
      // Both paid and free paths now equip flair
      if (selectedFlair) {
        setJustEquippedFlair(true);
      }

      // Refetch pin data so tokenURI + image resolve from onchain
      await refetchPinData();

      setPhase("celebrating");
      // Don't auto-dismiss - let user interact with their new pin
    } else {
      setPhase("idle");
    }
  }, [selectedFlair, selectedAmount, selectedCurrency, hasShares, hasPin, executeOnboarding, executeFreeMint, refetchPinData, pinMintPrice, flairMintPrice, minerState]);

  // Loading state
  if (segment === "loading") {
    return (
      <div className="fixed inset-0 bg-[#FDF6E3] flex items-center justify-center">
        <div className="text-8xl animate-pulse">🍩</div>
      </div>
    );
  }

  // isAwake = user has a pin (or just minted one in this session)
  const isAwake = hasPin || justMinted;
  const isFreebie = hasShares && !hasPin && !justMinted;
  // hasFlair = user has equipped flair (or just equipped during this session)
  const hasFlair = hasEquippedFlair || justEquippedFlair;

  // ============================================
  // POST-MINT VIEW - User has a pin
  // ============================================
  if (isAwake && phase === "idle") {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-[#FDF6E3] via-[#FAF0DC] to-[#F5E6C8] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 donut-ring">
              <div className="donut-ring-inner">
                <img
                  src="/media/peeples_donuts.png"
                  alt="Peeples Donuts"
                  className="w-9 h-9 object-contain"
                />
              </div>
            </div>
            <span className="text-2xl font-bold tracking-wider amatic text-[#3D2914]">
              PEEPLES DONUTS
            </span>
          </div>

          {/* User Badge */}
          {fUser && (
            <div className="glazed-card px-3 py-2 flex items-center gap-2">
              <Avatar className="h-8 w-8 ring-2 ring-[#D4915D]/30">
                <AvatarImage
                  src={fUser.pfpUrl || undefined}
                  alt={fUser.displayName || fUser.username || "User"}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-[#D4915D] to-[#B8763C] text-white text-[10px] font-bold">
                  {(fUser.displayName || fUser.username || "?").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="leading-tight text-left">
                <div className="text-xs font-bold text-[#3D2914] max-w-[80px] truncate">
                  {fUser.displayName || fUser.username}
                </div>
                <div className="text-[9px] text-[#8B7355]">
                  @{fUser.username || `fid:${fUser.fid}`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center px-4 overflow-y-auto">
          {/* Pin image - HERO */}
          <div className="relative my-4">
            {/* Glow effect */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#F4A627]/30 to-[#E85A71]/20 blur-2xl" />
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              {pinImageUrl ? (
                <img
                  src={pinImageUrl}
                  alt="Your Pin"
                  className="w-full h-full object-cover"
                />
              ) : fUser?.pfpUrl ? (
                <img
                  src={fUser.pfpUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#F4A627] to-[#D4915D] flex items-center justify-center">
                  <span className="text-6xl">🍩</span>
                </div>
              )}
            </div>
          </div>

          {/* Role badge */}
          <div className="flex items-center gap-2 px-5 py-2 bg-white rounded-full shadow-lg mb-3">
            <span className="text-base font-bold text-[#3D2914]">{primaryRole}</span>
          </div>

          {/* Flair Slots - 3 interactive slots */}
          <div className="flex justify-center gap-3 mb-5">
            {[0, 1, 2].map((slotIndex) => {
              const flair = equippedFlair[slotIndex];
              console.log(flair);
              const isEmpty = !flair;

              return (
                <button
                  key={slotIndex}
                  onClick={() => setActiveModal("flair")}
                  className={cn(
                    "w-16 h-16 rounded-xl flex flex-col items-center justify-center transition-all",
                    "hover:scale-105 active:scale-95",
                    isEmpty
                      ? "bg-white/50 border-2 border-dashed border-[#D4915D]/40"
                      : "bg-white shadow-md border-2 border-white"
                  )}
                >
                  {flair ? (
                    <>
                      <img
                        src={getFlairImagePath(flair.gauge as GaugeName, flair.rarity)}
                        alt={flair.gauge}
                        className="w-10 h-10 object-contain"
                      />
                      <span className="text-[8px] font-bold text-[#8B7355] mt-0.5">
                        {(flair.rarity as string).slice(0, 4)}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl text-[#D4915D]/40">+</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Stats section */}
          <div className="w-full max-w-xs space-y-3 mb-5">
            {/* Ready to Claim - only show if > 0 */}
            {hasClaimableYield && (
              <div className="bg-gradient-to-r from-[#6B9B7A] to-[#5C946E] rounded-2xl p-4 text-center shadow-lg">
                <p className="text-xs text-white/80 font-medium mb-1">Ready to Claim</p>
                <p className="text-2xl font-bold text-white">${totalYieldUsd.toFixed(2)}</p>
              </div>
            )}

            {/* Secondary stats row */}
            <div className="flex gap-3">
              <div className="flex-1 bg-white/70 rounded-xl p-3 text-center">
                <p className="text-[10px] text-[#8B7355] uppercase tracking-wide">Position</p>
                <p className="text-sm font-bold text-[#3D2914]">
                  {poolPositionEth > 0 ? `${poolPositionEth.toFixed(4)} Ξ` : "0 Ξ"}
                </p>
              </div>
              <div className="flex-1 bg-white/70 rounded-xl p-3 text-center">
                <p className="text-[10px] text-[#8B7355] uppercase tracking-wide">Yield Power</p>
                <p className="text-sm font-bold text-[#3D2914]">
                  {yieldPower > 0 ? `${yieldPower}x` : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="w-full max-w-xs space-y-3">
            {hasClaimableYield ? (
              <button
                onClick={() => {
                  claimYield().then(() => {
                    setShareAction("claim-yield");
                    setShareDetails({
                      message: `Payday at Peeples! Just collected $${totalYieldUsd.toFixed(2)} 🍩💰`,
                      embed: shareEmbed,
                    });
                    setShareOpen(true);
                  });
                }}
                disabled={isClaiming}
                className={cn(
                  "w-full py-4 rounded-full font-bold text-lg bg-[#6B9B7A] text-white shadow-lg",
                  "hover:scale-[1.02] active:scale-[0.98] transition-transform",
                  isClaiming && "opacity-70"
                )}
              >
                {isClaiming ? "Claiming..." : `Claim $${totalYieldUsd.toFixed(2)}`}
              </button>
            ) : (
              <button
                onClick={() => {
                  setShareAction("mint-pin");
                  setShareDetails({
                    message: `I'm part of the Peeples Donuts team! 🍩`,
                    embed: shareEmbed,
                  });
                  setShareOpen(true);
                }}
                className="w-full py-4 rounded-full font-bold text-lg bg-[#D4915D] text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Share Pin
              </button>
            )}

            <button
              onClick={() => setActiveModal("flair")}
              className="w-full py-3 rounded-full font-medium text-[#5C4A3D] bg-white shadow-md hover:shadow-lg transition-shadow"
            >
              {hasFlair ? "Manage Flair" : "Get Flair to Earn"}
            </button>
          </div>
        </div>

        {/* Bottom drawer handle */}
        <div className="py-4">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-full flex items-center justify-center gap-2 text-[#8B7355] text-sm"
          >
            <span>More features</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>

        {/* Bottom drawer overlay */}
        {drawerOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setDrawerOpen(false)}
          />
        )}

        {/* Bottom drawer */}
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 bg-[#FDF6E3] rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out",
            drawerOpen ? "translate-y-0" : "translate-y-full"
          )}
          style={{ maxHeight: "60vh" }}
        >
          {/* Drawer handle */}
          <div className="flex justify-center pt-3 pb-2">
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-12 h-1.5 bg-[#D4C4A8] rounded-full"
            />
          </div>

          {/* Drawer content */}
          <div className="px-6 pb-8 overflow-y-auto" style={{ maxHeight: "calc(60vh - 40px)" }}>
            <h3 className="text-lg font-bold text-[#3D2914] mb-4">Power Features</h3>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  setActiveModal("pool");
                }}
                className="w-full p-4 bg-white rounded-xl text-left shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#82AD94]/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🏊</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#3D2914]">Family Pool</p>
                    <p className="text-xs text-[#8B7355]">Deposit, withdraw, manage position</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setDrawerOpen(false);
                  setActiveModal("auction");
                }}
                className="w-full p-4 bg-white rounded-xl text-left shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F4A627]/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl">👑</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#3D2914]">Blazery & Auction</p>
                    <p className="text-xs text-[#8B7355]">Bid to become Head Baker</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setDrawerOpen(false);
                  setActiveModal("flashloan");
                }}
                className="w-full p-4 bg-white rounded-xl text-left shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F4A627]/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl">⚡</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#3D2914]">Flash Loans</p>
                    <p className="text-xs text-[#8B7355]">Borrow WETH or DONUT instantly</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setDrawerOpen(false);
                  setActiveModal("about");
                }}
                className="w-full p-4 bg-white rounded-xl text-left shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#B48EF7]/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl">ℹ️</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#3D2914]">About Donut</p>
                    <p className="text-xs text-[#8B7355]">Learn how it all works</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Share modal */}
        <ShareModal
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          action={shareAction}
          details={shareDetails}
        />

        {/* Feature Modals */}
        <PoolModal
          isOpen={activeModal === "pool"}
          onClose={() => setActiveModal(null)}
        />
        <AuctionModal
          isOpen={activeModal === "auction"}
          onClose={() => setActiveModal(null)}
        />
        <FlairModal
          isOpen={activeModal === "flair"}
          onClose={() => setActiveModal(null)}
        />
        <FlashLoanModal
          isOpen={activeModal === "flashloan"}
          onClose={() => setActiveModal(null)}
        />
        <AboutModal
          isOpen={activeModal === "about"}
          onClose={() => setActiveModal(null)}
        />
      </div>
    );
  }

  // ============================================
  // ONBOARDING VIEW - User needs to mint
  // ============================================
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#FDF6E3] via-[#FAF0DC] to-[#F5E6C8] overflow-hidden">
      {/* THE DONUT - Center of everything */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          ref={donutRef}
          className={cn(
            "relative cursor-pointer transition-transform duration-300",
            phase === "awakening" && "animate-pulse scale-110",
            phase === "celebrating" && "scale-125",
            phase === "idle" && "animate-breathe"
          )}
          onClick={handleDonutTap}
        >
          {/* Ripple effects */}
          {ripples.map((r) => (
            <div
              key={r}
              className="absolute inset-0 rounded-full border-2 border-[#D4915D]/30 animate-ping"
            />
          ))}

          {/* Main donut body */}
          <div
            className="relative w-56 h-56 rounded-full bg-gradient-to-br from-[#E8DCC8] to-[#D4C4A8] border-4 border-dashed border-[#D4915D]/30 transition-all duration-500"
            style={{ boxShadow: `0 10px 30px rgba(139, 115, 85, 0.2)` }}
          >
            {/* Donut hole / face area */}
            <div className="absolute inset-8 rounded-full bg-[#FDF6E3] flex items-center justify-center overflow-hidden shadow-inner">
              {/* Birthing phase - simple elegant loader */}
              {phase === "birthing" ? (
                <div className="flex flex-col items-center justify-center relative w-full h-full">
                  <div className="absolute inset-2 rounded-full border-[3px] border-[#E8DCC8]" />
                  <div className="absolute inset-2 rounded-full border-[3px] border-transparent border-t-[#D4915D] animate-spin-slow" />
                  <img
                    src="/media/peeples_donuts.png"
                    alt=""
                    className="w-12 h-12 object-contain opacity-60"
                  />
                </div>
              ) : selectedFlair && phase === "feeding" ? (
                <div className="text-center flex flex-col items-center justify-center">
                  <img
                    src={getFlairImagePath(selectedFlair.gauge, "Bronze")}
                    alt=""
                    className="w-16 h-16 object-contain mb-1"
                  />
                  <span className="text-xs text-[#8B7355] font-medium">
                    {ROLE_INFO[selectedFlair.gauge].title}
                  </span>
                </div>
              ) : (
                <div className="text-center flex flex-col items-center justify-center">
                  <img
                    src="/media/peeples_donuts.png"
                    alt=""
                    className="w-16 h-16 object-contain opacity-50 mb-1"
                  />
                  {phase === "idle" && (
                    <span className="text-xs text-[#8B7355] font-medium">
                      tap to join
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contextual UI - appears based on phase */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-12 px-6 z-10">
        {/* Role selection during awakening */}
        {phase === "choosing" && (
          <div className="w-full max-w-md animate-slideUp bg-[#FDF6E3] pt-5 pb-4 px-5 rounded-3xl shadow-xl border border-[#E8DCC8]">
            <p className="text-center text-[#3D2914] font-bold text-lg mb-1">
              Pick your role
            </p>
            <p className="text-center text-[#8B7355] text-sm mb-4">
              {isFreebie ? "Welcome back! What position suits you?" : "Every employee needs a job"}
            </p>
            <div className="flex justify-center gap-2 flex-wrap mb-4">
              {BRONZE_FLAIR.map((flair) => {
                const role = ROLE_INFO[flair.gauge];
                const isSelected = selectedFlair?.tokenId === flair.tokenId;
                return (
                  <button
                    key={flair.tokenId}
                    onClick={() => handleFlairSelect(flair)}
                    className={cn(
                      "w-[72px] p-2 rounded-2xl flex flex-col items-center gap-1 transition-all",
                      "bg-white/90 shadow-md hover:shadow-lg hover:scale-105",
                      "border-2",
                      isSelected
                        ? "border-[#E85A71] scale-105 shadow-lg"
                        : "border-[#E8DCC8] hover:border-[#D4915D]"
                    )}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#FAF0DC]">
                      <img
                        src={getFlairImagePath(flair.gauge, "Bronze")}
                        alt={role.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[10px] text-[#3D2914] font-bold leading-tight">
                      {role.title}
                    </span>
                    <span className="text-[8px] text-[#8B7355] leading-tight">
                      {role.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Deposit selection - your starting investment */}
        {phase === "feeding" && !isFreebie && (
          <div className="w-full max-w-sm animate-slideUp bg-[#FDF6E3] pt-5 pb-2 px-5 rounded-3xl shadow-xl border border-[#E8DCC8]">
            <p className="text-center text-[#3D2914] font-bold text-lg mb-1">
              {selectedFlair ? `Join as ${ROLE_INFO[selectedFlair.gauge].title}` : "Make your deposit"}
            </p>
            <p className="text-center text-[#8B7355] text-sm mb-3">
              Your deposit gets you a Pin + Flair in one transaction
            </p>

            {/* What you get breakdown */}
            <div className="flex justify-center gap-3 mb-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 rounded-full">
                <span className="text-sm">🎫</span>
                <span className="text-xs font-medium text-[#5C4A3D]">Pin</span>
              </div>
              <span className="text-[#8B7355] text-lg">+</span>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 rounded-full">
                {selectedFlair && (
                  <img
                    src={getFlairImagePath(selectedFlair.gauge, "Bronze")}
                    alt=""
                    className="w-4 h-4 object-contain"
                  />
                )}
                <span className="text-xs font-medium text-[#5C4A3D]">
                  {selectedFlair ? ROLE_INFO[selectedFlair.gauge].title : "Flair"}
                </span>
              </div>
            </div>

            {/* Currency toggle */}
            <div className="flex justify-center gap-2 mb-4">
              <button
                onClick={() => {
                  setSelectedCurrency("ETH");
                  const mintEth = pinMintPrice ? parseFloat(formatUnits(pinMintPrice, 18)) : 0;
                  setSelectedAmount(mintEth.toFixed(4));
                }}
                className={cn(
                  "px-5 py-2 rounded-full font-bold text-sm transition-all",
                  selectedCurrency === "ETH"
                    ? "bg-[#627EEA] text-white shadow-md"
                    : "bg-white/50 text-[#5C4A3D] hover:bg-white/70"
                )}
              >
                ETH
              </button>
              <button
                onClick={() => {
                  setSelectedCurrency("DONUT");
                  const mintEth = pinMintPrice ? parseFloat(formatUnits(pinMintPrice, 18)) : 0;
                  setSelectedAmount(mintEth.toFixed(4));
                }}
                className={cn(
                  "px-5 py-2 rounded-full font-bold text-sm transition-all",
                  selectedCurrency === "DONUT"
                    ? "bg-[#D4915D] text-white shadow-md"
                    : "bg-white/50 text-[#5C4A3D] hover:bg-white/70"
                )}
              >
                DONUT
              </button>
            </div>

            {/* Amount presets — values always in ETH, display converts to DONUT */}
            <div className="flex justify-center gap-2 mb-4">
              {(() => {
                const mintEth = pinMintPrice ? parseFloat(formatUnits(pinMintPrice, 18)) : 0;
                const donutPriceEth = minerState?.donutPrice ? parseFloat(formatUnits(minerState.donutPrice, 18)) : 0;
                const isDonut = selectedCurrency === "DONUT" && donutPriceEth > 0;
                const ethPresets = [mintEth, mintEth * 2.5, mintEth * 5, mintEth * 10].map(v => v.toFixed(4));

                return ethPresets.map((ethAmt) => {
                  const label = isDonut
                    ? Math.ceil(parseFloat(ethAmt) / donutPriceEth).toLocaleString()
                    : `${parseFloat(ethAmt)}Ξ`;
                  return (
                    <button
                      key={ethAmt}
                      onClick={() => handleAmountSelect(ethAmt)}
                      className={cn(
                        "px-3 py-2 rounded-full font-bold text-sm transition-all",
                        selectedAmount === ethAmt
                          ? "bg-[#D4915D] text-white shadow-lg scale-105"
                          : "bg-white/70 text-[#5C4A3D] hover:bg-white"
                      )}
                    >
                      {label}
                    </button>
                  );
                });
              })()}
            </div>

            {/* Cost breakdown — selectedAmount is always ETH, display converts to DONUT */}
            <div className="bg-[#F5E6C8]/50 rounded-xl p-3 mb-4">
              {(() => {
                const totalEth = parseFloat(selectedAmount || "0");
                const mintEth = pinMintPrice ? parseFloat(formatUnits(pinMintPrice, 18)) : 0;
                const flairEth = flairMintPrice ? parseFloat(formatUnits(flairMintPrice, 18)) : 0;
                const donutPriceEth = minerState?.donutPrice ? parseFloat(formatUnits(minerState.donutPrice, 18)) : 0;
                const isDonut = selectedCurrency === "DONUT" && donutPriceEth > 0;

                const toDisplay = (ethVal: number) => isDonut ? Math.ceil(ethVal / donutPriceEth) : ethVal;
                const pinCost = toDisplay(mintEth);
                const flairCost = toDisplay(flairEth);
                const deposit = toDisplay(Math.max(0, totalEth - mintEth));
                const grandTotal = toDisplay(totalEth + flairEth);
                const unit = isDonut ? "DONUT" : "ETH";
                const fmt = (v: number) => isDonut ? v.toLocaleString() : v.toFixed(4);

                return (
                  <>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#8B7355]">Pin mint</span>
                      <span className="text-[#5C4A3D] font-medium">{fmt(pinCost)} {unit}</span>
                    </div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#8B7355]">Extra deposit</span>
                      <span className="text-[#5C4A3D] font-medium">{fmt(deposit)} {unit}</span>
                    </div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#8B7355]">Bronze Flair</span>
                      <span className="text-[#5C4A3D] font-medium">{fmt(flairCost)} {unit}</span>
                    </div>
                    <div className="border-t border-[#D4C4A8] pt-1.5 flex justify-between text-xs">
                      <span className="text-[#5C4A3D] font-bold">Total</span>
                      <span className="text-[#3D2914] font-bold">{fmt(grandTotal)} {unit}</span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Pool shares note */}
            <p className="text-center text-[#8B7355] text-[10px] mb-3 px-2">
              Deposit more than the minimum to earn more pool shares!
            </p>

            <button
              onClick={handleBirth}
              disabled={isMinting}
              className={cn(
                "w-full py-4 rounded-full font-bold text-lg text-white transition-all",
                "bg-gradient-to-r from-[#E85A71] to-[#C94A5C] shadow-xl",
                "hover:scale-[1.02] active:scale-[0.98]",
                isMinting && "opacity-70"
              )}
            >
              {isMinting ? `Minting... ${mintProgress}%` : "Get Pin + Flair"}
            </button>
          </div>
        )}

        {/* Free mint flow - returning shareholder (free pin + paid flair) */}
        {phase === "feeding" && isFreebie && (
          <div className="w-full max-w-sm animate-slideUp bg-[#FDF6E3] pt-5 pb-2 px-5 rounded-3xl shadow-xl border border-[#E8DCC8]">
            <p className="text-center text-[#3D2914] font-bold text-lg mb-1">
              Welcome back, fam!
            </p>
            <p className="text-center text-[#8B7355] text-sm mb-3">
              {selectedFlair ? `Free pin + ${ROLE_INFO[selectedFlair.gauge].title} flair in one go` : "Claim your employee pin"}
            </p>

            {/* What you get */}
            <div className="flex justify-center gap-3 mb-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6B9B7A]/10 rounded-full">
                <span className="text-sm">🎫</span>
                <span className="text-xs font-medium text-[#5C4A3D]">Free Pin</span>
              </div>
              <span className="text-[#8B7355] text-lg">+</span>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 rounded-full">
                {selectedFlair && (
                  <img
                    src={getFlairImagePath(selectedFlair.gauge, "Bronze")}
                    alt=""
                    className="w-4 h-4 object-contain"
                  />
                )}
                <span className="text-xs font-medium text-[#5C4A3D]">
                  {selectedFlair ? ROLE_INFO[selectedFlair.gauge].title : "Flair"}
                </span>
              </div>
            </div>

            {/* Currency toggle */}
            <div className="flex justify-center gap-2 mb-4">
              <button
                onClick={() => setSelectedCurrency("ETH")}
                className={cn(
                  "px-5 py-2 rounded-full font-bold text-sm transition-all",
                  selectedCurrency === "ETH"
                    ? "bg-[#627EEA] text-white shadow-md"
                    : "bg-white/50 text-[#5C4A3D] hover:bg-white/70"
                )}
              >
                ETH
              </button>
              <button
                onClick={() => setSelectedCurrency("DONUT")}
                className={cn(
                  "px-5 py-2 rounded-full font-bold text-sm transition-all",
                  selectedCurrency === "DONUT"
                    ? "bg-[#D4915D] text-white shadow-md"
                    : "bg-white/50 text-[#5C4A3D] hover:bg-white/70"
                )}
              >
                DONUT
              </button>
            </div>

            {/* Cost breakdown — display converts to DONUT */}
            <div className="bg-[#F5E6C8]/50 rounded-xl p-3 mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#8B7355]">Peeples Pin</span>
                <span className="text-[#6B9B7A] font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#8B7355]">Bronze Flair</span>
                <span className="text-[#5C4A3D] font-medium">
                  {(() => {
                    if (!flairMintPrice) return "...";
                    const flairEth = parseFloat(formatUnits(flairMintPrice, 18));
                    const donutPriceEth = minerState?.donutPrice ? parseFloat(formatUnits(minerState.donutPrice, 18)) : 0;
                    if (selectedCurrency === "DONUT" && donutPriceEth > 0) {
                      return `${Math.ceil(flairEth / donutPriceEth).toLocaleString()} DONUT`;
                    }
                    return `${flairEth} WETH`;
                  })()}
                </span>
              </div>
            </div>

            <button
              onClick={handleBirth}
              disabled={isMinting || !flairMintPrice}
              className={cn(
                "w-full py-4 rounded-full font-bold text-lg text-white transition-all",
                "bg-gradient-to-r from-[#6B9B7A] to-[#5C946E] shadow-xl",
                "hover:scale-[1.02] active:scale-[0.98]",
                (isMinting || !flairMintPrice) && "opacity-70"
              )}
            >
              {isMinting ? `Minting... ${mintProgress}%` : "Get Pin + Flair"}
            </button>
          </div>
        )}

        {/* Minting progress */}
        {phase === "birthing" && (
          <div className="text-center animate-pulse bg-[#FDF6E3] pt-5 pb-6 px-5 rounded-3xl shadow-xl border border-[#E8DCC8]">
            <p className="text-lg text-[#3D2914] font-bold">
              Minting your Peeples Pin...
            </p>
            <p className="text-sm text-[#8B7355] mt-1">
              Welcome to the team!
            </p>
            <div className="w-48 h-2 bg-[#E8DCC8] rounded-full mt-4 mx-auto overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#E85A71] to-[#F4A627] transition-all duration-300"
                style={{ width: `${mintProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Celebrating - full screen pin reveal with next steps */}
        {phase === "celebrating" && (
          <div className="fixed inset-0 bg-gradient-to-b from-[#3D2914] via-[#5C4A3D] to-[#3D2914] z-50 flex flex-col items-center justify-center px-6 animate-fadeIn">
            {/* Welcome text */}
            <p className="text-[#FAF0DC]/80 text-sm tracking-widest uppercase mb-4">
              Welcome to the team
            </p>

            {/* BIG PIN DISPLAY */}
            <div className="relative mb-6">
              {pinImageUrl ? (
                <div className="relative">
                  <img
                    src={pinImageUrl}
                    alt="Your Peeples Pin"
                    className="w-64 h-64 rounded-3xl shadow-2xl object-cover border-4 border-[#FAF0DC]/20"
                  />
                  {/* Glow effect */}
                  <div className="absolute -inset-4 rounded-3xl bg-[#F4A627]/20 blur-xl -z-10" />
                </div>
              ) : (
                <div className="w-64 h-64 rounded-3xl bg-[#FAF0DC]/10 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-[#FAF0DC]/30 border-t-[#E85A71] rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Role badge */}
            {selectedFlair && (
              <div className="flex items-center gap-2 px-4 py-2 bg-[#FAF0DC]/10 rounded-full mb-6">
                <img
                  src={getFlairImagePath(selectedFlair.gauge, "Bronze")}
                  alt=""
                  className="w-6 h-6 object-contain"
                />
                <span className="text-[#FAF0DC] font-medium">
                  {ROLE_INFO[selectedFlair.gauge].title}
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="w-full max-w-xs space-y-3">
              <button
                onClick={() => {
                  setShareAction("mint-pin");
                  setShareDetails({
                    message: `Just got hired at Peeples Donuts as a ${selectedFlair ? ROLE_INFO[selectedFlair.gauge].title : "team member"}! 🍩`,
                    embed: shareEmbed,
                  });
                  setShareOpen(true);
                }}
                className="w-full py-4 rounded-full font-bold text-lg bg-[#E85A71] text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Share to Farcaster
              </button>

              <button
                onClick={() => {
                  setPhase("idle");
                  // Navigate to flair shop after a brief moment
                  setTimeout(() => {
                    setActiveModal("flair");
                  }, 100);
                }}
                className="w-full py-4 rounded-full font-bold text-lg bg-[#FAF0DC]/10 text-[#FAF0DC] border border-[#FAF0DC]/30 hover:bg-[#FAF0DC]/20 transition-colors"
              >
                Get More Flair
              </button>

              <button
                onClick={() => setPhase("idle")}
                className="w-full py-3 text-[#FAF0DC]/60 text-sm hover:text-[#FAF0DC] transition-colors"
              >
                Continue to app →
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Header with logo */}
      <div className="absolute top-0 inset-x-0 pt-4 pb-6 bg-gradient-to-b from-[#3D2914] to-transparent">
        <div className="flex flex-col items-center">
          <img
            src="/media/peeples_donuts.png"
            alt="Peeples Donuts"
            className="w-14 h-14 object-contain drop-shadow-lg"
          />
          <p className="text-[10px] text-[#000000]/80 tracking-[0.2em] uppercase mt-1">
            Join the family
          </p>
        </div>
      </div>

      {/* Share modal */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        action={shareAction}
        details={shareDetails}
      />

      {/* Keyframe animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.5s ease-out forwards; }
        .animate-spin-slow { animation: spin-slow 1.5s linear infinite; }
        .animate-breathe { animation: breathe 3.6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
