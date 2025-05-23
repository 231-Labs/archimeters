import { useState, useCallback } from 'react';
import type { ArtworkInfo, ArtistInfo, DesignSettings } from '../types';

// TODO: empty default values
const defaultArtworkInfo: ArtworkInfo = {
  workName: 'Morphic Vessel X-1',
  description: 'A revolutionary shape-shifting cup that adapts to your beverage experience. Interactive elements allow users to transform its form for optimal enjoyment of any drink.',
  price: '1',
};

const defaultArtistInfo: ArtistInfo = {
  name: 'FluidDesigner#0088',
  social: 'archimeters.lens',
  intro: 'Product designer pushing boundaries between functional objects and digital innovation through adaptive, fluid-inspired creations.',
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