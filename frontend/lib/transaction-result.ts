import type { SuiClientTypes } from '@mysten/sui/client';

export type SignAndExecuteEffectsResult = SuiClientTypes.TransactionResult<{
  effects: true;
  transaction: true;
  bcs: true;
}>;

/**
 * Unwraps dApp Kit signAndExecuteTransaction result; throws on chain failure.
 */
export function getExecutedTransactionDigest(result: SignAndExecuteEffectsResult): string {
  if (result.$kind === 'FailedTransaction') {
    const err = result.FailedTransaction.status;
    const msg =
      typeof err === 'object' && err !== null && 'error' in err
        ? String((err as { error?: unknown }).error)
        : JSON.stringify(err);
    throw new Error(msg || 'Transaction failed');
  }
  return result.Transaction.digest;
}
