import { RiskCategory } from './qr';

export type TransactionStatus = 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'CANCELLED';

export interface WalletState {
  id: string;
  balance: number;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  transactionRef: string;
  receiverName: string;
  upiId: string;
  amount: number;
  currency: string;
  transactionNote?: string;
  riskCategory: RiskCategory;
  riskScore: number;
  riskReasons: string[];
  status: TransactionStatus;
  createdAt: string;
}

export interface ProcessPaymentParams {
  receiverName: string;
  upiId: string;
  amount: number;
  currency?: string;
  transactionNote?: string;
  riskCategory: RiskCategory;
  riskScore: number;
  riskReasons: string[];
  transactionPin: string;
}

export interface PaymentResult {
  success: boolean;
  transaction?: PaymentTransaction;
  error?: string;
  code?: 'INCORRECT_PIN' | 'INSUFFICIENT_FUNDS' | 'BLOCKED_HIGH_RISK' | 'UNKNOWN';
}
