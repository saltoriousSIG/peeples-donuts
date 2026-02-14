import { useMemo } from "react";
import { formatUnits } from "viem";
import { useQuery } from "@tanstack/react-query";
import { getEthPrice } from "@/lib/utils";
import { useMinerState } from "./useMinerState";

export function useDonutPriceUsd() {
  const { minerState } = useMinerState();
  const { data: ethPrice = 0 } = useQuery({
    queryKey: ["ethPrice"],
    queryFn: getEthPrice,
    staleTime: 60000,
    refetchInterval: 60000,
  });

  const donutPriceUsd = useMemo(() => {
    if (!minerState?.donutPrice || !ethPrice) return 0;
    return parseFloat(formatUnits(minerState.donutPrice, 18)) * ethPrice;
  }, [minerState?.donutPrice, ethPrice]);

  const donutPerEth = useMemo(() => {
    if (!minerState?.donutPrice) return 0;
    return  ethPrice / donutPriceUsd; 
  }, [donutPriceUsd, ethPrice]);


  return { donutPriceUsd, ethPrice, donutPerEth };
}
