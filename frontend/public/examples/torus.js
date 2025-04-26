// 定義參數
const parameters = {
  radius: {
    label: '主半徑',
    type: 'number',
    default: 2.0,
    min: 1.0,
    max: 5.0,
    step: 0.1
  },
  tubeRadius: {
    label: '管半徑',
    type: 'number',
    default: 0.5,
    min: 0.1,
    max: 2.0,
    step: 0.1
  },
  radialSegments: {
    label: '徑向分段',
    type: 'number',
    default: 16,
    min: 3,
    max: 50,
    step: 1
  },
  tubularSegments: {
    label: '管向分段',
    type: 'number',
    default: 100,
    min: 3,
    max: 200,
    step: 1
  },
  color: {
    label: '主色調',
    type: 'color',
    default: '#4080ff'
  },
  metalness: {
    label: '金屬度',
    type: 'number',
    default: 0.5,
    min: 0,
    max: 1,
    step: 0.1
  },
  roughness: {
    label: '粗糙度',
    type: 'number',
    default: 0.5,
    min: 0,
    max: 1,
    step: 0.1
  }
};

// 創建一個環面幾何體
function createGeometry(THREE, params = {}) {
  // 使用傳入的參數或默認值
  const radius = params.radius ?? parameters.radius.default;
  const tubeRadius = params.tubeRadius ?? parameters.tubeRadius.default;
  const radialSegments = params.radialSegments ?? parameters.radialSegments.default;
  const tubularSegments = params.tubularSegments ?? parameters.tubularSegments.default;

  return new THREE.TorusGeometry(
    radius,         // 主半徑
    tubeRadius,     // 管半徑
    radialSegments, // 徑向分段
    tubularSegments // 管向分段
  );
} 