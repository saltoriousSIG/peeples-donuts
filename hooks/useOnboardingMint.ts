"use client";
import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { writeContract, waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { PINS_AND_FLAIR_ABI } from "@/lib/abi/pins-and-flair";
import { toast } from "sonner";
import { parseContractError } from "@/lib/errors";
import { useFrameContext } from "@/providers/FrameSDKProvider";
import generate_pin from "@/lib/server_functions/generate_pin";
import { type GaugeName } from "@/lib/flair-data";
import {
  encodeFunctionData,
  type Address,
} from "viem";
import { DIAMOND_MULTICALL } from "@/lib/abi/diamond_multicall";
import { ensureTokenApproval, getPaymentTokenAddress, getPaymentAmount } from "@/lib/token-utils";
import { useMinerState, type MinerState } from "./useMinerState";

export interface OnboardingMintOptions {
  flairTokenId: bigint;
  wethAmount: bigint; // Total deposit amount in WETH (wei) — includes mint price + extra deposit
  gauge: GaugeName;
  currency?: "ETH" | "DONUT"; // Defaults to ETH
  mintPrice: bigint; // Base pin mint price in WETH (wei)
  flairPrice: bigint; // Flair mint price in WETH (wei)
}

export interface OnboardingMintResult {
  success: boolean;
  pinImageUrl?: string;
  txHash?: string;
  error?: string;
}

export interface FreeMintOptions {
  flairTokenId: bigint;
  currency?: "ETH" | "DONUT";
  flairPrice: bigint;
}

export interface UseOnboardingMintReturn {
  isMinting: boolean;
  mintStep: "idle" | "approving" | "minting_pin" | "complete";
  mintProgress: number; // 0-100
  executeOnboarding: (
    options: OnboardingMintOptions
  ) => Promise<OnboardingMintResult>;
  executeFreeMint: (options: FreeMintOptions) => Promise<OnboardingMintResult>;
}

export function useOnboardingMint(): UseOnboardingMintReturn {
  const { address, isConnected } = useAccount();
  const { fUser } = useFrameContext();
  const [isMinting, setIsMinting] = useState(false);
  const [mintStep, setMintStep] =
    useState<UseOnboardingMintReturn["mintStep"]>("idle");
  const [mintProgress, setMintProgress] = useState(0);
  const { minerState, refetchMinerState } = useMinerState();

  // Execute full onboarding flow for new users (approve + deposit + mint + buy flair + equip)
  const executeOnboarding = useCallback(
    async (options: OnboardingMintOptions): Promise<OnboardingMintResult> => {
      if (!isConnected || !address) {
        toast.error("Wallet not connected");
        return { success: false, error: "Wallet not connected" };
      }

      if (!fUser?.fid) {
        toast.error("Farcaster user not available");
        return { success: false, error: "Farcaster user not available" };
      }

      const username =
        (fUser as any).username || (fUser as any).displayName || "";
      if (!username) {
        toast.error("Username not available");
        return { success: false, error: "Username not available" };
      }

      setIsMinting(true);
      setMintProgress(0);

      try {
        const currency = options.currency || "ETH";
        const isDonut = currency === "DONUT";
        const totalAmount = options.wethAmount;
        const extraAmount = totalAmount - options.mintPrice; // Amount above base mint price
        const tokenAddress = getPaymentTokenAddress(isDonut);
        const tokenName = isDonut ? "DONUT" : "WETH";
        const poolAddress = CONTRACT_ADDRESSES.pool as `0x${string}`;

        // Step 1: Approve token spend (deposit + flair)
        setMintStep("approving");
        setMintProgress(10);

        // Refetch miner state to get a fresh donutPrice before calculating approval
        const { data: freshMinerState } = await refetchMinerState();
        const currentDonutPrice = (freshMinerState as MinerState | undefined)?.donutPrice ?? minerState?.donutPrice;

        const totalToApprove = totalAmount + options.flairPrice;
        const approvalAmount = getPaymentAmount(totalToApprove, isDonut, currentDonutPrice);
        await ensureTokenApproval(address, tokenAddress, poolAddress, approvalAmount, tokenName);
        setMintProgress(30);

        // Step 2: Generate pin image, then multicall (mint + buy flair + equip)
        setMintStep("minting_pin");
        setMintProgress(35);
        toast.info("Setting up your Pin...");

        const pinData = await generate_pin(fUser.fid);
        const pinImageUrl = pinData.imageUrl;
        const cid = pinData.cid;

        if (!cid) {
          throw new Error("Failed to get CID for pin image");
        }

        setMintProgress(45);

        // Step 3: Multicall - mintPin (free) + buyFlair + equipFlair
        const encodedMintPin = encodeFunctionData({
          abi: PINS_AND_FLAIR_ABI,
          functionName: "mintPin",
          args: [isDonut, extraAmount, BigInt(fUser.fid), cid, username],
        });

        const encodedBuyFlair = encodeFunctionData({
          abi: PINS_AND_FLAIR_ABI,
          functionName: "buyAndEquipFlair",
          args: [isDonut, options.flairTokenId, cid],
        });


        setMintProgress(50);

        const multicallHash = await writeContract(wagmiConfig as any, {
          abi: DIAMOND_MULTICALL,
          address: CONTRACT_ADDRESSES.pool as Address,
          functionName: "multicall",
          args: [[encodedMintPin, encodedBuyFlair]],
        });

        await waitForTransactionReceipt(wagmiConfig as any, {
          hash: multicallHash,
        });
        setMintProgress(100);
        setMintStep("complete");
        toast.success("Welcome to Peeples Donuts!");

        return {
          success: true,
          pinImageUrl,
          txHash: "0x123", // Replace with actual tx hash from multicall
        };
      } catch (error: unknown) {
        const parsed = parseContractError(
          error instanceof Error ? error : new Error(String(error)),
          {
            contractName: "Onboarding",
            functionName: mintStep,
          }
        );

        if (parsed.severity === "warning") {
          toast.warning(parsed.title);
        } else {
          toast.error(parsed.title, {
            description: parsed.action
              ? `${parsed.message}\n\n${parsed.action}`
              : parsed.message,
          });
        }

        return {
          success: false,
          error: parsed.message,
        };
      } finally {
        setIsMinting(false);
        setMintStep("idle");
      }
    },
    [address, isConnected, fUser, mintStep, minerState, refetchMinerState]
  );

  // Execute free mint for existing shareholders (free pin + paid flair)
  const executeFreeMint = useCallback(
    async (options: FreeMintOptions): Promise<OnboardingMintResult> => {
      if (!isConnected || !address) {
        toast.error("Wallet not connected");
        return { success: false, error: "Wallet not connected" };
      }

      if (!fUser?.fid) {
        toast.error("Farcaster user not available");
        return { success: false, error: "Farcaster user not available" };
      }

      const username =
        (fUser as any).username || (fUser as any).displayName || "";
      if (!username) {
        toast.error("Username not available");
        return { success: false, error: "Username not available" };
      }

      const currency = options.currency || "ETH";
      const isDonut = currency === "DONUT";
      const tokenAddress = getPaymentTokenAddress(isDonut);
      const tokenName = isDonut ? "DONUT" : "WETH";
      const poolAddress = CONTRACT_ADDRESSES.pool as `0x${string}`;
      setIsMinting(true);
      setMintProgress(0);

      try {
        // Step 1: Approve token spend for flair purchase
        setMintStep("approving");
        setMintProgress(10);

        // Refetch miner state to get a fresh donutPrice before calculating approval
        const { data: freshMinerState } = await refetchMinerState();
        const currentDonutPrice = (freshMinerState as MinerState | undefined)?.donutPrice ?? minerState?.donutPrice;

        const approvalAmount = getPaymentAmount(options.flairPrice, isDonut, currentDonutPrice);
        await ensureTokenApproval(address, tokenAddress, poolAddress, approvalAmount, tokenName);
        setMintProgress(30);

        // Step 2: Generate pin image + get CID
        setMintStep("minting_pin");
        setMintProgress(35);
        toast.info("Setting up your Pin...");

        const pinData = await generate_pin(fUser.fid);
        const pinImageUrl = pinData.imageUrl;
        const cid = pinData.cid;
        if (!cid) {
          throw new Error("Failed to get CID for pin image");
        }

        setMintProgress(45);

        // Step 3: Multicall - mintPin (free) + buyFlair + equipFlair
        const encodedMintPin = encodeFunctionData({
          abi: PINS_AND_FLAIR_ABI,
          functionName: "mintPin",
          args: [isDonut, 0n, BigInt(fUser.fid), cid, username],
        });

        const encodedBuyFlair = encodeFunctionData({
          abi: PINS_AND_FLAIR_ABI,
          functionName: "buyAndEquipFlair",
          args: [isDonut, options.flairTokenId, cid],
        });

        setMintProgress(50);

        const multicallHash = await writeContract(wagmiConfig as any, {
          abi: DIAMOND_MULTICALL,
          address: CONTRACT_ADDRESSES.pool as Address,
          functionName: "multicall",
          args: [[encodedMintPin, encodedBuyFlair]],
        });

        await waitForTransactionReceipt(wagmiConfig as any, {
          hash: multicallHash,
        });
        setMintProgress(100);
        setMintStep("complete");
        toast.success("Welcome back to Peeples Donuts!");

        return {
          success: true,
          pinImageUrl,
          txHash: multicallHash,
        };
      } catch (error: unknown) {
        const parsed = parseContractError(
          error instanceof Error ? error : new Error(String(error)),
          {
            contractName: "Onboarding",
            functionName: mintStep,
          }
        );

        if (parsed.severity === "warning") {
          toast.warning(parsed.title);
        } else {
          toast.error(parsed.title, {
            description: parsed.action
              ? `${parsed.message}\n\n${parsed.action}`
              : parsed.message,
          });
        }

        return {
          success: false,
          error: parsed.message,
        };
      } finally {
        setIsMinting(false);
        setMintStep("idle");
      }
    },
    [address, isConnected, fUser, mintStep, minerState, refetchMinerState]
  );

  return {
    isMinting,
    mintStep,
    mintProgress,
    executeOnboarding,
    executeFreeMint,
  };
}
