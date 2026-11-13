import { getDatabase } from './db';
import { PaymentTransaction, TransactionStatus, RiskCategory } from '../types';

interface RawTransactionRow {
  id: string;
  transaction_ref: string;
  receiver_name: string;
  upi_id: string;
  amount: number;
  currency: string;
  transaction_note: string | null;
  risk_category: string;
  risk_score: number;
  risk_reasons: string | null;
  status: string;
  created_at: string;
}

const mapRowToTransaction = (row: RawTransactionRow): PaymentTransaction => {
  let reasons: string[] = [];
  try {
    if (row.risk_reasons) {
      reasons = JSON.parse(row.risk_reasons);
    }
  } catch {
    reasons = [];
  }

  return {
    id: row.id,
    transactionRef: row.transaction_ref,
    receiverName: row.receiver_name,
    upiId: row.upi_id,
    amount: row.amount,
    currency: row.currency,
    transactionNote: row.transaction_note || undefined,
    riskCategory: row.risk_category as RiskCategory,
    riskScore: row.risk_score,
    riskReasons: reasons,
    status: row.status as TransactionStatus,
    createdAt: row.created_at,
  };
};

export const getAllTransactions = (
  statusFilter?: 'ALL' | 'SUCCESS' | 'BLOCKED',
  searchQuery?: string
): PaymentTransaction[] => {
  const db = getDatabase();
  let query = 'SELECT * FROM transactions WHERE 1=1';
  const params: any[] = [];

  if (statusFilter && statusFilter !== 'ALL') {
    query += ' AND status = ?';
    params.push(statusFilter);
  }

  if (searchQuery && searchQuery.trim().length > 0) {
    query += ' AND (receiver_name LIKE ? OR upi_id LIKE ?)';
    const term = `%${searchQuery.trim()}%`;
    params.push(term, term);
  }

  query += ' ORDER BY created_at DESC';

  const rows = db.getAllSync<RawTransactionRow>(query, params);
  return rows.map(mapRowToTransaction);
};

export const getRecentTransactions = (limit: number = 5): PaymentTransaction[] => {
  const db = getDatabase();
  const rows = db.getAllSync<RawTransactionRow>(
    'SELECT * FROM transactions ORDER BY created_at DESC LIMIT ?',
    [limit]
  );
  return rows.map(mapRowToTransaction);
};

export const getTransactionById = (id: string): PaymentTransaction | null => {
  const db = getDatabase();
  const row = db.getFirstSync<RawTransactionRow>(
    'SELECT * FROM transactions WHERE id = ?',
    [id]
  );
  return row ? mapRowToTransaction(row) : null;
};
