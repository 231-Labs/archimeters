import { useState, useCallback } from 'react';
import type { ArtworkInfo, ArtistInfo, DesignSettings } from '../types';

// Empty default values - placeholders are shown in the UI components
const defaultArtworkInfo: ArtworkInfo = {
  workName: '',
  description: '',
  price: '',
};

const defaultArtistInfo: ArtistInfo = {
  name: '',
  social: '',
  intro: '',
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