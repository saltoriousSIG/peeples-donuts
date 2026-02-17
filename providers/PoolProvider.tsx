"use client";
import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useReadContracts, useAccount } from "wagmi";
import { sleep } from "@/lib/utils";
import { base } from "wagmi/chains";
import { CONTRACT_ADDRESSES } from "../lib/contracts";
import { DATA } from "../lib/abi/data";
import { ERC20 } from "../lib/abi/erc20";
import { AUCTION_ABI } from "../lib/abi/auction";
import {
  PoolConfig,
  PoolTVL,
  PoolState,
  PendingClaim,
} from "../types/pool.type";
import { type Address } from "viem";
import { Strategy, Vote as VoteType } from "../types/pool.type";
import { toast } from "sonner";
import toggleNotificationSettng from "@/lib/toggleNotificationSetting";
import { parseContractError } from "@/lib/errors";
import useContract, { ExecutionType } from "../hooks/useContract";

interface PoolContextType {
  config: PoolConfig;
  voteEpoch: bigint;
  votes: VoteType[];
  tvl: PoolTVL;
  state: PoolState;
  shareToken: `0x${string}`;
  isTxPending: boolean;
  wethBalance?: bigint;
  shareTokenBalance?: bigint;
  shareTokenTotalSupply?: bigint;
  hasUserVoted?: boolean;
  pendingClaim?: PendingClaim;
  currentAuction: any;
  minAuctionBid: bigint;
  auctionBid: (amount: bigint, feeRecipient: Address) => Promise<void>;
  claim: () => Promise<void>;
  deposit: (amount: number, useDonut: boolean) => Promise<void>;
  withdraw: (amount: number) => Promise<void>;
  buyKingGlazer: () => Promise<void>;
  vote: (strategy: Strategy) => Promise<void>;
  rebalance: () => Promise<void>;
}

const PoolContext = createContext<PoolContextType | undefined>(undefined);

export const usePool = () => {
  const context = useContext(PoolContext);
  if (!context) {
    throw new Error("usePool must be used within a PoolProvider");
  }
  return context;
};

interface PoolProviderProps {
  children: React.ReactNode;
}

export const PoolProvider: React.FC<PoolProviderProps> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const [isTxPending, setIsTxPending] = useState(false);

  // Batch 1 - Global pool reads (no wallet needed)
  const { data: globalBatch, refetch: refetchGlobal } = useReadContracts({
    contracts: [
      // [0] getConfig
      {
        address: CONTRACT_ADDRESSES.pool,
        abi: DATA,
        functionName: "getConfig",
        args: [],
        chainId: base.id,
      },
      // [1] getPoolState
      {
        address: CONTRACT_ADDRESSES.pool,
        abi: DATA,
        functionName: "getPoolState",
        args: [],
        chainId: base.id,
      },
      // [2] getTVL
      {
        address: CONTRACT_ADDRESSES.pool,
        abi: DATA,
        functionName: "getTVL",
        args: [],
        chainId: base.id,
      },
      // [3] getAddresses
      {
        address: CONTRACT_ADDRESSES.pool,
        abi: DATA,
        functionName: "getAddresses",
        args: [],
        chainId: base.id,
      },
      // [4] getVoteEpoch
      {
        address: CONTRACT_ADDRESSES.pool,
        abi: DATA,
        functionName: "getVoteEpoch",
        args: [],
        chainId: base.id,
      },
      // [5] getCurrentAuction
      {
        address: CONTRACT_ADDRESSES.pool,
        abi: AUCTION_ABI,
        functionName: "getCurrentAuction",
        args: [],
        chainId: base.id,
      },
      // [6] getMinimumBid
      {
        address: CONTRACT_ADDRESSES.pool,
        abi: AUCTION_ABI,
        functionName: "getMinimumBid",
        args: [],
        chainId: base.id,
      },
    ],
    query: {
      refetchInterval: 10_000,
    },
  });


  const config = globalBatch?.[0]?.result;
  const state = globalBatch?.[1]?.result;
  const tvl = globalBatch?.[2]?.result;
  const addresses = globalBatch?.[3]?.result as
    | { shareToken: `0x${string}` }
    | undefined;
  const voteEpoch = globalBatch?.[4]?.result as bigint | undefined;
  const currentAuction = globalBatch?.[5]?.result;
  const minAuctionBid = globalBatch?.[6]?.result;

  // Derived address for share token ERC20 reads
  const shareTokenAddr = (addresses?.shareToken || "0x") as `0x${string}`;

  // Batch 2 - User-specific reads (need wallet + global results)
  const { data: userBatch, refetch: refetchUser } = useReadContracts({
    contracts: [
      // [0] wethBalance
      {
        address: CONTRACT_ADDRESSES.weth,
        abi: ERC20,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
        chainId: base.id,
      },
      // [1] shareTokenBalance
      {
        address: shareTokenAddr,
        abi: ERC20,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
        chainId: base.id,
      },
      // [2] shareTotalSupply
      {
        address: shareTokenAddr,
        abi: ERC20,
        functionName: "totalSupply",
        args: [],
        chainId: base.id,
      },
      // [3] getVotes
      {
        address: CONTRACT_ADDRESSES.pool,
        abi: DATA,
        functionName: "getVotes",
        args: [voteEpoch || 0n],
        chainId: base.id,
      },
      // [4] hasUserVoted
      {
        address: CONTRACT_ADDRESSES.pool,
        abi: DATA,
        functionName: "hasUserVoted",
        args: [voteEpoch || 0n, address as `0x${string}`],
        chainId: base.id,
      },
      // [5] getUserPendingClaim
      {
        address: CONTRACT_ADDRESSES.pool,
        abi: DATA,
        functionName: "getUserPendingClaim",
        args: [address as `0x${string}`],
        chainId: base.id,
      },
    ],
    query: {
      enabled: !!address,
      refetchInterval: 15_000,
    },
  });

  const wethBalance = userBatch?.[0]?.result as bigint | undefined;
  const shareTokenBalance = userBatch?.[1]?.result as bigint | undefined;
  const shareTotalSupply = userBatch?.[2]?.result as bigint | undefined;
  const votes = userBatch?.[3]?.result;
  const hasUserVoted = userBatch?.[4]?.result as boolean | undefined;
  const pendingClaim = userBatch?.[5]?.result;

  const refetchPoolData = useCallback(() => {
    refetchGlobal();
    refetchUser();
  }, [refetchGlobal, refetchUser]);

  // Contract execution hooks
  const executeWethApprove = useContract(
    ExecutionType.WRITABLE,
    "ERC20",
    "approve",
    CONTRACT_ADDRESSES.weth as `0x${string}`
  );

  const executeDonutApprove = useContract(
    ExecutionType.WRITABLE,
    "ERC20",
    "approve",
    CONTRACT_ADDRESSES.donut as `0x${string}`
  );

  const executePeeplesApprove = useContract(
    ExecutionType.WRITABLE,
    "ERC20",
    "approve",
    CONTRACT_ADDRESSES.peeples as `0x${string}`
  );
  const executeDeposit = useContract(
    ExecutionType.WRITABLE,
    "Deposit",
    "depositToPool"
  );
  const executeDepositDonut = useContract(
    ExecutionType.WRITABLE,
    "Deposit",
    "depositDonut"
  );
  const executeWithdraw = useContract(
    ExecutionType.WRITABLE,
    "Withdraw",
    "withdraw"
  );
  const executeClaim = useContract(
    ExecutionType.WRITABLE,
    "Claim",
    "claimPending"
  );
  const executeVote = useContract(ExecutionType.WRITABLE, "Vote", "vote");
  const executeBuyKingGlazer = useContract(
    ExecutionType.WRITABLE,
    "Manage",
    "buyKingGlazer"
  );
  const executeBid = useContract(ExecutionType.WRITABLE, "Auction", "bid");
  const executeRebalance = useContract(
    ExecutionType.WRITABLE,
    "Manage",
    "rebalance"
  );

  const buyKingGlazer = useCallback(async () => {
    setIsTxPending(true);
    try {
      if (!isConnected || !address) {
        throw new Error("Wallet not connected");
      }
      await executeBuyKingGlazer([""]);
      await toggleNotificationSettng();
      refetchPoolData();
    } catch (error: unknown) {
      const parsed = parseContractError(
        error instanceof Error ? error : new Error(String(error)),
        {
          contractName: "Pool",
          functionName: "buyKingGlazer",
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
      setIsTxPending(false);
    }
  }, [executeBuyKingGlazer, isConnected, address, refetchPoolData]);

  const deposit = useCallback(
    async (amount: number, useDonut: boolean) => {
      setIsTxPending(true);
      try {
        if (!isConnected || !address) {
          throw new Error("Wallet not connected");
        }
        if (useDonut) {
          await executeDonutApprove([
            CONTRACT_ADDRESSES.pool as Address,
            BigInt(amount),
          ]);
          await sleep(3500);
          await executeDepositDonut([BigInt(amount)]);
        } else {
          await executeWethApprove([
            CONTRACT_ADDRESSES.pool as Address,
            BigInt(amount),
          ]);
          await sleep(3500);
          await executeDeposit([BigInt(amount)]);
        }
        refetchPoolData();
      } catch (error: unknown) {
        const parsed = parseContractError(
          error instanceof Error ? error : new Error(String(error)),
          {
            contractName: "Pool",
            functionName: "depositToPool",
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
        setIsTxPending(false);
      }
    },
    [executeWethApprove, executeDeposit, isConnected, address, refetchPoolData]
  );

  const withdraw = useCallback(
    async (amount: number) => {
      setIsTxPending(true);
      try {
        if (!isConnected || !address) {
          throw new Error("Wallet not connected");
        }
        await executeWithdraw([BigInt(amount)]);
        refetchPoolData();
      } catch (error: unknown) {
        const parsed = parseContractError(
          error instanceof Error ? error : new Error(String(error)),
          {
            contractName: "Pool",
            functionName: "withdraw",
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
        setIsTxPending(false);
      }
    },
    [executeWithdraw, isConnected, address, refetchPoolData]
  );

  const claim = useCallback(async () => {
    setIsTxPending(true);
    try {
      if (!isConnected || !address) {
        throw new Error("Wallet not connected");
      }
      await executeClaim([]);
      refetchPoolData();
    } catch (error: unknown) {
      const parsed = parseContractError(
        error instanceof Error ? error : new Error(String(error)),
        {
          contractName: "Pool",
          functionName: "claimPending",
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
      setIsTxPending(false);
    }
  }, [executeClaim, isConnected, address, refetchPoolData]);

  const vote = useCallback(
    async (strategy: Strategy) => {
      setIsTxPending(true);
      try {
        if (!isConnected || !address) {
          throw new Error("Wallet not connected");
        }
        await executeVote([strategy]);
        refetchUser();
      } catch (error: unknown) {
        const parsed = parseContractError(
          error instanceof Error ? error : new Error(String(error)),
          {
            contractName: "Pool",
            functionName: "vote",
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
        setIsTxPending(false);
      }
    },
    [executeVote, isConnected, address, refetchUser]
  );

  const auctionBid = useCallback(
    async (amount: bigint, feeRecipient: Address) => {
      setIsTxPending(true);
      try {
        if (!isConnected || !address) {
          throw new Error("Wallet not connected");
        }

        await executePeeplesApprove([
          CONTRACT_ADDRESSES.pool as Address,
          BigInt(amount),
        ]);

        await sleep(3500);

        await executeBid([amount, feeRecipient]);
        refetchGlobal();
      } catch (error: unknown) {
        const parsed = parseContractError(
          error instanceof Error ? error : new Error(String(error)),
          {
            contractName: "Pool",
            functionName: "bid",
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
        setIsTxPending(false);
      }
    },
    [executePeeplesApprove, executeBid, isConnected, address, refetchGlobal]
  );

  const rebalance = useCallback(async () => {
    setIsTxPending(true);
    try {
      if (!isConnected || !address) {
        throw new Error("Wallet not connected");
      }
      await executeRebalance([]);
      toast.success("Pool rebalanced successfully!");
      refetchPoolData();
    } catch (error: unknown) {
      const parsed = parseContractError(
        error instanceof Error ? error : new Error(String(error)),
        {
          contractName: "Pool",
          functionName: "rebalance",
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
      setIsTxPending(false);
    }
  }, [executeRebalance, isConnected, address, refetchPoolData]);

  const memoizedCurrentAuction = useMemo(
    () => ({
      auctionId: currentAuction && currentAuction[0],
      endTime: currentAuction && currentAuction[1],
      highestBidder: currentAuction && currentAuction[2],
      highestBid: currentAuction && currentAuction[3],
      feeRecipient: currentAuction && currentAuction[4],
      ended: currentAuction && currentAuction[5],
    }),
    [currentAuction]
  );

  const memoizedMinAuctionBid = useMemo(
    () =>
      typeof minAuctionBid === "object" &&
        minAuctionBid !== null &&
        0 in minAuctionBid
        ? (minAuctionBid as readonly [bigint, boolean])[0]
        : 0n,
    [minAuctionBid]
  );

  const value: PoolContextType = useMemo(
    () => ({
      config: config as PoolConfig,
      tvl: tvl as PoolTVL,
      state: state as PoolState,
      shareToken: addresses?.shareToken || "0x",
      isTxPending,
      currentAuction: memoizedCurrentAuction,
      minAuctionBid: memoizedMinAuctionBid,
      auctionBid,
      deposit,
      claim,
      pendingClaim,
      withdraw,
      wethBalance,
      shareTokenBalance,
      shareTokenTotalSupply: shareTotalSupply,
      buyKingGlazer,
      hasUserVoted,
      vote,
      voteEpoch: voteEpoch as bigint,
      votes: votes as VoteType[],
      rebalance,
    }),
    [
      config,
      tvl,
      state,
      addresses?.shareToken,
      isTxPending,
      memoizedCurrentAuction,
      memoizedMinAuctionBid,
      auctionBid,
      deposit,
      claim,
      pendingClaim,
      withdraw,
      wethBalance,
      shareTokenBalance,
      shareTotalSupply,
      buyKingGlazer,
      hasUserVoted,
      vote,
      voteEpoch,
      votes,
      rebalance,
    ]
  );

  return <PoolContext.Provider value={value}>{children}</PoolContext.Provider>;
};
