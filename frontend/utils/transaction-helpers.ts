export interface TransactionResult {
  digest: string;
  effects?: any;
}

export function isTransactionSuccessful(result: TransactionResult): boolean {
  if (!result.effects) {
    return true;
  }
  
  if (typeof result.effects === 'string') {
    return true;
  }
  
  if (typeof result.effects === 'object' && result.effects.status) {
    return result.effects.status.status === 'success';
  }
  
  return true;
}

export function getTransactionError(result: TransactionResult): string | null {
  if (!result.effects) {
    return null;
  }
  
  if (typeof result.effects === 'string') {
    return null;
  }
  
  if (typeof result.effects === 'object' && result.effects.status) {
    if (result.effects.status.status === 'failure') {
      return result.effects.status.error || 'Transaction failed';
    }
  }
  
  return null;
}

