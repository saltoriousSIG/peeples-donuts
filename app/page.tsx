"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PoolProvider } from "@/providers/PoolProvider";
import { PinApp } from "@/components/pin-app";
import type { ModalType } from "@/components/modals";

function HomePageContent() {
  const searchParams = useSearchParams();
  const featureParam = searchParams.get("feature");

  // Map feature query param to modal type
  const getInitialModal = (): ModalType => {
    if (featureParam === "pool") return "pool";
    if (featureParam === "auction") return "auction";
    if (featureParam === "flair" || featureParam === "pins") return "flair";
    if (featureParam === "about") return "about";
    return null;
  };

  return (
    <PoolProvider>
      <PinApp initialModal={getInitialModal()} />
    </PoolProvider>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-[#FDF6E3] flex items-center justify-center">
        <div className="text-8xl animate-pulse">🍩</div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
