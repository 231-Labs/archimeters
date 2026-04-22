'use client';

import { SuiLogo } from './SuiLogo';
import { formatSuiPrice } from '@/utils/formatters';
import { MARKETPLACE_CONFIG } from '@/config/marketplace';

interface RetroPriceBreakdownProps {
  priceInMist: string;
  className?: string;
}

export function RetroPriceBreakdown({ priceInMist, className = '' }: RetroPriceBreakdownProps) {
  const price = parseInt(priceInMist);
  const royalty = MARKETPLACE_CONFIG.calculateRoyalty(price);
  const total = MARKETPLACE_CONFIG.calculateTotal(price);
  const royaltyPercentage = MARKETPLACE_CONFIG.getRoyaltyPercentage();

  return (
    <div className={`font-mono text-xs text-foreground ${className}`}>
      <div className="space-y-1">
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Item Price</span>
          <div className="flex items-center gap-1">
            <SuiLogo width={8} height={10} />
            <span>{formatSuiPrice(price)} SUI</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Royalty ({royaltyPercentage}%)</span>
          <div className="flex items-center gap-1">
            <SuiLogo width={8} height={10} />
            <span>{formatSuiPrice(royalty)} SUI</span>
          </div>
        </div>
        
        <div className="my-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="flex justify-between items-center text-foreground/90 font-semibold">
          <span>Total</span>
          <div className="flex items-center gap-1">
            <SuiLogo width={8} height={10} />
            <span>{formatSuiPrice(total)} SUI</span>
          </div>
        </div>
      </div>
    </div>
  );
}

