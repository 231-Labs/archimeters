// Upload status types
export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

export type UploadStatuses = {
  image: UploadStatus;
  algo: UploadStatus;
  metadata: UploadStatus;
};

export type UploadResults = {
  imageBlobId: string;
  algoBlobId: string;
  metadataBlobId: string;
  success: boolean;
  error?: string;
} | null;

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