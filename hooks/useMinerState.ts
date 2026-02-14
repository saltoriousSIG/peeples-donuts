import { useReadContract, useAccount } from "wagmi";
import { base } from "wagmi/chains";
import { zeroAddress, type Address } from "viem";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { MULTICALL_ABI } from "@/lib/abi/multicall";

export type MinerState = {
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

export function useMinerState() {
  const { address } = useAccount();

  const { data: rawMinerState, refetch: refetchMinerState } = useReadContract({
    address: CONTRACT_ADDRESSES.multicall,
    abi: MULTICALL_ABI,
    functionName: "getMiner",
    args: [address ?? zeroAddress],
    chainId: base.id,
    query: {
      enabled: !!address,
      refetchInterval: 10_000,
    },
  });

  return {
    minerState: rawMinerState as MinerState | undefined,
    refetchMinerState,
  };
}
