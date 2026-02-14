"use client";

import { useAccount, useReadContracts } from "wagmi";
import { base } from "wagmi/chains";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { FLASH_LOAN_ABI } from "@/lib/abi/flash-loan";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { parseContractError } from "@/lib/errors";
import useContract, { ExecutionType } from "./useContract";

export interface UseFlashLoanReturn {
  maxLoanAmount: bigint | undefined;
  isLoading: boolean;
  isExecuting: boolean;
  calculateFee: (amount: bigint) => bigint;
  executeLoan: (amount: bigint) => Promise<void>;
}

export function useFlashLoan(tokenAddress: `0x${string}`): UseFlashLoanReturn {
  const { address, isConnected } = useAccount();
  const [isExecuting, setIsExecuting] = useState(false);

  // Batch flash loan reads into a single multicall
  const { data: flashBatch, fetchStatus } = useReadContracts({
    contracts: [
      // [0] maxFlashLoan
      {
        address: CONTRACT_ADDRESSES.pool as `0x${string}`,
        abi: FLASH_LOAN_ABI,
        functionName: "maxFlashLoan",
        args: [tokenAddress],
        chainId: base.id,
      },
      // [1] flashFee (sample for 1 token to derive fee rate)
      {
        address: CONTRACT_ADDRESSES.pool as `0x${string}`,
        abi: FLASH_LOAN_ABI,
        functionName: "flashFee",
        args: [tokenAddress, 1000000000000000000n],
        chainId: base.id,
      },
    ],
    query: {
      enabled: !!CONTRACT_ADDRESSES.pool,
      refetchInterval: 30_000,
    },
  });

  const maxLoanAmount = flashBatch?.[0]?.result as bigint | undefined;
  const sampleFee = flashBatch?.[1]?.result as bigint | undefined;

  // Contract execution hook
  const executeFlashLoan = useContract(ExecutionType.WRITABLE, "FlashLoan", "flashLoan");

  // Calculate fee for a given amount
  const calculateFee = useCallback(
    (amount: bigint): bigint => {
      if (!sampleFee || !CONTRACT_ADDRESSES.pool) {
        // Default to 0.1% if no data
        return (amount * 10n) / 10000n;
      }
      // Fee rate = sampleFee / 1e18, so fee = amount * sampleFee / 1e18
      return (amount * (sampleFee as bigint)) / 1000000000000000000n;
    },
    [sampleFee]
  );

  const executeLoan = useCallback(
    async (amount: bigint) => {
      if (!isConnected || !address) {
        toast.error("Wallet not connected");
        return;
      }
      if (!CONTRACT_ADDRESSES.pool) {
        toast.error("Pool contract not available");
        return;
      }

      setIsExecuting(true);
      try {
        // Note: Flash loans require a receiver contract that implements IERC3156FlashBorrower
        // This is a simplified UI - actual implementation would need a receiver contract
        await executeFlashLoan([
          address, // receiver (should be a contract implementing IERC3156FlashBorrower)
          tokenAddress,
          amount,
          "0x", // data
        ]);
        toast.success("Flash loan executed!");
      } catch (error: unknown) {
        const parsed = parseContractError(
          error instanceof Error ? error : new Error(String(error)),
          {
            contractName: 'FlashLoan',
            functionName: 'flashLoan'
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
        setIsExecuting(false);
      }
    },
    [address, isConnected, tokenAddress, executeFlashLoan]
  );

  return {
    maxLoanAmount: maxLoanAmount as bigint | undefined,
    isLoading: fetchStatus === 'fetching' && flashBatch === undefined,
    isExecuting,
    calculateFee,
    executeLoan,
  };
}
