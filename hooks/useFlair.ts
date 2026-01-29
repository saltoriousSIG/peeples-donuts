"use client";

import { useAccount, useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { FLAIR_ABI } from "@/lib/abi/flair";
import { DATA } from "@/lib/abi/data";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { zeroAddress } from "viem";
import { type Rarity, type GaugeName, getTokenById, FLAIR_TOKENS } from "@/lib/flair-data";
import { parseContractError } from "@/lib/errors";
import useContract, { ExecutionType } from "./useContract";

// Enable mock mode for UI testing without actual transactions
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_TRANSACTIONS === "true";

// Mock user state to match
const MOCK_USER_SEGMENT = process.env.NEXT_PUBLIC_MOCK_USER_SEGMENT || "new_user";

export interface FlairItem {
  id: string;
  tokenId: bigint;
  gauge: GaugeName;
  rarity: Rarity;
  weight: number;
  poolFeeDiscount: number;
  isEquipped: boolean;
}

export interface UseFlairReturn {
  ownedFlair: FlairItem[];
  equippedFlair: (FlairItem | null)[];
  totalPoolFeeDiscount: number;
  isLoading: boolean;
  isBuying: boolean;
  isEquipping: boolean;
  isFusing: boolean;
  buyFlair: (flairTypeId: bigint, price: bigint) => Promise<void>;
  equipFlair: (flairId: bigint, cid: string) => Promise<void>;
  unequipFlair: (flairId: bigint, cid: string) => Promise<void>;
  fuseFlair: (flairId: bigint) => Promise<void>;
}

// All known token IDs (1-20)
const ALL_TOKEN_IDS = FLAIR_TOKENS.map(t => BigInt(t.tokenId));

// Mock flair data based on user segment
function getMockFlairData(): { ownedFlair: FlairItem[]; equippedFlair: (FlairItem | null)[] } {
  if (MOCK_USER_SEGMENT === "yield_ready" || MOCK_USER_SEGMENT === "active_earner") {
    // User with equipped flair
    const donutFlair: FlairItem = {
      id: "1",
      tokenId: 1n,
      gauge: "Donut",
      rarity: "Bronze",
      weight: 1,
      poolFeeDiscount: 20,
      isEquipped: true,
    };
    const lpFlair: FlairItem = {
      id: "2",
      tokenId: 2n,
      gauge: "Donut/WETH LP",
      rarity: "Bronze",
      weight: 1,
      poolFeeDiscount: 20,
      isEquipped: MOCK_USER_SEGMENT === "yield_ready",
    };

    if (MOCK_USER_SEGMENT === "yield_ready") {
      return {
        ownedFlair: [donutFlair, lpFlair],
        equippedFlair: [donutFlair, lpFlair, null],
      };
    }
    return {
      ownedFlair: [donutFlair],
      equippedFlair: [donutFlair, null, null],
    };
  }

  // No flair for other states
  return {
    ownedFlair: [],
    equippedFlair: [null, null, null],
  };
}

export function useFlair(): UseFlairReturn {
  const { address, isConnected } = useAccount();
  const [isBuying, setIsBuying] = useState(false);
  const [isEquipping, setIsEquipping] = useState(false);
  const [isFusing, setIsFusing] = useState(false);

  // Get user's flair balances for all known token IDs using balanceOfBatch
  const { data: flairBalances, fetchStatus: flairFetchStatus } = useReadContract({
    address: CONTRACT_ADDRESSES.flair as `0x${string}`,
    abi: FLAIR_ABI,
    functionName: "balanceOfBatch",
    args: [
      ALL_TOKEN_IDS.map(() => address ?? zeroAddress), // Array of user addresses (same address repeated)
      ALL_TOKEN_IDS, // Array of token IDs
    ],
    chainId: base.id,
    query: {
      enabled: !!address && !!CONTRACT_ADDRESSES.flair,
      refetchInterval: 10_000,
    },
  });

  // Get equipped flair IDs from Data facet
  const { data: equippedFlairIds, fetchStatus: equippedFetchStatus } = useReadContract({
    address: CONTRACT_ADDRESSES.pool as `0x${string}`,
    abi: DATA,
    functionName: "getUserEquippedFlair",
    args: [address ?? zeroAddress],
    chainId: base.id,
    query: {
      enabled: !!address && !!CONTRACT_ADDRESSES.pool,
      refetchInterval: 10_000,
    },
  });

  // Check if PinsAndFlair contract is approved to transfer user's flair
  const { data: isApproved, refetch: refetchApproval } = useReadContract({
    address: CONTRACT_ADDRESSES.flair as `0x${string}`,
    abi: FLAIR_ABI,
    functionName: "isApprovedForAll",
    args: [address ?? zeroAddress, CONTRACT_ADDRESSES.pool as `0x${string}`],
    chainId: base.id,
    query: {
      enabled: !!address && !!CONTRACT_ADDRESSES.flair && !!CONTRACT_ADDRESSES.pool,
    },
  });

  // Contract execution hooks
  const executeBuyFlair = useContract(ExecutionType.WRITABLE, "PinsAndFlair", "buyFlair");
  const executeApproval = useContract(ExecutionType.WRITABLE, "Flair", "setApprovalForAll", CONTRACT_ADDRESSES.flair as `0x${string}`);
  const executeEquipFlair = useContract(ExecutionType.WRITABLE, "PinsAndFlair", "equipFlair");
  const executeUnequipFlair = useContract(ExecutionType.WRITABLE, "PinsAndFlair", "unequipFlair");
  const executeFuseFlair = useContract(ExecutionType.WRITABLE, "PinsAndFlair", "fuseFlair");

  // Parse owned flair from balanceOfBatch results
  const ownedFlair = useMemo((): FlairItem[] => {
    if (!flairBalances || !Array.isArray(flairBalances)) return [];

    // Build a set of equipped token IDs for quick lookup
    const equippedIds = new Set<string>();
    if (equippedFlairIds && Array.isArray(equippedFlairIds)) {
      (equippedFlairIds as readonly bigint[]).forEach(id => {
        if (id && id > 0n) {
          equippedIds.add(id.toString());
        }
      });
    }

    const items: FlairItem[] = [];

    // flairBalances is an array of balances corresponding to ALL_TOKEN_IDS
    (flairBalances as readonly bigint[]).forEach((balance, index) => {
      if (balance > 0n) {
        const tokenId = ALL_TOKEN_IDS[index];
        const tokenData = getTokenById(Number(tokenId));
        if (tokenData) {
          const isEquipped = equippedIds.has(tokenId.toString());
          items.push({
            id: tokenId.toString(),
            tokenId,
            gauge: tokenData.gauge,
            rarity: tokenData.rarity,
            weight: tokenData.weight,
            poolFeeDiscount: tokenData.poolFeeDiscount,
            isEquipped,
          });
        }
      }
    });

    return items;
  }, [flairBalances, equippedFlairIds]);

  // Parse equipped flair (3 slots, some may be null)
  const equippedFlair = useMemo((): (FlairItem | null)[] => {
    if (!equippedFlairIds || !Array.isArray(equippedFlairIds)) {
      return [null, null, null];
    }

    // equippedFlairIds is uint256[3] from getUserEquippedFlair
    const slots: (FlairItem | null)[] = [null, null, null];
    const typedIds = equippedFlairIds as readonly bigint[];

    typedIds.forEach((flairId, index) => {
      if (index >= 3) return; // Only 3 slots max

      if (!flairId || flairId === 0n) {
        slots[index] = null;
        return;
      }

      const tokenData = getTokenById(Number(flairId));
      if (!tokenData) {
        slots[index] = null;
        return;
      }

      slots[index] = {
        id: flairId.toString(),
        tokenId: flairId,
        gauge: tokenData.gauge,
        rarity: tokenData.rarity,
        weight: tokenData.weight,
        poolFeeDiscount: tokenData.poolFeeDiscount,
        isEquipped: true,
      };
    });

    return slots;
  }, [equippedFlairIds]);

  const buyFlair = useCallback(
    async (flairTypeId: bigint, _price: bigint) => {
      if (!isConnected || !address) {
        toast.error("Wallet not connected");
        return;
      }
      if (!CONTRACT_ADDRESSES.pool) {
        toast.error("Pool contract not available");
        return;
      }

      // Validate the token ID exists
      const tokenData = getTokenById(Number(flairTypeId));
      if (!tokenData) {
        toast.error("Invalid flair token");
        return;
      }

      setIsBuying(true);
      try {
        await executeBuyFlair([flairTypeId]);
        toast.success(`${tokenData.gauge} ${tokenData.rarity} flair purchased!`);
      } catch (error: unknown) {
        const parsed = parseContractError(
          error instanceof Error ? error : new Error(String(error)),
          {
            contractName: 'PinsAndFlair',
            functionName: 'buyFlair'
          }
        );

        if (parsed.severity === 'warning') {
          toast.warning(parsed.title);
        } else {
          toast.error(parsed.title, {
            description: parsed.action ? `${parsed.message}\n\n💡 ${parsed.action}` : parsed.message
          });
        }
      } finally {
        setIsBuying(false);
      }
    },
    [address, isConnected, executeBuyFlair]
  );

  const equipFlair = useCallback(
    async (flairId: bigint, cid: string) => {
      if (!isConnected || !address) {
        toast.error("Wallet not connected");
        return;
      }

      if (!cid) {
        toast.error("Pin metadata CID is required");
        return;
      }

      setIsEquipping(true);
      try {
        // Check if approval is needed
        if (!isApproved) {
          toast.info("Approving flair contract...");
          await executeApproval([CONTRACT_ADDRESSES.pool as `0x${string}`, true]);

          // Refetch approval status
          await refetchApproval();
          toast.success("Approval granted!");
        }

        // Equip the flair - contract expects (uint256 flairId, string cid)
        await executeEquipFlair([flairId, cid]);
        toast.success("Flair equipped!");
      } catch (error: unknown) {
        const parsed = parseContractError(
          error instanceof Error ? error : new Error(String(error)),
          {
            contractName: 'PinsAndFlair',
            functionName: 'equipFlair'
          }
        );

        if (parsed.severity === 'warning') {
          toast.warning(parsed.title);
        } else {
          toast.error(parsed.title, {
            description: parsed.action ? `${parsed.message}\n\n💡 ${parsed.action}` : parsed.message
          });
        }
      } finally {
        setIsEquipping(false);
      }
    },
    [address, isConnected, executeApproval, executeEquipFlair, isApproved, refetchApproval]
  );

  const unequipFlair = useCallback(
    async (flairId: bigint, cid: string) => {
      if (!isConnected || !address) {
        toast.error("Wallet not connected");
        return;
      }

      if (!cid) {
        toast.error("Pin metadata CID is required");
        return;
      }

      setIsEquipping(true);
      try {
        // Unequip the flair - contract expects (uint256 flairId, string cid)
        await executeUnequipFlair([flairId, cid]);
        toast.success("Flair unequipped!");
      } catch (error: unknown) {
        const parsed = parseContractError(
          error instanceof Error ? error : new Error(String(error)),
          {
            contractName: 'PinsAndFlair',
            functionName: 'unequipFlair'
          }
        );

        if (parsed.severity === 'warning') {
          toast.warning(parsed.title);
        } else {
          toast.error(parsed.title, {
            description: parsed.action ? `${parsed.message}\n\n💡 ${parsed.action}` : parsed.message
          });
        }
      } finally {
        setIsEquipping(false);
      }
    },
    [address, isConnected, executeUnequipFlair]
  );

  const fuseFlair = useCallback(
    async (flairId: bigint) => {
      if (!isConnected || !address) {
        toast.error("Wallet not connected");
        return;
      }

      setIsFusing(true);
      try {
        await executeFuseFlair([flairId]);
        toast.success("Flair upgraded!");
      } catch (error: unknown) {
        const parsed = parseContractError(
          error instanceof Error ? error : new Error(String(error)),
          {
            contractName: 'PinsAndFlair',
            functionName: 'fuseFlair'
          }
        );

        if (parsed.severity === 'warning') {
          toast.warning(parsed.title);
        } else {
          toast.error(parsed.title, {
            description: parsed.action ? `${parsed.message}\n\n💡 ${parsed.action}` : parsed.message
          });
        }
      } finally {
        setIsFusing(false);
      }
    },
    [address, isConnected, executeFuseFlair]
  );

  // Calculate total pool fee discount from equipped flair
  // The discount reduces the fee percentage (e.g., 20% fee with 5% discount = 15% fee)
  // Max discount is 20% (from 3 Platinum flair with 0% fee each means the base fee is fully removed)
  const totalPoolFeeDiscount = useMemo(() => {
    const basePoolFee = 20; // Base pool withdrawal fee is 20%

    // Sum up the fee reductions from equipped flair
    // Lower poolFeeDiscount value = more discount (0% = max discount, 20% = no discount)
    const equippedFees = equippedFlair
      .filter((f): f is FlairItem => f !== null)
      .map((f) => f.poolFeeDiscount);

    if (equippedFees.length === 0) {
      return 0; // No discount
    }

    // Calculate the minimum fee from equipped flair (best discount)
    const minEquippedFee = Math.min(...equippedFees);

    // Discount is the difference between base fee and the equipped fee
    // If you have Platinum (0%), discount is 20% (full fee removal)
    // If you have Bronze (20%), discount is 0%
    const discount = basePoolFee - minEquippedFee;

    return Math.max(0, Math.min(discount, basePoolFee)); // Clamp between 0 and base fee
  }, [equippedFlair]);

  // Return mock data in mock mode
  if (MOCK_MODE) {
    const mockData = getMockFlairData();
    return {
      ownedFlair: mockData.ownedFlair,
      equippedFlair: mockData.equippedFlair,
      totalPoolFeeDiscount: 0,
      isLoading: false,
      isBuying,
      isEquipping,
      isFusing,
      buyFlair,
      equipFlair,
      unequipFlair,
      fuseFlair,
    };
  }

  return {
    ownedFlair,
    equippedFlair,
    totalPoolFeeDiscount,
    isLoading: (flairFetchStatus === 'fetching' && !flairBalances) || (equippedFetchStatus === 'fetching' && !equippedFlairIds),
    isBuying,
    isEquipping,
    isFusing,
    buyFlair,
    equipFlair,
    unequipFlair,
    fuseFlair,
  };
}
