"use client";

import { useMemo, useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { zeroAddress } from "viem";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { DATA } from "@/lib/abi/data";
import { ERC20 } from "@/lib/abi/erc20";
import { usePins } from "./usePins";
import { useFlair } from "./useFlair";
import { useFlairYield } from "./useFlairYield";

// Max time to show loading state before falling back
const MAX_LOADING_TIME_MS = 5000;

export type UserSegment =
  | "loading"
  | "new_user"
  | "shareholder_no_pin"
  | "pin_no_flair"
  | "active_earner"
  | "yield_ready";

export interface UserState {
  segment: UserSegment;
  hasPin: boolean;
  hasShares: boolean;
  hasEquippedFlair: boolean;
  hasClaimableYield: boolean;
  canFuse: boolean;
  isLoading: boolean;
  shareBalance: bigint;
  ownedFlairCount: number;
  equippedFlairCount: number;
}

// Check if pin/flair contracts are deployed
const PIN_CONTRACT_DEPLOYED = !!CONTRACT_ADDRESSES.pin;
const FLAIR_CONTRACT_DEPLOYED = !!CONTRACT_ADDRESSES.flair; 

export function useUserState(): UserState {
  const { address, isConnected } = useAccount();
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  // Timeout to prevent infinite loading - reset when connection changes
  useEffect(() => {
    setLoadingTimedOut(false);

    if (!isConnected) {
      return;
    }

    const timer = setTimeout(() => {
      setLoadingTimedOut(true);
    }, MAX_LOADING_TIME_MS);

    return () => clearTimeout(timer);
  }, [isConnected, address]);

  // Get pins data - only use loading state if contract is deployed
  const { hasPin, isLoading: isPinsLoading } = usePins();

  // Get flair data - only use loading state if contract is deployed
  const { ownedFlair, equippedFlair, isLoading: isFlairLoading } = useFlair();

  // Get yield data
  const { hasClaimableYield, isLoading: isYieldLoading } = useFlairYield();

  // Get pool addresses for share token
  const { data: addresses, isLoading: isAddressesLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.pool as `0x${string}`,
    abi: DATA,
    functionName: "getAddresses",
    chainId: base.id,
    query: {
      enabled: !!CONTRACT_ADDRESSES.pool,
    },
  });

  // Get share token balance
  const { data: shareBalance, fetchStatus: shareFetchStatus } = useReadContract({
    address: (addresses as any)?.shareToken || zeroAddress,
    abi: ERC20,
    functionName: "balanceOf",
    args: [address ?? zeroAddress],
    chainId: base.id,
    query: {
      enabled: !!address && !!(addresses as any)?.shareToken,
      refetchInterval: 10_000,
    },
  });

  // Calculate derived state
  const hasShares = useMemo(() => {
    return !!shareBalance && shareBalance > 0n;
  }, [shareBalance]);

  const hasEquippedFlair = useMemo(() => {
    return equippedFlair.some((f) => f !== null);
  }, [equippedFlair]);

  const equippedFlairCount = useMemo(() => {
    return equippedFlair.filter((f) => f !== null).length;
  }, [equippedFlair]);

  // Check if user can fuse (owns 2+ of the same flair type)
  const canFuse = useMemo(() => {
    // Group owned flair by token ID and check for duplicates
    const flairCounts = new Map<string, number>();
    for (const flair of ownedFlair) {
      const count = flairCounts.get(flair.id) || 0;
      flairCounts.set(flair.id, count + 1);
    }
    // Check if any token ID has 2 or more
    for (const count of flairCounts.values()) {
      if (count >= 2) return true;
    }
    return false;
  }, [ownedFlair]);

  const isLoading = useMemo(() => {
    // Not loading if not connected or if we've timed out
    if (!isConnected || loadingTimedOut) return false;

    // Only wait for pin loading if contract is deployed
    const waitingForPins = PIN_CONTRACT_DEPLOYED && isPinsLoading;

    // Only wait for flair loading if contract is deployed
    const waitingForFlair = FLAIR_CONTRACT_DEPLOYED && isFlairLoading;

    // Only wait for yield if flair contract is deployed
    const waitingForYield = FLAIR_CONTRACT_DEPLOYED && isYieldLoading;

    // Wait for share balance if we have addresses
    const waitingForShares = isAddressesLoading ||
      (!!addresses && shareFetchStatus === "fetching" && shareBalance === undefined);

    return waitingForPins || waitingForFlair || waitingForYield || waitingForShares;
  }, [
    isConnected,
    loadingTimedOut,
    isPinsLoading,
    isFlairLoading,
    isYieldLoading,
    isAddressesLoading,
    addresses,
    shareFetchStatus,
    shareBalance,
  ]);

  // Determine user segment
  const segment = useMemo((): UserSegment => {
    if (!isConnected) return "new_user";
    if (isLoading) return "loading";

    // User has shares but no pin -> free pin mint flow
    if (hasShares && !hasPin) {
      return "shareholder_no_pin";
    }

    // User has no shares and no pin -> paid onboarding
    if (!hasShares && !hasPin) {
      return "new_user";
    }

    // User has pin but no equipped flair -> prompt to buy/equip flair
    if (hasPin && !hasEquippedFlair) {
      return "pin_no_flair";
    }

    // User has pin + flair + claimable yield -> yield ready
    if (hasPin && hasEquippedFlair && hasClaimableYield) {
      return "yield_ready";
    }

    // User has pin + flair but no yield yet -> active earner
    if (hasPin && hasEquippedFlair) {
      return "active_earner";
    }

    // Default to new user if we can't determine state
    return "new_user";
  }, [
    isConnected,
    isLoading,
    hasShares,
    hasPin,
    hasEquippedFlair,
    hasClaimableYield,
  ]);

  return {
    segment,
    hasPin,
    hasShares,
    hasEquippedFlair,
    hasClaimableYield,
    canFuse,
    isLoading,
    shareBalance: shareBalance ?? 0n,
    ownedFlairCount: ownedFlair.length,
    equippedFlairCount,
  };
}
