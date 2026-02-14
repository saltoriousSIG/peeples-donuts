// Peeples Donuts ABI Exports
// This file provides convenient exports for all ABIs and types

// Diamond Facet ABIs
export { DEPOSIT } from "./deposit";
export { WITHDRAW } from "./withdraw";
export { CLAIM } from "./claim";
export { DATA } from "./data";
export { VOTE } from "./vote";
export { AUCTION_ABI } from "./auction";
export { FLASH_LOAN_ABI } from "./flash-loan";
export { PINS_AND_FLAIR_ABI } from "./pins-and-flair";
export { DIAMOND_MULTICALL } from "./diamond_multicall";

// External Token Contract ABIs
export { PIN_ABI } from "./pin";
export { FLAIR_ABI } from "./flair";
export { ERC20 } from "./erc20";

// Utility ABIs
export { MULTICALL_ABI } from "./multicall";
export { PEEPLES_BLAZERY } from "./peeples-blazery";

// Types
export * from "./types";

// Combined Diamond ABI for single contract interaction
import { DEPOSIT } from "./deposit";
import { WITHDRAW } from "./withdraw";
import { CLAIM } from "./claim";
import { DATA } from "./data";
import { VOTE } from "./vote";
import { AUCTION_ABI } from "./auction";
import { FLASH_LOAN_ABI } from "./flash-loan";
import { PINS_AND_FLAIR_ABI } from "./pins-and-flair";
import { DIAMOND_MULTICALL } from "./diamond_multicall";

/**
 * Combined ABI for the Diamond proxy contract
 * Use this when interacting with the diamond address
 */
export const DIAMOND_ABI = [
  ...DEPOSIT,
  ...WITHDRAW,
  ...CLAIM,
  ...DATA,
  ...VOTE,
  ...AUCTION_ABI,
  ...FLASH_LOAN_ABI,
  ...PINS_AND_FLAIR_ABI,
  ...DIAMOND_MULTICALL,
] as const;
