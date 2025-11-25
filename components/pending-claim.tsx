"use client";
import { Button } from "@/components/ui/button";
import { usePool } from "@/providers/PoolProvider";
import { formatUnits } from "viem";

interface PendingClaimProps {
  ethPrice: number;
  donutPrice: number;
}

export function PendingClaim({ ethPrice, donutPrice }: PendingClaimProps) {
  const { pendingClaim, claim } = usePool();
  console.log(pendingClaim)

  if (!pendingClaim) {
    return null;
  }

  if (pendingClaim?.donut === 0n && pendingClaim?.weth === 0n) {
    return null;
  }

  const wethUsdValue = ethPrice
    ? parseFloat(formatUnits(pendingClaim?.weth || 0n, 18)) * ethPrice
    : 0;

  const donutUsdValue = donutPrice
    ? parseFloat(formatUnits(pendingClaim?.donut || 0n, 18)) * donutPrice
    : 0;

  return (
    <div className="bg-gradient-to-r from-[#BC4B51] to-[#F4A259] rounded-xl p-4 shadow-md relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="text-[10px] text-white/70 uppercase tracking-widest font-semibold mb-2">
            Available to Claim
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-start gap-y-0.5">
              <span className="text-lg font-bold text-white tabular-nums">
                Ξ{" "}
                {parseFloat(formatUnits(pendingClaim?.weth || 0n, 18)).toFixed(
                  4
                )}
              </span>
              <span className="text-[14px] text-white/60 tabular-nums">
                ${wethUsdValue.toLocaleString()}
              </span>
            </div>
            <div className="w-px h-4 bg-white/30" />
            <div className="flex flex-col items-start gap-1.5">
              <span className="text-lg font-bold text-white tabular-nums">
                🍩{" "}
                {parseFloat(formatUnits(pendingClaim?.donut || 0n, 18)).toFixed(
                  2
                )}
              </span>
              <span className="text-[10px] text-white/60 tabular-nums">
                ${donutUsdValue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <Button
          onClick={claim}
          className="bg-white text-[#BC4B51] hover:bg-white/90 font-bold text-sm px-6 h-10 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          CLAIM
        </Button>
      </div>
    </div>
  );
}

//
//
