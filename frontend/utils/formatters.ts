/**
 * Formatting utilities for displaying Sui amounts and other data
 */

export const MIST_PER_SUI = 1_000_000_000;

/**
 * Format Sui amount from MIST to SUI with proper decimal places
 * @param mist - Amount in MIST (smallest unit)
 * @returns Formatted string with SUI label
 */
export function formatSuiAmount(mist: number | string): string {
  const mistValue = typeof mist === 'string' ? parseInt(mist, 10) : mist;
  
  if (isNaN(mistValue) || mistValue < 0) {
    return '0 SUI';
  }
  
  const sui = mistValue / MIST_PER_SUI;
  
  if (sui === 0) {
    return '0 SUI';
  } else if (sui >= 1) {
    // For amounts >= 1 SUI, show 2 decimal places
    return `${sui.toFixed(2)} SUI`;
  } else if (sui >= 0.01) {
    // For amounts >= 0.01 SUI, show 4 decimal places
    return `${sui.toFixed(4)} SUI`;
  } else {
    // For very small amounts, show 6 decimal places or scientific notation
    if (sui >= 0.000001) {
      return `${sui.toFixed(6)} SUI`;
    } else {
      return `${sui.toExponential(2)} SUI`;
    }
  }
}

/**
 * Format Sui amount with custom precision
 * @param mist - Amount in MIST
 * @param decimals - Number of decimal places (default: 4)
 * @returns Formatted string
 */
export function formatSuiWithPrecision(mist: number | string, decimals: number = 4): string {
  const mistValue = typeof mist === 'string' ? parseInt(mist, 10) : mist;
  
  if (isNaN(mistValue) || mistValue < 0) {
    return '0';
  }
  
  const sui = mistValue / MIST_PER_SUI;
  return sui.toFixed(decimals);
}

/**
 * Format address for display (truncated)
 * @param address - Full Sui address
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns Truncated address
 */
export function formatAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!address || address.length <= startChars + endChars) {
    return address;
  }
  
  return `${address.substring(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format timestamp to readable date
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string
 */
export function formatDate(timestamp: number | string): string {
  const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
  
  if (isNaN(ts)) {
    return 'Invalid date';
  }
  
  const date = new Date(ts);
  
  // Format: "Jan 1, 2024"
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format timestamp to relative time
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: number | string): string {
  const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
  
  if (isNaN(ts)) {
    return 'Invalid date';
  }
  
  const now = Date.now();
  const diff = now - ts;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 30) {
    return formatDate(ts);
  } else if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

/**
 * Format number with thousands separators
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number | string): string {
  const value = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(value)) {
    return '0';
  }
  
  return value.toLocaleString('en-US');
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatSuiPrice(priceInMist: string | number): string {
  const numPrice = typeof priceInMist === 'string' ? parseInt(priceInMist) : priceInMist;
  const scaled = numPrice / MIST_PER_SUI;
  return scaled.toFixed(9).replace(/\.?0+$/, '');
}

export function extractBlobId(url: string): string | null {
  if (!url) return null;
  const regex = /\/blobs\/([A-Za-z0-9_-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
