import type { SuiClientTypes } from '@mysten/sui/client';

export type TransactionEffectsResult = SuiClientTypes.TransactionResult<{ effects: true }>;

export function isTransactionSuccessful(result: TransactionEffectsResult): boolean {
  if (result.$kind === 'FailedTransaction') {
    return false;
  }
  return result.Transaction.status.success === true;
}

export function getTransactionError(result: TransactionEffectsResult): string | null {
  if (result.$kind === 'FailedTransaction') {
    const st = result.FailedTransaction.status;
    if (typeof st === 'object' && st !== null && 'error' in st && st.error) {
      return String((st as { error: unknown }).error);
    }
    return 'Transaction failed';
  }
  if (!result.Transaction.status.success) {
    const err = result.Transaction.status.error;
    return err ? JSON.stringify(err) : 'Transaction failed';
  }
  return null;
}

export function getEffectsResultDigest(result: TransactionEffectsResult): string {
  if (result.$kind === 'FailedTransaction') {
    return result.FailedTransaction.digest;
  }
  return result.Transaction.digest;
}
