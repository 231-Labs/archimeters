import * as THREE from 'three';

export interface Atelier {
  id: string;
  photoBlobId: string;
  algorithmBlobId: string;
  dataBlobId: string;
  url: string | null;
  algorithmContent: string | null;
  configData: any | null;
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

