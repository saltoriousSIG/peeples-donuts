// Peeples Donuts Contract Types
// This file contains TypeScript types for contract enums and structs

// =============================================================================
// ENUMS
// =============================================================================

/**
 * Strategy enum - defines the pool strategy types
 * Used in voting and pool configuration
 */
export enum Strategy {
  MINING = 0,
  TELLER = 1,
  LSG = 2,
  BALANCED = 3,
}

/**
 * FlairRarity enum - defines the rarity levels for flair items
 * Used in flair purchasing, fusion, and yield calculations
 */
export enum FlairRarity {
  COMMON = 0,
  UNCOMMON = 1,
  RARE = 2,
  LEGENDARY = 3,
}

/**
 * FeeTypes enum - defines fee type categories
 */
export enum FeeTypes {
  PIN_MINT = 0,
  FLAIR_MINT = 1,
  FLAIR_FUSE = 2,
}

// =============================================================================
// DATA FACET STRUCTS
// =============================================================================

/**
 * WithdrawalAmounts - returned by calculateWithdrawalAmounts
 */
export interface WithdrawalAmounts {
  wethOut: bigint;
  donutOut: bigint;
}

/**
 * PoolState - comprehensive pool state information
 */
export interface PoolState {
  isActive: boolean;
  wethBalance: bigint;
  donutBalance: bigint;
  availableWeth: bigint;
  availableDonut: bigint;
  pendingClaimWeth: bigint;
  pendingClaimDonut: bigint;
  totalShares: bigint;
  activatedTime: bigint;
  purchasePrice: bigint;
  numPoolParticipants: bigint;
  minerEpochId: number;
}

/**
 * Addresses - contract address configuration
 */
export interface Addresses {
  miner: `0x${string}`;
  weth: `0x${string}`;
  donut: `0x${string}`;
  shareToken: `0x${string}`;
  multicall: `0x${string}`;
}

/**
 * SharePrice - current share price in both tokens
 */
export interface SharePrice {
  wethPerShare: bigint;
  donutPerShare: bigint;
}

/**
 * TVL - total value locked
 */
export interface TVL {
  wethTVL: bigint;
  donutTVL: bigint;
}

/**
 * Stats - pool statistics
 */
export interface Stats {
  totalDeposited: bigint;
  totalDonutEarned: bigint;
  totalWethEarned: bigint;
  totalBuys: bigint;
}

/**
 * UserInfo - comprehensive user information
 */
export interface UserInfo {
  shares: bigint;
  sharePercentage: bigint;
  wethValue: bigint;
  donutValue: bigint;
  hasPendingWithdrawal: boolean;
  hasPendingClaim: boolean;
}

/**
 * ReturnedEpoch - epoch information from getEpoch
 */
export interface ReturnedEpoch {
  epochId: bigint;
  start_time: bigint;
  end_time: bigint;
  totalPoolAssets: bigint;
  miningBuffer: bigint;
  bufferBps: bigint;
  deployableCapital: bigint;
  finalized: boolean;
}

/**
 * AuctionInfo - current auction state
 */
export interface AuctionInfo {
  auctionId: bigint;
  endTime: bigint;
  highestBidder: `0x${string}`;
  highestBid: bigint;
  feeRecipient: `0x${string}`;
  ended: boolean;
}

/**
 * AuctionConfig - auction configuration
 */
export interface AuctionConfig {
  duration: bigint;
  minBidIncrement: bigint;
  blazeryContract: `0x${string}`;
  defaultFeeRecipient: `0x${string}`;
}

/**
 * RebalanceInfo - rebalance state information
 */
export interface RebalanceInfo {
  thresholdBps: bigint;
  lastRebalanceTime: bigint;
  lastRebalancer: `0x${string}`;
  lastDonutSwapped: bigint;
  lastWethBought: bigint;
}

// =============================================================================
// LIB PEEPLES STRUCTS
// =============================================================================

/**
 * Pin - pin NFT with equipped flair
 */
export interface Pin {
  pinId: bigint;
  owner: `0x${string}`;
  equippedFlairIds: [bigint, bigint, bigint];
}

/**
 * FlairType - flair type configuration
 */
export interface FlairType {
  tokenId: bigint;
  strategyId: `0x${string}`;
  weight: bigint;
  name: string;
  metadataURI: string;
  rarity: FlairRarity;
  totalMinted: bigint;
  poolFee: bigint;
}

/**
 * Config - main protocol configuration
 */
export interface Config {
  minDeposit: bigint;
  minPoolSize: bigint;
  duration: bigint;
  maxPriceBps: bigint;
  messagePrice: bigint;
  feeRecipient: `0x${string}`;
  reward: RewardConfig;
  vote: VoteConfig;
  strategy: Strategy;
}

/**
 * RewardConfig - reward configuration
 */
export interface RewardConfig {
  peeplesReward: bigint;
  peeplesToken: `0x${string}`;
}

/**
 * VoteConfig - voting configuration
 */
export interface VoteConfig {
  holdingsRequirement: bigint;
  epochTimestamp: bigint;
  epochDuration: bigint;
}

/**
 * Claim - pending claim amounts
 */
export interface Claim {
  weth: bigint;
  donut: bigint;
}

/**
 * PendingWithdrawal - pending withdrawal information
 */
export interface PendingWithdrawal {
  shares: bigint;
  snapshotTotalShares: bigint;
}

/**
 * Vote - vote record
 */
export interface Vote {
  strategy: Strategy;
  voter: `0x${string}`;
}

/**
 * StrategyConfig - strategy configuration
 */
export interface StrategyConfig {
  strategyId: `0x${string}`;
  name: string;
  strategyAddress: `0x${string}`;
  rewardsToken: `0x${string}`;
  isTeller: boolean;
  active: boolean;
  id: number;
}

/**
 * FeeSplit - fee distribution configuration
 */
export interface FeeSplit {
  blazeryBps: bigint;
  poolBps: bigint;
  treasuryBps: bigint;
}

/**
 * TellerStakeConfig - Teller staking configuration
 */
export interface TellerStakeConfig {
  tellerDonutVaultAddress: `0x${string}`;
  tellerDonutStakeAddress: `0x${string}`;
  vaultedShares: bigint;
}

/**
 * LSGStakeConfig - LSG staking configuration
 */
export interface LSGStakeConfig {
  gDonut: `0x${string}`;
  lsgVault: `0x${string}`;
}

// =============================================================================
// PINS AND FLAIR STRUCTS
// =============================================================================

/**
 * PinMintConfig - pin minting configuration
 */
export interface PinMintConfig {
  price: bigint;
  merkleRoot: `0x${string}`;
  requireWhitelist: boolean;
}

/**
 * UserClaimStatus - user's claim status
 */
export interface UserClaimStatus {
  hasPendingShares: boolean;
  pendingShareAmount: bigint;
}

/**
 * PendingDepositInfo - user's pending deposit information
 */
export interface PendingDepositInfo {
  wethAmount: bigint;
  donutAmount: bigint;
}

// =============================================================================
// FLASH LOAN STRUCTS
// =============================================================================

/**
 * MinimumBid - minimum bid information
 */
export interface MinimumBid {
  minBid: bigint;
  willStartNewAuction: boolean;
}

// =============================================================================
// HELPER TYPES
// =============================================================================

/**
 * Helper type for strategy names
 */
export const STRATEGY_NAMES: Record<Strategy, string> = {
  [Strategy.MINING]: "Mining",
  [Strategy.TELLER]: "Teller",
  [Strategy.LSG]: "LSG",
  [Strategy.BALANCED]: "Balanced",
};

/**
 * Helper type for flair rarity names
 */
export const FLAIR_RARITY_NAMES: Record<FlairRarity, string> = {
  [FlairRarity.COMMON]: "Common",
  [FlairRarity.UNCOMMON]: "Uncommon",
  [FlairRarity.RARE]: "Rare",
  [FlairRarity.LEGENDARY]: "Legendary",
};

/**
 * Helper type for fee type names
 */
export const FEE_TYPE_NAMES: Record<FeeTypes, string> = {
  [FeeTypes.PIN_MINT]: "Pin Mint",
  [FeeTypes.FLAIR_MINT]: "Flair Mint",
  [FeeTypes.FLAIR_FUSE]: "Flair Fuse",
};
