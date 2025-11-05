/**
 * Walrus 配置
 * 統一管理 Walrus 相關的 URL 和設置
 */

export const WALRUS_CONFIG = {
  // Walrus Aggregator URL（用於讀取數據）
  AGGREGATOR_URL: 'https://aggregator.testnet.walrus.atalma.io/v1/blobs',
  
  // 獲取完整的 blob URL
  getBlobUrl: (blobId: string) => `https://aggregator.testnet.walrus.atalma.io/v1/blobs/${blobId}`,
  
  // Epochs（上傳時的保存週期）
  DEFAULT_EPOCHS: 1,
} as const;

// 導出便捷函數
export const getWalrusBlobUrl = WALRUS_CONFIG.getBlobUrl;

