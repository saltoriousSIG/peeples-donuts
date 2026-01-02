import AuctionPage from "@/components/auction-page";
import { PoolProvider } from "@/providers/PoolProvider";


export default function Home() {
    return (
        <PoolProvider>
            <AuctionPage />
        </PoolProvider >
    );
}
