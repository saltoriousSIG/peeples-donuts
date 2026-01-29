"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { useUserState } from "@/hooks/useUserState";
import { useOnboardingMint } from "@/hooks/useOnboardingMint";
import { useFlair } from "@/hooks/useFlair";
import { useFlairYield } from "@/hooks/useFlairYield";
import { usePins } from "@/hooks/usePins";
import { useFrameContext } from "@/providers/FrameSDKProvider";
import { ShareModal, type ShareAction } from "@/components/share-modal";
import generate_pin from "@/lib/server_functions/generate_pin";
import {
  FLAIR_TOKENS,
  getFlairImagePath,
  type FlairTokenData,
  type GaugeName,
  type Rarity,
} from "@/lib/flair-data";

// Bronze flair options for onboarding
const BRONZE_FLAIR = FLAIR_TOKENS.filter((f) => f.rarity === "Bronze");

// Role descriptions for each flair type - you're joining the team!
const ROLE_INFO: Record<GaugeName, { title: string; description: string }> = {
  "Donut": { title: "Baker", description: "Earn $DONUT" },
  "Donut/WETH LP": { title: "Manager", description: "Earn LP fees" },
  "USDC": { title: "Cashier", description: "Earn $USDC" },
  "QR": { title: "Promoter", description: "Earn $QR" },
  "Aero": { title: "Delivery", description: "Earn $AERO" },
};

// The donut - a living, breathing companion
export function PinApp() {
  const { segment, hasPin, hasShares, hasEquippedFlair } = useUserState();
  const { fUser } = useFrameContext();
  const { equippedFlair } = useFlair();
  const { pinId } = usePins();
  const { claimableYield, hasClaimableYield, claimYield } = useFlairYield();
  const { isMinting, mintProgress, executeOnboarding, executeFreeMint } = useOnboardingMint();

  // Interaction states
  const [phase, setPhase] = useState<"idle" | "awakening" | "choosing" | "feeding" | "birthing" | "celebrating">("idle");
  const [selectedFlair, setSelectedFlair] = useState<FlairTokenData | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<string>("0.01");

  // Generated pin preview
  const [generatedPinUrl, setGeneratedPinUrl] = useState<string | null>(null);
  const [isGeneratingPin, setIsGeneratingPin] = useState(false);

  // Track if user just minted (for mock mode - overrides hasPin/hasFlair)
  const [justMinted, setJustMinted] = useState(false);
  const [justEquippedFlair, setJustEquippedFlair] = useState(false);

  // Share modal
  const [shareOpen, setShareOpen] = useState(false);
  const [shareAction, setShareAction] = useState<ShareAction>("mint-pin");
  const [shareDetails, setShareDetails] = useState({ message: "", embed: "https://peeplesdonuts.com" });

  // Bottom drawer for power features
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Animation states
  const [breathePhase, setBreathePhase] = useState(0);
  const [ripples, setRipples] = useState<number[]>([]);
  const donutRef = useRef<HTMLDivElement>(null);

  // Breathing animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathePhase((p) => (p + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);


  // Calculate total yield
  const totalYield = useMemo(
    () => claimableYield?.tokens.reduce((sum, t) => sum + t.formattedAmount, 0) ?? 0,
    [claimableYield]
  );

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
          message: `Payday at Peeples! Just collected $${totalYield.toFixed(2)} from my shift 🍩💰`,
          embed: "https://peeplesdonuts.com",
        });
        setShareOpen(true);
      });
    }
  }, [hasPin, justMinted, hasClaimableYield, phase, claimYield, totalYield]);

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
      ? await executeFreeMint()
      : await executeOnboarding({
          flairTokenId: BigInt(selectedFlair.tokenId),
          wethAmount: selectedAmount,
          gauge: selectedFlair.gauge,
        });

    if (result?.success) {
      // Mark as minted (for mock mode state tracking)
      setJustMinted(true);
      // If paid onboarding, they also got flair equipped
      if (!isFreebie && selectedFlair) {
        setJustEquippedFlair(true);
      }

      // Generate the pin AFTER payment succeeds
      if (fUser?.fid) {
        setIsGeneratingPin(true);
        try {
          const pinResult = await generate_pin(fUser.fid);
          setGeneratedPinUrl(pinResult.imageUrl);
        } catch (error) {
          console.error("Failed to generate pin:", error);
        } finally {
          setIsGeneratingPin(false);
        }
      }

      setPhase("celebrating");
      // Don't auto-dismiss - let user interact with their new pin
    } else {
      setPhase("idle");
    }
  }, [selectedFlair, selectedAmount, hasShares, hasPin, executeOnboarding, executeFreeMint, fUser?.fid]);

  // Navigate to flair shop
  const handleFlairSlotTap = useCallback(() => {
    window.location.href = "/pins";
  }, []);

  // Calculate breathing scale
  const breatheScale = 1 + Math.sin(breathePhase * 0.0174) * 0.02;

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
        <div className="pt-4 pb-2 px-6 flex items-center justify-between">
          <img
            src="/media/peeples_donuts.png"
            alt="Peeples Donuts"
            className="w-10 h-10 object-contain"
          />
          <div className="px-3 py-1 bg-[#3D2914] rounded-full">
            <span className="text-xs font-bold text-[#FAF0DC]">#{pinId || justMinted ? "NEW" : "---"}</span>
          </div>
        </div>

        {/* Main content - Pin card */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-8">
          {/* Pin image */}
          <div className="relative mb-4">
            <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
              {generatedPinUrl ? (
                <img
                  src={generatedPinUrl}
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
                  <span className="text-5xl">🍩</span>
                </div>
              )}
            </div>
          </div>

          {/* Role/Flair display */}
          {(hasFlair || selectedFlair) && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-4">
              <img
                src={getFlairImagePath(
                  (equippedFlair[0]?.gauge as GaugeName) || selectedFlair?.gauge || "Donut",
                  (equippedFlair[0]?.rarity as Rarity) || "Bronze"
                )}
                alt=""
                className="w-6 h-6 object-contain"
              />
              <span className="text-sm font-medium text-[#3D2914]">
                {ROLE_INFO[(equippedFlair[0]?.gauge as GaugeName) || selectedFlair?.gauge || "Donut"].title}
              </span>
            </div>
          )}

          {/* Yield status */}
          <div className="text-center mb-6">
            {hasClaimableYield ? (
              <>
                <p className="text-xs text-[#6B9B7A] font-medium mb-1">Ready to claim</p>
                <p className="text-3xl font-bold text-[#3D2914]">${totalYield.toFixed(4)}</p>
              </>
            ) : (
              <>
                <p className="text-xs text-[#8B7355] mb-1">Yield accumulating</p>
                <p className="text-lg font-medium text-[#3D2914]">$0.0000</p>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="w-full max-w-xs space-y-3">
            {hasClaimableYield ? (
              <button
                onClick={() => {
                  claimYield().then(() => {
                    setShareAction("claim-yield");
                    setShareDetails({
                      message: `Payday at Peeples! Just collected $${totalYield.toFixed(2)} 🍩💰`,
                      embed: "https://peeplesdonuts.com",
                    });
                    setShareOpen(true);
                  });
                }}
                className="w-full py-4 rounded-full font-bold text-lg bg-[#6B9B7A] text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Claim ${totalYield.toFixed(2)}
              </button>
            ) : (
              <button
                onClick={() => {
                  setShareAction("mint-pin");
                  setShareDetails({
                    message: `I'm now part of the Peeples Donuts team! 🍩`,
                    embed: generatedPinUrl || "https://peeplesdonuts.com",
                  });
                  setShareOpen(true);
                }}
                className="w-full py-4 rounded-full font-bold text-lg bg-[#D4915D] text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Share Pin
              </button>
            )}

            <button
              onClick={handleFlairSlotTap}
              className="w-full py-3 rounded-full font-medium text-[#5C4A3D] bg-white shadow-md hover:shadow-lg transition-shadow"
            >
              {hasFlair ? "Get More Flair" : "Get Flair to Start Earning"}
            </button>
          </div>
        </div>

        {/* Bottom drawer handle */}
        <div className="pb-6">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center justify-center gap-2 text-[#8B7355] text-sm"
          >
            <span>Explore more</span>
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
          style={{ maxHeight: "70vh" }}
        >
          {/* Drawer handle */}
          <div className="flex justify-center pt-3 pb-2">
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-12 h-1.5 bg-[#D4C4A8] rounded-full"
            />
          </div>

          {/* Drawer content */}
          <div className="px-6 pb-8 overflow-y-auto" style={{ maxHeight: "calc(70vh - 40px)" }}>
            <h3 className="text-lg font-bold text-[#3D2914] mb-4">Power Features</h3>

            {/* King Glazer - Featured */}
            <button
              onClick={() => {
                setDrawerOpen(false);
                window.location.href = "/auction";
              }}
              className="w-full p-4 bg-gradient-to-r from-[#F4A627] to-[#D4915D] rounded-2xl mb-3 text-left shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👑</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white">King Glazer</p>
                  <p className="text-sm text-white/80">Become the top shareholder</p>
                </div>
                <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Other features */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  window.location.href = "/auction";
                }}
                className="w-full p-4 bg-white rounded-xl text-left shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FAF0DC] rounded-lg flex items-center justify-center">
                    <span className="text-xl">🎪</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#3D2914]">Fee Auction</p>
                    <p className="text-xs text-[#8B7355]">Bid on protocol fees</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setDrawerOpen(false);
                  window.location.href = "/pool";
                }}
                className="w-full p-4 bg-white rounded-xl text-left shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FAF0DC] rounded-lg flex items-center justify-center">
                    <span className="text-xl">🏊</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#3D2914]">Pool</p>
                    <p className="text-xs text-[#8B7355]">Manage your position</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setDrawerOpen(false);
                  // Flash loans page TBD
                }}
                className="w-full p-4 bg-white rounded-xl text-left shadow-sm hover:shadow-md transition-shadow opacity-60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FAF0DC] rounded-lg flex items-center justify-center">
                    <span className="text-xl">⚡</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#3D2914]">Flash Loans</p>
                    <p className="text-xs text-[#8B7355]">Coming soon</p>
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
            phase === "celebrating" && "scale-125"
          )}
          style={{ transform: `scale(${breatheScale})` }}
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
                  <span className="text-xs text-[#8B7355] font-medium">
                    {phase === "idle" ? "tap to join" : phase === "choosing" ? "pick your role" : "..."}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contextual UI - appears based on phase */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-12 px-6">
        {/* Role selection during awakening */}
        {phase === "choosing" && (
          <div className="w-full max-w-md animate-slideUp">
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
          <div className="w-full max-w-sm animate-slideUp">
            <p className="text-center text-[#3D2914] font-bold text-lg mb-1">
              {selectedFlair ? `Join as ${ROLE_INFO[selectedFlair.gauge].title}` : "Make your deposit"}
            </p>
            <p className="text-center text-[#8B7355] text-sm mb-4">
              Every Peeples employee invests in the shop
            </p>
            <div className="flex justify-center gap-2 mb-6">
              {["0.005", "0.01", "0.025", "0.05"].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleAmountSelect(amt)}
                  className={cn(
                    "px-4 py-2 rounded-full font-bold transition-all",
                    selectedAmount === amt
                      ? "bg-[#D4915D] text-white shadow-lg scale-105"
                      : "bg-white/70 text-[#5C4A3D] hover:bg-white"
                  )}
                >
                  {amt}Ξ
                </button>
              ))}
            </div>
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
              {isMinting ? `Minting... ${mintProgress}%` : "Mint & Join 🍩"}
            </button>
          </div>
        )}

        {/* Free mint flow - returning shareholder */}
        {phase === "feeding" && isFreebie && (
          <div className="w-full max-w-sm animate-slideUp">
            <p className="text-center text-[#3D2914] font-bold text-lg mb-1">
              Welcome back, fam!
            </p>
            <p className="text-center text-[#8B7355] text-sm mb-4">
              {selectedFlair ? `Claim your ${ROLE_INFO[selectedFlair.gauge].title} pin - it's on the house` : "Claim your employee pin - it's on the house"}
            </p>
            <button
              onClick={handleBirth}
              disabled={isMinting}
              className={cn(
                "w-full py-4 rounded-full font-bold text-lg text-white transition-all",
                "bg-gradient-to-r from-[#6B9B7A] to-[#5C946E] shadow-xl",
                "hover:scale-[1.02] active:scale-[0.98]",
                isMinting && "opacity-70"
              )}
            >
              {isMinting ? `Minting... ${mintProgress}%` : "Claim Free Pin 🍩"}
            </button>
          </div>
        )}

        {/* Minting progress */}
        {phase === "birthing" && (
          <div className="text-center animate-pulse">
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
              {isGeneratingPin ? (
                <div className="w-64 h-64 rounded-3xl bg-[#FAF0DC]/10 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-[#FAF0DC]/30 border-t-[#E85A71] rounded-full animate-spin" />
                </div>
              ) : generatedPinUrl ? (
                <div className="relative">
                  <img
                    src={generatedPinUrl}
                    alt="Your Peeples Pin"
                    className="w-64 h-64 rounded-3xl shadow-2xl object-cover border-4 border-[#FAF0DC]/20"
                  />
                  {/* Glow effect */}
                  <div className="absolute -inset-4 rounded-3xl bg-[#F4A627]/20 blur-xl -z-10" />
                </div>
              ) : (
                <div className="w-64 h-64 rounded-3xl bg-gradient-to-br from-[#F4A627] to-[#E85A71] flex items-center justify-center shadow-2xl">
                  <span className="text-6xl">🍩</span>
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
                    embed: generatedPinUrl || "https://peeplesdonuts.com",
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
                    window.location.href = "/pins";
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
          <p className="text-[10px] text-[#FAF0DC]/80 tracking-[0.2em] uppercase mt-1">
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
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.5s ease-out forwards; }
        .animate-spin-slow { animation: spin-slow 1.5s linear infinite; }
      `}</style>
    </div>
  );
}
