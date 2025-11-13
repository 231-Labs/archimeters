export const MARKETPLACE_CONFIG = {
  ROYALTY_BPS: 1000,
  
  calculateRoyalty(priceInMist: string | number): number {
    const price = typeof priceInMist === 'string' ? parseInt(priceInMist) : priceInMist;
    return Math.floor((price * this.ROYALTY_BPS) / 10000);
  },
  
  calculateTotal(priceInMist: string | number): number {
    const price = typeof priceInMist === 'string' ? parseInt(priceInMist) : priceInMist;
    return price + this.calculateRoyalty(price);
  },
  
  getRoyaltyPercentage(): number {
    return this.ROYALTY_BPS / 100;
  }
} as const;

export type MarketplaceConfig = typeof MARKETPLACE_CONFIG;

