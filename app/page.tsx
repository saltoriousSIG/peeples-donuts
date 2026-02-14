import type { Metadata } from "next";
import HomeClient from "./home-content";
const appDomain = process.env.NEXT_PUBLIC_APP_URL || "https://supervictorious-laurel-idyllically.ngrok-free.dev";
const fallbackImage = `${appDomain}/media/peeples_donuts.png`;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const fid = typeof params.fid === "string" ? params.fid : undefined;

  // Point to the frame_image route which resolves + resizes the pin image
  const imageUrl = fid
    ? `${appDomain}/api/frame_image?fid=${fid}`
    : fallbackImage;

  const launchUrl = fid ? `${appDomain}/?fid=${fid}` : appDomain;

  const miniAppEmbed = {
    version: "1",
    imageUrl,
    button: {
      title: "Peeples Donuts",
      action: {
        type: "launch_miniapp",
        name: "Peeples Donuts",
        url: launchUrl,
        splashImageUrl: fallbackImage,
        splashBackgroundColor: "#FEE7EC",
      },
    },
  };

  return {
    title: "Peeples Donuts - Where you're family",
    description: "Claim the glaze factory and earn donuts on Base.",
    openGraph: {
      title: "Peeples Donuts - Where you're family",
      description: "Pool your ETH, and join the sweetest yield farm on Base.",
      url: appDomain,
      images: [{ url: imageUrl }],
    },
    other: {
      "fc:miniapp": JSON.stringify(miniAppEmbed),
    },
  };
}

export default function HomePage() {
  return <HomeClient />;
}
