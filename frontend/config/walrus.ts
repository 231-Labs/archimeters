/**
 * Walrus 配置
 * 統一管理 Walrus 相關的 URL 和設置
 */

export const WALRUS_CONFIG = {
  // Walrus Aggregator URL for reading data
  AGGREGATOR_URL: 'https://aggregator.testnet.walrus.atalma.io/v1/blobs',
  
  // Get complete blob URL
  getBlobUrl: (blobId: string) => `https://aggregator.testnet.walrus.atalma.io/v1/blobs/${blobId}`,
  
  // Epochs for upload retention period
  DEFAULT_EPOCHS: 1,
} as const;

// Export utility functions
export const getWalrusBlobUrl = WALRUS_CONFIG.getBlobUrl;

