"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  useAccount,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import { formatEther, zeroAddress, type Address, formatUnits } from "viem";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { MULTICALL_ABI } from "@/lib/abi/multicall";
import { PEEPLES_BLAZERY } from "@/lib/abi/peeples-blazery";
import { ERC20 } from "@/lib/abi/erc20";
import { cn } from "@/lib/utils";
import { parseContractError } from "@/lib/errors";
import { toast } from "sonner";

type TxStep = "idle" | "approving" | "buying";

const DEADLINE_BUFFER_SECONDS = 5 * 60;

const PEEPLES_DONUT_LP_TOKEN_ADDRESS =
  "0x189f254685CD46E48CbdCe39E9572695dDe92402" as Address;

const toBigInt = (value: bigint | number) =>
  typeof value === "bigint" ? value : BigInt(value);

const formatEth = (value: bigint, maximumFractionDigits = 4) => {
  if (value === 0n) return "0";
  const asNumber = Number(formatEther(value));
  if (!Number.isFinite(asNumber)) {
    return formatEther(value);
  }
  return asNumber.toLocaleString(undefined, {
    maximumFractionDigits,
  });
};

const ERC20_ABI = [
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

interface BlazeryContentProps {
  ethUsdPrice: number;
}

export const BlazeryContent: React.FC<BlazeryContentProps> = ({ ethUsdPrice }) => {
  const [peeplesDonutBlazeResult, setPeeplesDonutBlazeResult] = useState<"success" | "failure" | null>(null);
  const [peeplesDonutTxStep, setPeeplesDonutTxStep] = useState<TxStep>("idle");
  const peeplesDonutResultTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { address } = useAccount();

  const resetPeeplesDonutBlazeResult = useCallback(() => {
    if (peeplesDonutResultTimeoutRef.current) {
      clearTimeout(peeplesDonutResultTimeoutRef.current);
      peeplesDonutResultTimeoutRef.current = null;
    }
    setPeeplesDonutBlazeResult(null);
  }, []);

  const showPeeplesDonutBlazeResult = useCallback((result: "success" | "failure") => {
    if (peeplesDonutResultTimeoutRef.current) {
      clearTimeout(peeplesDonutResultTimeoutRef.current);
    }
    setPeeplesDonutBlazeResult(result);
    peeplesDonutResultTimeoutRef.current = setTimeout(() => {
      setPeeplesDonutBlazeResult(null);
      peeplesDonutResultTimeoutRef.current = null;
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (peeplesDonutResultTimeoutRef.current) {
        clearTimeout(peeplesDonutResultTimeoutRef.current);
      }
    };
  }, []);

  const { data: peeplesTokenPrice } = useQuery({
    queryKey: ['peeplesTokenPrice'],
    queryFn: async () => {
      const { data } = await axios.get('/api/clanker/token_info');
      return data.peeples_price;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data, refetch: refetchData } = useReadContracts({
    contracts: [
      {
        address: CONTRACT_ADDRESSES.multicall,
        abi: MULTICALL_ABI,
        functionName: "getMiner",
        args: [address ?? zeroAddress],
        chainId: base.id,
      },
      {
        address: CONTRACT_ADDRESSES.peeples_blazery,
        abi: PEEPLES_BLAZERY,
        functionName: "getSlot0",
        args: [],
        chainId: base.id,
      },
      {
        address: CONTRACT_ADDRESSES.peeples_blazery,
        abi: PEEPLES_BLAZERY,
        functionName: "paymentToken",
        args: [],
        chainId: base.id,
      },
      {
        address: CONTRACT_ADDRESSES.peeples_blazery,
        abi: PEEPLES_BLAZERY,
        functionName: "getPrice",
        args: [],
        chainId: base.id,
      },
      {
        address: CONTRACT_ADDRESSES.donut,
        abi: ERC20,
        functionName: "balanceOf",
        args: [PEEPLES_DONUT_LP_TOKEN_ADDRESS],
        chainId: base.id
      },
      {
        address: PEEPLES_DONUT_LP_TOKEN_ADDRESS,
        abi: ERC20,
        functionName: "totalSupply",
        args: [],
        chainId: base.id
      },
      {
        address: CONTRACT_ADDRESSES.donut,
        abi: ERC20,
        functionName: "balanceOf",
        args: [CONTRACT_ADDRESSES.peeples_blazery],
        chainId: base.id
      },
      {
        address: CONTRACT_ADDRESSES.weth,
        abi: ERC20,
        functionName: "balanceOf",
        args: [CONTRACT_ADDRESSES.peeples_blazery],
        chainId: base.id
      },
      {
        address: CONTRACT_ADDRESSES.peeples,
        abi: ERC20,
        functionName: "balanceOf",
        args: [CONTRACT_ADDRESSES.peeples_blazery],
        chainId: base.id
      },
      {
        address: PEEPLES_DONUT_LP_TOKEN_ADDRESS,
        abi: ERC20,
        functionName: "balanceOf",
        args: [address!],
        chainId: base.id
      }
    ],
  });

  const [minerData, slot0Data, paymentTokenAddress, priceData, donutLPBalance, LPTotalSupply, donutBlazeryBalance, wethBlazeryBalance, peeplesBlazeryBalance, userLPBalance] = data ?? [];

  const peeplesBlazeryState = useMemo(() => {
    if (!minerData || !slot0Data || !paymentTokenAddress || !priceData || !donutLPBalance || !LPTotalSupply || !donutBlazeryBalance || !wethBlazeryBalance || !peeplesBlazeryBalance || !userLPBalance) {
      return null;
    }
    const donutPriceEth = minerData.result?.donutPrice;
    const paymentTokenPrice = donutPriceEth && donutLPBalance.result && LPTotalSupply.result ? donutPriceEth * donutLPBalance.result * 2n / LPTotalSupply.result : 0n
    const totalBlazeValue = (parseFloat(formatUnits(donutBlazeryBalance.result || 0n, 18)) * (donutPriceEth ? parseFloat(formatUnits(donutPriceEth, 18)) : 0) * ethUsdPrice) + (parseFloat(formatUnits(wethBlazeryBalance.result || 0n, 18)) * ethUsdPrice) + parseFloat(formatUnits(peeplesBlazeryBalance.result || 0n, 18)) * (peeplesTokenPrice || 0);
    return {
      initPrice: slot0Data.result?.initPrice,
      epochId: slot0Data.result?.epochId,
      startTime: slot0Data.result?.startTime,
      paymentToken: paymentTokenAddress.result,
      price: priceData.result,
      paymentTokenPrice,
      donutBlazeryBalance: donutBlazeryBalance.result,
      wethBlazeryBalance: wethBlazeryBalance.result,
      peeplesBlazeryBalance: peeplesBlazeryBalance.result,
      totalBlazeValue,
      userLPBalance: userLPBalance.result,
      pnl: totalBlazeValue - (parseFloat(formatUnits(priceData.result || 0n, 18)) * (paymentTokenPrice ? parseFloat(formatUnits(paymentTokenPrice, 18)) : 0) * ethUsdPrice)
    }
  }, [minerData, slot0Data, paymentTokenAddress, priceData, donutLPBalance, LPTotalSupply, donutBlazeryBalance, wethBlazeryBalance, peeplesBlazeryBalance, ethUsdPrice, peeplesTokenPrice, userLPBalance]);

  const {
    data: peeplesDonutTxHash,
    writeContract: writePeeplesDonutContract,
    isPending: isPeeplesDonutWriting,
    isError: isPeeplesDonutError,
    error: peeplesDonutWriteError,
    reset: resetPeeplesDonutWrite,
  } = useWriteContract();

  const { data: peeplesDonutReceipt, isLoading: isPeeplesDonutConfirming } =
    useWaitForTransactionReceipt({
      hash: peeplesDonutTxHash,
      chainId: base.id,
    });

  const handlePeeplesBlaze = useCallback(async () => {
    if (!peeplesBlazeryState || !address) return;
    resetPeeplesDonutBlazeResult();
    try {
      const price = peeplesBlazeryState.price;
      const epochId = toBigInt(peeplesBlazeryState.epochId as number);
      const deadline = BigInt(
        Math.floor(Date.now() / 1000) + DEADLINE_BUFFER_SECONDS
      );

      if (peeplesDonutTxStep === "idle") {
        setPeeplesDonutTxStep("approving");
        writePeeplesDonutContract({
          account: address as Address,
          address: PEEPLES_DONUT_LP_TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [CONTRACT_ADDRESSES.peeples_blazery as Address, price as bigint],
          chainId: base.id,
        });
        return;
      }
      if (peeplesDonutTxStep === "buying") {
        writePeeplesDonutContract({
          account: address as Address,
          address: CONTRACT_ADDRESSES.peeples_blazery as Address,
          abi: PEEPLES_BLAZERY,
          functionName: "buy",
          args: [[CONTRACT_ADDRESSES.donut, CONTRACT_ADDRESSES.weth, CONTRACT_ADDRESSES.peeples], address as Address, epochId as bigint, deadline as bigint, price as bigint],
          chainId: base.id,
        });
      }
    } catch (error: unknown) {
      console.error("Failed to peeples blaze:", error);

      const stepContext = peeplesDonutTxStep === "approving" ? "approve" : "buy";
      const parsed = parseContractError(
        error instanceof Error ? error : new Error(String(error)),
        {
          contractName: peeplesDonutTxStep === "approving" ? "ERC20" : "Blazery",
          functionName: stepContext,
          additionalInfo: { step: peeplesDonutTxStep }
        }
      );

      if (parsed.severity === 'warning') {
        toast.warning(parsed.title);
      } else {
        toast.error(parsed.title, {
          description: parsed.action ? `${parsed.message}\n\n💡 ${parsed.action}` : parsed.message
        });
      }

      showPeeplesDonutBlazeResult("failure");
      setPeeplesDonutTxStep("idle");
      resetPeeplesDonutWrite();
    }
  }, [
    address,
    peeplesBlazeryState,
    peeplesDonutTxStep,
    resetPeeplesDonutBlazeResult,
    resetPeeplesDonutWrite,
    showPeeplesDonutBlazeResult,
    writePeeplesDonutContract,
  ]);

  useEffect(() => {
    if (isPeeplesDonutError && peeplesDonutTxStep !== "idle") {
      if (peeplesDonutWriteError) {
        const stepContext = peeplesDonutTxStep === "approving" ? "approve" : "buy";
        const parsed = parseContractError(
          peeplesDonutWriteError,
          {
            contractName: peeplesDonutTxStep === "approving" ? "ERC20" : "Blazery",
            functionName: stepContext,
            additionalInfo: { step: peeplesDonutTxStep }
          }
        );

        if (parsed.severity === 'warning') {
          toast.warning(parsed.title);
        } else {
          toast.error(parsed.title, {
            description: parsed.action ? `${parsed.message}\n\n💡 ${parsed.action}` : parsed.message
          });
        }
      }
      showPeeplesDonutBlazeResult("failure");
      setPeeplesDonutTxStep("idle");
      resetPeeplesDonutWrite();
    }
  }, [isPeeplesDonutError, peeplesDonutTxStep, peeplesDonutWriteError, resetPeeplesDonutWrite, showPeeplesDonutBlazeResult]);

  useEffect(() => {
    if (!peeplesDonutReceipt) return;
    if (peeplesDonutReceipt.status === "success" || peeplesDonutReceipt.status === "reverted") {
      if (peeplesDonutReceipt.status === "reverted") {
        showPeeplesDonutBlazeResult("failure");
        setPeeplesDonutTxStep("idle");
        refetchData();
        const resetTimer = setTimeout(() => {
          resetPeeplesDonutWrite();
        }, 500);
        return () => clearTimeout(resetTimer);
      }

      if (peeplesDonutTxStep === "approving") {
        resetPeeplesDonutWrite();
        setPeeplesDonutTxStep("buying");
        return;
      }

      if (peeplesDonutTxStep === "buying") {
        showPeeplesDonutBlazeResult("success");
        setPeeplesDonutTxStep("idle");
        refetchData();
        const resetTimer = setTimeout(() => {
          resetPeeplesDonutWrite();
        }, 500);
        return () => clearTimeout(resetTimer);
      }
    }
    return;
  }, [peeplesDonutReceipt, peeplesDonutTxStep, refetchData, resetPeeplesDonutWrite, showPeeplesDonutBlazeResult]);

  useEffect(() => {
    if (peeplesDonutTxStep === "buying" && !isPeeplesDonutWriting && !isPeeplesDonutConfirming && !peeplesDonutTxHash && !isPeeplesDonutError) {
      handlePeeplesBlaze();
    }
  }, [peeplesDonutTxStep, isPeeplesDonutWriting, isPeeplesDonutConfirming, peeplesDonutTxHash, isPeeplesDonutError, handlePeeplesBlaze]);

  const peeplesDonutButtonLabel = useMemo(() => {
    if (!peeplesBlazeryState) return "Loading…";
    if (peeplesDonutBlazeResult === "success") return "SUCCESS";
    if (peeplesDonutBlazeResult === "failure") return "FAILURE";
    if (isPeeplesDonutWriting || isPeeplesDonutConfirming) {
      if (peeplesDonutTxStep === "approving") return "APPROVING…";
      if (peeplesDonutTxStep === "buying") return "BLAZING…";
      return "PROCESSING…";
    }
    return "BLAZE";
  }, [peeplesDonutBlazeResult, isPeeplesDonutConfirming, isPeeplesDonutWriting, peeplesBlazeryState, peeplesDonutTxStep]);

  const hasInsufficientPeeplesLP =
    (peeplesBlazeryState?.userLPBalance && peeplesBlazeryState?.price) ? peeplesBlazeryState?.userLPBalance < peeplesBlazeryState?.price : true;

  const isPeeplesBlazeDisabled =
    !peeplesBlazeryState ||
    isPeeplesDonutWriting ||
    isPeeplesDonutConfirming ||
    peeplesDonutBlazeResult !== null ||
    hasInsufficientPeeplesLP;

  return (
    <div className="space-y-4">
      {/* Donut-PEEPLES Blazery */}
      <div>
        <h2 className="uppercase font-bold text-sm mb-2">Donut-PEEPLES Blazery</h2>
        <p className="text-xs text-gray-600 mb-3">
          Trade your DONUT-PEEPLES LP tokens for accumulated treasury tokens at a discount.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <Card className="border-[#82AF96] bg-[#FFFFF0]">
            <CardContent className="grid gap-1.5 p-2.5">
              <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-800">
                PAY
              </div>
              <div className="text-xl font-semibold text-[#82AF96]">
                {parseFloat(
                  formatUnits(peeplesBlazeryState?.price || 0n, 18)
                ).toFixed(4)}{" "}
                LP
              </div>
              <div className="text-xs text-gray-600">
                $
                {peeplesBlazeryState
                  ? (
                    Number(formatEther(peeplesBlazeryState?.price || 0n)) *
                    Number(formatEther(peeplesBlazeryState?.paymentTokenPrice || 0n)) *
                    ethUsdPrice
                  ).toFixed(2)
                  : "0.00"}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#82AF96] bg-[#FFFFF0] text-[#82AD94]">
            <CardContent className="grid gap-1.5 p-2.5">
              <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-800">
                GET
              </div>
              <div className="text-sm font-semibold flex flex-col">
                <span>{parseFloat(formatUnits(peeplesBlazeryState?.wethBlazeryBalance || 0n, 18)).toFixed(4)} WETH</span>
                <span>{parseFloat(formatUnits(peeplesBlazeryState?.donutBlazeryBalance || 0n, 18)).toFixed(2)} DONUT</span>
                <span>{parseFloat(formatUnits(peeplesBlazeryState?.peeplesBlazeryBalance || 0n, 18)).toFixed(2)} PEEPLES</span>
              </div>
              <div className="text-xs text-gray-600">
                ${peeplesBlazeryState?.totalBlazeValue?.toFixed(2) ?? "0.00"}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <Button
            className="w-full rounded-xl bg-[#82AF96] py-2.5 text-sm font-bold text-black shadow-lg transition-colors hover:bg-[#82AF96]/90 disabled:cursor-not-allowed disabled:bg-[#82AF96]/80"
            onClick={handlePeeplesBlaze}
            disabled={isPeeplesBlazeDisabled as boolean}
          >
            {peeplesDonutButtonLabel}
          </Button>

          <div className="flex items-center justify-between px-1">
            <div className="text-xs text-black">
              Available:{" "}
              <span className="text-black font-semibold">
                {address && peeplesBlazeryState?.userLPBalance
                  ? formatEth(peeplesBlazeryState.userLPBalance, 4)
                  : "0"}
              </span>{" "}
              LP
            </div>
            <a
              href="https://app.uniswap.org/explore/pools/base/0x189f254685CD46E48CbdCe39E9572695dDe92402"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#82AF96] hover:text-[#82AF96]/80 font-semibold transition-colors"
            >
              Get LP →
            </a>
          </div>

          {peeplesBlazeryState?.pnl !== undefined && peeplesBlazeryState?.pnl !== 0 && (
            <div
              className={cn(
                "text-center text-xs font-semibold px-2 py-1.5 rounded",
                peeplesBlazeryState?.pnl > 0
                  ? "text-green-500"
                  : "text-red-500"
              )}
            >
              {peeplesBlazeryState.pnl > 0 ? (
                <>💰 +${peeplesBlazeryState.pnl.toFixed(2)} profit</>
              ) : (
                <>⚠️ ${peeplesBlazeryState.pnl.toFixed(2)} loss</>
              )}
            </div>
          )}
        </div>
      </div>

      {/* How Blazery Works */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-[#3D405B]/10 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-[#3D405B] mb-3">How Blazery Works</h3>
        <div className="space-y-2 text-xs text-gray-600">
          <p>
            The Blazery accumulates tokens from protocol fees. When the value exceeds
            the cost of LP tokens, you can trade LP for treasury tokens at a profit.
          </p>
          <p>
            LP tokens are burned, reducing supply and increasing value for remaining holders.
          </p>
        </div>
      </div>
    </div>
  );
};
