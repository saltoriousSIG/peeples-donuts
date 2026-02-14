import { NextRequest, NextResponse } from "next/server";
import setupAdminWallet from "@/lib/setupAdminWallet";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { DATA } from "@/lib/abi/data";
import { MULTICALL_ABI } from "@/lib/abi/multicall";
import { MANAGE } from "@/lib/abi/manage";
import { zeroAddress } from "viem";

export async function GET(req: NextRequest) {
  try {
    if (
      req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { publicClient, account, walletClient } = setupAdminWallet();

    const poolState = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.pool as `0x${string}`,
      abi: DATA,
      functionName: "getPoolState",
      args: [],
    });


    //check if pool is active, if it isnt do nothing if it is, check if we are still king glazer, if we arent call check and finalize
    if (!poolState.isActive) {
      return NextResponse.json(
        { message: "Pool is not active" },
        { status: 200 }
      );
    } else {
      const minerState = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.multicall,
        abi: MULTICALL_ABI,
        functionName: "getMiner",
        args: [zeroAddress],
      });


      if (
        minerState.miner.toLowerCase() !== CONTRACT_ADDRESSES.pool.toLowerCase()
      ) {
        // not king glazer anymore finalize
        //
        const { request } = await publicClient.simulateContract({
          account,
          address: CONTRACT_ADDRESSES.pool as `0x${string}`,
          abi: MANAGE,
          functionName: "checkAndFinalize",
          args: [],
        });

        const hash = await walletClient.writeContract(request);

        // Wait for transaction confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        return NextResponse.json(
          { message: "Pool finalized", txHash: hash },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { message: "Still King Glazer, no action taken" },
          { status: 200 }
        );
      }
    }
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Unknown error" },
      { status: 500 }
    );
  }
}
