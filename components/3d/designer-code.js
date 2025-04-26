// 參數定義
const parameterDefinitions = {
  radius: {
    type: 'number',
    default: 1,
    min: 0.1,
    max: 5,
    step: 0.1,
    label: '半徑'
  },
  height: {
    type: 'number',
    default: 2,
    min: 0.5,
    max: 10,
    step: 0.1,
    label: '高度'
  },
  segments: {
    type: 'number',
    default: 32,
    min: 8,
    max: 128,
    step: 4,
    label: '分段數'
  },
  twist: {
    type: 'number',
    default: 0,
    min: -Math.PI * 2,
    max: Math.PI * 2,
    step: 0.1,
    label: '扭轉角度'
  },
  wave: {
    type: 'number',
    default: 0,
    min: 0,
    max: 1,
    step: 0.05,
    label: '波浪強度'
  },
  waveFrequency: {
    type: 'number',
    default: 1,
    min: 0.1,
    max: 5,
    step: 0.1,
    label: '波浪頻率'
  },
  waveAmplitude: {
    type: 'number',
    default: 0.2,
    min: 0,
    max: 1,
    step: 0.05,
    label: '波浪振幅'
  },
  wireframe: {
    type: 'boolean',
    default: true,
    label: '網格顯示'
  }
};

// 幾何生成函數
function generateGeometry(parameters) {
  // 從參數中獲取值
  const {
    radius = 1,
    height = 2,
    segments = 32,
    twist = 0,
    wave = 0,
    waveFrequency = 1,
    waveAmplitude = 0.2
  } = parameters;

  // 創建基礎幾何體
  const geometry = new THREE.CylinderGeometry(radius, radius, height, segments);

  // 獲取頂點位置
  const positions = geometry.attributes.position.array;
  const vertexCount = positions.length / 3;

  // 應用變形
  for (let i = 0; i < vertexCount; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];

    // 計算到中心的距離
    const distance = Math.sqrt(x * x + z * z);
    const angle = Math.atan2(z, x);

    // 應用扭曲
    const twistAngle = (y / height) * twist;
    const newAngle = angle + twistAngle;

    // 應用波浪
    const waveOffset = Math.sin(y * waveFrequency) * waveAmplitude * wave;
    const newDistance = distance + waveOffset;

    // 更新頂點位置
    positions[i * 3] = Math.cos(newAngle) * newDistance;
    positions[i * 3 + 2] = Math.sin(newAngle) * newDistance;
  }

  // 更新法線
  geometry.computeVertexNormals();

  return geometry;
} 