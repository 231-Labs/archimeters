// 定義參數
const parameters = {
  radius: {
    label: '整體半徑',
    type: 'number',
    default: 2.0,
    min: 1.0,
    max: 5.0,
    step: 0.1
  },
  height: {
    label: '高度',
    type: 'number',
    default: 1.5,
    min: 0.5,
    max: 3.0,
    step: 0.1
  },
  petalCount: {
    label: '花瓣數量',
    type: 'number',
    default: 6,
    min: 3,
    max: 12,
    step: 1
  },
  petalWidth: {
    label: '花瓣寬度',
    type: 'number',
    default: 0.8,
    min: 0.3,
    max: 1.5,
    step: 0.1
  },
  holeSize: {
    label: '簍空大小',
    type: 'number',
    default: 0.3,
    min: 0.1,
    max: 0.8,
    step: 0.1
  },
  holeCount: {
    label: '簍空數量',
    type: 'number',
    default: 3,
    min: 1,
    max: 5,
    step: 1
  },
  twist: {
    label: '扭轉角度',
    type: 'number',
    default: 0.5,
    min: 0,
    max: 2,
    step: 0.1
  },
  color: {
    label: '主色調',
    type: 'color',
    default: '#ff69b4'
  },
  metalness: {
    label: '金屬度',
    type: 'number',
    default: 0.6,
    min: 0,
    max: 1,
    step: 0.1
  },
  roughness: {
    label: '粗糙度',
    type: 'number',
    default: 0.3,
    min: 0,
    max: 1,
    step: 0.1
  }
};

// 創建一個花瓣形狀的幾何體
function createGeometry(THREE, params = {}) {
  // 使用傳入的參數或默認值
  const radius = params.radius ?? parameters.radius.default;
  const height = params.height ?? parameters.height.default;
  const petalCount = params.petalCount ?? parameters.petalCount.default;
  const petalWidth = params.petalWidth ?? parameters.petalWidth.default;
  const holeSize = params.holeSize ?? parameters.holeSize.default;
  const holeCount = params.holeCount ?? parameters.holeCount.default;
  const twist = params.twist ?? parameters.twist.default;

  // 創建形狀
  const shape = new THREE.Shape();
  
  // 創建花瓣外輪廓
  for (let i = 0; i <= 360; i++) {
    const angle = (i * Math.PI) / 180;
    const r = radius * (1 + Math.sin(petalCount * angle) * petalWidth);
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    
    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }

  // 創建簍空的洞
  const holes = [];
  for (let i = 0; i < holeCount; i++) {
    const hole = new THREE.Path();
    const angle = (i * 2 * Math.PI) / holeCount;
    const centerX = radius * 0.5 * Math.cos(angle);
    const centerY = radius * 0.5 * Math.sin(angle);
    
    // 創建橢圓形狀的洞
    for (let j = 0; j <= 360; j++) {
      const holeAngle = (j * Math.PI) / 180;
      const hx = centerX + holeSize * Math.cos(holeAngle);
      const hy = centerY + holeSize * 0.7 * Math.sin(holeAngle);
      
      if (j === 0) {
        hole.moveTo(hx, hy);
      } else {
        hole.lineTo(hx, hy);
      }
    }
    holes.push(hole);
  }
  shape.holes = holes;

  // 擠出設置
  const extrudeSettings = {
    steps: 50,
    depth: height,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 10,
    curveSegments: 50
  };

  // 創建幾何體
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  // 應用扭轉變形
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    
    // 根據高度計算扭轉角度
    const twistAngle = (z / height) * twist * Math.PI;
    const radius = Math.sqrt(x * x + y * y);
    const angle = Math.atan2(y, x) + twistAngle;
    
    position.setXY(
      i,
      radius * Math.cos(angle),
      radius * Math.sin(angle)
    );
  }

  // 重新計算法向量
  geometry.computeVertexNormals();

  return geometry;
} 