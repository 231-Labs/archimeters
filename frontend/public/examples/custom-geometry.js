// 定義參數
const parameters = {
  height: {
    label: '高度',
    type: 'number',
    default: 2.0,
    min: 0.5,
    max: 5.0
  },
  baseSize: {
    label: '底部大小',
    type: 'number',
    default: 1.0,
    min: 0.5,
    max: 3.0
  },
  segments: {
    label: '分段數',
    type: 'number',
    default: 4,
    min: 3,
    max: 8,
    step: 1
  },
  color: {
    label: '主色調',
    type: 'color',
    default: '#ff3366'
  },
  metalness: {
    label: '金屬度',
    type: 'number',
    default: 0.5,
    min: 0,
    max: 1,
    step: 0.1
  }
};

// 創建一個自定義幾何體
function createGeometry(THREE, params = {}) {
  // 使用傳入的參數或默認值
  const height = params.height ?? parameters.height.default;
  const baseSize = params.baseSize ?? parameters.baseSize.default;
  const segments = params.segments ?? parameters.segments.default;

  // 創建一個 BufferGeometry
  const geometry = new THREE.BufferGeometry();

  // 計算頂點位置
  const vertices = [];
  const indices = [];

  // 添加頂點（金字塔頂點）
  vertices.push(0, height, 0);

  // 添加底部頂點
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * baseSize;
    const z = Math.sin(angle) * baseSize;
    vertices.push(x, 0, z);
  }

  // 添加面（三角形）
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    // 添加側面三角形
    indices.push(0, i + 1, next + 1);
    // 添加底面三角形
    if (i > 1) {
      indices.push(1, i + 1, next + 1);
    }
  }

  // 設置頂點位置
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(new Float32Array(vertices), 3)
  );

  // 設置面的索引
  geometry.setIndex(indices);

  // 計算法向量
  geometry.computeVertexNormals();

  return geometry;
} 