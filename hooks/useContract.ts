import { useCallback, useMemo } from "react";
import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
  simulateContract,
} from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { DEPOSIT } from "@/lib/abi/deposit";
import { WITHDRAW } from "@/lib/abi/withdraw";
import { MANAGE } from "@/lib/abi/manage";
import { CLAIM } from "@/lib/abi/claim";
import { DATA } from "@/lib/abi/data";
import { VOTE } from "@/lib/abi/vote";
import { AUCTION_ABI } from "@/lib/abi/auction";
import { FLASH_LOAN_ABI } from "@/lib/abi/flash-loan";
import { PINS_AND_FLAIR_ABI } from "@/lib/abi/pins-and-flair";
import { ERC20 } from "@/lib/abi/erc20";
import { MULTICALL_ABI } from "@/lib/abi/multicall";
import { PEEPLES_BLAZERY } from "@/lib/abi/peeples-blazery";
import { PIN_ABI } from "@/lib/abi/pin";
import { FLAIR_ABI } from "@/lib/abi/flair";
import { DIAMOND_MULTICALL } from "@/lib/abi/diamond_multicall";
import { BaseError, ContractFunctionRevertedError } from "viem";

type Facets =
  | "Deposit"
  | "Withdraw"
  | "Manage"
  | "Claim"
  | "Data"
  | "Vote"
  | "Auction"
  | "FlashLoan"
  | "PinsAndFlair"
  | "DiamondMulticall"
  | "ERC20"
  | "Multicall"
  | "PeeplesBlazer"
  | "Pin"
  | "Flair";

export enum ExecutionType {
  READABLE,
  WRITABLE,
}

type ExecutionResult<
  T extends ExecutionType,
  R = any,
> = T extends ExecutionType.READABLE
  ? (args: Array<any>) => Promise<R>
  : (
      args: Array<any>
    ) => Promise<{ hash: `0x${string}`; receipt: any; result: string }>;

const useContract = <T extends ExecutionType, R = any>(
  type: T,
  facet: Facets,
  functionName: string,
  contractAddress: `0x${string}` = "0x0"
): ExecutionResult<T, R> => {
  const abi = useMemo(() => {
    switch (facet) {
      case "Deposit":
        return DEPOSIT;
      case "Withdraw":
        return WITHDRAW;
      case "Manage":
        return MANAGE;
      case "Claim":
        return CLAIM;
      case "Data":
        return DATA;
      case "Vote":
        return VOTE;
      case "Auction":
        return AUCTION_ABI;
      case "FlashLoan":
        return FLASH_LOAN_ABI;
      case "PinsAndFlair":
        return PINS_AND_FLAIR_ABI;
      case "DiamondMulticall":
        return DIAMOND_MULTICALL;
      case "ERC20":
        return ERC20;
      case "Multicall":
        return MULTICALL_ABI;
      case "PeeplesBlazer":
        return PEEPLES_BLAZERY;
      case "Pin":
        return PIN_ABI;
      case "Flair":
        return FLAIR_ABI;
      default:
        return ERC20;
    }
  }, [facet]);

  // Diamond facets use pool address, others use their own addresses
  const isDiamondFacet = useMemo(
    () =>
      [
        "Deposit",
        "Withdraw",
        "Manage",
        "Claim",
        "Data",
        "Vote",
        "Auction",
        "FlashLoan",
        "PinsAndFlair",
        "DiamondMulticall",
      ].includes(facet),
    [facet]
  );

  const targetAddress = useMemo(() => {
    if (isDiamondFacet) {
      return CONTRACT_ADDRESSES.pool as `0x${string}`;
    }
    return contractAddress;
  }, [isDiamondFacet, contractAddress]);

  const execute = useCallback(
    async (args: Array<any>) => {
      try {
        let res;
        switch (type) {
          case ExecutionType.READABLE:
            res = await readContract(wagmiConfig as any, {
              abi: abi as any,
              address: targetAddress,
              functionName: functionName as any,
              args: args as any,
            });
            break;
          case ExecutionType.WRITABLE:
            const { result }: { result: bigint } = await simulateContract(
              wagmiConfig as any,
              {
                abi: abi as any,
                address: targetAddress,
                functionName: functionName as any,
                args: args as any,
              }
            ) as any;

            const hash = await writeContract(wagmiConfig as any, {
              abi: abi as any,
              address: targetAddress,
              functionName: functionName as any,
              args: args as any,
            });
            const receipt = await waitForTransactionReceipt(wagmiConfig as any, {
              hash,
            });
            res = { hash, receipt, result: result?.toString() };
            break;
        }
        return res as any;
      } catch (e: any) {
        if (e instanceof BaseError) {
          const revertError = e.walk(
            (err) => err instanceof ContractFunctionRevertedError
          );
          if (revertError instanceof ContractFunctionRevertedError) {
            const errorName = revertError.data?.errorName ?? "";
            if (revertError.data?.args) {
              throw new Error(revertError.data?.args[0] as string);
            }
          }
        }
        throw new Error(e.message);
      }
    },
    [abi, functionName, targetAddress, type]
  );

  return execute as ExecutionResult<T, R>;
};

export default useContract;
