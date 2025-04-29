import { TemplateSeries, FontStyle } from '../types';
import { templateSeries } from './templateConfig';

interface MetadataParams {
  workName: string;
  description: string;
  style: TemplateSeries;
  fontStyle: FontStyle;
  name: string;
  address: string;
  intro: string;
  membershipData?: {
    username: string;
    description: string;
    address: string;
  } | null;
}

export const createMetadataJson = ({
  workName,
  description,
  style,
  fontStyle,
  name,
  address,
  intro,
  membershipData
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
      name: membershipData?.username || name,
      address: membershipData?.address || address,
      introduction: membershipData?.description || intro
    }
  };

  // TODO: Test Only
  // console.log('=== Metadata Content ===');
  // console.log(JSON.stringify(metadata, null, 2));

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
  address,
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
      address: address,
      introduction: intro
    }
  };
}; 