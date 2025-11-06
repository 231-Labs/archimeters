/**
 * Pavilion Configuration
 * List of Walrus Sites (Pavilions) to display in the Pavilion browser
 */

export interface PavilionConfig {
  id: string;
  name: string;
  kioskId: string;
  description?: string;
  category?: string;
}

/**
 * List of featured Pavilions
 * Add more Pavilion Kiosk IDs as they become available
 */
export const PAVILION_KIOSKS: PavilionConfig[] = [
  {
    id: 'example-1',
    name: 'Example Pavilion',
    kioskId: '0x010fb58982e0e1947103b227cea5f33bcbb4ba073e558d6ef92aa927e370f300',
    description: 'Demo pavilion for testing Walrus Sites integration',
    category: 'Demo',
  },
  // Add more pavilions here as they become available
  // {
  //   id: 'archimeters-showcase',
  //   name: 'Archimeters Showcase',
  //   kioskId: '0x...',
  //   description: 'Official Archimeters design showcase',
  //   category: '3D Design',
  // },
];

/**
 * Pavilion base URL
 */
export const PAVILION_BASE_URL = 'https://pavilion-231.vercel.app/pavilion/visit';

/**
 * Generate Pavilion visit URL
 * @param kioskId - The Kiosk ID of the Pavilion
 * @returns Full URL to visit the Pavilion
 */
export function getPavilionUrl(kioskId: string): string {
  return `${PAVILION_BASE_URL}?kioskId=${kioskId}`;
}

/**
 * Category colors for visual organization
 */
export const CATEGORY_COLORS: Record<string, string> = {
  Demo: 'bg-blue-900/30 text-blue-400',
  '3D Design': 'bg-purple-900/30 text-purple-400',
  Art: 'bg-pink-900/30 text-pink-400',
  Gallery: 'bg-green-900/30 text-green-400',
  Marketplace: 'bg-yellow-900/30 text-yellow-400',
  default: 'bg-neutral-800/70 text-neutral-400',
};

/**
 * Get category color class
 */
export function getCategoryColor(category?: string): string {
  if (!category) return CATEGORY_COLORS.default;
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
}

