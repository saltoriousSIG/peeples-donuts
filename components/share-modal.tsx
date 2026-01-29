"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useFrameContext } from "@/providers/FrameSDKProvider"
import { Share2 } from "lucide-react"

export type ShareAction =
  | "king-glazer"
  | "deposit"
  | "withdraw"
  | "claim"
  | "mint-pin"
  | "equip-flair"
  | "claim-yield"
  | "fuse-flair"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  action: ShareAction
  details: {
    embed: string
    message: string
    imageUrl?: string // Optional frame preview image
  }
}

const actionConfig: Record<ShareAction, { title: string; color: string; icon: string }> = {
  "king-glazer": {
    title: "Share Your Crown",
    color: "#F4A259",
    icon: "👑",
  },
  deposit: {
    title: "Share Your Deposit",
    color: "#5C946E",
    icon: "💰",
  },
  withdraw: {
    title: "Share Your Earnings",
    color: "#BC4B51",
    icon: "📤",
  },
  claim: {
    title: "Share Your Claim",
    color: "#F4A259",
    icon: "🎁",
  },
  "mint-pin": {
    title: "Share Your New Pin",
    color: "#E85A71",
    icon: "🎨",
  },
  "equip-flair": {
    title: "Share Your Flair",
    color: "#82AD94",
    icon: "✨",
  },
  "claim-yield": {
    title: "Share Your Yield",
    color: "#5C946E",
    icon: "💎",
  },
  "fuse-flair": {
    title: "Share Your Upgrade",
    color: "#B48EF7",
    icon: "🔮",
  },
}

export function ShareModal({ isOpen, onClose, action, details }: ShareModalProps) {
  const { sdk } = useFrameContext()
  const config = actionConfig[action]

  if (!isOpen) return null

  const handleShare = () => {
    sdk.actions.composeCast({
      text: details.message,
      embeds: [details.embed],
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#3D2914]/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative bg-[#FFFDD0] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-[#D4915D]/20 animate-in zoom-in-95 fade-in duration-300">
        {/* Colored header bar */}
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: config.color }}
        />

        <div className="p-5 space-y-4">
          {/* Header with icon */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{config.icon}</span>
              <h3 className="text-base font-bold text-[#2D2319] tracking-tight">
                {config.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[#D4915D]/10 hover:bg-[#D4915D]/20 flex items-center justify-center text-[#5C4A3D]/50 hover:text-[#5C4A3D] transition-all text-sm hover:rotate-90 duration-200"
            >
              ×
            </button>
          </div>

          {/* Frame Preview (if image provided) */}
          {details.imageUrl && (
            <div className="animate-in slide-in-from-bottom-2 duration-300 delay-100">
              <p className="text-[10px] uppercase tracking-widest font-semibold text-[#5C4A3D]/50 mb-2">
                Preview
              </p>
              <div className="relative aspect-video rounded-xl overflow-hidden bg-white/50 border border-[#D4915D]/10">
                <Image
                  src={details.imageUrl}
                  alt="Share preview"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Cast message */}
          <div className="animate-in slide-in-from-bottom-2 duration-300 delay-150">
            <p className="text-[10px] uppercase tracking-widest font-semibold text-[#5C4A3D]/50 mb-2">
              Your cast
            </p>
            <div className="bg-white/80 border border-[#D4915D]/10 rounded-xl px-4 py-3">
              <p className="text-sm text-[#2D2319] leading-relaxed">{details.message}</p>
            </div>
          </div>

          {/* Embed URL preview */}
          <div className="animate-in slide-in-from-bottom-2 duration-300 delay-175">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#D4915D]/5 rounded-lg">
              <div
                className="w-6 h-6 rounded flex items-center justify-center"
                style={{ backgroundColor: `${config.color}20` }}
              >
                <span className="text-xs">🔗</span>
              </div>
              <span className="text-xs text-[#8B7355] truncate flex-1">
                {details.embed}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-1 animate-in slide-in-from-bottom-2 duration-300 delay-200">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border-[#D4915D]/20 text-[#5C4A3D]/70 hover:bg-[#D4915D]/5 font-semibold text-sm bg-transparent transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              className="flex-1 h-11 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              style={{
                backgroundColor: config.color,
                boxShadow: `0 4px 14px ${config.color}40`,
              }}
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
