"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "@farcaster/miniapp-sdk";
import { CircleUserRound } from "lucide-react";
import {
  useAccount,
  useConnect,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import { formatEther, formatUnits, zeroAddress, type Address } from "viem";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CONTRACT_ADDRESSES, MULTICALL_ABI } from "@/lib/contracts";
import { cn, getEthPrice } from "@/lib/utils";
import { useAccountData } from "@/hooks/useAccountData";
import { NavBar } from "@/components/nav-bar";
import { AddToFarcasterDialog } from "@/components/add-to-farcaster-dialog";
import { useRouter } from "next/navigation";

export type MiniAppContext = {
  user?: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  };
};

type MinerState = {
  epochId: bigint | number;
  initPrice: bigint;
  startTime: bigint | number;
  glazed: bigint;
  price: bigint;
  dps: bigint;
  nextDps: bigint;
  donutPrice: bigint;
  miner: Address;
  uri: string;
  ethBalance: bigint;
  wethBalance: bigint;
  donutBalance: bigint;
};

const DONUT_DECIMALS = 18;
const DEADLINE_BUFFER_SECONDS = 15 * 60;

const toBigInt = (value: bigint | number) =>
  typeof value === "bigint" ? value : BigInt(value);

const formatTokenAmount = (
  value: bigint,
  decimals: number,
  maximumFractionDigits = 2
) => {
  if (value === 0n) return "0";
  const asNumber = Number(formatUnits(value, decimals));
  if (!Number.isFinite(asNumber)) {
    return formatUnits(value, decimals);
  }
  return asNumber.toLocaleString(undefined, {
    maximumFractionDigits,
  });
};

const formatEth = (value: bigint, maximumFractionDigits = 4) => {
  if (value === 0n) return "0";
  const asNumber = Number(formatEther(value)) * 0.95;
  if (!Number.isFinite(asNumber)) {
    return formatEther(value);
  }
  return asNumber.toLocaleString(undefined, {
    maximumFractionDigits,
  });
};

const formatAddress = (addr?: string) => {
  if (!addr) return "—";
  const normalized = addr.toLowerCase();
  if (normalized === zeroAddress) return "No miner";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
};

const initialsFrom = (label?: string) => {
  if (!label) return "";
  const stripped = label.replace(/[^a-zA-Z0-9]/g, "");
  if (!stripped) return label.slice(0, 2).toUpperCase();
  return stripped.slice(0, 2).toUpperCase();
};

const formatGlazeTime = (seconds: number): string => {
  if (seconds < 0) return "0s";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

export default function HomePage() {
  const readyRef = useRef(false);
  const router = useRouter()
  const autoConnectAttempted = useRef(false);
  const [context, setContext] = useState<MiniAppContext | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [ethUsdPrice, setEthUsdPrice] = useState<number>(3500);
  const [glazeResult, setGlazeResult] = useState<"success" | "failure" | null>(
    null
  );
  const glazeResultTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [glazeElapsedSeconds, setGlazeElapsedSeconds] = useState<number>(0);
  const resetGlazeResult = useCallback(() => {
    if (glazeResultTimeoutRef.current) {
      clearTimeout(glazeResultTimeoutRef.current);
      glazeResultTimeoutRef.current = null;
    }
    setGlazeResult(null);
  }, []);
  const showGlazeResult = useCallback((result: "success" | "failure") => {
    if (glazeResultTimeoutRef.current) {
      clearTimeout(glazeResultTimeoutRef.current);
    }
    setGlazeResult(result);
    glazeResultTimeoutRef.current = setTimeout(() => {
      setGlazeResult(null);
      glazeResultTimeoutRef.current = null;
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

  useEffect(() => {
    return () => {
      if (glazeResultTimeoutRef.current) {
        clearTimeout(glazeResultTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!readyRef.current) {
        readyRef.current = true;
        sdk.actions.ready().catch(() => { });
      }
    }, 1200);
    return () => clearTimeout(timeout);
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
    }).catch(() => {
      // Ignore auto-connect failures; user can connect manually.
    });
  }, [connectAsync, isConnected, isConnecting, primaryConnector]);

  const { data: rawMinerState, refetch: refetchMinerState } = useReadContract({
    address: CONTRACT_ADDRESSES.multicall,
    abi: MULTICALL_ABI,
    functionName: "getMiner",
    args: [address ?? zeroAddress],
    chainId: base.id,
    query: {
      refetchInterval: 3_000,
    },
  });

  const minerState = useMemo(() => {
    if (!rawMinerState) return undefined;
    return rawMinerState as unknown as MinerState;
  }, [rawMinerState]);

  const { data: accountData } = useAccountData(address);

  useEffect(() => {
    if (!readyRef.current && minerState) {
      readyRef.current = true;
      sdk.actions.ready().catch(() => { });
    }
  }, [minerState]);

  useEffect(() => {
    if (!minerState) {
      setGlazeElapsedSeconds(0);
      return;
    }

    // Calculate initial elapsed time
    const startTimeSeconds = Number(minerState.startTime);
    const initialElapsed = Math.floor(Date.now() / 1000) - startTimeSeconds;
    setGlazeElapsedSeconds(initialElapsed);

    // Update every second
    const interval = setInterval(() => {
      const currentElapsed = Math.floor(Date.now() / 1000) - startTimeSeconds;
      setGlazeElapsedSeconds(currentElapsed);
    }, 1_000);

    return () => clearInterval(interval);
  }, [minerState]);

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

  useEffect(() => {
    if (!receipt) return;
    if (receipt.status === "success" || receipt.status === "reverted") {
      showGlazeResult(receipt.status === "success" ? "success" : "failure");
      refetchMinerState();
      const resetTimer = setTimeout(() => {
        resetWrite();
      }, 500);
      return () => clearTimeout(resetTimer);
    }
    return;
  }, [receipt, refetchMinerState, resetWrite, showGlazeResult]);

  const minerAddress = minerState?.miner ?? zeroAddress;
  const hasMiner = minerAddress !== zeroAddress;

  const claimedHandleParam = (minerState?.uri ?? "").trim();

  const { data: neynarUser } = useQuery<{
    user: {
      fid: number | null;
      username: string | null;
      displayName: string | null;
      pfpUrl: string | null;
    } | null;
  }>({
    queryKey: ["neynar-user", minerAddress],
    queryFn: async () => {
      const res = await fetch(
        `/api/neynar/user?address=${encodeURIComponent(minerAddress)}`
      );
      if (!res.ok) {
        throw new Error("Failed to load Farcaster profile.");
      }
      return (await res.json()) as {
        user: {
          fid: number | null;
          username: string | null;
          displayName: string | null;
          pfpUrl: string | null;
        } | null;
      };
    },
    enabled: hasMiner,
    staleTime: 60_000,
    retry: false,
  });

  const glazeTimeDisplay = minerState
    ? formatGlazeTime(glazeElapsedSeconds)
    : "—";

  const handleGlaze = useCallback(async () => {
    if (!minerState) return;
    resetGlazeResult();
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
      const price = minerState.price;
      const epochId = toBigInt(minerState.epochId);
      const deadline = BigInt(
        Math.floor(Date.now() / 1000) + DEADLINE_BUFFER_SECONDS
      );
      const maxPrice = price === 0n ? 0n : (price * 105n) / 100n;
      writeContract({
        account: targetAddress as Address,
        address: CONTRACT_ADDRESSES.multicall as Address,
        abi: MULTICALL_ABI,
        functionName: "mine",
        args: [
          address as Address,
          epochId,
          deadline,
          maxPrice,
          customMessage.trim(),
        ],
        value: price,
        chainId: base.id,
      });
    } catch (error) {
      console.error("Failed to glaze:", error);
      showGlazeResult("failure");
      resetWrite();
    }
  }, [
    address,
    connectAsync,
    customMessage,
    minerState,
    primaryConnector,
    resetGlazeResult,
    resetWrite,
    showGlazeResult,
    writeContract,
  ]);

  // Local state for smooth glazed counter interpolation
  const [interpolatedGlazed, setInterpolatedGlazed] = useState<bigint | null>(
    null
  );

  // Update interpolated glazed amount smoothly between fetches
  useEffect(() => {
    if (!minerState) {
      setInterpolatedGlazed(null);
      return;
    }

    // Start with the fetched value
    setInterpolatedGlazed(minerState.glazed);

    // Update every second with interpolated value
    const interval = setInterval(() => {
      if (minerState.nextDps > 0n) {
        setInterpolatedGlazed((prev) => {
          if (!prev) return minerState.glazed;
          return prev + minerState.nextDps;
        });
      }
    }, 1_000);

    return () => clearInterval(interval);
  }, [minerState]);

  const occupantDisplay = useMemo(() => {
    if (!minerState) {
      return {
        primary: "—",
        secondary: "",
        isYou: false,
        avatarUrl: null as string | null,
        isUnknown: true,
        addressLabel: "—",
      };
    }
    const minerAddr = minerState.miner;
    const fallback = formatAddress(minerAddr);
    const isYou =
      !!address &&
      minerAddr.toLowerCase() === (address as string).toLowerCase();

    const fallbackAvatarUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(
      minerAddr.toLowerCase()
    )}`;

    const profile = neynarUser?.user ?? null;
    const profileUsername = profile?.username ? `@${profile.username}` : null;
    const profileDisplayName = profile?.displayName ?? null;

    const contextProfile = context?.user ?? null;
    const contextHandle = contextProfile?.username
      ? `@${contextProfile.username}`
      : null;
    const contextDisplayName = contextProfile?.displayName ?? null;

    const claimedHandle = claimedHandleParam
      ? claimedHandleParam.startsWith("@")
        ? claimedHandleParam
        : `@${claimedHandleParam}`
      : null;

    const addressLabel = fallback;

    const labelCandidates = [
      profileDisplayName,
      profileUsername,
      isYou ? contextDisplayName : null,
      isYou ? contextHandle : null,
      addressLabel,
    ].filter((label): label is string => !!label);

    const seenLabels = new Set<string>();
    const uniqueLabels = labelCandidates.filter((label) => {
      const key = label.toLowerCase();
      if (seenLabels.has(key)) return false;
      seenLabels.add(key);
      return true;
    });

    const primary = uniqueLabels[0] ?? addressLabel;

    const secondary =
      uniqueLabels.find(
        (label) => label !== primary && label.startsWith("@")
      ) ?? "";

    const avatarUrl =
      profile?.pfpUrl ??
      (isYou ? (contextProfile?.pfpUrl ?? null) : null) ??
      fallbackAvatarUrl;

    const isUnknown =
      !profile &&
      !claimedHandle &&
      !(isYou && (contextHandle || contextDisplayName));

    return {
      primary,
      secondary,
      isYou,
      avatarUrl,
      isUnknown,
      addressLabel,
    };
  }, [
    address,
    claimedHandleParam,
    context?.user?.displayName,
    context?.user?.pfpUrl,
    context?.user?.username,
    minerState,
    neynarUser?.user,
  ]);

  const glazeRateDisplay = minerState
    ? formatTokenAmount(minerState.nextDps, DONUT_DECIMALS, 4)
    : "—";
  const glazePriceDisplay = minerState
    ? `Ξ${formatEth(minerState.price, minerState.price === 0n ? 0 : 5)}`
    : "Ξ—";
  const glazedDisplay =
    minerState && interpolatedGlazed !== null
      ? `🍩${formatTokenAmount(interpolatedGlazed, DONUT_DECIMALS, 2)}`
      : "🍩—";

  // Calculate USD values for donuts
  const glazedUsdValue =
    minerState && minerState.donutPrice > 0n && interpolatedGlazed !== null
      ? (
        Number(formatEther(interpolatedGlazed)) *
        Number(formatEther(minerState.donutPrice)) *
        ethUsdPrice
      ).toFixed(2)
      : "0.00";

  const glazeRateUsdValue =
    minerState && minerState.donutPrice > 0n
      ? (
        Number(formatUnits(minerState.nextDps, DONUT_DECIMALS)) *
        Number(formatEther(minerState.donutPrice)) *
        ethUsdPrice
      ).toFixed(4)
      : "0.0000";

  // Calculate PNL in USD
  const pnlUsdValue = minerState
    ? (() => {
      const halfInitPrice = minerState.initPrice / 2n;
      const pnl =
        minerState.price < minerState.initPrice
          ? (minerState.price * 80n) / 100n - halfInitPrice
          : minerState.price - halfInitPrice;
      const pnlEth = Number(formatEther(pnl >= 0n ? pnl : -pnl));
      const pnlUsd = pnlEth * ethUsdPrice;
      const sign = pnl >= 0n ? "+" : "-";
      return `${sign}$${pnlUsd.toFixed(2)}`;
    })()
    : "$0.00";

  const occupantInitialsSource = occupantDisplay.isUnknown
    ? occupantDisplay.addressLabel
    : occupantDisplay.primary || occupantDisplay.addressLabel;

  const occupantFallbackInitials = occupantDisplay.isUnknown
    ? (occupantInitialsSource?.slice(-2) ?? "??").toUpperCase()
    : initialsFrom(occupantInitialsSource);

  const donutBalanceDisplay =
    minerState && minerState.donutBalance !== undefined
      ? formatTokenAmount(minerState.donutBalance, DONUT_DECIMALS, 2)
      : "—";
  const ethBalanceDisplay =
    minerState && minerState.ethBalance !== undefined
      ? formatEth(minerState.ethBalance, 4)
      : "—";

  const buttonLabel = useMemo(() => {
    if (!minerState) return "Loading…";
    if (glazeResult === "success") return "SUCCESS";
    if (glazeResult === "failure") return "FAILURE";
    if (isWriting || isConfirming) {
      return "GLAZING…";
    }
    return "GLAZE";
  }, [glazeResult, isConfirming, isWriting, minerState]);

  const isGlazeDisabled =
    !minerState || isWriting || isConfirming || glazeResult !== null;

  const handleViewKingGlazerProfile = useCallback(() => {
    const fid = neynarUser?.user?.fid;
    const username = neynarUser?.user?.username;

    if (username) {
      // Open Farcaster profile URL using username (cleaner URL)
      window.open(
        `https://warpcast.com/${username}`,
        "_blank",
        "noopener,noreferrer"
      );
    } else if (fid) {
      // Fallback to FID-based URL if username not available
      window.open(
        `https://warpcast.com/~/profiles/${fid}`,
        "_blank",
        "noopener,noreferrer"
      );
    } else {
      console.log("No FID or username available for King Glazer");
    }
  }, [neynarUser?.user?.fid, neynarUser?.user?.username]);

  const userDisplayName =
    context?.user?.displayName ?? context?.user?.username ?? "Farcaster user";
  const userHandle = context?.user?.username
    ? `@${context.user.username}`
    : context?.user?.fid
      ? `fid ${context.user.fid}`
      : "";
  const userAvatarUrl = context?.user?.pfpUrl ?? null;

  const onGoToPool = () => {
    router.push("/pool");
  }

  const handleSwap = async () => {
    sdk.actions.swapToken({
      sellToken: "eip155:8453/erc20:0x4200000000000000000000000000000000000006",
      buyToken: "eip155:8453/erc20:0x0eb9d965DBEfbfB131216A4250A29C9b0693Cb07",
    });
  }


  return (
    <main className="flex h-screen w-screen justify-center overflow-hidden bg-[#FFFDD0] coming-soon text-black">
      {/* Add to Farcaster Dialog - shows on first visit */}
      <AddToFarcasterDialog showOnFirstVisit={true} />

      <div
        className="relative flex h-full w-full max-w-[520px] flex-1 flex-col overflow-hidden rounded-[28px] bg-[#FFFDD0] px-2 pb-4 shadow-inner"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 80px)",
        }}
      >
        <div className="flex flex-1 flex-col overflow-hidden">
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
                  <AvatarFallback className="bg-zinc-800 text-white">
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

          <Card
            className={cn(
              "mt-2 border-zinc-800 bg-[#FFFFF0] transition-shadow text-black",
              occupantDisplay.isYou &&
              "border-[#82AD94] shadow-[inset_0_0_24px_rgba(130,173,148,0.55)] animate-glow"
            )}
          >
            <CardContent className="flex items-center justify-between gap-3 p-2.5">
              {/* King Glazer Section */}
              <div
                className={cn(
                  "flex flex-col items-start gap-2 min-w-0 flex-1",
                  neynarUser?.user?.fid &&
                  "cursor-pointer hover:opacity-80 transition-opacity"
                )}
                onClick={
                  neynarUser?.user?.fid
                    ? handleViewKingGlazerProfile
                    : undefined
                }
              >
                <div className="flex items-center gap-2 w-full min-w-0">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage
                      src={occupantDisplay.avatarUrl || undefined}
                      alt={occupantDisplay.primary}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-zinc-800 text-gray-600 text-xs uppercase">
                      {minerState ? (
                        occupantFallbackInitials
                      ) : (
                        <CircleUserRound className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="leading-tight text-left min-w-0">
                    <div
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-[0.08em]",
                        occupantDisplay.isYou
                          ? "text-[#82AD94]"
                          : "text-gray-600"
                      )}
                    >
                      KING GLAZER
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-700 truncate">
                      <span className="truncate">
                        {occupantDisplay.primary}
                      </span>
                    </div>
                    {occupantDisplay.secondary ? (
                      <div className="text-[10px] text-gray-600 truncate">
                        {occupantDisplay.secondary}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-0.5 w-full">
                  <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-gray-600  text-left whitespace-nowrap">
                    PURCHASED FOR:
                  </div>
                  <div className="flex items-center justify-center gap-0.5">
                    <div className="text-[10px] text-gray-600 whitespace-nowrap">
                      {parseFloat(
                        formatUnits((minerState?.initPrice || 0n) / 2n, 18)
                      ).toFixed(5)}{" "}
                      $ETH
                    </div>
                    <div className="text-[10px] text-gray-600 whitespace-nowrap">
                      ($
                      {minerState
                        ? (
                          Number(formatEther(minerState.initPrice / 2n)) *
                          ethUsdPrice
                        ).toFixed(2)
                        : "0.00"}
                      )
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Section - Glazed and PNL stacked */}
              <div className="flex flex-col gap-1.5 flex-shrink-0 items-end">
                <div className="flex items-center gap-1.5">
                  <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-gray-700 w-10 text-right">
                    TIME
                  </div>
                  <div className="text-xs font-semibold text-gray-500">
                    {glazeTimeDisplay}
                  </div>
                </div>
                {/* Glazed Row */}
                <div className="flex items-center gap-2">
                  <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-gray-600 w-12 text-right">
                    GLAZED
                  </div>
                  <div className="text-sm font-semibold text-[#82AD94]">
                    {glazedDisplay}
                  </div>
                  <div className="text-[10px] text-gray-600">
                    ${glazedUsdValue}
                  </div>
                </div>

                {/* PNL Row */}
                <div className="flex items-center gap-2">
                  <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-gray-600 w-12 text-right">
                    PNL
                  </div>
                  <div
                    className={cn(
                      "text-sm font-semibold",
                      minerState &&
                        (() => {
                          const halfInitPrice = minerState.initPrice / 2n;
                          const pnl =
                            minerState.price < minerState.initPrice
                              ? (minerState.price * 80n) / 100n - halfInitPrice
                              : minerState.price - halfInitPrice;
                          return pnl >= 0n;
                        })()
                        ? "text-green-400"
                        : "text-red-400"
                    )}
                  >
                    {minerState
                      ? (() => {
                        const halfInitPrice = minerState.initPrice / 2n;
                        const pnl =
                          minerState.price < minerState.initPrice
                            ? (minerState.price * 80n) / 100n - halfInitPrice
                            : minerState.price - halfInitPrice;
                        const sign = pnl >= 0n ? "+" : "-";
                        const absolutePnl = pnl >= 0n ? pnl : -pnl;
                        return `${sign}Ξ${formatEth(absolutePnl, 5)}`;
                      })()
                      : "Ξ—"}
                  </div>
                  <div className="text-[10px] text-gray-600">{pnlUsdValue}</div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-gray-600 w-12 text-right whitespace-nowrap">
                    Total PNL
                  </div>
                  <div
                    className={cn(
                      "text-sm font-semibold flex items-center jusify-center",
                      glazedUsdValue &&
                        pnlUsdValue &&
                        (() => {
                          const totalPnl =
                            parseFloat(glazedUsdValue) +
                            parseFloat(pnlUsdValue.replace(/[$+,-]/g, "")) *
                            (pnlUsdValue.startsWith("-") ? -1 : 1);
                          return totalPnl >= 0;
                        })()
                        ? "text-green-400"
                        : "text-red-400"
                    )}
                  >
                    <span className="pb-0.5">
                      {(() => {
                        const totalPnl =
                          parseFloat(glazedUsdValue) +
                          parseFloat(pnlUsdValue.replace(/[$+,-]/g, "")) *
                          (pnlUsdValue.startsWith("-") ? -1 : 1);
                        return totalPnl >= 0 ? "+" : "-";
                      })()}{" "}
                    </span>
                    <span>$ </span>
                    <span>
                      {Math.abs(
                        parseFloat(glazedUsdValue) +
                        parseFloat(pnlUsdValue.replace(/[$+,-]/g, "")) *
                        (pnlUsdValue.startsWith("-") ? -1 : 1)
                      ).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="w-full h-fit mt-1.5 flex items-center justify-center gap-x-2">
            <Button onClick={() => onGoToPool()} variant="default" className="w-full h-[25px] bg-[#82AD94] text-black hover:text-white">
              Join the Pool!
            </Button>
            <Button onClick={() => handleSwap()} variant="default" className="w-full h-[25px] bg-[#82AD94] text-black hover:text-white">
              Buy $PEEPLES
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <Card className="border-zinc-800 bg-[#FFFFF0]">
              <CardContent className="grid gap-1.5 p-2.5">
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-600">
                  GLAZE RATE
                </div>
                <div className="text-2xl font-semibold text-[#82AD94]">
                  🍩{glazeRateDisplay}
                  <span className="text-xs text-gray-600">/s</span>
                </div>
                <div className="text-xs text-gray-600 -mt-1">
                  ${glazeRateUsdValue}/s
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-[#FFFFF0]">
              <CardContent className="grid gap-1.5 p-2.5">
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-600">
                  GLAZE PRICE
                </div>
                <div className="text-2xl font-semibold text-[#82AD94]">
                  {glazePriceDisplay}
                </div>
                <div className="text-xs text-gray-600 -mt-1">
                  $
                  {minerState
                    ? (
                      Number(formatEther(minerState.price)) * ethUsdPrice
                    ).toFixed(2)
                    : "0.00"}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative mt-1 overflow-hidden bg-[#FFFDD0]">
            <div className="flex animate-scroll whitespace-nowrap py-0.5 text-sm font-bold text-[#82AD94]">
              {Array.from({ length: 1000 }).map((_, i) => (
                <span key={i} className="inline-block px-8">
                  {minerState?.uri && minerState.uri.trim() !== ""
                    ? minerState.uri
                    : "PEEPLES DONUTS"}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-1 -mx-2 w-[calc(100%+1rem)] overflow-hidden">
            <video
              className="aspect-[16/9] w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              src="/media/peeples_final.mp4"
            />
          </div>

          <div className="mt-2 flex flex-col gap-2 pb-2">
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a message (optional)"
              maxLength={100}
              className="w-full text-black rounded-lg border border-zinc-800 bg-[#FFFFF0] px-3 py-2 text-sm coming-soon placeholder-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-[30px]"
              disabled={isGlazeDisabled}
            />

            <Button
              className="w-full rounded-2xl bg-[#82AD94] py-3 text-base font-bold text-black shadow-lg transition-colors hover:bg-[#82AD94]/70 disabled:cursor-not-allowed disabled:bg-pink-500/40 h-[30px]"
              onClick={handleGlaze}
              disabled={isGlazeDisabled}
            >
              {buttonLabel}
            </Button>
          </div>

          <div className="mt-auto px-2 pb-1">
            <div className="mb-0.5 text-[11px] uppercase tracking-wide text-gray-600">
              Your Balances
            </div>

            <div className="flex justify-between">
              {/* Left Column - Donut Balance & Mined */}
              <div className="flex flex-col gap-0.5 items-start">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                  <span>🍩</span>
                  <span>{donutBalanceDisplay}</span>
                </div>
              </div>

              {/* Middle Column - ETH Balance & Spent */}
              <div className="flex flex-col gap-0.5 items-start">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                  <span>Ξ</span>
                  <span>{ethBalanceDisplay}</span>
                </div>
              </div>

              {/* Right Column - WETH Balance & Earned */}
              <div className="flex flex-col gap-0.5 items-start">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                  <span>wΞ</span>
                  <span>
                    {minerState && minerState.wethBalance !== undefined
                      ? formatEth(minerState.wethBalance, 4)
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <NavBar />
    </main>
  );
}
