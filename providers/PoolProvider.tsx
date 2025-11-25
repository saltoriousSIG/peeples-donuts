"use client";
import React, { createContext, useContext, useCallback } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { sleep } from "@/lib/utils";
import { base } from "wagmi/chains";
import {
  CONTRACT_ADDRESSES,
  DATA,
  DEPOSIT,
  ERC20,
  MANAGE,
  WITHDRAW,
  VOTE,
  CLAIM,
} from "../lib/contracts";
import {
  PoolConfig,
  PoolTVL,
  PoolState,
  PendingClaim,
} from "../types/pool.type";
import { type Address } from "viem";
import { Strategy, Vote as VoteType } from "../types/pool.type";
import { toast } from "sonner";

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
  claim: () => void;
  deposit: (amount: number) => void;
  withdraw: (amount: number) => void;
  buyKingGlazer: () => void;
  vote: (strategy: Strategy) => Promise<void>;
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

  const { data: config, refetch: refetchPoolConfig } = useReadContract({
    address: CONTRACT_ADDRESSES.pool,
    abi: DATA,
    functionName: "getConfig",
    args: [],
    chainId: base.id,
  });

  console.log(config);

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

  console.log(pendingClaim, "pending claim");

  const {
    data: txHash,
    writeContract,
    isPending: isWriting,
    writeContractAsync,
    reset: resetWrite,
  } = useWriteContract();

  const { data: receipt, isLoading: isConfirming } =
    useWaitForTransactionReceipt({
      hash: txHash,
      chainId: base.id,
    });

  const buyKingGlazer = useCallback(() => {
    try {
      if (!isConnected || !address) {
        throw new Error("Wallet not connected");
      }
      writeContract({
        account: address as Address,
        address: CONTRACT_ADDRESSES.pool as Address,
        abi: MANAGE,
        functionName: "buyKingGlazer",
        args: [""],
        chainId: base.id,
      });
    } catch (e: any) {
      toast.error(e.message);
    }
  }, [writeContract, isConnected, address]);

  const deposit = useCallback(
    async (amount: number) => {
      try {
        if (!isConnected || !address) {
          throw new Error("Wallet not connected");
        }
        await writeContractAsync({
          account: address as Address,
          address: CONTRACT_ADDRESSES.weth as Address,
          abi: ERC20,
          functionName: "approve",
          args: [CONTRACT_ADDRESSES.pool as Address, BigInt(amount)],
          chainId: base.id,
        });

        await sleep(3500);

        await writeContractAsync({
          account: address as Address,
          address: CONTRACT_ADDRESSES.pool as Address,
          abi: DEPOSIT,
          functionName: "depositToPool",
          args: [BigInt(amount)],
          chainId: base.id,
        });
      } catch (e: any) {
        toast.error(e.message);
      }
    },
    [writeContractAsync, isConnected, address]
  );

  const withdraw = useCallback(
    (amount: number) => {
      try {
        if (!isConnected || !address) {
          throw new Error("Wallet not connected");
        }
        writeContract({
          account: address as Address,
          address: CONTRACT_ADDRESSES.pool as Address,
          abi: WITHDRAW,
          functionName: "withdraw",
          args: [BigInt(amount)],
          chainId: base.id,
        });
      } catch (e: any) {
        toast.error(e.message);
      }
    },
    [writeContract, isConnected, address]
  );

  const claim = useCallback(() => {
    try {
      if (!isConnected || !address) {
        throw new Error("Wallet not connected");
      }
      writeContract({
        account: address as Address,
        address: CONTRACT_ADDRESSES.pool as Address,
        abi: CLAIM,
        functionName: "claimPending",
        args: [],
        chainId: base.id,
      });
    } catch (e: any) {
      toast.error(e.message);
    }
  }, [writeContract, isConnected, address]);

  const vote = useCallback(
    async (strategy: Strategy) => {
      try {
        if (!isConnected || !address) {
          throw new Error("Wallet not connected");
        }
        await writeContractAsync({
          account: address as Address,
          address: CONTRACT_ADDRESSES.pool as Address,
          abi: VOTE,
          functionName: "vote",
          args: [strategy],
          chainId: base.id,
        });
      } catch (e: any) {
        toast.error(e.message);
      }
    },
    [writeContractAsync, isConnected, address]
  );

  const value: PoolContextType = {
    config: config as PoolConfig,
    tvl: tvl as PoolTVL,
    state: state as PoolState,
    shareToken: addresses?.shareToken || "0x",
    isTxPending: isWriting,
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
  };

  return <PoolContext.Provider value={value}>{children}</PoolContext.Provider>;
};
