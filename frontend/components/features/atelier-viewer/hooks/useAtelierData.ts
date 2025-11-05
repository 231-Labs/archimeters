import { useState, useEffect } from 'react';
import { Atelier } from '../types';
import { getWalrusBlobUrl } from '@/config/walrus';

const DEFAULT_IMAGE_URL = '/placeholder-image.png';

const fetchImageFromWalrus = async (blobId: string): Promise<string> => {
  try {
    const imageUrl = getWalrusBlobUrl(blobId);
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to load image: ${response.statusText}`);
    }
    return imageUrl;
  } catch (err) {
    console.error('Error loading image:', err);
    return DEFAULT_IMAGE_URL;
  }
};

const fetchAlgorithmFromWalrus = async (blobId: string): Promise<string> => {
  try {
    const algorithmUrl = getWalrusBlobUrl(blobId);
    const response = await fetch(algorithmUrl);
    if (!response.ok) {
      throw new Error(`Failed to load algorithm: ${response.statusText}`);
    }
    const text = await response.text();
    return text;
  } catch (err) {
    console.error('Error loading algorithm:', err);
    throw err;
  }
};

const fetchConfigDataFromWalrus = async (blobId: string): Promise<any> => {
  try {
    const configUrl = getWalrusBlobUrl(blobId);
    const response = await fetch(configUrl);
    if (!response.ok) {
      throw new Error(`Failed to load config data: ${response.statusText}`);
    }
    const configText = await response.text();
    const config = JSON.parse(configText);
    return config;
  } catch (err) {
    console.error('Error loading config data:', err);
    throw err;
  }
};

export const useAtelierData = () => {
  const [atelier, setAtelier] = useState<Atelier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAtelierData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const storedAtelier = sessionStorage.getItem('selected-atelier');
        if (!storedAtelier) {
          throw new Error('No atelier data found in sessionStorage');
        }

        const parsedAtelier = JSON.parse(storedAtelier);
        setAtelier(parsedAtelier);

        const [imageUrl, algorithmContent, configData] = await Promise.all([
          fetchImageFromWalrus(parsedAtelier.photoBlobId).catch(() => DEFAULT_IMAGE_URL),
          fetchAlgorithmFromWalrus(parsedAtelier.algorithmBlobId).catch(() => null),
          fetchConfigDataFromWalrus(parsedAtelier.dataBlobId).catch(() => null),
        ]);

        setAtelier((prev) => ({
          ...prev!,
          url: imageUrl,
          algorithmContent,
          configData,
          description: configData?.artwork?.description || '',
          artistStatement: configData?.artist?.introduction || '',
          artistName: configData?.artist?.name || prev!.author,
          artistAddress: configData?.artist?.address || '',
        }));

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching Atelier data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch Atelier data');
        setIsLoading(false);
      }
    };

    fetchAtelierData();

  }, []);

  return { atelier, isLoading, error };
};

