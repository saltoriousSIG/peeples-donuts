"use client";

import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import {
  writeContract,
  waitForTransactionReceipt,
} from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { PINS_AND_FLAIR_ABI } from "@/lib/abi/pins-and-flair";
import { DEPOSIT } from "@/lib/abi/deposit";
import { ERC20 } from "@/lib/abi/erc20";
import { toast } from "sonner";
import { parseContractError } from "@/lib/errors";
import { useFrameContext } from "@/providers/FrameSDKProvider";
import generate_pin from "@/lib/server_functions/generate_pin";
import { type GaugeName } from "@/lib/flair-data";
import { parseEther, type Address } from "viem";

// Enable mock mode for UI testing without actual transactions
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_TRANSACTIONS === "true";

// Helper to simulate async delay
const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface OnboardingMintOptions {
  flairTokenId: bigint;
  wethAmount: string; // WETH amount as string (e.g., "0.01")
  gauge: GaugeName;
}

export interface OnboardingMintResult {
  success: boolean;
  pinImageUrl?: string;
  txHash?: string;
  error?: string;
}

export interface UseOnboardingMintReturn {
  isMinting: boolean;
  mintStep: "idle" | "approving" | "depositing" | "minting_pin" | "buying_flair" | "equipping" | "complete";
  mintProgress: number; // 0-100
  executeOnboarding: (options: OnboardingMintOptions) => Promise<OnboardingMintResult>;
  executeFreeMint: () => Promise<OnboardingMintResult>;
}

export function useOnboardingMint(): UseOnboardingMintReturn {
  const { address, isConnected } = useAccount();
  const { fUser } = useFrameContext();
  const [isMinting, setIsMinting] = useState(false);
  const [mintStep, setMintStep] = useState<UseOnboardingMintReturn["mintStep"]>("idle");
  const [mintProgress, setMintProgress] = useState(0);

  // Mock implementation for testing UI
  const executeMockOnboarding = useCallback(
    async (options: OnboardingMintOptions): Promise<OnboardingMintResult> => {
      console.log("[MOCK] Starting onboarding with options:", options);
      setIsMinting(true);
      setMintProgress(0);

      try {
        // Step 1: Approve WETH
        setMintStep("approving");
        setMintProgress(5);
        toast.info("[MOCK] Approving WETH...");
        await mockDelay(800);
        setMintProgress(15);
        toast.success("[MOCK] WETH approved!");

        // Step 2: Deposit WETH to pool
        setMintStep("depositing");
        setMintProgress(20);
        toast.info("[MOCK] Depositing to pool...");
        await mockDelay(1000);
        setMintProgress(35);
        toast.success("[MOCK] Deposit complete!");

        // Step 3: Generate pin and mint
        setMintStep("minting_pin");
        setMintProgress(45);
        toast.info("[MOCK] Generating your Pin...");
        await mockDelay(1200);
        setMintProgress(55);
        await mockDelay(800);
        setMintProgress(70);
        toast.success("[MOCK] Pin minted!");

        // Step 4: Buy flair
        setMintStep("buying_flair");
        setMintProgress(75);
        toast.info("[MOCK] Purchasing flair...");
        await mockDelay(800);
        setMintProgress(85);
        toast.success("[MOCK] Flair purchased!");

        // Step 5: Equip flair
        setMintStep("equipping");
        setMintProgress(90);
        toast.info("[MOCK] Equipping flair...");
        await mockDelay(600);
        setMintProgress(100);
        setMintStep("complete");
        toast.success("[MOCK] Welcome to Peeples Donuts!");

        return {
          success: true,
          pinImageUrl: "/media/peeples_donuts.png",
          txHash: "0xmock_transaction_hash",
        };
      } catch (error) {
        toast.error("[MOCK] Error during onboarding");
        return { success: false, error: String(error) };
      } finally {
        setIsMinting(false);
        setMintStep("idle");
      }
    },
    []
  );

  const executeMockFreeMint = useCallback(async (): Promise<OnboardingMintResult> => {
    console.log("[MOCK] Starting free mint");
    setIsMinting(true);
    setMintStep("minting_pin");
    setMintProgress(20);

    try {
      toast.info("[MOCK] Generating your Pin...");
      await mockDelay(1000);
      setMintProgress(50);
      await mockDelay(1000);
      setMintProgress(100);
      setMintStep("complete");
      toast.success("[MOCK] Pin minted! Welcome to the family!");

      return {
        success: true,
        pinImageUrl: "/media/peeples_donuts.png",
        txHash: "0xmock_free_mint_hash",
      };
    } catch (error) {
      toast.error("[MOCK] Error during free mint");
      return { success: false, error: String(error) };
    } finally {
      setIsMinting(false);
      setMintStep("idle");
    }
  }, []);

  // Execute full onboarding flow for new users (approve + deposit + mint + buy flair + equip)
  const executeOnboarding = useCallback(
    async (options: OnboardingMintOptions): Promise<OnboardingMintResult> => {
      // Use mock mode if enabled
      if (MOCK_MODE) {
        return executeMockOnboarding(options);
      }

      if (!isConnected || !address) {
        toast.error("Wallet not connected");
        return { success: false, error: "Wallet not connected" };
      }

      if (!fUser?.fid) {
        toast.error("Farcaster user not available");
        return { success: false, error: "Farcaster user not available" };
      }

      const username = (fUser as any).username || (fUser as any).displayName || "";
      if (!username) {
        toast.error("Username not available");
        return { success: false, error: "Username not available" };
      }

      setIsMinting(true);
      setMintProgress(0);

      try {
        const depositAmount = parseEther(options.wethAmount);

        // Step 1: Approve WETH spend
        setMintStep("approving");
        setMintProgress(5);
        toast.info("Approving WETH...");

        const approveHash = await writeContract(wagmiConfig as any, {
          abi: ERC20,
          address: CONTRACT_ADDRESSES.weth as Address,
          functionName: "approve",
          args: [CONTRACT_ADDRESSES.pool as Address, depositAmount],
        });

        await waitForTransactionReceipt(wagmiConfig as any, { hash: approveHash });
        setMintProgress(15);
        toast.success("WETH approved!");

        // Step 2: Deposit WETH to pool
        setMintStep("depositing");
        setMintProgress(20);
        toast.info("Depositing to pool...");

        const depositHash = await writeContract(wagmiConfig as any, {
          abi: DEPOSIT,
          address: CONTRACT_ADDRESSES.pool as Address,
          functionName: "depositToPool",
          args: [depositAmount],
        });

        await waitForTransactionReceipt(wagmiConfig as any, { hash: depositHash });
        setMintProgress(35);
        toast.success("Deposit complete!");

        // Step 3: Generate pin and mint
        setMintStep("minting_pin");
        setMintProgress(45);
        toast.info("Generating your Pin...");

        const pinData = await generate_pin(fUser.fid);
        const pinImageUrl = pinData.imageUrl;
        const cid = pinData.cid;

        setMintProgress(55);

        const mintHash = await writeContract(wagmiConfig as any, {
          abi: PINS_AND_FLAIR_ABI,
          address: CONTRACT_ADDRESSES.pool as Address,
          functionName: "mintPin",
          args: [false, BigInt(fUser.fid), cid, username],
        });

        await waitForTransactionReceipt(wagmiConfig as any, { hash: mintHash });
        setMintProgress(70);
        toast.success("Pin minted!");

        // Step 4: Buy flair
        setMintStep("buying_flair");
        setMintProgress(75);
        toast.info("Purchasing flair...");

        const buyFlairHash = await writeContract(wagmiConfig as any, {
          abi: PINS_AND_FLAIR_ABI,
          address: CONTRACT_ADDRESSES.pool as Address,
          functionName: "buyFlair",
          args: [options.flairTokenId],
        });

        await waitForTransactionReceipt(wagmiConfig as any, { hash: buyFlairHash });
        setMintProgress(85);
        toast.success("Flair purchased!");

        // Step 5: Equip flair
        setMintStep("equipping");
        setMintProgress(90);
        toast.info("Equipping flair...");

        const equipHash = await writeContract(wagmiConfig as any, {
          abi: PINS_AND_FLAIR_ABI,
          address: CONTRACT_ADDRESSES.pool as Address,
          functionName: "equipFlair",
          args: [options.flairTokenId, cid],
        });

        await waitForTransactionReceipt(wagmiConfig as any, { hash: equipHash });
        setMintProgress(100);
        setMintStep("complete");
        toast.success("Welcome to Peeples Donuts!");

        return {
          success: true,
          pinImageUrl,
          txHash: equipHash,
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
    [address, isConnected, fUser, mintStep, executeMockOnboarding]
  );

  // Execute free mint for existing shareholders
  const executeFreeMint = useCallback(async (): Promise<OnboardingMintResult> => {
    // Use mock mode if enabled
    if (MOCK_MODE) {
      return executeMockFreeMint();
    }

    if (!isConnected || !address) {
      toast.error("Wallet not connected");
      return { success: false, error: "Wallet not connected" };
    }

    if (!fUser?.fid) {
      toast.error("Farcaster user not available");
      return { success: false, error: "Farcaster user not available" };
    }

    const username = (fUser as any).username || (fUser as any).displayName || "";
    if (!username) {
      toast.error("Username not available");
      return { success: false, error: "Username not available" };
    }

    setIsMinting(true);
    setMintStep("minting_pin");
    setMintProgress(20);

    try {
      toast.info("Generating your Pin...");

      const pinData = await generate_pin(fUser.fid);
      const pinImageUrl = pinData.imageUrl;
      const cid = pinData.cid;

      setMintProgress(50);

      const mintHash = await writeContract(wagmiConfig as any, {
        abi: PINS_AND_FLAIR_ABI,
        address: CONTRACT_ADDRESSES.pool as Address,
        functionName: "mintPin",
        args: [false, BigInt(fUser.fid), cid, username],
      });

      await waitForTransactionReceipt(wagmiConfig as any, { hash: mintHash });
      setMintProgress(100);
      setMintStep("complete");
      toast.success("Pin minted! Welcome to the family!");

      return {
        success: true,
        pinImageUrl,
        txHash: mintHash,
      };
    } catch (error: unknown) {
      const parsed = parseContractError(
        error instanceof Error ? error : new Error(String(error)),
        {
          contractName: "PinsAndFlair",
          functionName: "mintPin",
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
  }, [address, isConnected, fUser, executeMockFreeMint]);

  return {
    isMinting,
    mintStep,
    mintProgress,
    executeOnboarding,
    executeFreeMint,
  };
}
