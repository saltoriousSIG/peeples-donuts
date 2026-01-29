"use client";
import { useState } from "react";
import {
  useAccount,
  useReadContract,
} from "wagmi";
import { base } from "wagmi/chains";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { PIN_ABI } from "@/lib/abi/pin";
import { DATA } from "@/lib/abi/data";
import { PINS_AND_FLAIR_ABI } from "@/lib/abi/pins-and-flair";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { zeroAddress } from "viem";
import { parseContractError } from "@/lib/errors";
import { useFrameContext } from "@/providers/FrameSDKProvider";
import generate_pin from "@/lib/server_functions/generate_pin";
import useContract, { ExecutionType } from "./useContract";

// Enable mock mode for UI testing without actual transactions
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_TRANSACTIONS === "true";

// Mock user state to match
const MOCK_USER_SEGMENT = process.env.NEXT_PUBLIC_MOCK_USER_SEGMENT || "new_user";

// Claim status enum from contract
export enum ClaimStatus {
  NONE = 0,
  PENDING = 1,
  READY = 2,
  CLAIMED = 3,
}

// Pin mint config from contract
export interface PinMintConfig {
  blazeryAddress: `0x${string}`;
  ownerAddress: `0x${string}`;
  mintPrice: bigint;
  poolActive: boolean;
}

// Pending deposit info from contract
export interface PendingDepositInfo {
  pendingWeth: bigint;
  pendingDonut: bigint;
  pendingShares: bigint;
  sharesCalculated: boolean;
  hasClaimed: boolean;
}

export interface UsePinsReturn {
  hasPin: boolean;
  pinId: string | null;
  canMint: boolean;
  isLoading: boolean;
  isMinting: boolean;
  mintConfig: PinMintConfig | null;
  isWhitelisted: boolean;
  pendingDeposit: PendingDepositInfo | null;
  claimStatus: ClaimStatus;
  mintPin: (useDonut: boolean) => Promise<string | undefined>;
}

export function usePins(): UsePinsReturn {
  const { address } = useAccount();
  const { fUser } = useFrameContext();
  const [isMinting, setIsMinting] = useState<boolean>(false);

  // Check if user has a pin (ERC721 balance)
  const { data: pinBalance, fetchStatus: tokenPinBalanceFetchStatus } = useReadContract({
    address: CONTRACT_ADDRESSES.pin as `0x${string}`,
    abi: PIN_ABI,
    functionName: "balanceOf",
    args: [address ?? zeroAddress],
    chainId: base.id,
    query: {
      enabled: !!address && !!CONTRACT_ADDRESSES.pin
    },
  });

  // Get user's pin ID from Data facet
  const { data: pinTokenId, fetchStatus: tokenIdFetchStatus } = useReadContract({
    address: CONTRACT_ADDRESSES.pool as `0x${string}`,
    abi: DATA,
    functionName: "getUserPinId",
    args: [address ?? zeroAddress],
    chainId: base.id,
    query: {
      enabled: !!address && !!CONTRACT_ADDRESSES.pool
    },
  });

  // Get pin mint config from PinsAndFlair facet
  const { data: mintConfigData } = useReadContract({
    address: CONTRACT_ADDRESSES.pool as `0x${string}`,
    abi: PINS_AND_FLAIR_ABI,
    functionName: "getPinMintConfig",
    chainId: base.id,
    query: {
      enabled: !!CONTRACT_ADDRESSES.pool,
      refetchInterval: 30_000,
    },
  });

  // Check if user is whitelisted
  const { data: whitelistData } = useReadContract({
    address: CONTRACT_ADDRESSES.pool as `0x${string}`,
    abi: PINS_AND_FLAIR_ABI,
    functionName: "isWhitelisted",
    args: [address ?? zeroAddress],
    chainId: base.id,
    query: {
      enabled: !!address && !!CONTRACT_ADDRESSES.pool,
    },
  });

  // Get pending deposit info
  const { data: pendingDepositData } = useReadContract({
    address: CONTRACT_ADDRESSES.pool as `0x${string}`,
    abi: PINS_AND_FLAIR_ABI,
    functionName: "getPendingDepositInfo",
    args: [address ?? zeroAddress],
    chainId: base.id,
    query: {
      enabled: !!address && !!CONTRACT_ADDRESSES.pool,
      refetchInterval: 10_000,
    },
  });

  // Get user claim status
  const { data: claimStatusData } = useReadContract({
    address: CONTRACT_ADDRESSES.pool as `0x${string}`,
    abi: PINS_AND_FLAIR_ABI,
    functionName: "getUserClaimStatus",
    args: [address ?? zeroAddress],
    chainId: base.id,
    query: {
      enabled: !!address && !!CONTRACT_ADDRESSES.pool,
      refetchInterval: 10_000,
    },
  });

  // Parse mint config
  const mintConfig = useMemo((): PinMintConfig | null => {
    if (!mintConfigData) return null;
    const data = mintConfigData as {
      blazeryAddress: `0x${string}`;
      ownerAddress: `0x${string}`;
      mintPrice: bigint;
      poolActive: boolean;
    };
    return {
      blazeryAddress: data.blazeryAddress,
      ownerAddress: data.ownerAddress,
      mintPrice: data.mintPrice,
      poolActive: data.poolActive,
    };
  }, [mintConfigData]);

  // Parse pending deposit info
  const pendingDeposit = useMemo((): PendingDepositInfo | null => {
    if (!pendingDepositData) return null;
    const data = pendingDepositData as {
      pendingWeth: bigint;
      pendingDonut: bigint;
      pendingShares: bigint;
      sharesCalculated: boolean;
      hasClaimed: boolean;
    };
    return {
      pendingWeth: data.pendingWeth,
      pendingDonut: data.pendingDonut,
      pendingShares: data.pendingShares,
      sharesCalculated: data.sharesCalculated,
      hasClaimed: data.hasClaimed,
    };
  }, [pendingDepositData]);

  // Contract execution hook for mintPin
  const executeMintPin = useContract(
    ExecutionType.WRITABLE,
    "PinsAndFlair",
    "mintPin"
  );

  const hasPin = useMemo(() => {
    return !!pinBalance && pinBalance > 0n;
  }, [pinBalance]);

  const pinId = useMemo(() => {
    if (!hasPin || pinTokenId === undefined) return null;
    return pinTokenId.toString();
  }, [hasPin, pinTokenId]);

  const canMint = useMemo(() => {
    return !hasPin && mintConfig?.poolActive === true;
  }, [hasPin, mintConfig?.poolActive]);

  const isWhitelisted = useMemo(() => {
    return whitelistData === true;
  }, [whitelistData]);

  const claimStatus = useMemo((): ClaimStatus => {
    if (claimStatusData === undefined) return ClaimStatus.NONE;
    return claimStatusData as ClaimStatus;
  }, [claimStatusData]);

  const mintPin = useCallback(async (useDonut: boolean) => {
    setIsMinting(true);

    if (!fUser || !fUser.fid) {
      toast.error("Frame user not available");
      setIsMinting(false);
      return;
    }

    const username = (fUser as any).username || (fUser as any).displayName || "";
    if (!username) {
      toast.error("Username not available");
      setIsMinting(false);
      return;
    }

    let imageUrl = "";

    try {
      const pin_data = await generate_pin(fUser.fid);
      console.log(pin_data);
      imageUrl = pin_data.imageUrl;

      //const cid = pin_data.cid;
      //await executeMintPin([useDonut, BigInt(fUser.fid), cid, username]);
      toast.success("Pin minted successfully!");
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
            ? `${parsed.message}\n\n💡 ${parsed.action}`
            : parsed.message,
        });
      }
    } finally {
      setIsMinting(false);
    }

    return imageUrl;
  }, [executeMintPin, fUser]);

  // Return mock data in mock mode
  if (MOCK_MODE) {
    const mockHasPin = ["pin_no_flair", "active_earner", "yield_ready"].includes(MOCK_USER_SEGMENT);
    return {
      hasPin: mockHasPin,
      pinId: mockHasPin ? "42" : null,
      canMint: !mockHasPin,
      isLoading: false,
      isMinting,
      mintConfig: {
        blazeryAddress: zeroAddress,
        ownerAddress: zeroAddress,
        mintPrice: 0n,
        poolActive: true,
      },
      isWhitelisted: true,
      pendingDeposit: null,
      claimStatus: ClaimStatus.NONE,
      mintPin,
    };
  }

  return {
    hasPin,
    pinId,
    canMint,
    isLoading: (tokenPinBalanceFetchStatus === 'fetching' && pinBalance === undefined) || (tokenIdFetchStatus === 'fetching' && pinTokenId === undefined),
    isMinting,
    mintConfig,
    isWhitelisted,
    pendingDeposit,
    claimStatus,
    mintPin,
  };
}
