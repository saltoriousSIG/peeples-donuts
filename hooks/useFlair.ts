"use client";

import { useAccount, useReadContracts } from "wagmi";
import { base } from "wagmi/chains";
import { waitForTransactionReceipt } from "@wagmi/core";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { FLAIR_ABI } from "@/lib/abi/flair";
import { DATA } from "@/lib/abi/data";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { zeroAddress } from "viem";
import { type Rarity, type GaugeName, getTokenById, FLAIR_TOKENS } from "@/lib/flair-data";
import { parseContractError } from "@/lib/errors";
import { ensureTokenApproval, getPaymentTokenAddress } from "@/lib/token-utils";
import { wagmiConfig } from "@/lib/wagmi";
import useContract, { ExecutionType } from "./useContract";

export interface FlairItem {
  id: string;
  tokenId: bigint;
  gauge: GaugeName;
  rarity: Rarity;
  weight: number;
  poolFeeDiscount: number;
  isEquipped: boolean;
  balance: bigint; // wallet balance from balanceOfBatch (excludes equipped copy held by pool)
}

export interface UseFlairReturn {
  ownedFlair: FlairItem[];
  equippedFlair: (FlairItem | null)[];
  totalPoolFeeDiscount: number;
  isLoading: boolean;
  isBuying: boolean;
  isEquipping: boolean;
  isFusing: boolean;
  buyFlair: (flairTypeId: bigint, price: bigint, useDonut?: boolean) => Promise<void>;
  equipFlair: (flairId: bigint, cid: string) => Promise<void>;
  unequipFlair: (flairId: bigint, cid: string) => Promise<void>;
  fuseFlair: (flairId: bigint, fusionCost: bigint) => Promise<void>;
}

// All known token IDs (1-20)
const ALL_TOKEN_IDS = FLAIR_TOKENS.map(t => BigInt(t.tokenId));

export function useFlair(): UseFlairReturn {
  const { address, isConnected } = useAccount();
  const [isBuying, setIsBuying] = useState(false);
  const [isEquipping, setIsEquipping] = useState(false);
  const [isFusing, setIsFusing] = useState(false);

  // Batch all flair reads into a single multicall
  const { data: flairBatch, fetchStatus, refetch: refetchFlairBatch } = useReadContracts({
    contracts: [
      // [0] balanceOfBatch - user's flair balances for all token IDs
      {
        address: CONTRACT_ADDRESSES.flair as `0x${string}`,
        abi: FLAIR_ABI,
        functionName: "balanceOfBatch",
        args: [
          ALL_TOKEN_IDS.map(() => address ?? zeroAddress),
          ALL_TOKEN_IDS,
        ],
        chainId: base.id,
      },
      // [1] getUserEquippedFlair - equipped flair IDs from Data facet
      {
        address: CONTRACT_ADDRESSES.pool as `0x${string}`,
        abi: DATA,
        functionName: "getUserEquippedFlair",
        args: [address ?? zeroAddress],
        chainId: base.id,
      },
      // [2] isApprovedForAll - check if pool can transfer user's flair
      {
        address: CONTRACT_ADDRESSES.flair as `0x${string}`,
        abi: FLAIR_ABI,
        functionName: "isApprovedForAll",
        args: [address ?? zeroAddress, CONTRACT_ADDRESSES.pool as `0x${string}`],
        chainId: base.id,
      },
    ],
    query: {
      enabled: !!address && !!CONTRACT_ADDRESSES.flair && !!CONTRACT_ADDRESSES.pool,
      refetchInterval: 10_000,
    },
  });

  const flairBalances = flairBatch?.[0]?.result;
  const equippedFlairIds = flairBatch?.[1]?.result;
  const isApproved = flairBatch?.[2]?.result as boolean | undefined;

  // Contract execution hooks
  const executeBuyFlair = useContract(ExecutionType.WRITABLE, "PinsAndFlair", "buyFlair");
  const executeApproval = useContract(ExecutionType.WRITABLE, "Flair", "setApprovalForAll", CONTRACT_ADDRESSES.flair as `0x${string}`);
  const executeEquipFlair = useContract(ExecutionType.WRITABLE, "PinsAndFlair", "equipFlair");
  const executeUnequipFlair = useContract(ExecutionType.WRITABLE, "PinsAndFlair", "unequipFlair");
  const executeFuseFlair = useContract(ExecutionType.WRITABLE, "PinsAndFlair", "fuseFlair");

  // Parse owned flair from balanceOfBatch results
  const ownedFlair = useMemo((): FlairItem[] => {
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
    const addedIds = new Set<string>();

    // flairBalances is an array of balances corresponding to ALL_TOKEN_IDS
    if (flairBalances && Array.isArray(flairBalances)) {
      (flairBalances as readonly bigint[]).forEach((balance, index) => {
        if (balance > 0n) {
          const tokenId = ALL_TOKEN_IDS[index];
          const tokenData = getTokenById(Number(tokenId));
          if (tokenData) {
            const isEquipped = equippedIds.has(tokenId.toString());
            addedIds.add(tokenId.toString());
            items.push({
              id: tokenId.toString(),
              tokenId,
              gauge: tokenData.gauge,
              rarity: tokenData.rarity,
              weight: tokenData.weight,
              poolFeeDiscount: tokenData.poolFeeDiscount,
              isEquipped,
              balance, // wallet balance (excludes equipped copy held by pool)
            });
          }
        }
      });
    }

    // Equipped flair transferred to pool — wallet balance is 0 but user still owns it
    equippedIds.forEach(idStr => {
      if (!addedIds.has(idStr)) {
        const tokenData = getTokenById(Number(idStr));
        if (tokenData) {
          items.push({
            id: idStr,
            tokenId: BigInt(idStr),
            gauge: tokenData.gauge,
            rarity: tokenData.rarity,
            weight: tokenData.weight,
            poolFeeDiscount: tokenData.poolFeeDiscount,
            isEquipped: true,
            balance: 0n,
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

      // Look up wallet balance from ownedFlair if available
      const owned = ownedFlair.find(f => f.tokenId === flairId);
      slots[index] = {
        id: flairId.toString(),
        tokenId: flairId,
        gauge: tokenData.gauge,
        rarity: tokenData.rarity,
        weight: tokenData.weight,
        poolFeeDiscount: tokenData.poolFeeDiscount,
        isEquipped: true,
        balance: owned?.balance ?? 0n,
      };
    });

    return slots;
  }, [equippedFlairIds, ownedFlair]);

  const buyFlair = useCallback(
    async (flairTypeId: bigint, _price: bigint, useDonut: boolean = false) => {
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
        const tokenAddress = getPaymentTokenAddress(useDonut);
        const poolAddress = CONTRACT_ADDRESSES.pool as `0x${string}`;
        const tokenName = useDonut ? "DONUT" : "WETH";

        await ensureTokenApproval(address, tokenAddress, poolAddress, _price, tokenName);

        await executeBuyFlair([useDonut, flairTypeId]);
        await refetchFlairBatch();
        toast.success(`${tokenData.gauge} ${tokenData.rarity} flair purchased!`);
      } catch (error: unknown) {
        console.log(error)
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
    [address, isConnected, executeBuyFlair, refetchFlairBatch]
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
          const { hash: approvalHash } = await executeApproval([CONTRACT_ADDRESSES.pool as `0x${string}`, true]);

          // Wait for an extra confirmation so the next tx sees the approval
          await waitForTransactionReceipt(wagmiConfig as any, { hash: approvalHash, confirmations: 2 });
          await refetchFlairBatch();
          toast.success("Approval granted!");
        }

        // Equip the flair - contract expects (uint256 flairId, string cid)
        await executeEquipFlair([flairId, cid]);
        await refetchFlairBatch();
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
    [address, isConnected, executeApproval, executeEquipFlair, isApproved, refetchFlairBatch]
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
        await refetchFlairBatch();
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
    [address, isConnected, executeUnequipFlair, refetchFlairBatch]
  );

  const fuseFlair = useCallback(
    async (flairId: bigint, fusionCost: bigint) => {
      if (!isConnected || !address) {
        toast.error("Wallet not connected");
        return;
      }

      setIsFusing(true);
      try {
        // Approve PEEPLES spending for fusion cost
        if (fusionCost > 0n) {
          await ensureTokenApproval(
            address,
            CONTRACT_ADDRESSES.peeples as `0x${string}`,
            CONTRACT_ADDRESSES.pool as `0x${string}`,
            fusionCost,
            "PEEPLES"
          );
        }

        await executeFuseFlair([flairId]);
        await refetchFlairBatch();
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
    [address, isConnected, executeFuseFlair, refetchFlairBatch]
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

  return {
    ownedFlair,
    equippedFlair,
    totalPoolFeeDiscount,
    isLoading: fetchStatus === 'fetching' && flairBatch === undefined,
    isBuying,
    isEquipping,
    isFusing,
    buyFlair,
    equipFlair,
    unequipFlair,
    fuseFlair,
  };
}
