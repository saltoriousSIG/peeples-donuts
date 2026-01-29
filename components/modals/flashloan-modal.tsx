"use client";

import { useEffect, useMemo } from "react";
import { formatUnits } from "viem";
import { cn } from "@/lib/utils";
import { X, Zap, ExternalLink, Copy } from "lucide-react";
import { useFlashLoan } from "@/hooks/useFlashLoan";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { toast } from "sonner";

interface FlashLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FlashLoanModal({ isOpen, onClose }: FlashLoanModalProps) {
  const wethFlashLoan = useFlashLoan(CONTRACT_ADDRESSES.weth as `0x${string}`);
  const donutFlashLoan = useFlashLoan(CONTRACT_ADDRESSES.donut as `0x${string}`);

  const wethAvailable = useMemo(() => {
    if (!wethFlashLoan.maxLoanAmount) return "0";
    return parseFloat(formatUnits(wethFlashLoan.maxLoanAmount, 18)).toFixed(4);
  }, [wethFlashLoan.maxLoanAmount]);

  const donutAvailable = useMemo(() => {
    if (!donutFlashLoan.maxLoanAmount) return "0";
    return parseFloat(formatUnits(donutFlashLoan.maxLoanAmount, 18)).toLocaleString();
  }, [donutFlashLoan.maxLoanAmount]);

  const copyAddress = (address: string, label: string) => {
    navigator.clipboard.writeText(address);
    toast.success(`${label} address copied!`);
  };

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
          "max-h-[85vh] overflow-hidden flex flex-col"
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
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#F4A627]" />
            <h2 className="text-lg font-bold text-[#2D2319]">Flash Loans</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#D4915D]/10 flex items-center justify-center text-[#5C4A3D] hover:bg-[#D4915D]/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {/* Available Liquidity */}
          <div className="glazed-card p-4">
            <h3 className="text-sm font-bold text-[#2D2319] mb-3">Available Liquidity</h3>

            <div className="space-y-3">
              {/* WETH */}
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#627EEA] to-[#3C3C3D] flex items-center justify-center text-white font-bold">
                    Ξ
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#2D2319]">WETH</div>
                    <div className="text-[10px] text-[#8B7355]">0.1% fee</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#2D2319]">{wethAvailable}</div>
                  <div className="text-[10px] text-[#8B7355]">available</div>
                </div>
              </div>

              {/* DONUT */}
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFB5BA] to-[#E8919A] flex items-center justify-center text-xl">
                    🍩
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#2D2319]">DONUT</div>
                    <div className="text-[10px] text-[#8B7355]">0.1% fee</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#2D2319]">{donutAvailable}</div>
                  <div className="text-[10px] text-[#8B7355]">available</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Addresses */}
          <div className="glazed-card p-4">
            <h3 className="text-sm font-bold text-[#2D2319] mb-3">Contract Addresses</h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-white/30 rounded-lg">
                <div>
                  <div className="text-xs font-bold text-[#2D2319]">Pool (ERC-3156)</div>
                  <div className="text-[10px] text-[#8B7355] font-mono">
                    {CONTRACT_ADDRESSES.pool.slice(0, 10)}...{CONTRACT_ADDRESSES.pool.slice(-8)}
                  </div>
                </div>
                <button
                  onClick={() => copyAddress(CONTRACT_ADDRESSES.pool, "Pool")}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4 text-[#8B7355]" />
                </button>
              </div>

              <div className="flex items-center justify-between p-2 bg-white/30 rounded-lg">
                <div>
                  <div className="text-xs font-bold text-[#2D2319]">WETH</div>
                  <div className="text-[10px] text-[#8B7355] font-mono">
                    {CONTRACT_ADDRESSES.weth.slice(0, 10)}...{CONTRACT_ADDRESSES.weth.slice(-8)}
                  </div>
                </div>
                <button
                  onClick={() => copyAddress(CONTRACT_ADDRESSES.weth, "WETH")}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4 text-[#8B7355]" />
                </button>
              </div>

              <div className="flex items-center justify-between p-2 bg-white/30 rounded-lg">
                <div>
                  <div className="text-xs font-bold text-[#2D2319]">DONUT</div>
                  <div className="text-[10px] text-[#8B7355] font-mono">
                    {CONTRACT_ADDRESSES.donut.slice(0, 10)}...{CONTRACT_ADDRESSES.donut.slice(-8)}
                  </div>
                </div>
                <button
                  onClick={() => copyAddress(CONTRACT_ADDRESSES.donut, "DONUT")}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4 text-[#8B7355]" />
                </button>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="glazed-card p-4">
            <h3 className="text-sm font-bold text-[#2D2319] mb-3">How It Works</h3>

            <div className="space-y-3 text-xs text-[#5C4A3D]">
              <p>
                Flash loans let you borrow assets without collateral, as long as you return them
                (plus fee) in the same transaction.
              </p>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#82AD94]/20 flex items-center justify-center text-[10px] font-bold text-[#82AD94] flex-shrink-0">1</span>
                  <span>Implement <code className="bg-white/50 px-1 rounded text-[#E85A71]">IERC3156FlashBorrower</code> in your contract</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#82AD94]/20 flex items-center justify-center text-[10px] font-bold text-[#82AD94] flex-shrink-0">2</span>
                  <span>Call <code className="bg-white/50 px-1 rounded text-[#E85A71]">flashLoan()</code> on the pool contract</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#82AD94]/20 flex items-center justify-center text-[10px] font-bold text-[#82AD94] flex-shrink-0">3</span>
                  <span>Execute your logic in <code className="bg-white/50 px-1 rounded text-[#E85A71]">onFlashLoan()</code></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#82AD94]/20 flex items-center justify-center text-[10px] font-bold text-[#82AD94] flex-shrink-0">4</span>
                  <span>Approve repayment (principal + 0.1% fee)</span>
                </div>
              </div>
            </div>

            <a
              href="https://basescan.org/address/${CONTRACT_ADDRESSES.pool}#code"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#3D2914] text-white text-xs font-bold hover:bg-[#2D1F0F] transition-colors"
            >
              <span>View Contract on Basescan</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
