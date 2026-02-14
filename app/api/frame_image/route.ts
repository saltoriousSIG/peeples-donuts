import { NextRequest } from "next/server";
import { resolvePinImageUrl } from "@/lib/resolve-pin-image";

export async function GET(req: NextRequest) {
  const fid = req.nextUrl.searchParams.get("fid");

  if (!fid) {
    return new Response("Missing fid", { status: 400 });
  }

  try {
    const pinUrl = await resolvePinImageUrl(Number(fid));
    if (!pinUrl) {
      return new Response("Pin not found", { status: 404 });
    }

    const res = await fetch(pinUrl);
    const buffer = Buffer.from(await res.arrayBuffer());

    return new Response(buffer, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[frame_image] Error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
