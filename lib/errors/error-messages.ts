export interface ErrorMessageMapping {
  title: string;
  message: string;
  action?: string;
}

export const CONTRACT_ERROR_MESSAGES: Record<string, ErrorMessageMapping> = {
  // Blazery Contract Errors
  'Blazery__DeadlinePassed': {
    title: 'Transaction Expired',
    message: 'The deadline has passed for this transaction.',
    action: 'Please try again with a new transaction.',
  },
  'Blazery__EmptyAssets': {
    title: 'No Assets Selected',
    message: 'You must select at least one asset to proceed.',
    action: 'Select assets and try again.',
  },
  'Blazery__EpochIdMismatch': {
    title: 'Auction Period Mismatch',
    message: 'The auction period has changed since you started.',
    action: 'Please refresh and try again.',
  },
  'Blazery__MaxPaymentAmountExceeded': {
    title: 'Price Increased',
    message: 'The cost exceeds your maximum payment amount.',
    action: 'Please increase your maximum payment or try again later.',
  },

  // Pool/Ownership Errors
  'Ownable__NotOwner': {
    title: 'Permission Denied',
    message: 'You do not have permission to perform this action.',
    action: 'Only the contract owner can perform this operation.',
  },
  'ReentrancyGuard__ReentrantCall': {
    title: 'Transaction In Progress',
    message: 'A transaction is already in progress.',
    action: 'Please wait for the current transaction to complete.',
  },

  // Common ERC20/Token Errors
  'ERC20InsufficientBalance': {
    title: 'Insufficient Token Balance',
    message: 'You do not have enough tokens for this transaction.',
    action: 'Check your balance and try again.',
  },
  'ERC20InsufficientAllowance': {
    title: 'Approval Required',
    message: 'You need to approve the contract to spend your tokens.',
    action: 'Approve the transaction first, then try again.',
  },

  // Common Generic Errors
  'InsufficientFunds': {
    title: 'Insufficient Funds',
    message: 'You do not have enough funds for this transaction.',
    action: 'Add funds to your wallet and try again.',
  },
  'TransferFailed': {
    title: 'Transfer Failed',
    message: 'The token transfer could not be completed.',
    action: 'Please check your balance and try again.',
  },
};

export const GENERIC_ERROR_MESSAGES = {
  USER_REJECTED: {
    title: 'Transaction Cancelled',
    message: 'You cancelled the transaction in your wallet.',
  },
  INSUFFICIENT_GAS: {
    title: 'Insufficient ETH',
    message: 'You do not have enough ETH to cover gas fees.',
    action: 'Add ETH to your wallet and try again.',
  },
  NETWORK_ERROR: {
    title: 'Network Error',
    message: 'Unable to connect to the network.',
    action: 'Check your connection and try again.',
  },
  UNKNOWN: {
    title: 'Transaction Failed',
    message: 'An unexpected error occurred.',
    action: 'Please try again or contact support if the issue persists.',
  },
};
