import { ErrorType, ParsedError, ErrorContext } from './error-types';
import {
  CONTRACT_ERROR_MESSAGES,
  GENERIC_ERROR_MESSAGES,
} from './error-messages';

/**
 * Parses blockchain/contract errors into user-friendly messages
 */
export function parseContractError(
  error: Error,
  context?: ErrorContext
): ParsedError {
  const errorMessage = error.message || String(error);
  const isDev = process.env.NODE_ENV === 'development';

  // 1. Check for user rejection
  if (isUserRejection(errorMessage)) {
    return {
      type: ErrorType.USER_REJECTED,
      ...GENERIC_ERROR_MESSAGES.USER_REJECTED,
      severity: 'warning',
      technicalDetails: isDev ? errorMessage : undefined,
    };
  }

  // 2. Check for insufficient funds/gas
  if (isInsufficientFunds(errorMessage)) {
    return {
      type: ErrorType.INSUFFICIENT_FUNDS,
      ...GENERIC_ERROR_MESSAGES.INSUFFICIENT_GAS,
      severity: 'error',
      technicalDetails: isDev ? errorMessage : undefined,
    };
  }

  // 3. Extract and map contract errors
  const contractError = extractContractError(errorMessage);
  if (contractError && CONTRACT_ERROR_MESSAGES[contractError]) {
    const mapping = CONTRACT_ERROR_MESSAGES[contractError];
    return {
      type: ErrorType.CONTRACT_REVERT,
      ...mapping,
      severity: 'error',
      technicalDetails: isDev ? errorMessage : undefined,
    };
  }

  // 4. Check for network errors
  if (isNetworkError(errorMessage)) {
    return {
      type: ErrorType.NETWORK_ERROR,
      ...GENERIC_ERROR_MESSAGES.NETWORK_ERROR,
      severity: 'error',
      technicalDetails: isDev ? errorMessage : undefined,
    };
  }

  // 5. Fallback to generic error
  const contextInfo = context
    ? ` (${context.contractName}.${context.functionName})`
    : '';

  return {
    type: ErrorType.UNKNOWN,
    ...GENERIC_ERROR_MESSAGES.UNKNOWN,
    severity: 'error',
    technicalDetails: isDev ? `${errorMessage}${contextInfo}` : undefined,
  };
}

/**
 * Checks if error is from user rejecting transaction
 */
function isUserRejection(message: string): boolean {
  const rejectionPatterns = [
    'user rejected',
    'user denied',
    'user cancelled',
    'rejected by user',
    'denied transaction',
    'user disapproved',
    'cancelled by user',
  ];

  const lowerMessage = message.toLowerCase();
  return rejectionPatterns.some((pattern) => lowerMessage.includes(pattern));
}

/**
 * Checks if error is due to insufficient funds
 */
function isInsufficientFunds(message: string): boolean {
  const fundsPatterns = [
    'insufficient funds',
    'insufficient balance',
    'exceeds balance',
    'gas * price + value',
  ];

  const lowerMessage = message.toLowerCase();
  return fundsPatterns.some((pattern) => lowerMessage.includes(pattern));
}

/**
 * Checks if error is network-related
 */
function isNetworkError(message: string): boolean {
  const networkPatterns = [
    'network error',
    'fetch failed',
    'failed to fetch',
    'network request failed',
    'could not connect',
    'timeout',
    'econnrefused',
  ];

  const lowerMessage = message.toLowerCase();
  return networkPatterns.some((pattern) => lowerMessage.includes(pattern));
}

/**
 * Extracts contract error name from error message
 * Handles various error formats from viem/wagmi
 */
function extractContractError(message: string): string | null {
  // Pattern 1: "execution reverted: ErrorName"
  const revertMatch = message.match(/execution reverted:?\s*([A-Z][A-Za-z0-9_]*)/);
  if (revertMatch) return revertMatch[1];

  // Pattern 2: "ContractFunctionRevertedError: ErrorName"
  const functionRevertMatch = message.match(/ContractFunctionRevertedError:?\s*([A-Z][A-Za-z0-9_]*)/);
  if (functionRevertMatch) return functionRevertMatch[1];

  // Pattern 3: Custom error in format "The contract function ... reverted with the following reason:\nErrorName"
  const reasonMatch = message.match(/reverted with the following reason:\s*([A-Z][A-Za-z0-9_]*)/);
  if (reasonMatch) return reasonMatch[1];

  // Pattern 4: Look for custom error pattern in message
  const customErrorMatch = message.match(/([A-Z][A-Za-z0-9_]*__[A-Z][A-Za-z0-9_]*)/);
  if (customErrorMatch) return customErrorMatch[1];

  return null;
}

/**
 * Formats parsed error for toast display
 * Returns object ready for toast.error() or toast.warning()
 */
export function formatErrorForToast(parsed: ParsedError): {
  title: string;
  description?: string;
} {
  const parts: string[] = [parsed.message];

  if (parsed.action) {
    parts.push(`\n💡 ${parsed.action}`);
  }

  // Only show technical details in development
  if (parsed.technicalDetails && process.env.NODE_ENV === 'development') {
    console.error('Technical error details:', parsed.technicalDetails);
  }

  return {
    title: parsed.title,
    description: parts.length > 1 ? parts.join('\n') : parsed.message,
  };
}
