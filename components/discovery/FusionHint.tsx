"use client";

import { cn } from "@/lib/utils";
import { Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface FusionHintProps {
  className?: string;
  onClick?: () => void;
}

export function FusionHint({ className, onClick }: FusionHintProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push("/?feature=flair");
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "block w-full p-3 rounded-xl text-left",
        "bg-gradient-to-r from-[#B48EF7]/10 to-[#E85A71]/10",
        "border border-[#B48EF7]/20",
        "transition-all duration-200",
        "hover:scale-[1.02] hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#B48EF7]/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-[#B48EF7]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-[#2D2319]">Fusion Available</p>
          <p className="text-xs text-[#8B7355]">
            Combine 2 same flair to upgrade!
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-[#B48EF7]" />
      </div>
    </button>
  );
}
