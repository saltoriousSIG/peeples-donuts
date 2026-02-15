import { readContract, writeContract, waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { ERC20 } from "@/lib/abi/erc20";
import { toast } from "sonner";

/**
 * Resolves the token contract address based on payment method.
 */
export function getPaymentTokenAddress(useDonut: boolean): `0x${string}` {
  return (useDonut ? CONTRACT_ADDRESSES.donut : CONTRACT_ADDRESSES.weth) as `0x${string}`;
}

/**
 * Converts a WETH-denominated price to DONUT amount.
 * donutPrice is the amount of WETH for 1 DONUT (18 decimals) from minerState.
 * donutAmount = wethAmount / donutPrice
 */
export function wethToDonut(wethAmount: bigint, donutPrice: bigint): bigint {
  return (wethAmount * 10n ** 18n) / donutPrice;
}

/**
 * Returns the amount to approve/pay in the chosen token.
 * For WETH: returns the price as-is.
 * For DONUT: converts using donutPrice (amount of WETH per 1 DONUT).
 */
export function getPaymentAmount(
  wethPrice: bigint,
  useDonut: boolean,
  donutPrice?: bigint
): bigint {
  console.log(wethPrice, useDonut, donutPrice, "params");
  if (!useDonut) return wethPrice;
  if (!donutPrice || donutPrice === 0n) return wethPrice;
  const amtDonut =  wethToDonut(wethPrice, donutPrice);
  const buffer = amtDonut / 1000n; // Add 1% buffer to account for price fluctuations
  return amtDonut + buffer;
}

/**
 * Checks allowance and approves the exact amount if needed.
 * Returns true if approval was performed, false if already sufficient.
 */
export async function ensureTokenApproval(
  owner: `0x${string}`,
  tokenAddress: `0x${string}`,
  spender: `0x${string}`,
  amount: bigint,
  tokenName: string
): Promise<boolean> {
  const currentAllowance = await readContract(wagmiConfig as any, {
    abi: ERC20,
    address: tokenAddress,
    functionName: "allowance",
    args: [owner, spender],
  }) as bigint;
  console.log(currentAllowance, "allowance");
  console.log(amount, "amount to approve");

  if (currentAllowance >= amount) return false;

  toast.info(`Approving ${tokenName}...`);
  const approveHash = await writeContract(wagmiConfig as any, {
    abi: ERC20,
    address: tokenAddress,
    functionName: "approve",
    args: [spender, amount],
  });
  await waitForTransactionReceipt(wagmiConfig as any, { hash: approveHash, confirmations: 2 });
  toast.success(`${tokenName} approved!`);
  return true;
}
