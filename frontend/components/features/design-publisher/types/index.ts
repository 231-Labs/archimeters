// File types
export interface FileState {
  imageFile: File | null;
  imageUrl: string;
  algoFile: File | null;
  algoResponse: string;
  algoError: string;
}

// Upload status types
export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

export type UploadStatuses = 'pending' | 'uploading' | 'success' | 'error';

export interface UploadResults {
  imageBlobId: string;
  algoBlobId: string;
  metadataBlobId: string;
  success: boolean;
  error?: string;
}

// Parameter types
export interface GeometryParameter {
  type: 'number' | 'color';
  label: string;
  default: number | string;
  min?: number;
  max?: number;
  current: number | string;
}

export interface ParameterRule {
  type: 'number' | 'color';
  label: string;
  minValue: number;
  maxValue: number;
  defaultValue: number;
}

export interface ParameterRules {
  [key: string]: ParameterRule;
}

export interface ParameterState {
  extractedParameters: Record<string, GeometryParameter>;
  hasExtractedParams: boolean;
  previewParams: Record<string, any>;
  showPreview: boolean;
  customScript: { code: string; filename: string } | null;
}

// Template types
export type TemplateSeries = 'default' | 'minimal' | 'elegant';
export type FontStyle = 'sans' | 'serif' | 'mono';

export type TemplateComponents = {
  header: boolean;
  preview3D: boolean;
  mainVisual: boolean;
  description: boolean;
  parameters: boolean;
  artistInfo: boolean;
  mintSection: boolean;
};

export type TemplateConfig = {
  font: FontStyle;
  layout: string;
  components: TemplateComponents;
  version: string;
};

export type Template = {
  name: string;
  description: string;
  layouts: string[];
  components: TemplateComponents;
};

// Artwork types
export interface ArtworkInfo {
  workName: string;
  description: string;
  price: string;
}

export interface ArtistInfo {
  name: string;
  social: string;
  intro: string;
}

export interface DesignSettings {
  style: TemplateSeries;
  fontStyle: FontStyle;
}

// Validation types
export interface ValidationState {
  workNameRequired: boolean;
  descriptionRequired: boolean;
  priceRequired: boolean;
  introRequired: boolean;
  priceError: string;
  imageRequired: boolean;
  algoRequired: boolean;
} 