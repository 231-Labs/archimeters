// Test-print box: width × length × height only, units in mm
// Default ~5 mm (~0.5 cm) cube; solid watertight mesh, STL-friendly
// Same shape as RainHarvestingRoofSolid: parameters + createGeometry(THREE, params)

const parameters = {
  width: {
    label: 'Width W (mm)',
    type: 'number',
    default: 5,
    min: 4,
    max: 7,
    step: 0.1
  },
  length: {
    label: 'Length L (mm)',
    type: 'number',
    default: 5,
    min: 4,
    max: 7,
    step: 0.1
  },
  height: {
    label: 'Height H (mm)',
    type: 'number',
    default: 5,
    min: 4,
    max: 7,
    step: 0.1
  }
};

/** Read a numeric value from runtime params (host passes numbers; standalone falls back to default). */
function resolveNumber(params, key) {
  const raw = params[key];
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw;
  }
  const spec = parameters[key];
  if (spec && typeof spec === 'object' && typeof spec.default === 'number') {
    return spec.default;
  }
  return 5;
}

/**
 * Three.js BoxGeometry(width, height, depth) = X × Y × Z = width × height × length.
 */
function createGeometry(THREE, params = {}) {
  const w = resolveNumber(params, 'width');
  const l = resolveNumber(params, 'length');
  const h = resolveNumber(params, 'height');

  const geometry = new THREE.BoxGeometry(w, h, l);
  geometry.computeVertexNormals();
  return geometry;
}

window.PrintCubeLWHmm = {
  parameters,
  createGeometry
};
