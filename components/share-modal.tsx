
"use client"
import { Button } from "@/components/ui/button"
import {sdk} from "@farcaster/miniapp-sdk"

export type ShareAction = "king-glazer" | "deposit" | "withdraw" | "claim"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  action: ShareAction
  details: {
    embed: string,
    message: string
  }
}

const actionConfig: Record<ShareAction, { title: string; color: string }> = {
  "king-glazer": {
    title: "Share Your Crown",
    color: "#F4A259",
  },
  deposit: {
    title: "Share Your Deposit",
    color: "#5C946E",
  },
  withdraw: {
    title: "Share Your Earnings",
    color: "#BC4B51",
  },
  claim: {
    title: "Share Your Claim",
    color: "#F4A259",
  },
}

export function ShareModal({ isOpen, onClose, action, details }: ShareModalProps) {
  const config = actionConfig[action]

  if (!isOpen) return null

  const handleShare = () => {
    sdk.actions.composeCast({
      text: details.message,
      embeds: [details.embed]
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#3D405B]/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative bg-[#FFFDD0] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-[#3D405B]/10 animate-in zoom-in-95 fade-in duration-300">
        <div
          className="h-1.5 w-full bg-gradient-to-r animate-pulse"
          style={{
            backgroundImage: `linear-gradient(90deg, ${config.color}, ${config.color}80, ${config.color})`,
            backgroundSize: "200% 100%",
          }}
        />

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#3D405B] tracking-tight">{config.title}</h3>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[#3D405B]/5 hover:bg-[#3D405B]/10 flex items-center justify-center text-[#3D405B]/50 hover:text-[#3D405B] transition-all text-sm hover:rotate-90 duration-200"
            >
              ×
            </button>
          </div>

          {/* Amount display if applicable */}
          {details.amount && (
            <div
              className="rounded-xl p-4 text-center animate-in slide-in-from-bottom-2 duration-300 delay-100"
              style={{ backgroundColor: `${config.color}15`, border: `1px solid ${config.color}30` }}
            >
              <div
                className="text-[10px] uppercase tracking-widest font-semibold mb-1"
                style={{ color: `${config.color}` }}
              >
                {action === "king-glazer" ? "Reward Earned" : "Amount"}
              </div>
              <div className="text-2xl font-bold tabular-nums" style={{ color: config.color }}>
                {details.amount}
              </div>
            </div>
          )}

          <div className="animate-in slide-in-from-bottom-2 duration-300 delay-150">
            <p className="text-[10px] uppercase tracking-widest font-semibold text-[#3D405B]/50 mb-2">Your cast</p>
            <div className="bg-white/80 border border-[#3D405B]/10 rounded-xl px-4 py-3">
              <p className="text-sm text-[#3D405B] leading-relaxed">{details.message}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-1 animate-in slide-in-from-bottom-2 duration-300 delay-200">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border-[#3D405B]/15 text-[#3D405B]/70 hover:bg-[#3D405B]/5 font-semibold text-sm bg-transparent transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              className="flex-1 h-11 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: config.color,
                boxShadow: `0 4px 14px ${config.color}40`,
              }}
            >
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
