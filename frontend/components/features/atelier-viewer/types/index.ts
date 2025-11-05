import * as THREE from 'three';

export interface ParameterMetadata {
  type: 'number' | 'color';
  label: string;
  originalMin?: number;      // Original min value (can be negative)
  originalMax?: number;      // Original max value
  originalDefault?: number;  // Original default value
  step?: number;
  default?: any;
}

export interface AtelierMetadata {
  artwork?: {
    title: string;
    description: string;
    template?: any;
  };
  artist?: {
    name: string;
    address: string;
    introduction: string;
  };
  parameters?: Record<string, ParameterMetadata>;
}

/**
 * Atelier (Design Template) data structure
 * 
 * Note: On-chain, Atelier is now a generic type: Atelier<ATELIER>
 * This ensures type safety between Atelier and Sculpt.
 * However, in the frontend, we use this plain interface for data representation.
 */
export interface Atelier {
  id: string;
  photoBlobId: string;
  algorithmBlobId: string;
  dataBlobId: string;
  poolId: string;     // Pool ID for payment when minting sculpts
  url: string | null;
  algorithmContent: string | null;
  configData: any | null;
  metadata?: AtelierMetadata;
  title: string;
  author: string;
  price: string;
  description?: string;
  artistStatement?: string;
  artistName?: string;
  artistAddress?: string;
}

export interface Parameter {
  type: 'number' | 'color' | 'string';
  label: string;
  default: number | string;
  min?: number;
  max?: number;
  current: number | string;
}

export interface Parameters {
  [key: string]: Parameter;
}

export type ExportFormat = 'glb' | 'stl';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export type MintStatus = 'idle' | 'preparing' | 'minting' | 'success' | 'error';

export interface MintButtonState {
  disabled: boolean;
  tooltip: string;
  tooltipComponent?: React.ReactNode;
}

export interface UploadResult {
  blobId: string;
  success: boolean;
  error?: string;
}

export interface SceneRefs {
  scene: THREE.Scene | null;
  renderer: THREE.WebGLRenderer | null;
  camera: THREE.Camera | null;
}

export interface UserScript {
  code: string;
  filename: string;
}

export interface EncryptMetadata {
  sculptId: string;
  atelierId: string;
}

export interface EncryptResult {
  encryptedBlob: Blob;
  backupKey?: string;
}

export interface UseSculptMintOptions {
  encryptModel?: (file: File, metadata: EncryptMetadata) => Promise<EncryptResult>;
}

