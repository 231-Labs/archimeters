// 複雜波浪表面參數化設計
const parameterDefinitions = {
  width: {
    type: 'number',
    default: 5,
    min: 1,
    max: 10,
    step: 0.1,
    label: '寬度'
  },
  height: {
    type: 'number',
    default: 5,
    min: 1,
    max: 10,
    step: 0.1,
    label: '高度'
  },
  depth: {
    type: 'number',
    default: 1,
    min: 0.1,
    max: 2,
    step: 0.1,
    label: '深度'
  },
  segments: {
    type: 'number',
    default: 64,
    min: 16,
    max: 128,
    step: 8,
    label: '分段數'
  },
  wave1: {
    type: 'select',
    default: 'sine',
    options: ['sine', 'cosine', 'tangent'],
    label: '波浪類型 1'
  },
  wave1Freq: {
    type: 'number',
    default: 1,
    min: 0.1,
    max: 5,
    step: 0.1,
    label: '波浪頻率 1'
  },
  wave1Amp: {
    type: 'number',
    default: 0.2,
    min: 0,
    max: 1,
    step: 0.01,
    label: '波浪振幅 1'
  },
  wave1Phase: {
    type: 'number',
    default: 0,
    min: 0,
    max: Math.PI * 2,
    step: 0.1,
    label: '波浪相位 1'
  },
  noise: {
    type: 'number',
    default: 0.1,
    min: 0,
    max: 0.5,
    step: 0.01,
    label: '噪聲強度'
  },
  noiseScale: {
    type: 'number',
    default: 1,
    min: 0.1,
    max: 5,
    step: 0.1,
    label: '噪聲縮放'
  },
  wireframe: {
    type: 'boolean',
    default: true,
    label: '網狀顯示'
  }
};

function generateGeometry(parameters) {
  const {
    width = 5,
    height = 5,
    depth = 1,
    segments = 64,
    wave1 = 'sine',
    wave1Freq = 1,
    wave1Amp = 0.2,
    wave1Phase = 0,
    noise = 0.1,
    noiseScale = 1
  } = parameters;

  // 創建基礎平面
  const geometry = new THREE.PlaneGeometry(width, height, segments, segments);

  // 獲取頂點位置
  const positions = geometry.attributes.position.array;
  const vertexCount = positions.length / 3;

  // 應用複雜波浪變形
  for (let i = 0; i < vertexCount; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];

    // 根據選擇的波浪類型計算
    let waveValue;
    switch (wave1) {
      case 'sine':
        waveValue = Math.sin(x * wave1Freq + wave1Phase) * Math.cos(y * wave1Freq + wave1Phase);
        break;
      case 'cosine':
        waveValue = Math.cos(x * wave1Freq + wave1Phase) * Math.sin(y * wave1Freq + wave1Phase);
        break;
      case 'tangent':
        waveValue = Math.tan(x * wave1Freq + wave1Phase) * Math.tan(y * wave1Freq + wave1Phase);
        break;
      default:
        waveValue = Math.sin(x * wave1Freq + wave1Phase) * Math.cos(y * wave1Freq + wave1Phase);
    }

    // 計算噪聲
    const noiseValue = Math.sin(x * noiseScale) * Math.cos(y * noiseScale) * noise;

    // 組合所有效果
    const totalDisplacement = waveValue * wave1Amp + noiseValue;

    // 更新頂點位置
    positions[i * 3 + 2] = totalDisplacement * depth;
  }

  // 更新法線
  geometry.computeVertexNormals();

  return geometry;
} 