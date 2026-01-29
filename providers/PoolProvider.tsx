"use client";
import React, { createContext, useContext, useCallback, useState } from "react";
import {
  useReadContract,
  useAccount,
} from "wagmi";
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
  deposit: (amount: number) => Promise<void>;
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

  const { data: config, refetch: refetchPoolConfig } = useReadContract({
    address: CONTRACT_ADDRESSES.pool,
    abi: DATA,
    functionName: "getConfig",
    args: [],
    chainId: base.id,
  });

  const { data: state, refetch: refetchPoolState } = useReadContract({
    address: CONTRACT_ADDRESSES.pool,
    abi: DATA,
    functionName: "getPoolState",
    args: [],
    chainId: base.id,
    query: {
      refetchInterval: 10_000,
    },
  });

  const { data: tvl, refetch: refetchPoolTvl } = useReadContract({
    address: CONTRACT_ADDRESSES.pool,
    abi: DATA,
    functionName: "getTVL",
    args: [],
    chainId: base.id,
    query: {
      refetchInterval: 10_000,
    },
  });

  const { data: addresses, refetch: refetchAddresses } = useReadContract({
    address: CONTRACT_ADDRESSES.pool,
    abi: DATA,
    functionName: "getAddresses",
    args: [],
    chainId: base.id,
  });

  const { data: wethBalance, refetch: refetchWethBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.weth,
    abi: ERC20,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    chainId: base.id,
    query: {
      refetchInterval: 5_000,
    },
  });

  const { data: shareTokenBalance, refetch: refetchShareTokenBalance } =
    useReadContract({
      address: addresses?.shareToken || ("0x" as `0x${string}`),
      abi: ERC20,
      functionName: "balanceOf",
      args: [address as `0x${string}`],
      chainId: base.id,
      query: {
        refetchInterval: 5_000,
      },
    });

  const { data: shareTotalSupply, refetch: refetchShareTotalSupply } =
    useReadContract({
      address: addresses?.shareToken || ("0x" as `0x${string}`),
      abi: ERC20,
      functionName: "totalSupply",
      args: [],
      chainId: base.id,
      query: {
        refetchInterval: 5_000,
      },
    });

  const { data: voteEpoch, refetch: refetchVoteEpoch } = useReadContract({
    address: CONTRACT_ADDRESSES.pool,
    abi: DATA,
    functionName: "getVoteEpoch",
    args: [],
    chainId: base.id,
  });

  const { data: votes, refetch: refetchVotes } = useReadContract({
    address: CONTRACT_ADDRESSES.pool,
    abi: DATA,
    functionName: "getVotes",
    args: [voteEpoch || 0n],
    chainId: base.id,
    query: {
      refetchInterval: 5_000,
    },
  });

  const { data: hasUserVoted, refetch: refetchHasUserVoted } = useReadContract({
    address: CONTRACT_ADDRESSES.pool,
    abi: DATA,
    functionName: "hasUserVoted",
    args: [voteEpoch || 0n, address as `0x${string}`],
    chainId: base.id,
    query: {
      refetchInterval: 5_000,
    },
  });

  const { data: pendingClaim, refetch: refetchPendingClaim } = useReadContract({
    address: CONTRACT_ADDRESSES.pool,
    abi: DATA,
    functionName: "getUserPendingClaim",
    args: [address as `0x${string}`],
    chainId: base.id,
    query: {
      refetchInterval: 5_000,
    },
  });

  const { data: currentAuction } = useReadContract({
    address: CONTRACT_ADDRESSES.pool,
    abi: AUCTION_ABI,
    functionName: "getCurrentAuction",
    args: [],
    chainId: base.id,
    query: {
      refetchInterval: 3_000,
    },
  });

  const { data: minAuctionBid } = useReadContract({
    address: CONTRACT_ADDRESSES.pool,
    abi: AUCTION_ABI,
    functionName: "getMinimumBid",
    args: [],
    chainId: base.id,
    query: {
      refetchInterval: 1_000,
    },
  });

  // Contract execution hooks
  const executeWethApprove = useContract(ExecutionType.WRITABLE, "ERC20", "approve", CONTRACT_ADDRESSES.weth as `0x${string}`);
  const executePeeplesApprove = useContract(ExecutionType.WRITABLE, "ERC20", "approve", CONTRACT_ADDRESSES.peeples as `0x${string}`);
  const executeDeposit = useContract(ExecutionType.WRITABLE, "Deposit", "depositToPool");
  const executeWithdraw = useContract(ExecutionType.WRITABLE, "Withdraw", "withdraw");
  const executeClaim = useContract(ExecutionType.WRITABLE, "Claim", "claimPending");
  const executeVote = useContract(ExecutionType.WRITABLE, "Vote", "vote");
  const executeBuyKingGlazer = useContract(ExecutionType.WRITABLE, "Manage", "buyKingGlazer");
  const executeBid = useContract(ExecutionType.WRITABLE, "Auction", "bid");
  const executeRebalance = useContract(ExecutionType.WRITABLE, "Manage", "rebalance");

  const buyKingGlazer = useCallback(async () => {
    setIsTxPending(true);
    try {
      if (!isConnected || !address) {
        throw new Error("Wallet not connected");
      }
      await executeBuyKingGlazer([""]);
      await toggleNotificationSettng();
    } catch (error: unknown) {
      const parsed = parseContractError(
        error instanceof Error ? error : new Error(String(error)),
        {
          contractName: 'Pool',
          functionName: 'buyKingGlazer'
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
      setIsTxPending(false);
    }
  }, [executeBuyKingGlazer, isConnected, address]);

  const deposit = useCallback(
    async (amount: number) => {
      setIsTxPending(true);
      try {
        if (!isConnected || !address) {
          throw new Error("Wallet not connected");
        }
        await executeWethApprove([CONTRACT_ADDRESSES.pool as Address, BigInt(amount)]);

        await sleep(3500);

        await executeDeposit([BigInt(amount)]);
      } catch (error: unknown) {
        const parsed = parseContractError(
          error instanceof Error ? error : new Error(String(error)),
          {
            contractName: 'Pool',
            functionName: 'depositToPool'
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
        setIsTxPending(false);
      }
    },
    [executeWethApprove, executeDeposit, isConnected, address]
  );

  const withdraw = useCallback(
    async (amount: number) => {
      setIsTxPending(true);
      try {
        if (!isConnected || !address) {
          throw new Error("Wallet not connected");
        }
        await executeWithdraw([BigInt(amount)]);
      } catch (error: unknown) {
        const parsed = parseContractError(
          error instanceof Error ? error : new Error(String(error)),
          {
            contractName: 'Pool',
            functionName: 'withdraw'
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
        setIsTxPending(false);
      }
    },
    [executeWithdraw, isConnected, address]
  );

  const claim = useCallback(async () => {
    setIsTxPending(true);
    try {
      if (!isConnected || !address) {
        throw new Error("Wallet not connected");
      }
      await executeClaim([]);
    } catch (error: unknown) {
      const parsed = parseContractError(
        error instanceof Error ? error : new Error(String(error)),
        {
          contractName: 'Pool',
          functionName: 'claimPending'
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
      setIsTxPending(false);
    }
  }, [executeClaim, isConnected, address]);

  const vote = useCallback(
    async (strategy: Strategy) => {
      setIsTxPending(true);
      try {
        if (!isConnected || !address) {
          throw new Error("Wallet not connected");
        }
        await executeVote([strategy]);
      } catch (error: unknown) {
        const parsed = parseContractError(
          error instanceof Error ? error : new Error(String(error)),
          {
            contractName: 'Pool',
            functionName: 'vote'
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
        setIsTxPending(false);
      }
    },
    [executeVote, isConnected, address]
  );

  const auctionBid = useCallback(async (amount: bigint, feeRecipient: Address) => {
    setIsTxPending(true);
    try {
      if (!isConnected || !address) {
        throw new Error("Wallet not connected");
      }

      await executePeeplesApprove([CONTRACT_ADDRESSES.pool as Address, BigInt(amount)]);

      await sleep(3500);

      await executeBid([amount, feeRecipient]);
    } catch (error: unknown) {
      const parsed = parseContractError(
        error instanceof Error ? error : new Error(String(error)),
        {
          contractName: 'Pool',
          functionName: 'bid'
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
      setIsTxPending(false);
    }
  }, [executePeeplesApprove, executeBid, isConnected, address])

  const rebalance = useCallback(async () => {
    setIsTxPending(true);
    try {
      if (!isConnected || !address) {
        throw new Error("Wallet not connected");
      }
      await executeRebalance([]);
      toast.success("Pool rebalanced successfully!");
    } catch (error: unknown) {
      const parsed = parseContractError(
        error instanceof Error ? error : new Error(String(error)),
        {
          contractName: 'Pool',
          functionName: 'rebalance'
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
      setIsTxPending(false);
    }
  }, [executeRebalance, isConnected, address]);

  const value: PoolContextType = {
    config: config as PoolConfig,
    tvl: tvl as PoolTVL,
    state: state as PoolState,
    shareToken: addresses?.shareToken || "0x",
    isTxPending,
    currentAuction: {
      auctionId: currentAuction && currentAuction[0],
      endTime: currentAuction && currentAuction[1],
      highestBidder: currentAuction && currentAuction[2],
      highestBid: currentAuction && currentAuction[3],
      feeRecipient: currentAuction && currentAuction[4],
      ended: currentAuction && currentAuction[5],
    },
    minAuctionBid: (typeof minAuctionBid === 'object' && minAuctionBid !== null && 0 in minAuctionBid ? (minAuctionBid as readonly [bigint, boolean])[0] : 0n),
    auctionBid: auctionBid,
    deposit,
    claim,
    pendingClaim,
    withdraw,
    wethBalance: wethBalance,
    shareTokenBalance: shareTokenBalance,
    shareTokenTotalSupply: shareTotalSupply,
    buyKingGlazer,
    hasUserVoted: hasUserVoted,
    vote,
    voteEpoch: voteEpoch as bigint,
    votes: votes as VoteType[],
    rebalance,
  };

  return <PoolContext.Provider value={value}>{children}</PoolContext.Provider>;
};
