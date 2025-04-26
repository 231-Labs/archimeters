// 定義參數
const parameters = {
  radius: {
    label: '基本半徑',
    type: 'number',
    default: 2.0,
    min: 1.0,
    max: 4.0,
    step: 0.1
  },
  height: {
    label: '高度',
    type: 'number',
    default: 3.0,
    min: 1.0,
    max: 5.0,
    step: 0.1
  },
  holeRadius: {
    label: '孔洞半徑',
    type: 'number',
    default: 0.5,
    min: 0.2,
    max: 1.0,
    step: 0.1
  },
  surfaceDetail: {
    label: '表面細節',
    type: 'number',
    default: 0.3,
    min: 0.1,
    max: 0.5,
    step: 0.05
  },
  segments: {
    label: '分段數',
    type: 'number',
    default: 32,
    min: 16,
    max: 64,
    step: 4
  },
  heightSegments: {
    label: '高度分段',
    type: 'number',
    default: 20,
    min: 10,
    max: 40,
    step: 2
  },
  noiseFrequency: {
    label: '噪波頻率',
    type: 'number',
    default: 3,
    min: 1,
    max: 10,
    step: 0.5
  }
};

// 創建不規則柱狀體
function createGeometry(THREE, params = {}) {
  // 使用傳入的參數或默認值
  const radius = params.radius ?? parameters.radius.default;
  const height = params.height ?? parameters.height.default;
  const holeRadius = params.holeRadius ?? parameters.holeRadius.default;
  const surfaceDetail = params.surfaceDetail ?? parameters.surfaceDetail.default;
  const segments = params.segments ?? parameters.segments.default;
  const heightSegments = params.heightSegments ?? parameters.heightSegments.default;
  const noiseFrequency = params.noiseFrequency ?? parameters.noiseFrequency.default;

  // 創建圓柱體頂點
  const vertices = [];
  const indices = [];
  const uvs = [];

  // 生成外部和內部頂點
  for (let h = 0; h <= heightSegments; h++) {
    const v = h / heightSegments;
    const heightFactor = h / heightSegments * height;

    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const angle = u * Math.PI * 2;

      // 外部頂點
      const noiseOuter = Math.sin(angle * noiseFrequency) * 
                        Math.cos(v * noiseFrequency) * surfaceDetail;
      const outerRadius = radius * (1 + noiseOuter);
      vertices.push(
        Math.cos(angle) * outerRadius,
        heightFactor,
        Math.sin(angle) * outerRadius
      );
      uvs.push(u, v);

      // 內部頂點
      const innerRadius = holeRadius;
      vertices.push(
        Math.cos(angle) * innerRadius,
        heightFactor,
        Math.sin(angle) * innerRadius
      );
      uvs.push(u, v);
    }
  }

  // 生成側面的面片
  for (let h = 0; h < heightSegments; h++) {
    for (let i = 0; i < segments; i++) {
      const first = h * (segments + 1) * 2 + i * 2;
      const second = first + 2;
      const third = first + (segments + 1) * 2;
      const fourth = third + 2;

      // 外部面
      indices.push(first, second, third);
      indices.push(second, fourth, third);

      // 內部面（反向）
      indices.push(first + 1, third + 1, second + 1);
      indices.push(second + 1, third + 1, fourth + 1);
    }
  }

  // 生成頂部和底部的面片
  const topVerticesStart = vertices.length / 3;
  const bottomVerticesStart = topVerticesStart + (segments + 1) * 2;

  // 添加頂部和底部的頂點
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // 頂部外圈
    const noiseTop = Math.sin(angle * noiseFrequency) * surfaceDetail;
    const topOuterRadius = radius * (1 + noiseTop);
    vertices.push(cos * topOuterRadius, height, sin * topOuterRadius);
    uvs.push(i / segments, 1);

    // 頂部內圈
    vertices.push(cos * holeRadius, height, sin * holeRadius);
    uvs.push(i / segments, 0.8);

    // 底部外圈
    const noiseBottom = Math.sin(angle * noiseFrequency) * surfaceDetail;
    const bottomOuterRadius = radius * (1 + noiseBottom);
    vertices.push(cos * bottomOuterRadius, 0, sin * bottomOuterRadius);
    uvs.push(i / segments, 0.2);

    // 底部內圈
    vertices.push(cos * holeRadius, 0, sin * holeRadius);
    uvs.push(i / segments, 0);
  }

  // 生成頂部和底部的面片
  for (let i = 0; i < segments; i++) {
    // 頂部面片
    const topFirst = topVerticesStart + i * 2;
    const topSecond = topVerticesStart + (i + 1) * 2;
    indices.push(topFirst, topSecond, topFirst + 1);
    indices.push(topSecond, topSecond + 1, topFirst + 1);

    // 底部面片（注意順序相反以確保面向正確）
    const bottomFirst = bottomVerticesStart + i * 2;
    const bottomSecond = bottomVerticesStart + (i + 1) * 2;
    indices.push(bottomFirst, bottomFirst + 1, bottomSecond);
    indices.push(bottomSecond, bottomFirst + 1, bottomSecond + 1);
  }

  // 創建幾何體
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  // 計算法向量
  geometry.computeVertexNormals();

  return geometry;
}

// 輔助函數：合併緩衝幾何體
function mergeBufferGeometries(geometries) {
  const positions = [];
  const normals = [];
  const uvs = [];
  let vertexCount = 0;
  const indices = [];

  // 收集所有幾何體的數據
  geometries.forEach(geometry => {
    const position = geometry.attributes.position;
    const normal = geometry.attributes.normal;
    const uv = geometry.attributes.uv;
    const index = geometry.index;

    // 添加頂點數據
    for (let i = 0; i < position.count; i++) {
      positions.push(
        position.getX(i),
        position.getY(i),
        position.getZ(i)
      );
      normals.push(
        normal.getX(i),
        normal.getY(i),
        normal.getZ(i)
      );
      uvs.push(
        uv.getX(i),
        uv.getY(i)
      );
    }

    // 添加索引數據
    if (index) {
      for (let i = 0; i < index.count; i++) {
        indices.push(index.getX(i) + vertexCount);
      }
    }

    vertexCount += position.count;
  });

  // 創建新的緩衝幾何體
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  return geometry;
} 