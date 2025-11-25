import "@/app/globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner"

const appDomain = "https://peeplesdonuts.com";
const heroImageUrl = `${appDomain}/media/peeles_donuts.png`;
const splashImageUrl = `${appDomain}/media/peeples_donuts.png`;

const miniAppEmbed = {
  version: "1",
  imageUrl: heroImageUrl,
  button: {
    title: "Peeples Donuts",
    action: {
      type: "launch_miniapp" as const,
      name: "Peeples Donuts",
      url: appDomain,
      splashImageUrl,
      splashBackgroundColor: "#FEE7EC",
    },
  },
};

export const metadata: Metadata = {
  title: "Peeples Donuts - Where you're family",
  description: "Claim the glaze factory and earn donuts on Base.",
  openGraph: {
    title: "Peeples Donuts - Where you're family",
    description: "Pool your ETH, and join the sweetest yield farm on Base.",
    url: appDomain,
    images: [
      {
        url: heroImageUrl,
      },
    ],
  },
  other: {
    "fc:miniapp": JSON.stringify(miniAppEmbed),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Toaster richColors />
      </body>
    </html>
  );
}
