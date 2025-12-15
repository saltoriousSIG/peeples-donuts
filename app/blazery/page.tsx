"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import {
  useAccount,
  useConnect,
  useReadContract,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import { formatEther, zeroAddress, type Address, formatUnits } from "viem";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CONTRACT_ADDRESSES,
  MULTICALL_ABI,
  PEEPLES_BLAZERY,
} from "@/lib/contracts";
import { cn, getEthPrice } from "@/lib/utils";
import { NavBar } from "@/components/nav-bar";

type MiniAppContext = {
  user?: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  };
};

type AuctionState = {
  epochId: bigint | number;
  initPrice: bigint;
  startTime: bigint | number;
  paymentToken: Address;
  price: bigint;
  paymentTokenPrice: bigint;
  wethAccumulated: bigint;
  wethBalance: bigint;
  paymentTokenBalance: bigint;
};

const DEADLINE_BUFFER_SECONDS = 5 * 60;
const LP_TOKEN_ADDRESS =
  "0xD1DbB2E56533C55C3A637D13C53aeEf65c5D5703" as Address;

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

const initialsFrom = (label?: string) => {
  if (!label) return "";
  const stripped = label.replace(/[^a-zA-Z0-9]/g, "");
  if (!stripped) return label.slice(0, 2).toUpperCase();
  return stripped.slice(0, 2).toUpperCase();
};

export default function BlazeryPage() {
  // Mock data
  const readyRef = useRef(false);
  const autoConnectAttempted = useRef(false);
  const [context, setContext] = useState<MiniAppContext | null>(null);
  const [ethUsdPrice, setEthUsdPrice] = useState<number>(3500);
  const [blazeResult, setBlazeResult] = useState<"success" | "failure" | null>(
    null
  );
  const [txStep, setTxStep] = useState<"idle" | "approving" | "buying">("idle");
  const blazeResultTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const resetBlazeResult = useCallback(() => {
    if (blazeResultTimeoutRef.current) {
      clearTimeout(blazeResultTimeoutRef.current);
      blazeResultTimeoutRef.current = null;
    }
    setBlazeResult(null);
  }, []);

  const showBlazeResult = useCallback((result: "success" | "failure") => {
    if (blazeResultTimeoutRef.current) {
      clearTimeout(blazeResultTimeoutRef.current);
    }
    setBlazeResult(result);
    blazeResultTimeoutRef.current = setTimeout(() => {
      setBlazeResult(null);
      blazeResultTimeoutRef.current = null;
    }, 3000);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const hydrateContext = async () => {
      try {
        const ctx = (await (
          sdk as unknown as {
            context: Promise<MiniAppContext> | MiniAppContext;
          }
        ).context) as MiniAppContext;
        if (!cancelled) {
          setContext(ctx);
        }
      } catch {
        if (!cancelled) setContext(null);
      }
    };
    hydrateContext();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch ETH price on mount and every minute
  useEffect(() => {
    const fetchPrice = async () => {
      const price = await getEthPrice();
      setEthUsdPrice(price);
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60_000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (blazeResultTimeoutRef.current) {
        clearTimeout(blazeResultTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!readyRef.current) {
        readyRef.current = true;
        sdk.actions.ready().catch(() => {});
      }
    }, 1200);
    return () => clearTimeout(timeout);
  }, []);

  const { address, isConnected } = useAccount();
  const { connectors, connectAsync, isPending: isConnecting } = useConnect();
  const primaryConnector = connectors[0];

  useEffect(() => {
    if (
      autoConnectAttempted.current ||
      isConnected ||
      !primaryConnector ||
      isConnecting
    ) {
      return;
    }
    autoConnectAttempted.current = true;
    connectAsync({
      connector: primaryConnector,
      chainId: base.id,
    }).catch(() => {});
  }, [connectAsync, isConnected, isConnecting, primaryConnector]);

  const { data: rawAuctionState, refetch: refetchAuctionState } =
    useReadContract({
      address: CONTRACT_ADDRESSES.multicall,
      abi: MULTICALL_ABI,
      functionName: "getAuction",
      args: [address ?? zeroAddress],
      chainId: base.id,
      query: {
        refetchInterval: 3_000,
      },
    });

  const auctionState = useMemo(() => {
    if (!rawAuctionState) return undefined;
    return rawAuctionState as unknown as AuctionState;
  }, [rawAuctionState]);

  const { data } = useReadContracts({
    contracts: [
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
    ],
    query: {
      refetchInterval: 3_000,
    },
  });
  console.log("blazery data", data);

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

  useEffect(() => {
    if (!readyRef.current && auctionState) {
      readyRef.current = true;
      sdk.actions.ready().catch(() => {});
    }
  }, [auctionState]);

  const {
    data: txHash,
    writeContract,
    isPending: isWriting,
    reset: resetWrite,
  } = useWriteContract();

  const { data: receipt, isLoading: isConfirming } =
    useWaitForTransactionReceipt({
      hash: txHash,
      chainId: base.id,
    });

  const handleBlaze = useCallback(async () => {
    if (!auctionState) return;
    resetBlazeResult();
    try {
      let targetAddress = address;
      if (!targetAddress) {
        if (!primaryConnector) {
          throw new Error("Wallet connector not available yet.");
        }
        const result = await connectAsync({
          connector: primaryConnector,
          chainId: base.id,
        });
        targetAddress = result.accounts[0];
      }
      if (!targetAddress) {
        throw new Error("Unable to determine wallet address.");
      }

      const price = auctionState.price;
      const epochId = toBigInt(auctionState.epochId);
      const deadline = BigInt(
        Math.floor(Date.now() / 1000) + DEADLINE_BUFFER_SECONDS
      );
      const maxPaymentTokenAmount = price;

      // If we're in idle or approval failed, start with approval
      if (txStep === "idle") {
        setTxStep("approving");
        writeContract({
          account: targetAddress as Address,
          address: LP_TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [CONTRACT_ADDRESSES.multicall as Address, price],
          chainId: base.id,
        });
        return;
      }

      // If approval succeeded, now call buy
      if (txStep === "buying") {
        writeContract({
          account: targetAddress as Address,
          address: CONTRACT_ADDRESSES.multicall as Address,
          abi: MULTICALL_ABI,
          functionName: "buy",
          args: [epochId, deadline, maxPaymentTokenAmount],
          chainId: base.id,
        });
      }
    } catch (error) {
      console.error("Failed to blaze:", error);
      showBlazeResult("failure");
      setTxStep("idle");
      resetWrite();
    }
  }, [
    address,
    connectAsync,
    auctionState,
    primaryConnector,
    resetBlazeResult,
    resetWrite,
    showBlazeResult,
    writeContract,
    txStep,
  ]);

  useEffect(() => {
    if (!receipt) return;
    if (receipt.status === "success" || receipt.status === "reverted") {
      if (receipt.status === "reverted") {
        showBlazeResult("failure");
        setTxStep("idle");
        refetchAuctionState();
        const resetTimer = setTimeout(() => {
          resetWrite();
        }, 500);
        return () => clearTimeout(resetTimer);
      }

      // If approval succeeded, now call buy
      if (txStep === "approving") {
        resetWrite();
        setTxStep("buying");
        return;
      }

      // If buy succeeded
      if (txStep === "buying") {
        showBlazeResult("success");
        setTxStep("idle");
        refetchAuctionState();
        const resetTimer = setTimeout(() => {
          resetWrite();
        }, 500);
        return () => clearTimeout(resetTimer);
      }
    }
    return;
  }, [receipt, refetchAuctionState, resetWrite, showBlazeResult, txStep]);

  // Auto-trigger buy after approval
  useEffect(() => {
    if (txStep === "buying" && !isWriting && !isConfirming && !txHash) {
      handleBlaze();
    }
  }, [txStep, isWriting, isConfirming, txHash, handleBlaze]);

  const auctionPriceDisplay = auctionState
    ? formatEth(auctionState.price, auctionState.price === 0n ? 0 : 5)
    : "—";

  const claimableDisplay = auctionState
    ? formatEth(auctionState.wethAccumulated, 8)
    : "—";

  const buttonLabel = useMemo(() => {
    if (!auctionState) return "Loading…";
    if (blazeResult === "success") return "SUCCESS";
    if (blazeResult === "failure") return "FAILURE";
    if (isWriting || isConfirming) {
      if (txStep === "approving") return "APPROVING…";
      if (txStep === "buying") return "BLAZING…";
      return "PROCESSING…";
    }
    return "BLAZE";
  }, [blazeResult, isConfirming, isWriting, auctionState, txStep]);

  const hasInsufficientLP =
    auctionState && auctionState.paymentTokenBalance < auctionState.price;

  // Calculate profit/loss for blazing
  const blazeProfitLoss = useMemo(() => {
    if (!auctionState) return null;

    // LP token value in USD
    const lpValueInEth =
      Number(formatEther(auctionState.price)) *
      Number(formatEther(auctionState.paymentTokenPrice));
    const lpValueInUsd = lpValueInEth * ethUsdPrice;

    // WETH value in USD
    const wethReceivedInEth = Number(formatEther(auctionState.wethAccumulated));
    const wethValueInUsd = wethReceivedInEth * ethUsdPrice;

    const profitLoss = wethValueInUsd - lpValueInUsd;
    const isProfitable = profitLoss > 0;

    return {
      profitLoss,
      isProfitable,
      lpValueInUsd,
      wethValueInUsd,
    };
  }, [auctionState, ethUsdPrice]);

  const isBlazeDisabled =
    !auctionState ||
    isWriting ||
    isConfirming ||
    blazeResult !== null ||
    hasInsufficientLP;

  const userDisplayName =
    context?.user?.displayName ?? context?.user?.username ?? "Farcaster user";
  const userHandle = context?.user?.username
    ? `@${context.user.username}`
    : context?.user?.fid
      ? `fid ${context.user.fid}`
      : "";
  const userAvatarUrl = context?.user?.pfpUrl ?? null;

  return (
    <main className="flex h-screen w-screen justify-center bg-[#FFFDD0] coming-soon text-white">
      <div
        className="relative flex h-full w-full flex-1 flex-col rounded-[28px] bg-[#FFFDD0] px-2 pb-4 shadow-inner"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 80px)",
        }}
      >
        <div className="flex flex-1 flex-col text-black">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-wide amatic flex items-center justify-center">
              <img
                src="/media/peeples_donuts.png"
                className="h-[50px] w-[50px]"
              />
              PEEPLES DONUTS
            </h1>
            {context?.user ? (
              <div className="flex items-center gap-2 rounded-full bg-[#FFFFF0] px-3 py-1">
                <Avatar className="h-8 w-8 border border-zinc-800">
                  <AvatarImage
                    src={userAvatarUrl || undefined}
                    alt={userDisplayName}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-zinc-800 text-black">
                    {initialsFrom(userDisplayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="leading-tight text-left">
                  <div className="text-sm font-bold">{userDisplayName}</div>
                  {userHandle ? (
                    <div className="text-xs text-gray-600">{userHandle}</div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
          <div className="mt-1 flex flex-col">
            <h2 className="uppercase font-bold">Donut-ETH Blazery:</h2>
            <div className="mt-1 grid grid-cols-2 gap-2 h-fit">
              <Card className="border-[#82AF96] bg-[#FFFFF0]">
                <CardContent className="grid gap-1.5 p-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-800">
                    PAY
                  </div>
                  <div className="text-2xl font-semibold text-[#82AF96]">
                    {auctionPriceDisplay} LP
                  </div>
                  <div className="text-xs text-gray-600">
                    $
                    {auctionState
                      ? (
                          Number(formatEther(auctionState.price)) *
                          Number(formatEther(auctionState.paymentTokenPrice)) *
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
                  <div className="text-2xl font-semibold">
                    Ξ{claimableDisplay}
                  </div>
                  <div className="text-xs text-gray-600">
                    $
                    {auctionState
                      ? (
                          Number(formatEther(auctionState.wethAccumulated)) *
                          ethUsdPrice
                        ).toFixed(2)
                      : "0.00"}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Button
                className="w-full rounded-2xl bg-[#82AF96] py-3 text-base font-bold text-black shadow-lg transition-colors hover:bg-[#82AF96]/90 disabled:cursor-not-allowed disabled:bg-[#82AF96]/80"
                onClick={handleBlaze}
                disabled={isBlazeDisabled}
              >
                {buttonLabel}
              </Button>

              <div className="flex items-center justify-between px-1">
                <div className="text-xs text-black">
                  Available:{" "}
                  <span className="text-black font-semibold">
                    {address && auctionState?.paymentTokenBalance
                      ? formatEth(auctionState.paymentTokenBalance, 4)
                      : "0"}
                  </span>{" "}
                  DONUT-ETH LP
                </div>
                <a
                  href="https://app.uniswap.org/explore/pools/base/0xD1DbB2E56533C55C3A637D13C53aeEf65c5D5703"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#82AF96] hover:text-[#82AF96]/80 font-semibold transition-colors"
                >
                  Get LP →
                </a>
              </div>

              {/* Profit/Loss Warning Message */}
              {blazeProfitLoss && (
                <div
                  className={cn(
                    "text-center text-sm font-semibold px-2 py-1.5 rounded",
                    blazeProfitLoss.isProfitable
                      ? "text-green-400"
                      : "text-red-400"
                  )}
                >
                  {blazeProfitLoss.isProfitable ? (
                    <>
                      💰 Profitable blaze! You'll receive $
                      {blazeProfitLoss.wethValueInUsd.toFixed(2)} in WETH for $
                      {blazeProfitLoss.lpValueInUsd.toFixed(2)} in LP (
                      {blazeProfitLoss.profitLoss >= 0 ? "+" : ""}$
                      {blazeProfitLoss.profitLoss.toFixed(2)})
                    </>
                  ) : (
                    <>
                      ⚠️ Unprofitable blaze! You'll receive $
                      {blazeProfitLoss.wethValueInUsd.toFixed(2)} in WETH for $
                      {blazeProfitLoss.lpValueInUsd.toFixed(2)} in LP ($
                      {blazeProfitLoss.profitLoss.toFixed(2)})
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="mt-2">
            <h2 className="uppercase font-bold">Donut-PEEPLES Blazery:</h2>
            <div className="mt-1 grid grid-cols-2 gap-2 h-fit">
              <Card className="border-[#82AF96] bg-[#FFFFF0]">
                <CardContent className="grid gap-1.5 p-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-800">
                    PAY
                  </div>
                  <div className="text-2xl font-semibold text-[#82AF96]">
                    {parseFloat(
                      formatUnits( 0n, 18)
                    ).toFixed(4)}{" "}
                    LP
                  </div>
                  <div className="text-xs text-gray-600">
                    $
                    {auctionState
                      ? (
                          Number(formatEther(auctionState.price)) *
                          Number(formatEther(auctionState.paymentTokenPrice)) *
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
                  <div className="text-2xl font-semibold">
                    Ξ{claimableDisplay}
                  </div>
                  <div className="text-xs text-gray-600">
                    $
                    {auctionState
                      ? (
                          Number(formatEther(auctionState.wethAccumulated)) *
                          ethUsdPrice
                        ).toFixed(2)
                      : "0.00"}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <NavBar />
    </main>
  );
}
