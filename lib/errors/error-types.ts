export enum ErrorType {
  USER_REJECTED = 'user_rejected',
  INSUFFICIENT_FUNDS = 'insufficient_funds',
  CONTRACT_REVERT = 'contract_revert',
  NETWORK_ERROR = 'network_error',
  UNKNOWN = 'unknown',
}

export type ErrorSeverity = 'error' | 'warning';

export interface ParsedError {
  type: ErrorType;
  title: string;
  message: string;
  action?: string;
  severity: ErrorSeverity;
  technicalDetails?: string;
}

export interface ErrorContext {
  contractName?: string;
  functionName?: string;
  additionalInfo?: Record<string, unknown>;
}
