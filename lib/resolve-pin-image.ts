import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { PIN_ABI } from "@/lib/abi/pin";
import { DATA } from "@/lib/abi/data";

const PINATA_GATEWAY = "https://harlequin-eligible-urial-768.mypinata.cloud/ipfs";

const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org";

const publicClient = createPublicClient({
  chain: base,
  transport: http(rpcUrl),
});

/**
 * Resolves a Farcaster user's pin image URL from on-chain data.
 * FID → Neynar → wallet address → getUserPinId → tokenURI → Pinata URL
 * Returns null if any step fails.
 */
export async function resolvePinImageUrl(fid: number): Promise<string | null> {
  try {
    // 1. FID → wallet address via Neynar
    const address = await getAddressFromFid(fid);
    if (!address) return null;

    // 2. address → pin token ID
    const pinId = (await publicClient.readContract({
      address: CONTRACT_ADDRESSES.pool as `0x${string}`,
      abi: DATA,
      functionName: "getUserPinId",
      args: [address as `0x${string}`],
    })) as bigint;

    if (!pinId || pinId === 0n) return null;

    // 3. pinId → tokenURI (base64 encoded JSON)
    const tokenUri = (await publicClient.readContract({
      address: CONTRACT_ADDRESSES.pin as `0x${string}`,
      abi: PIN_ABI,
      functionName: "tokenURI",
      args: [pinId],
    })) as string;

    if (!tokenUri) return null;

    // 4. Decode metadata → Pinata image URL
    return resolveTokenUri(tokenUri);
  } catch (error) {
    console.error("[resolvePinImageUrl] Error:", error);
    return null;
  }
}

function getNeynarClient(): NeynarAPIClient | null {
  const apiKey = process.env.NEYNAR_API_KEY;
  return apiKey ? new NeynarAPIClient(apiKey) : null;
}

async function getAddressFromFid(fid: number): Promise<string | null> {
  const client = getNeynarClient();
  if (!client) return null;

  try {
    const res = await client.fetchBulkUsers([fid]);
    const user = res.users?.[0];
    if (!user) return null;

    const primary = (user.verified_addresses as any)?.primary?.eth_address;
    return primary || user.verified_addresses?.eth_addresses?.[0] || user.custody_address || null;
  } catch (error) {
    console.error("[resolvePinImageUrl] Neynar lookup failed:", error);
    return null;
  }
}

function resolveTokenUri(tokenUri: string): string | null {
  try {
    const encoded = tokenUri.split(",")[1];
    if (!encoded) return null;
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const metadata = JSON.parse(decoded);
    const imageUri = metadata.image as string;
    if (!imageUri) return null;

    if (imageUri.startsWith("ipfs://")) {
      return `${PINATA_GATEWAY}/${imageUri.slice(7)}`;
    }
    return imageUri;
  } catch {
    return null;
  }
}
