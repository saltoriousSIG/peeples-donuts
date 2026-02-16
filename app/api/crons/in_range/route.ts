import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import axios from "axios";
import setupAdminWallet from "@/lib/setupAdminWallet";
import { zeroAddress, formatUnits } from "viem";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { DATA } from "@/lib/abi/data";
import { MULTICALL_ABI } from "@/lib/abi/multicall";
import { ERC20 } from "@/lib/abi/erc20";
import { getBreakevenThreshold } from "@/lib/utils";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL as string,
  token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
});

export async function GET(req: NextRequest) {
  try {
    const hasAlreadyBeenNotified = await redis.get("notification_sent");

    const { publicClient } = setupAdminWallet();
    const minerState = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.multicall,
      abi: MULTICALL_ABI,
      functionName: "getMiner",
      args: [zeroAddress],
    });

    if (hasAlreadyBeenNotified === "true" || hasAlreadyBeenNotified) {
      if (minerState.miner !== CONTRACT_ADDRESSES.pool) {
        await redis.del("notification_sent");
        return NextResponse.json({
          success: true,
          message: "reset notification flag",
        });
      }
    }

    if (hasAlreadyBeenNotified === "false" || !hasAlreadyBeenNotified) {
      const poolConfig = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.pool as `0x${string}`,
        abi: DATA,
        functionName: "getConfig",
        args: [],
      });

      const poolWETHBalance = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.weth,
        abi: ERC20,
        functionName: "balanceOf",
        args: [CONTRACT_ADDRESSES.pool],
      });

      const glazePrice = parseFloat(formatUnits(minerState?.price ?? 0n, 18));
      const poolWeth = parseFloat(formatUnits(poolWETHBalance ?? 0n, 18));
      const donutPrice = parseFloat(
        formatUnits(minerState?.donutPrice ?? 0n, 18),
      );
      const dps = parseFloat(formatUnits(minerState?.dps ?? 0n, 18));
      const strategy = poolConfig.strategy;
      const breakEvenSeconds = glazePrice / (donutPrice * dps);
      const targetBreakEven = getBreakevenThreshold(
        glazePrice,
        poolWeth,
        strategy,
      );

      const canBuy =
        targetBreakEven >= breakEvenSeconds / 60 && poolWeth >= glazePrice;

      if (canBuy) {
        const { data: holders } = await axios.get(
          "https://base.blockscout.com/api/v2/tokens/0xEcDdeE4B294230C24285D92c0Eab81E63B5c0655/holders",
        );
        const holder_addresses = holders.items
          .map((holder: any) => {
            return holder.address.hash;
          })
          .join(",");
        const { data: profiles } = await axios.get(
          `https://api.neynar.com/v2/farcaster/user/bulk-by-address/?addresses=${holder_addresses}`,
          {
            headers: {
              "x-api-key": process.env.NEYNAR_API_KEY as string,
            },
          },
        );
        const fids = Object.values(profiles).map(
          (profile: any) => profile[0].fid,
        );

        await axios.post(
          `https://api.neynar.com/v2/farcaster/frame/notifications`,
          {
            notification: {
              title: `The pool is in buy range!`,
              body: "Buy King Glazer on behalf of the pool, and earn 25K $PEEPLES",
              target_url: "https://peeplesdonuts.com",
            },
            target_fids: [...fids],
          },
          {
            headers: {
              "x-api-key": process.env.NEYNAR_API_KEY as string,
            },
          },
        );
        await redis.set("notification_sent", "true");

        return NextResponse.json({
          success: true,
          message: "notification sent",
        });
      }
      return NextResponse.json({
        success: true,
        message: "pool not in range",
      });
    }

    return NextResponse.json({ success: true, message: "alredy notified" });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Unknown error" },
      { status: 500 },
    );
  }
}
