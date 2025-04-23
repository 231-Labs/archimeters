import { Template, TemplateSeries } from '../types';

export const templateSeries: Record<TemplateSeries, Template> = {
  default: {
    name: 'Default Series',
    description: 'Standard parametric artwork display with interactive controls',
    layouts: ['split', 'stacked'],
    components: {
      header: true,
      preview3D: true,
      mainVisual: true,
      description: true,
      parameters: true,
      artistInfo: true,
      mintSection: true
    }
  },
  minimal: {
    name: 'Minimal Series',
    description: 'Clean and focused presentation style',
    layouts: ['centered', 'grid'],
    components: {
      header: true,
      preview3D: true,
      mainVisual: true,
      description: true,
      parameters: false,
      artistInfo: true,
      mintSection: true
    }
  },
  elegant: {
    name: 'Elegant Series',
    description: 'Sophisticated design with emphasis on typography',
    layouts: ['gallery', 'showcase'],
    components: {
      header: true,
      preview3D: true,
      mainVisual: true,
      description: true,
      parameters: true,
      artistInfo: true,
      mintSection: true
    }
  }
}; 