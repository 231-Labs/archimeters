import { useMemo } from 'react';

interface UseGeometryScriptProps {
  jsCode: string | null;
  fileName?: string;
}

interface GeometryScript {
  code: string;
  filename: string;
}

export function useGeometryScript({
  jsCode,
  fileName = 'default_preview.js'
}: UseGeometryScriptProps): GeometryScript {
  return useMemo(() => {
    if (!jsCode) {
      return {
        code: `
          function createGeometry(THREE, params) {
            return new THREE.TorusGeometry(
              params.radius || 2,
              params.tubeRadius || 0.5,
              params.radialSegments || 16,
              params.tubularSegments || 100
            );
          }
        `,
        filename: 'default_preview.js'
      };
    }
    
    return {
      code: jsCode,
      filename: fileName
    };
  }, [jsCode, fileName]);
}

