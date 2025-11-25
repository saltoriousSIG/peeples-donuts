export const STRATEGY_NAMES = [
  "CONSERVATIVE",
  "MODERATE",
  "AGGRESSIVE",
  "DEGEN",
] as const;


export enum Strategy {
  CONSERVATIVE = 0,
  MODERATE = 1,
  AGGRESSIVE = 2,
  DEGEN = 3,
}

export const STRATEGY_NAME_MAPPING: Record<Strategy, string> = {
  [Strategy.CONSERVATIVE]: "Conservative",
  [Strategy.MODERATE]: "Moderate",
  [Strategy.AGGRESSIVE]: "Aggressive",
  [Strategy.DEGEN]: "Degen",
} as const;


export type Vote = {
  strategy: Strategy;
  voter: `0x${string}`;
};

export type PendingClaim = {
  weth: bigint;
  donut: bigint;
}

export type PoolConfig = {
  duration: bigint;
  feeRecipient: `0x${string}`;
  maxPriceBps: bigint;
  messagePrice: bigint;
  minDeposit: bigint;
  minPoolSize: bigint;
  reward: {
    peeplesReward: bigint;
    peeplesToken: `0x${string}`;
  };
  strategy: number;
  vote: {
    holdingsRequirement: bigint;
    epochTimestamp: bigint;
    epochDuration: bigint;
  };
};

export type PoolState = {
  activatedTime: bigint;
  availableDonut: bigint;
  availableWeth: bigint;
  donutBalance: bigint;
  isActive: boolean;
  minerEpochId: number;
  numPoolParticipants: bigint;
  pendingClaimDonut: bigint;
  pendingClaimWeth: bigint;
  purchasePrice: bigint;
  totalShares: bigint;
  wethBalance: bigint;
};

export type PoolTVL = {
  donutTVL: bigint;
  wethTVL: bigint;
};
