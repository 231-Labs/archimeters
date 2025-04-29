// components/background/Background.tsx
'use client';
import Noise from '../background_animations/NoiseEffect';
import SpaceRoom from '../background_animations/SpaceRoom';
import GalaxyEffect from '../background_animations/GalaxyEffect';

interface BackgroundProps {
  walletStatus: 'disconnected' | 'connected-no-nft' | 'connected-with-nft';
}

export default function Background({ walletStatus }: BackgroundProps) {
    {console.log('Wallet status:', walletStatus)}
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      {walletStatus === 'disconnected' && <Noise />}
      {walletStatus === 'connected-no-nft' && <SpaceRoom />}
      {walletStatus === 'connected-with-nft' && (
        <>
          <SpaceRoom />
          <GalaxyEffect />
        </>
      )}
    </div>
  );
}
