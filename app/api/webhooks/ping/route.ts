
import { NextRequest, NextResponse } from "next/server";
import {headers} from "next/headers";

export async function POST(req: NextRequest) {
  const headersList = await headers();
  if (
    headersList.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
 try {
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
