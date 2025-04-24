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