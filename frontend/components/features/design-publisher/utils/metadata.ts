import { TemplateSeries, FontStyle, GeometryParameter } from '../types';
import { templateSeries } from './templateConfig';

interface MetadataParams {
  workName: string;
  description: string;
  style: TemplateSeries;
  fontStyle: FontStyle;
  name: string;
  address: string;
  intro: string;
  isPrintable?: boolean; // true = 3D printable, false = 2D/animated
  membershipData?: {
    username: string;
    description: string;
    address: string;
  } | null;
  extractedParameters?: Record<string, GeometryParameter>;
}

export const createMetadataJson = ({
  workName,
  description,
  style,
  fontStyle,
  name,
  address,
  intro,
  isPrintable = true,
  membershipData,
  extractedParameters = {}
}: MetadataParams): File => {
  // Build parameter metadata with original ranges (for offset calculation)
  const parametersMetadata: Record<string, any> = {};
  Object.entries(extractedParameters).forEach(([key, param]) => {
    if (param.type === 'number') {
      parametersMetadata[key] = {
        type: param.type,
        label: param.label || key,
        originalMin: param.min ?? 0,      // Original min (can be negative)
        originalMax: param.max ?? 100,    // Original max
        originalDefault: param.default ?? 0,
        step: (param as any).step,
      };
    } else {
      parametersMetadata[key] = {
        type: param.type,
        label: param.label || key,
        default: param.default,
      };
    }
  });

  const metadata = {
    artwork: {
      title: workName,
      description: description,
      isPrintable: isPrintable, // Flag to indicate if artwork is 3D printable or 2D/animated
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
    },
    // Store original parameter ranges for offset calculation
    parameters: parametersMetadata
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