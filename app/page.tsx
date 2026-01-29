"use client";

import { PoolProvider } from "@/providers/PoolProvider";
import { PinApp } from "@/components/pin-app";

export default function HomePage() {
  return (
    <PoolProvider>
      <PinApp />
    </PoolProvider>
  );
}
