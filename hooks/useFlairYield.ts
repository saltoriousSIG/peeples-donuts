"use client";

import { useAccount, useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { CLAIM } from "@/lib/abi/claim";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { zeroAddress, formatUnits } from "viem";
import { parseContractError } from "@/lib/errors";
import useContract, { ExecutionType } from "./useContract";

// Enable mock mode for UI testing without actual transactions
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_TRANSACTIONS === "true";

// Helper to simulate async delay
const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Known token configurations
const KNOWN_TOKENS: Record<string, { symbol: string; name: string; decimals: number }> = {
  [CONTRACT_ADDRESSES.weth.toLowerCase()]: { symbol: "WETH", name: "Wrapped Ether", decimals: 18 },
  [CONTRACT_ADDRESSES.donut.toLowerCase()]: { symbol: "DONUT", name: "Donut", decimals: 18 },
  [CONTRACT_ADDRESSES.peeples.toLowerCase()]: { symbol: "PEEPLES", name: "Peeples", decimals: 18 },
};

export interface TokenYield {
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
  amount: bigint;
  formattedAmount: number;
}

export interface ClaimableYield {
  tokens: TokenYield[];
  totalCount: number;
}

export interface UseFlairYieldReturn {
  claimableYield: ClaimableYield | null;
  hasClaimableYield: boolean;
  isLoading: boolean;
  isClaiming: boolean;
  claimYield: () => Promise<void>;
}

// Mock data for testing
const MOCK_CLAIMABLE_YIELD: ClaimableYield = {
  tokens: [
    {
      address: CONTRACT_ADDRESSES.weth as `0x${string}`,
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      amount: 1500000000000000n, // 0.0015 WETH
      formattedAmount: 0.0015,
    },
    {
      address: CONTRACT_ADDRESSES.donut as `0x${string}`,
      symbol: "DONUT",
      name: "Donut",
      decimals: 18,
      amount: 25000000000000000000n, // 25 DONUT
      formattedAmount: 25,
    },
  ],
  totalCount: 2,
};

export function useFlairYield(): UseFlairYieldReturn {
  const { address, isConnected } = useAccount();
  const [isClaiming, setIsClaiming] = useState(false);
  const [mockYieldClaimed, setMockYieldClaimed] = useState(false);

  // Get claimable yield from contract
  const { data: claimableData, fetchStatus: claimableFetchStatus } = useReadContract({
    address: CONTRACT_ADDRESSES.pool as `0x${string}`,
    abi: CLAIM,
    functionName: "getClaimableYield",
    args: [address ?? zeroAddress],
    chainId: base.id,
    query: {
      enabled: !!address && !!CONTRACT_ADDRESSES.pool && !MOCK_MODE,
      refetchInterval: 15_000,
    },
  });

  // Contract execution hook
  const executeClaimYield = useContract(ExecutionType.WRITABLE, "Claim", "claimYield");

  // Parse claimable yield data
  const claimableYield = useMemo((): ClaimableYield | null => {
    // In mock mode, return mock data unless already claimed
    if (MOCK_MODE) {
      if (mockYieldClaimed) {
        return { tokens: [], totalCount: 0 };
      }
      return MOCK_CLAIMABLE_YIELD;
    }

    if (!CONTRACT_ADDRESSES.pool) {
      return null;
    }

    if (!claimableData) {
      return null;
    }

    try {
      const [tokenAddresses, amounts] = claimableData as [`0x${string}`[], bigint[]];

      const tokens: TokenYield[] = tokenAddresses.map((tokenAddress, index) => {
        const amount = amounts[index] ?? 0n;
        const lowerAddress = tokenAddress.toLowerCase();
        const knownToken = KNOWN_TOKENS[lowerAddress];

        const decimals = knownToken?.decimals ?? 18;
        const formattedAmount = parseFloat(formatUnits(amount, decimals));

        return {
          address: tokenAddress,
          symbol: knownToken?.symbol ?? "???",
          name: knownToken?.name ?? "Unknown Token",
          decimals,
          amount,
          formattedAmount,
        };
      });

      // Filter out zero amounts for cleaner display
      const nonZeroTokens = tokens.filter((t) => t.amount > 0n);

      return {
        tokens: nonZeroTokens,
        totalCount: nonZeroTokens.length,
      };
    } catch {
      return null;
    }
  }, [claimableData, mockYieldClaimed]);

  // Check if there's any claimable yield
  const hasClaimableYield = useMemo(() => {
    if (!claimableYield) return false;
    return claimableYield.totalCount > 0;
  }, [claimableYield]);

  // Mock claim implementation
  const executeMockClaim = useCallback(async () => {
    console.log("[MOCK] Claiming yield...");
    setIsClaiming(true);

    try {
      toast.info("[MOCK] Claiming yield...");
      await mockDelay(1500);
      setMockYieldClaimed(true);
      toast.success("[MOCK] Yield claimed successfully!");

      // Reset mock yield after a delay (simulate new yield accumulation)
      setTimeout(() => {
        setMockYieldClaimed(false);
      }, 10000);
    } catch (error) {
      toast.error("[MOCK] Error claiming yield");
    } finally {
      setIsClaiming(false);
    }
  }, []);

  const claimYield = useCallback(async () => {
    // Use mock mode if enabled
    if (MOCK_MODE) {
      return executeMockClaim();
    }

    if (!isConnected || !address) {
      toast.error("Wallet not connected");
      return;
    }
    if (!CONTRACT_ADDRESSES.pool) {
      toast.error("Pool contract not available");
      return;
    }
    if (!hasClaimableYield) {
      toast.error("No yield to claim");
      return;
    }

    setIsClaiming(true);
    try {
      await executeClaimYield([]);
      toast.success("Yield claimed successfully!");
    } catch (error: unknown) {
      const parsed = parseContractError(
        error instanceof Error ? error : new Error(String(error)),
        {
          contractName: "Claim",
          functionName: "claimYield",
        }
      );

      if (parsed.severity === "warning") {
        toast.warning(parsed.title);
      } else {
        toast.error(parsed.title, {
          description: parsed.action
            ? `${parsed.message}\n\n💡 ${parsed.action}`
            : parsed.message,
        });
      }
    } finally {
      setIsClaiming(false);
    }
  }, [address, isConnected, hasClaimableYield, executeClaimYield, executeMockClaim]);

  return {
    claimableYield,
    hasClaimableYield,
    isLoading: !MOCK_MODE && claimableFetchStatus === "fetching" && !claimableData,
    isClaiming,
    claimYield,
  };
}
