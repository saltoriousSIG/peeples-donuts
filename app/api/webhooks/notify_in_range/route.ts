import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  if (
    req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();

    const { fids } = body;

    await axios.post(
      `https://api.neynar.com/v2/farcaster/frame/notifications`,
      {
        notification: {
          title: `The pool is in buy range!`,
          body: "Buy King Glazer on behalf of the pool, and earn 25K $PEEPLES",
          target_url: "https://peeplesdonuts.com/pool",
        },
        target_fids: [...fids],
      },
      {
        headers: {
          "x-api-key": process.env.NEYNAR_API_KEY as string,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "notification sent",
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Unknown error" },
      { status: 500 }
    );
  }
}
