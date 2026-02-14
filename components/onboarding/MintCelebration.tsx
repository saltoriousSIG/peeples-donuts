"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useFrameContext } from "@/providers/FrameSDKProvider";
import { Share2, Sparkles, PartyPopper } from "lucide-react";

interface MintCelebrationProps {
  isVisible: boolean;
  pinImageUrl?: string;
  onShare: () => void;
  onContinue: () => void;
}

export function MintCelebration({
  isVisible,
  pinImageUrl,
  onShare,
  onContinue,
}: MintCelebrationProps) {
  const { sdk, fUser } = useFrameContext();
  const [showContent, setShowContent] = useState(false);
  const shareEmbed = `${typeof window !== "undefined" ? window.location.origin : "https://peeplesdonuts.com"}/?fid=${fUser?.fid || ""}`;

  useEffect(() => {
    if (isVisible) {
      // Trigger haptic feedback
      try {
        sdk.haptics?.impactOccurred("heavy" as any);
      } catch {
        // Haptics not available
      }

      // Delay content reveal for animation
      const timer = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isVisible, sdk]);

  if (!isVisible) return null;

  const handleShare = () => {
    sdk.actions.composeCast({
      text: "I just joined the Peeples Donuts family! Come get glazed with us!",
      embeds: [shareEmbed],
    });
    onShare();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#3D2914]/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onContinue}
      />

      {/* Confetti effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              backgroundColor: ["#E85A71", "#82AD94", "#F4A627", "#D4915D", "#5C946E"][
                Math.floor(Math.random() * 5)
              ],
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div
        className={cn(
          "relative bg-[#FFFDD0] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden",
          "border-2 border-[#D4915D]/20",
          "animate-in zoom-in-95 fade-in duration-500"
        )}
      >
        {/* Header decorative bar */}
        <div className="h-2 bg-gradient-to-r from-[#E85A71] via-[#F4A627] to-[#82AD94]" />

        <div className="p-6 space-y-5">
          {/* Celebration icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E85A71] to-[#C94A5C] flex items-center justify-center animate-bounce">
                <PartyPopper className="w-8 h-8 text-white" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-[#F4A627] animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#2D2319] mb-1">
              Welcome to the Family!
            </h2>
            <p className="text-sm text-[#5C4A3D]">
              You&apos;re officially a Peeples Donuts member
            </p>
          </div>

          {/* Pin preview */}
          {pinImageUrl && showContent && (
            <div className="flex justify-center animate-in slide-in-from-bottom-4 duration-500 delay-200">
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-lg border-2 border-[#D4915D]/30">
                <Image
                  src={pinImageUrl}
                  alt="Your Pin"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Info */}
          <div
            className={cn(
              "bg-[#82AD94]/10 rounded-xl p-3 text-center",
              showContent && "animate-in slide-in-from-bottom-4 duration-500 delay-300"
            )}
          >
            <p className="text-xs text-[#5C4A3D]">
              Your flair is now active and earning yield. Check back to claim your rewards!
            </p>
          </div>

          {/* Action buttons */}
          <div
            className={cn(
              "space-y-3",
              showContent && "animate-in slide-in-from-bottom-4 duration-500 delay-400"
            )}
          >
            <button
              onClick={handleShare}
              className={cn(
                "w-full py-3.5 rounded-xl font-bold text-sm",
                "bg-gradient-to-r from-[#E85A71] to-[#C94A5C]",
                "text-white shadow-lg hover:shadow-xl",
                "hover:scale-[1.02] active:scale-[0.98]",
                "transition-all duration-200",
                "flex items-center justify-center gap-2"
              )}
            >
              <Share2 className="w-4 h-4" />
              Share to Farcaster
            </button>

            <button
              onClick={onContinue}
              className={cn(
                "w-full py-3 rounded-xl font-semibold text-sm",
                "bg-white/50 border border-[#D4915D]/20",
                "text-[#5C4A3D] hover:bg-white/70",
                "hover:scale-[1.02] active:scale-[0.98]",
                "transition-all duration-200"
              )}
            >
              View My Pin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
