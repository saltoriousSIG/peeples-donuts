"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { X, Droplets, Gavel, Vote, Info, ChevronRight } from "lucide-react";

interface PowerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DRAWER_ITEMS: {
  href: "/" | "/pool" | "/auction" | "/about";
  icon: typeof Droplets;
  label: string;
  description: string;
  color: string;
}[] = [
  {
    href: "/pool",
    icon: Droplets,
    label: "Family Pool",
    description: "Deposit, withdraw, and manage your position",
    color: "#82AD94",
  },
  {
    href: "/auction",
    icon: Gavel,
    label: "LSG Auction",
    description: "Bid for the next Limited Series Glaze",
    color: "#FFB5BA",
  },
  {
    href: "/pool",
    icon: Vote,
    label: "Pool Voting",
    description: "Vote on pool strategy each week",
    color: "#B48EF7",
  },
  {
    href: "/about",
    icon: Info,
    label: "About",
    description: "Learn about Peeples Donuts",
    color: "#F4A627",
  },
];

export function PowerDrawer({ isOpen, onClose }: PowerDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

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
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "bg-[#FFFDD0] rounded-t-3xl",
          "shadow-2xl",
          "animate-in slide-in-from-bottom duration-300"
        )}
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 rounded-full bg-[#D4915D]/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4">
          <h2 className="text-lg font-bold text-[#2D2319]">More Features</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#D4915D]/10 flex items-center justify-center text-[#5C4A3D] hover:bg-[#D4915D]/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="px-4 space-y-2">
          {DRAWER_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl",
                  "bg-white/50 hover:bg-white/70",
                  "transition-all duration-200",
                  "hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: item.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#2D2319]">{item.label}</p>
                  <p className="text-xs text-[#8B7355]">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#D4915D]/50" />
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 pt-4 mt-2 border-t border-[#D4915D]/10">
          <p className="text-[10px] text-center text-[#A89485]">
            Swipe down or tap outside to close
          </p>
        </div>
      </div>
    </>
  );
}
