"use client";

import { useMemo } from "react";
import { formatUnits } from "viem";
import { cn } from "@/lib/utils";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  ethPrice?: number;
  currency?: "ETH" | "DONUT";
  onCurrencyChange?: (currency: "ETH" | "DONUT") => void;
  pinMintPrice?: bigint;
  donutPrice?: bigint;
}

export function AmountInput({
  value,
  onChange,
  disabled,
  ethPrice = 3500,
  currency = "ETH",
  onCurrencyChange,
  pinMintPrice,
  donutPrice,
}: AmountInputProps) {
  const isDonut = currency === "DONUT";

  const mintPriceEth = pinMintPrice ? parseFloat(formatUnits(pinMintPrice, 18)) : 0.01;
  const donutPriceEth = donutPrice ? parseFloat(formatUnits(donutPrice, 18)) : 0;

  // Value is always in ETH — display converts to DONUT
  const displayValue = useMemo(() => {
    if (isDonut && donutPriceEth > 0) {
      const ethVal = parseFloat(value || "0");
      return Math.ceil(ethVal / donutPriceEth).toString();
    }
    return value;
  }, [value, isDonut, donutPriceEth]);

  const minDepositDisplay = useMemo(() => {
    if (isDonut && donutPriceEth > 0) {
      return Math.ceil(mintPriceEth / donutPriceEth);
    }
    return mintPriceEth;
  }, [isDonut, mintPriceEth, donutPriceEth]);

  const usdValue = useMemo(() => {
    const numValue = parseFloat(value || "0");
    return (numValue * ethPrice).toFixed(2);
  }, [value, ethPrice]);

  const isValid = useMemo(() => {
    const numValue = parseFloat(value || "0");
    return numValue >= mintPriceEth;
  }, [value, mintPriceEth]);

  // Presets always store ETH values, display converts to DONUT
  const presetAmounts = useMemo(() => {
    const base = mintPriceEth;
    const ethPresets = [base, base * 2.5, base * 5, base * 10];
    return ethPresets.map(v => {
      const ethStr = v.toFixed(4);
      const label = isDonut && donutPriceEth > 0
        ? Math.ceil(v / donutPriceEth).toLocaleString()
        : ethStr;
      return { label, value: ethStr };
    });
  }, [isDonut, donutPriceEth, mintPriceEth]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-[#5C4A3D] uppercase tracking-wider">
          Deposit Amount
        </div>
        <div className="text-[10px] text-[#8B7355]">
          Min: {isDonut ? `${minDepositDisplay.toLocaleString()} DONUT` : `${mintPriceEth} ETH`}
        </div>
      </div>

      {/* Currency toggle */}
      {onCurrencyChange && (
        <div className="flex gap-2">
          <button
            onClick={() => !disabled && onCurrencyChange("ETH")}
            disabled={disabled}
            className={cn(
              "flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all",
              "hover:scale-105 active:scale-95",
              !isDonut
                ? "bg-[#627EEA] text-white shadow-md"
                : "bg-white/50 text-[#5C4A3D] hover:bg-white/70",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            ETH
          </button>
          <button
            onClick={() => !disabled && onCurrencyChange("DONUT")}
            disabled={disabled}
            className={cn(
              "flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all",
              "hover:scale-105 active:scale-95",
              isDonut
                ? "bg-[#D4915D] text-white shadow-md"
                : "bg-white/50 text-[#5C4A3D] hover:bg-white/70",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            DONUT
          </button>
        </div>
      )}

      {/* Main input — value always in ETH, display shows DONUT equivalent */}
      <div className="relative">
        <input
          type="number"
          step={isDonut ? "1" : "0.001"}
          min={isDonut ? minDepositDisplay : mintPriceEth}
          value={isDonut ? displayValue : value}
          onChange={(e) => {
            if (isDonut && donutPriceEth > 0) {
              // User types DONUT amount, convert to ETH for storage
              const donutAmt = parseFloat(e.target.value || "0");
              onChange((donutAmt * donutPriceEth).toFixed(18));
            } else {
              onChange(e.target.value);
            }
          }}
          disabled={disabled}
          placeholder={isDonut ? String(minDepositDisplay) : String(mintPriceEth)}
          className={cn(
            "w-full bg-white/70 text-[#2D2319] border-2 rounded-xl px-4 py-4 text-2xl font-bold",
            "placeholder:text-[#A89485]/50 focus:outline-none transition-all",
            "pr-24",
            !isValid && value
              ? "border-[#E85A71]/50 focus:border-[#E85A71]"
              : "border-transparent focus:border-[#82AD94]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end">
          <span className="text-sm font-bold text-[#5C4A3D]">{isDonut ? "DONUT" : "ETH"}</span>
          <span className="text-[10px] text-[#8B7355]">~${usdValue}</span>
        </div>
      </div>

      {/* Validation message */}
      {!isValid && value && (
        <p className="text-xs text-[#E85A71]">
          Minimum deposit is {isDonut ? `${minDepositDisplay.toLocaleString()} DONUT` : `${mintPriceEth} ETH`}
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
            {preset.label}
          </button>
        ))}
      </div>

      {/* Pool shares explanation */}
      <p className="text-[10px] text-[#8B7355] text-center">
        {isDonut
          ? "Deposit more DONUT to earn more pool shares and rewards!"
          : `Deposit more than ${mintPriceEth} ETH to earn more pool shares and rewards!`}
      </p>
    </div>
  );
}
