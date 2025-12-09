import { useReadContract, useAccount } from "wagmi";
import { CONTRACT_ADDRESSES, MULTICALL_ABI, ERC20 } from "@/lib/contracts";
import { base } from "wagmi/chains";
import { zeroAddress } from "viem";
import { usePool } from "../providers/PoolProvider";
import { formatUnits } from "viem";
import { getBreakevenThreshold } from "@/lib/utils";

export const useCanBuyGlaze = () => {
  const { config } = usePool();
  const { address } = useAccount();
  const { data: rawMinerState, refetch: refetchMinerState } = useReadContract({
    address: CONTRACT_ADDRESSES.multicall,
    abi: MULTICALL_ABI,
    functionName: "getMiner",
    args: [address ?? zeroAddress],
    chainId: base.id,
    query: {
      refetchInterval: 3_000,
    },
  });

  const { data: poolWETHBalance, refetch: refetchPoolWETHBalance } =
    useReadContract({
      address: CONTRACT_ADDRESSES.weth,
      abi: ERC20,
      functionName: "balanceOf",
      args: [CONTRACT_ADDRESSES.pool],
      chainId: base.id,
      query: {
        refetchInterval: 5_000,
      },
    });

  const glazePrice = parseFloat(formatUnits(rawMinerState?.price ?? 0n, 18));
  const poolWeth = parseFloat(formatUnits(poolWETHBalance ?? 0n, 18));
  const donutPrice = parseFloat(
    formatUnits(rawMinerState?.donutPrice ?? 0n, 18)
  );
  const dps = parseFloat(formatUnits(rawMinerState?.dps ?? 0n, 18));
  const strategy = config?.strategy ?? 0;
  const breakEvenSeconds = glazePrice / (donutPrice * dps);
  const targetBreakEven = getBreakevenThreshold(glazePrice, poolWeth, strategy);
  return {
    currentBreakEven: Math.ceil(breakEvenSeconds / 60),
    targetBreakEven,
    canBuy: targetBreakEven >= breakEvenSeconds / 60 && poolWeth >= glazePrice,
  };
};
