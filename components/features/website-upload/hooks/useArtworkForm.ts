import { useState, useCallback } from 'react';
import type { ArtworkInfo, ArtistInfo, DesignSettings } from '../types';

const defaultArtworkInfo: ArtworkInfo = {
  workName: 'Parametric Constellation #42',
  description: 'A generative artwork exploring celestial patterns through mathematical algorithms. Parameters can be adjusted to create unique constellations.',
  price: '1024',
};

const defaultArtistInfo: ArtistInfo = {
  name: 'CryptoArtist#0042',
  social: 'archimeters.lens',
  intro: 'Digital artist exploring the intersection of mathematics and visual aesthetics through parametric art.',
};

const defaultDesignSettings: DesignSettings = {
  style: 'default',
  fontStyle: 'sans',
};

export function useArtworkForm() {
  const [artworkInfo, setArtworkInfo] = useState<ArtworkInfo>(defaultArtworkInfo);
  const [artistInfo, setArtistInfo] = useState<ArtistInfo>(defaultArtistInfo);
  const [designSettings, setDesignSettings] = useState<DesignSettings>(defaultDesignSettings);

  const updateArtworkInfo = useCallback((field: keyof ArtworkInfo, value: string) => {
    setArtworkInfo(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateArtistInfo = useCallback((field: keyof ArtistInfo, value: string) => {
    setArtistInfo(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateDesignSettings = useCallback((field: keyof DesignSettings, value: any) => {
    setDesignSettings(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setArtworkInfo(defaultArtworkInfo);
    setArtistInfo(defaultArtistInfo);
    setDesignSettings(defaultDesignSettings);
  }, []);

  return {
    artworkInfo,
    artistInfo,
    designSettings,
    updateArtworkInfo,
    updateArtistInfo,
    updateDesignSettings,
    resetForm,
  };
} 