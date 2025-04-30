// components/background/Background.tsx
'use client';
import { memo } from 'react';
import Noise from '../background_animations/NoiseEffect';
import SpaceRoom from '../background_animations/SpaceRoom';
import GalaxyEffect from '../background_animations/GalaxyEffect';

interface BackgroundProps {
  walletStatus: 'disconnected' | 'connected-no-nft' | 'connected-with-nft';
}

/**
 * Background component that manages different animation effects based on wallet status:
 * - Disconnected: Shows noise effect with static starfield
 * - Connected without NFT: Shows space room with static starfield
 * - Connected with NFT: Shows space room + galaxy effect
 */
const Background = memo(({ walletStatus }: BackgroundProps) => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      {/* Full noise effect when disconnected */}
      {walletStatus === 'disconnected' && (
        <div className="transition-opacity duration-1000 opacity-100">
          <Noise />
        </div>
      )}

      {/* Static starfield effect - only when connected without NFT */}
      {walletStatus === 'connected-no-nft' && (
        <div className="transition-opacity duration-1000 opacity-100">
          <Noise staticStarfieldOnly />
        </div>
      )}

      {/* Space room effect with fade transition */}
      <div className={`transition-opacity duration-1000 ${walletStatus !== 'disconnected' ? 'opacity-100' : 'opacity-0'}`}>
        {walletStatus !== 'disconnected' && <SpaceRoom />}
      </div>

      {/* Galaxy effect with fade transition */}
      <div className={`transition-opacity duration-1000 ${walletStatus === 'connected-with-nft' ? 'opacity-100' : 'opacity-0'}`}>
        {walletStatus === 'connected-with-nft' && <GalaxyEffect />}
      </div>
    </div>
  );
});

Background.displayName = 'Background';

export default Background;
