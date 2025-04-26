// 參數定義
const parameterDefinitions = {
  size: {
    type: 'number',
    default: 20,
    min: 5,
    max: 100,
    step: 1,
    label: '邊長(mm)'
  },
  segments: {
    type: 'number',
    default: 1,
    min: 1,
    max: 10,
    step: 1,
    label: '分段數'
  },
  wireframe: {
    type: 'boolean',
    default: true,
    label: '顯示網格'
  }
};

// 幾何生成函數
function generateGeometry(parameters) {
  const {
    size = 20,
    segments = 1
  } = parameters;

  // 創建立方體，尺寸單位為毫米
  const geometry = new THREE.BoxGeometry(
    size,    // 寬度
    size,    // 高度
    size,    // 深度
    segments,// x方向分段
    segments,// y方向分段
    segments // z方向分段
  );

  return geometry;
} 