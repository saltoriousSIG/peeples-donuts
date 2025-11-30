import { NextRequest, NextResponse } from "next/server";
import { verifySignature } from "@/lib/verifySignature";
import setupAdminWallet from "@/lib/setupAdminWallet";
import { decodeEventLog } from "viem";

export async function GET(req: NextRequest) {
  try {
    const signature = req.headers.get("x-qn-signature") as string;
    const secret = process.env.QN_WEBHOOK_SECRET as string;
    const isValid = verifySignature(
      secret,
      JSON.stringify(req.body),
      req.headers.get("x-qn-nonce") as string,
      req.headers.get("x-qn-timestamp") as string,
      signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature." },
        { status: 401 }
      );
    }

    const { publicClient } = setupAdminWallet();

    const body = await req.json();
    if (body.length > 0) {
      console.log(
        "Glazed event fired vvv =============================================================================================== vvv"
      );
    }


    // Process the webhook payload as needed
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Unknown error" },
      { status: 500 }
    );
  }
}
