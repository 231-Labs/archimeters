/**
 * Parameter Offset Utilities
 * 
 * These utilities handle the conversion between user-facing parameter values
 * (which can be negative) and on-chain parameter values (which must be u64).
 * 
 * IMPORTANT: This must match the logic in useParameters.ts exportParameterRules()
 * 
 * Conversion formula (matching Design Publisher):
 * - Step 1: Apply offset to make non-negative: value_offset = value - minValue
 * - Step 2: Convert to basis points: value_on_chain = value_offset * 100
 * 
 * Combined: value_on_chain = (value - minValue) * 100
 * Reverse: value = (value_on_chain / 100) + minValue
 * 
 * The * 100 is for basis points precision (allows 2 decimal places).
 */

export const BASIS_POINTS = 100;

/**
 * Convert a user-facing parameter value to on-chain value
 * @param value - User input value (can be negative)
 * @param minValue - The minimum value from the parameter definition (used as offset)
 * @returns On-chain value (always non-negative u64, in basis points)
 * 
 * Example: value=-30, minValue=-30 → ((-30) - (-30)) * 100 = 0
 * Example: value=30, minValue=-30 → (30 - (-30)) * 100 = 6000
 */
export function toChainValue(value: number, minValue: number): number {
  return Math.round((value - minValue) * BASIS_POINTS);
}

/**
 * Convert an on-chain parameter value back to user-facing value
 * @param chainValue - Value stored on-chain (u64, in basis points)
 * @param minValue - The minimum value from the parameter definition (used as offset)
 * @returns User-facing value (can be negative)
 * 
 * Example: chainValue=0, minValue=-30 → (0 / 100) + (-30) = -30
 * Example: chainValue=6000, minValue=-30 → (6000 / 100) + (-30) = 30
 */
export function fromChainValue(chainValue: number, minValue: number): number {
  return (chainValue / BASIS_POINTS) + minValue;
}

/**
 * Convert multiple parameters to on-chain values
 * @param userParams - User-facing parameter values
 * @param parameterMetadata - Parameter metadata containing minValue for each param
 * @returns Object with keys and chain values arrays
 */
export function convertParamsToChain(
  userParams: Record<string, number>,
  parameterMetadata: Record<string, { minValue?: number; min?: number; originalMin?: number }>
): { keys: string[], values: number[] } {
  const keys: string[] = [];
  const values: number[] = [];

  Object.entries(userParams).forEach(([key, value]) => {
    const metadata = parameterMetadata[key];
    if (metadata && typeof value === 'number') {
      keys.push(key);
      // Support multiple field names for minimum value
      const minValue = metadata.minValue ?? metadata.originalMin ?? metadata.min ?? 0;
      values.push(toChainValue(value, minValue));
    }
  });

  return { keys, values };
}

/**
 * Convert multiple parameters from on-chain values back to user-facing values
 * @param paramKeys - Array of parameter keys
 * @param paramValues - Array of on-chain values (in basis points)
 * @param parameterMetadata - Parameter metadata containing minValue for each param
 * @returns Object mapping parameter keys to user-facing values
 */
export function convertParamsFromChain(
  paramKeys: string[],
  paramValues: number[],
  parameterMetadata: Record<string, { minValue?: number; min?: number; originalMin?: number }>
): Record<string, number> {
  const result: Record<string, number> = {};

  paramKeys.forEach((key, index) => {
    const metadata = parameterMetadata[key];
    if (metadata) {
      // Support multiple field names for minimum value
      const minValue = metadata.minValue ?? metadata.originalMin ?? metadata.min ?? 0;
      result[key] = fromChainValue(paramValues[index], minValue);
    }
  });

  return result;
}

