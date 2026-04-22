// Bio-Mimetic Rain Roof — compact variant for examples/
// - Tighter parameter ranges (print-friendly module scale)
// - Fixes: numeric param resolution, four-edge frame mask, frame clamp, boundary-safe normals
// - Internal weave: fixed mild pattern (not exposed); UI focuses on outer shell / top wave

const parameters = {
  width: {
    label: 'Module Width (mm)',
    type: 'number',
    default: 60,
    min: 40,
    max: 120,
    step: 2
  },
  length: {
    label: 'Module Length (mm)',
    type: 'number',
    default: 60,
    min: 40,
    max: 120,
    step: 2
  },
  frameWidth: {
    label: 'Frame Border (mm)',
    type: 'number',
    default: 6,
    min: 3,
    max: 18,
    step: 1
  },
  baseThickness: {
    label: 'Base Thickness (mm)',
    type: 'number',
    default: 5,
    min: 3,
    max: 14,
    step: 1
  },
  skinThickness: {
    label: 'Wall Thickness (mm)',
    type: 'number',
    default: 2.2,
    min: 1,
    max: 3.5,
    step: 0.2
  },
  waveCount: {
    label: 'Wave Count',
    type: 'number',
    default: 3,
    min: 1,
    max: 8,
    step: 1
  },
  waveHeight: {
    label: 'Wave Amplitude (mm)',
    type: 'number',
    default: 6,
    min: 2,
    max: 18,
    step: 1
  },
  organicFlow: {
    label: 'Organic Flow (top)',
    type: 'number',
    default: 0.6,
    min: 0,
    max: 1.2,
    step: 0.1
  }
};

// Fixed internal weave (subtle; not in parameters)
const WEAVE_LAYERS = 1;
const WEAVE_DENSITY = 7;
const WEAVE_ORGANIC = 0.35;

const materialColorHex = '#f5f5f5';

function hexToRGB(hex) {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized, 16);
  return [
    ((bigint >> 16) & 255) / 255,
    ((bigint >> 8) & 255) / 255,
    (bigint & 255) / 255
  ];
}

/** Host passes plain numbers; standalone / bad merges may omit — always return finite numbers. */
function resolveNumericParams(raw) {
  const out = {};
  for (const key of Object.keys(parameters)) {
    const v = raw[key];
    if (typeof v === 'number' && Number.isFinite(v)) {
      out[key] = v;
    } else {
      out[key] = parameters[key].default;
    }
  }
  const w = Math.max(out.width, 1e-6);
  const len = Math.max(out.length, 1e-6);
  const maxFrame = Math.min(w, len) * 0.5 - 0.5;
  out.frameWidth = Math.max(2, Math.min(out.frameWidth, maxFrame));
  return out;
}

/** 0 at outer edges inside frame band, 1 in interior (all four sides). */
function frameWaveMask(u, v, frameU, frameV) {
  const edgeFactor = (coord, f) => {
    if (f <= 1e-9) return 1;
    const low = coord < f ? coord / f : 1;
    const high = coord > 1 - f ? (1 - coord) / f : 1;
    return Math.min(low, high);
  };
  return Math.min(edgeFactor(u, frameU), edgeFactor(v, frameV));
}

function getTopHeight(u, v, p) {
  const { width, length, frameWidth, waveHeight, waveCount, organicFlow, baseThickness } = p;

  const frameU = frameWidth / width;
  const frameV = frameWidth / length;
  const waveMask = frameWaveMask(u, v, frameU, frameV);

  const flowAmplitude = organicFlow * (width / 6);
  const flowOffset = Math.sin(v * Math.PI * 2.5) * flowAmplitude;
  const wavePhase = u * waveCount * Math.PI * 2 + (flowOffset / Math.max(width, 1e-6)) * Math.PI * 2;

  let waveY = Math.cos(wavePhase) * waveHeight * 0.5;
  waveY *= waveMask;

  const centerY = baseThickness + waveHeight * 0.5;
  return centerY + waveY;
}

function createGeometry(THREE, params = {}) {
  const fullParams = resolveNumericParams(params);

  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const indices = [];
  const colors = [];

  const matColor = hexToRGB(materialColorHex);
  let vertexOffset = 0;

  const addTri = (v1, v2, v3) => {
    vertices.push(v1.x, v1.y, v1.z);
    vertices.push(v2.x, v2.y, v2.z);
    vertices.push(v3.x, v3.y, v3.z);
    colors.push(...matColor, ...matColor, ...matColor);
    indices.push(vertexOffset, vertexOffset + 1, vertexOffset + 2);
    vertexOffset += 3;
  };

  const addQuad = (v1, v2, v3, v4) => {
    addTri(v1, v2, v3);
    addTri(v1, v3, v4);
  };

  const resX = 48;
  const resZ = 48;
  const wallThick = fullParams.skinThickness;

  const generateSolidSheetGrids = (surfaceFn, uDivs, vDivs, thickness) => {
    const gridTop = [];
    const gridBot = [];
    const halfThick = thickness / 2;
    const uStep = 1 / Math.max(1, uDivs);
    const vStep = 1 / Math.max(1, vDivs);

    for (let j = 0; j <= vDivs; j++) {
      const v = j / vDivs;
      const rowTop = [];
      const rowBot = [];
      for (let i = 0; i <= uDivs; i++) {
        const u = i / uDivs;
        const p = surfaceFn(u, v);

        const uA = Math.max(0, u - uStep * 0.5);
        const uB = Math.min(1, u + uStep * 0.5);
        const vA = Math.max(0, v - vStep * 0.5);
        const vB = Math.min(1, v + vStep * 0.5);

        const pUx = surfaceFn(uB, v);
        const pUxM = surfaceFn(uA, v);
        const pVz = surfaceFn(u, vB);
        const pVzM = surfaceFn(u, vA);

        const dx = { x: pUx.x - pUxM.x, y: pUx.y - pUxM.y, z: pUx.z - pUxM.z };
        const dz = { x: pVz.x - pVzM.x, y: pVz.y - pVzM.y, z: pVz.z - pVzM.z };

        let nx = dx.y * dz.z - dx.z * dz.y;
        let ny = dx.z * dz.x - dx.x * dz.z;
        let nz = dx.x * dz.y - dx.y * dz.x;
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        nx /= len;
        ny /= len;
        nz /= len;

        if (ny < 0) {
          nx = -nx;
          ny = -ny;
          nz = -nz;
        }

        rowTop.push({
          x: p.x + nx * halfThick,
          y: p.y + ny * halfThick,
          z: p.z + nz * halfThick
        });
        rowBot.push({
          x: p.x - nx * halfThick,
          y: p.y - ny * halfThick,
          z: p.z - nz * halfThick
        });
      }
      gridTop.push(rowTop);
      gridBot.push(rowBot);
    }
    return { top: gridTop, bot: gridBot };
  };

  const meshSheet = (grids, uDivs, vDivs) => {
    const { top, bot } = grids;
    for (let j = 0; j < vDivs; j++) {
      for (let i = 0; i < uDivs; i++) {
        addQuad(top[j][i], top[j][i + 1], top[j + 1][i + 1], top[j + 1][i]);
        addQuad(bot[j][i], bot[j + 1][i], bot[j + 1][i + 1], bot[j][i + 1]);
      }
    }
  };

  const getTopCenter = (u, v) => {
    const px = u * fullParams.width;
    const pz = v * fullParams.length;
    const py = getTopHeight(u, v, fullParams);
    return { x: px, y: py - wallThick / 2, z: pz };
  };
  const topSkinGrids = generateSolidSheetGrids(getTopCenter, resX, resZ, wallThick);
  meshSheet(topSkinGrids, resX, resZ);

  const getBotCenter = (u, v) => {
    const px = u * fullParams.width;
    const pz = v * fullParams.length;
    return { x: px, y: wallThick / 2, z: pz };
  };
  const botSkinGrids = generateSolidSheetGrids(getBotCenter, resX, resZ, wallThick);
  meshSheet(botSkinGrids, resX, resZ);

  const numLayers = WEAVE_LAYERS;
  const freq = WEAVE_DENSITY * Math.PI * 2;
  const chaos = WEAVE_ORGANIC * 2;

  for (let L = 0; L < numLayers; L++) {
    const layerPhase = (L / Math.max(1, numLayers)) * Math.PI;

    const getWeaveCenter = (u, v) => {
      const px = u * fullParams.width;
      const pz = v * fullParams.length;
      const topY = getTopHeight(u, v, fullParams) - wallThick;
      const botY = wallThick;
      const uD = u + Math.sin(v * 10) * 0.02 * chaos;
      const vD = v + Math.cos(u * 10) * 0.02 * chaos;
      const val = Math.sin(uD * freq + layerPhase) * Math.cos(vD * freq);
      const w = val * 0.5 + 0.5;
      const py = botY + (topY - botY) * w;
      return { x: px, y: py, z: pz };
    };

    const weaveGrids = generateSolidSheetGrids(getWeaveCenter, resX, resZ, wallThick);
    meshSheet(weaveGrids, resX, resZ);

    const { top, bot } = weaveGrids;
    for (let j = 0; j < resZ; j++) {
      addQuad(top[j][0], bot[j][0], bot[j + 1][0], top[j + 1][0]);
    }
    for (let j = 0; j < resZ; j++) {
      addQuad(top[j][resX], top[j + 1][resX], bot[j + 1][resX], bot[j][resX]);
    }
    for (let i = 0; i < resX; i++) {
      addQuad(top[resZ][i], top[resZ][i + 1], bot[resZ][i + 1], bot[resZ][i]);
    }
    for (let i = 0; i < resX; i++) {
      addQuad(top[0][i], bot[0][i], bot[0][i + 1], top[0][i + 1]);
    }
  }

  const { top: tTop, bot: tBot } = topSkinGrids;
  const { top: bTop, bot: bBot } = botSkinGrids;

  const stitchEdges = (edge1, edge2) => {
    for (let k = 0; k < edge1.length - 1; k++) {
      addQuad(edge1[k], edge1[k + 1], edge2[k + 1], edge2[k]);
    }
  };

  const leftOuterTop = [];
  const leftOuterBot = [];
  const leftInnerTop = [];
  const leftInnerBot = [];
  for (let j = 0; j <= resZ; j++) {
    leftOuterTop.push(tTop[j][0]);
    leftOuterBot.push(bBot[j][0]);
    leftInnerTop.push(tBot[j][0]);
    leftInnerBot.push(bTop[j][0]);
  }
  stitchEdges(leftOuterTop, leftOuterBot);
  stitchEdges(leftInnerBot, leftInnerTop);

  const rightOuterTop = [];
  const rightOuterBot = [];
  const rightInnerTop = [];
  const rightInnerBot = [];
  for (let j = 0; j <= resZ; j++) {
    rightOuterTop.push(tTop[j][resX]);
    rightOuterBot.push(bBot[j][resX]);
    rightInnerTop.push(tBot[j][resX]);
    rightInnerBot.push(bTop[j][resX]);
  }
  stitchEdges(rightOuterBot, rightOuterTop);
  stitchEdges(rightInnerTop, rightInnerBot);

  const topOuterTop = [];
  const topOuterBot = [];
  const topInnerTop = [];
  const topInnerBot = [];
  for (let i = 0; i <= resX; i++) {
    topOuterTop.push(tTop[0][i]);
    topOuterBot.push(bBot[0][i]);
    topInnerTop.push(tBot[0][i]);
    topInnerBot.push(bTop[0][i]);
  }
  stitchEdges(topOuterBot, topOuterTop);
  stitchEdges(topInnerTop, topInnerBot);

  const botOuterTop = [];
  const botOuterBot = [];
  const botInnerTop = [];
  const botInnerBot = [];
  for (let i = 0; i <= resX; i++) {
    botOuterTop.push(tTop[resZ][i]);
    botOuterBot.push(bBot[resZ][i]);
    botInnerTop.push(tBot[resZ][i]);
    botInnerBot.push(bTop[resZ][i]);
  }
  stitchEdges(botOuterTop, botOuterBot);
  stitchEdges(botInnerBot, botInnerTop);

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

window.RainHarvestingRoofSolidCompact = {
  parameters,
  createGeometry
};
