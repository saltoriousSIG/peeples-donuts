import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const PEEPLES_TOKEN_ID = 591480;

export async function GET(req: NextRequest) {
  try {
    const {
      data: { data },
    } = await axios.get(
      "https://www.clanker.world/api/tokens?fids=483713&includeMarket=true"
    );
    const peeplesToken = data.find(
      (token: any) => token.id === PEEPLES_TOKEN_ID
    );
    return NextResponse.json({
      success: true,
      peeples_price: peeplesToken.priceUsd || 0,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Unknown error" },
      { status: 500 }
    );
  }
}
