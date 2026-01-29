"use client";

import { useMemo } from "react";
import { useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { formatUnits } from "viem";
import { cn } from "@/lib/utils";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { DATA } from "@/lib/abi/data";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  ethPrice?: number;
}

export function AmountInput({ value, onChange, disabled, ethPrice = 3500 }: AmountInputProps) {
  // Get pool config to know minimum deposit
  const { data: config } = useReadContract({
    address: CONTRACT_ADDRESSES.pool as `0x${string}`,
    abi: DATA,
    functionName: "getConfig",
    chainId: base.id,
  });

  const minDeposit = useMemo(() => {
    if (!config) return 0.001; // Default minimum
    return parseFloat(formatUnits((config as any).minDeposit || 0n, 18));
  }, [config]);

  const usdValue = useMemo(() => {
    const ethValue = parseFloat(value || "0");
    return (ethValue * ethPrice).toFixed(2);
  }, [value, ethPrice]);

  const isValid = useMemo(() => {
    const ethValue = parseFloat(value || "0");
    return ethValue >= minDeposit;
  }, [value, minDeposit]);

  const presetAmounts = [
    { label: "Min", value: minDeposit.toString() },
    { label: "0.01", value: "0.01" },
    { label: "0.05", value: "0.05" },
    { label: "0.1", value: "0.1" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-[#5C4A3D] uppercase tracking-wider">
          Deposit Amount
        </div>
        <div className="text-[10px] text-[#8B7355]">
          Min: {minDeposit.toFixed(4)} WETH
        </div>
      </div>

      {/* Main input */}
      <div className="relative">
        <input
          type="number"
          step="0.001"
          min={minDeposit}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={minDeposit.toFixed(4)}
          className={cn(
            "w-full bg-white/70 text-[#2D2319] border-2 rounded-xl px-4 py-4 text-2xl font-bold",
            "placeholder:text-[#A89485]/50 focus:outline-none transition-all",
            "pr-20",
            !isValid && value
              ? "border-[#E85A71]/50 focus:border-[#E85A71]"
              : "border-transparent focus:border-[#82AD94]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end">
          <span className="text-sm font-bold text-[#5C4A3D]">WETH</span>
          <span className="text-[10px] text-[#8B7355]">~${usdValue}</span>
        </div>
      </div>

      {/* Validation message */}
      {!isValid && value && (
        <p className="text-xs text-[#E85A71]">
          Minimum deposit is {minDeposit.toFixed(4)} WETH
        </p>
      )}

      {/* Preset amounts */}
      <div className="flex gap-2">
        {presetAmounts.map((preset) => (
          <button
            key={preset.label}
            onClick={() => !disabled && onChange(preset.value)}
            disabled={disabled}
            className={cn(
              "flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all",
              "hover:scale-105 active:scale-95",
              value === preset.value
                ? "bg-[#82AD94] text-white shadow-md"
                : "bg-white/50 text-[#5C4A3D] hover:bg-white/70",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {preset.label === "Min" ? `${minDeposit.toFixed(3)}` : preset.label}
          </button>
        ))}
      </div>

      {/* Info text */}
      <p className="text-[10px] text-[#8B7355] text-center">
        Your deposit earns pool rewards + flair yield
      </p>
    </div>
  );
}
