import { PoolProvider } from "@/providers/PoolProvider";
import PoolPage from "@/components/pool-page";

export default function Home() {
  return (
    <PoolProvider>
      <PoolPage />
    </PoolProvider>
  );
}
