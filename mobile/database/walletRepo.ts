import { getDatabase } from './db';
import { PaymentResult, ProcessPaymentParams, PaymentTransaction } from '../types';

export const getWalletBalance = (): number => {
  const db = getDatabase();
  const row = db.getFirstSync<{ balance: number }>('SELECT balance FROM wallet WHERE id = "default_wallet"');
  return row ? row.balance : 10000.00;
};

export const addDemoFunds = (amountToAdd: number = 5000): number => {
  const db = getDatabase();
  db.runSync(
    `UPDATE wallet 
     SET balance = balance + ?, updated_at = datetime('now') 
     WHERE id = "default_wallet"`,
    [amountToAdd]
  );
  return getWalletBalance();
};

export const executeSimulatedPayment = (
  params: ProcessPaymentParams
): PaymentResult => {
  const db = getDatabase();
  const currentBalance = getWalletBalance();

  // 1. Critical risk transactions must be blocked
  if (params.riskCategory === 'RED') {
    const txId = 'tx_blk_' + Math.random().toString(36).substring(2, 9);
    const txRef = 'REF-BLK-' + Date.now().toString().slice(-8);

    db.runSync(
      `INSERT INTO transactions (
        id, transaction_ref, receiver_name, upi_id, amount, currency,
        transaction_note, risk_category, risk_score, risk_reasons, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'BLOCKED')`,
      [
        txId,
        txRef,
        params.receiverName,
        params.upiId,
        params.amount,
        params.currency || 'INR',
        params.transactionNote || 'Blocked high risk transaction',
        params.riskCategory,
        params.riskScore,
        JSON.stringify(params.riskReasons),
      ]
    );

    return {
      success: false,
      code: 'BLOCKED_HIGH_RISK',
      error: 'Transaction blocked because critical risk indicators were detected.',
    };
  }

  // 2. Validate wallet balance
  if (currentBalance < params.amount) {
    return {
      success: false,
      code: 'INSUFFICIENT_FUNDS',
      error: `Insufficient wallet balance. Available: ₹${currentBalance.toLocaleString('en-IN')}, Required: ₹${params.amount.toLocaleString('en-IN')}`,
    };
  }

  // 3. Execute atomic transaction
  const txId = 'tx_' + Math.random().toString(36).substring(2, 10);
  const txRef = 'REF' + Date.now().toString().slice(-8) + Math.floor(100 + Math.random() * 900);
  const now = new Date().toISOString();

  let transactionRecord: PaymentTransaction | null = null;

  try {
    db.withTransactionSync(() => {
      // Decrement wallet balance
      const updateResult = db.runSync(
        `UPDATE wallet 
         SET balance = balance - ?, updated_at = datetime('now')
         WHERE id = "default_wallet" AND balance >= ?`,
        [params.amount, params.amount]
      );

      if (updateResult.changes === 0) {
        throw new Error('Failed to deduct from wallet balance. Insufficient funds.');
      }

      // Record transaction
      db.runSync(
        `INSERT INTO transactions (
          id, transaction_ref, receiver_name, upi_id, amount, currency,
          transaction_note, risk_category, risk_score, risk_reasons, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SUCCESS')`,
        [
          txId,
          txRef,
          params.receiverName,
          params.upiId,
          params.amount,
          params.currency || 'INR',
          params.transactionNote || '',
          params.riskCategory,
          params.riskScore,
          JSON.stringify(params.riskReasons),
        ]
      );

      transactionRecord = {
        id: txId,
        transactionRef: txRef,
        receiverName: params.receiverName,
        upiId: params.upiId,
        amount: params.amount,
        currency: params.currency || 'INR',
        transactionNote: params.transactionNote,
        riskCategory: params.riskCategory,
        riskScore: params.riskScore,
        riskReasons: params.riskReasons,
        status: 'SUCCESS',
        createdAt: now,
      };
    });

    if (transactionRecord) {
      return {
        success: true,
        transaction: transactionRecord,
      };
    } else {
      return {
        success: false,
        code: 'UNKNOWN',
        error: 'Transaction could not be confirmed.',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      code: 'UNKNOWN',
      error: err.message || 'Payment execution failed.',
    };
  }
};

export const resetWalletAndHistory = (): void => {
  const db = getDatabase();
  db.withTransactionSync(() => {
    db.runSync(`DELETE FROM transactions`);
    db.runSync(`UPDATE wallet SET balance = 10000.00, updated_at = datetime('now') WHERE id = "default_wallet"`);
  });
};
