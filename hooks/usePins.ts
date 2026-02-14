"use client";
import { useState } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { useQuery } from "@tanstack/react-query";
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
import { FlagOff } from "lucide-react";

function resolveUri(uri: string): string {
  if (uri.startsWith("ipfs://")) {
    return `https://harlequin-eligible-urial-768.mypinata.cloud/ipfs/${uri.slice(7)}`;
  }
  return uri;
}

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
  pinCid: string | null;
  pinImageUrl: string | null;
  canMint: boolean;
  isLoading: boolean;
  isMinting: boolean;
  mintConfig: PinMintConfig | null;
  isWhitelisted: boolean;
  pendingDeposit: PendingDepositInfo | null;
  claimStatus: ClaimStatus;
  pinMintPrice: bigint | undefined;
  flairMintPrice: bigint | undefined;
  mintPin: (useDonut: boolean) => Promise<string | undefined>;
  refetchPinData: () => Promise<void>;
}

export function usePins(): UsePinsReturn {
  const { address } = useAccount();
  const { fUser } = useFrameContext();
  const [isMinting, setIsMinting] = useState<boolean>(false);

  // Batch all contract reads into a single multicall
  const {
    data: batchData,
    fetchStatus,
    refetch: refetchBatch,
  } = useReadContracts({
    contracts: [
      // [1] User pin ID
      {
        address: CONTRACT_ADDRESSES.pool as `0x${string}`,
        abi: DATA,
        functionName: "getUserPinId",
        args: [address ?? zeroAddress],
        chainId: base.id,
      },
      // [2] Pin mint config
      {
        address: CONTRACT_ADDRESSES.pool as `0x${string}`,
        abi: PINS_AND_FLAIR_ABI,
        functionName: "getPinMintConfig",
        chainId: base.id,
      },
      // [3] Whitelisted
      {
        address: CONTRACT_ADDRESSES.pool as `0x${string}`,
        abi: PINS_AND_FLAIR_ABI,
        functionName: "isWhitelisted",
        args: [address ?? zeroAddress],
        chainId: base.id,
      },
      // [4] Pending deposit info
      {
        address: CONTRACT_ADDRESSES.pool as `0x${string}`,
        abi: PINS_AND_FLAIR_ABI,
        functionName: "getPendingDepositInfo",
        args: [address ?? zeroAddress],
        chainId: base.id,
      },
      // [5] User claim status
      {
        address: CONTRACT_ADDRESSES.pool as `0x${string}`,
        abi: PINS_AND_FLAIR_ABI,
        functionName: "getUserClaimStatus",
        args: [address ?? zeroAddress],
        chainId: base.id,
      },
      // [6] Flair mint price
      {
        address: CONTRACT_ADDRESSES.pool as `0x${string}`,
        abi: DATA,
        functionName: "getFlairMintPrice",
        chainId: base.id,
      },
      // [7] Pin mint price
      {
        address: CONTRACT_ADDRESSES.pool as `0x${string}`,
        abi: DATA,
        functionName: "getPinMintPrice",
        chainId: base.id,
      },
    ],
    query: {
      enabled: !!address && !!CONTRACT_ADDRESSES.pool,
      refetchInterval: 10_000,
    },
  });

  // Extract results from batch
  const pinTokenId = batchData?.[0]?.result as bigint | undefined;
  const mintConfigData = batchData?.[1]?.result;
  const whitelistData = batchData?.[2]?.result as boolean | undefined;
  const pendingDepositData = batchData?.[3]?.result;
  const claimStatusData = batchData?.[4]?.result;
  const flairMintPrice = batchData?.[5]?.result as bigint | undefined;
  const pinMintPrice = batchData?.[6].result as bigint | undefined;

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
    return pinTokenId !== undefined && pinTokenId !== 0n;
  }, [pinTokenId]);

  const pinId = useMemo(() => {
    if (!hasPin || pinTokenId === undefined) return null;
    return pinTokenId.toString();
  }, [hasPin, pinTokenId]);

  // Read tokenURI from pin contract
  const { data: tokenUri } = useReadContract({
    address: CONTRACT_ADDRESSES.pin as `0x${string}`,
    abi: PIN_ABI,
    functionName: "tokenURI",
    args: [BigInt(pinId || "0")],
    chainId: base.id,
    query: {
      enabled: hasPin && !!pinId && !!CONTRACT_ADDRESSES.pin,
    },
  });

  const pinImageUrl = useMemo(() => {
    if (!tokenUri) return null;
    const encoded = tokenUri.split(",")[1];
    if (!encoded) return null;
    const decoded = atob(encoded);
    const metadata = JSON.parse(decoded);
    return resolveUri(metadata.image);
  }, [tokenUri]);

  const pinCid = useMemo(() => {
    if (!tokenUri) return null;
    const encoded = tokenUri.split(",")[1];
    if (!encoded) return null;
    const decoded = atob(encoded);
    const metadata = JSON.parse(decoded);
    const imageUri = metadata.image as string;
    if (imageUri.startsWith("ipfs://")) {
      return imageUri.slice(7);
    }
    return null;
  }, [tokenUri]);

  const refetchPinData = useCallback(async () => {
    await refetchBatch();
  }, [refetchBatch]);

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

  const mintPin = useCallback(
    async (useDonut: boolean) => {
      setIsMinting(true);

      if (!fUser || !fUser.fid) {
        toast.error("Frame user not available");
        setIsMinting(false);
        return;
      }

      const username =
        (fUser as any).username || (fUser as any).displayName || "";
      if (!username) {
        toast.error("Username not available");
        setIsMinting(false);
        return;
      }

      let imageUrl = "";

      try {
        const pin_data = await generate_pin(fUser.fid);
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
    },
    [executeMintPin, fUser]
  );

  return {
    hasPin,
    pinId,
    pinImageUrl: (pinImageUrl as string | null) ?? null,
    canMint,
    isLoading: fetchStatus === "fetching" && batchData === undefined,
    isMinting,
    mintConfig,
    isWhitelisted,
    pendingDeposit,
    claimStatus,
    pinMintPrice,
    flairMintPrice,
    mintPin,
    pinCid,
    refetchPinData,
  };
}
