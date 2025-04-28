import { TemplateSeries, FontStyle } from '../types';
import { templateSeries } from './templateConfig';

interface MetadataParams {
  workName: string;
  description: string;
  style: TemplateSeries;
  fontStyle: FontStyle;
  name: string;
  social: string;
  intro: string;
}

export const createMetadataJson = ({
  workName,
  description,
  style,
  fontStyle,
  name,
  social,
  intro
}: MetadataParams): File => {
  const metadata = {
    artwork: {
      title: workName,
      description: description,
      template: {
        id: style === 'default' ? 'default-v1' : `${style}-${fontStyle}`,
        series: style,
        config: {
          font: fontStyle,
          layout: style === 'default' ? 'split' : 'centered',
          components: templateSeries[style].components,
          version: '1.0.0'
        }
      }
    },
    artist: {
      name: name,
      social: social,
      introduction: intro
    }
  };

  return new File(
    [JSON.stringify(metadata, null, 2)],
    'metadata.json',
    { type: 'application/json' }
  );
};

export const getCurrentMetadata = ({
  workName,
  description,
  style,
  fontStyle,
  name,
  social,
  intro
}: MetadataParams) => {
  return {
    artwork: {
      title: workName,
      description: description,
      template: {
        id: style === 'default' ? 'default-v1' : `${style}-${fontStyle}`,
        series: style,
        config: {
          font: fontStyle,
          layout: style === 'default' ? 'split' : 'centered',
          components: templateSeries[style].components,
          version: '1.0.0'
        }
      }
    },
    artist: {
      name: name,
      social: social,
      introduction: intro
    }
  };
}; 