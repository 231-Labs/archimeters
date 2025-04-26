// 定義參數
const parameters = {
  height: {
    label: 'Cup Height',
    type: 'number',
    default: 3.0,
    min: 2.0,
    max: 5.0,
    step: 0.1
  },
  topRadius: {
    label: 'Top Radius',
    type: 'number',
    default: 2.0,
    min: 1.5,
    max: 3.0,
    step: 0.1
  },
  bottomRadius: {
    label: 'Bottom Radius',
    type: 'number',
    default: 1.5,
    min: 1.0,
    max: 2.5,
    step: 0.1
  },
  thickness: {
    label: 'Wall Thickness',
    type: 'number',
    default: 0.2,
    min: 0.15,
    max: 0.4,
    step: 0.05
  },
  facets: {
    label: 'Facet Count',
    type: 'number',
    default: 6,
    min: 4,
    max: 12,
    step: 1
  },
  twistAngle: {
    label: 'Twist Angle',
    type: 'number',
    default: 45,
    min: 0,
    max: 90,
    step: 5
  },
  waveHeight: {
    label: 'Wave Height',
    type: 'number',
    default: 0.15,
    min: 0,
    max: 0.3,
    step: 0.05
  },
  waveCount: {
    label: 'Wave Count',
    type: 'number',
    default: 3,
    min: 0,
    max: 5,
    step: 1
  },
  wireframe: {
    label: 'Wireframe Mode',
    type: 'boolean',
    default: false
  },
  wireframeLinewidth: {
    label: 'Wireframe Width',
    type: 'number',
    default: 1,
    min: 1,
    max: 3,
    step: 0.5
  },
  wireframeSegments: {
    label: 'Wireframe Detail',
    type: 'number',
    default: 1,
    min: 1,
    max: 3,
    step: 1
  }
};

// 創建幾何杯子
function createGeometry(THREE, params = {}) {
  // 使用傳入的參數或默認值
  const height = params.height ?? parameters.height.default;
  const topRadius = params.topRadius ?? parameters.topRadius.default;
  const bottomRadius = params.bottomRadius ?? parameters.bottomRadius.default;
  const thickness = params.thickness ?? parameters.thickness.default;
  const facets = params.facets ?? parameters.facets.default;
  const twistAngle = (params.twistAngle ?? parameters.twistAngle.default) * Math.PI / 180;
  const waveHeight = params.waveHeight ?? parameters.waveHeight.default;
  const waveCount = params.waveCount ?? parameters.waveCount.default;
  
  // 設定線框參數 - 但不直接強制使用
  const wireframeLinewidth = params.wireframeLinewidth ?? parameters.wireframeLinewidth.default;
  const wireframeSegments = params.wireframeSegments ?? parameters.wireframeSegments.default;

  // 增加分段數以獲得更細緻的網格
  const heightSegments = 40 * wireframeSegments;
  const radialSegments = facets * wireframeSegments;

  // 創建頂點和索引數組
  const vertices = [];
  const indices = [];
  const uvs = [];

  // 生成外部和內部的頂點
  for (let h = 0; h <= heightSegments; h++) {
    const heightRatio = h / heightSegments;
    const currentHeight = height * heightRatio;
    
    // 計算當前層的基本半徑（線性插值）
    const currentRadius = bottomRadius + (topRadius - bottomRadius) * heightRatio;
    
    // 計算扭轉角度
    const twistOffset = heightRatio * twistAngle;
    
    // 添加波紋效果
    const waveOffset = waveCount > 0 
      ? Math.sin(heightRatio * Math.PI * 2 * waveCount) * waveHeight
      : 0;

    for (let i = 0; i <= radialSegments; i++) {
      const angle = (i / radialSegments) * Math.PI * 2 + twistOffset;
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);

      // 外部頂點
      const outerRadius = currentRadius + waveOffset;
      vertices.push(
        cos * outerRadius,
        currentHeight,
        sin * outerRadius
      );
      uvs.push(i / radialSegments, heightRatio);

      // 內部頂點
      const innerRadius = outerRadius - thickness;
      vertices.push(
        cos * innerRadius,
        currentHeight,
        sin * innerRadius
      );
      uvs.push(i / radialSegments, heightRatio);
    }
  }

  // 生成側面的面片
  const vertsPerRow = (radialSegments + 1) * 2;
  for (let h = 0; h < heightSegments; h++) {
    for (let i = 0; i < radialSegments; i++) {
      const first = h * vertsPerRow + i * 2;
      const second = first + 2;
      const third = first + vertsPerRow;
      const fourth = third + 2;

      // 外部面
      indices.push(first, second, third);
      indices.push(second, fourth, third);

      // 內部面（反向）
      indices.push(first + 1, third + 1, second + 1);
      indices.push(second + 1, third + 1, fourth + 1);
    }
  }

  // 生成頂部面片
  const topStart = vertices.length / 3;
  const topRim = [];
  const topInnerRim = [];

  // 添加頂部環形的頂點
  for (let i = 0; i <= radialSegments; i++) {
    const angle = (i / radialSegments) * Math.PI * 2 + twistAngle;
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    // 計算波紋效果
    const waveOffset = waveCount > 0 ? Math.sin(Math.PI * 2 * waveCount) * waveHeight : 0;
    
    // 外圈頂點
    const outerRadius = topRadius + waveOffset;
    vertices.push(
      cos * outerRadius,
      height,
      sin * outerRadius
    );
    uvs.push(i / radialSegments, 1);
    topRim.push(topStart + i * 2);

    // 內圈頂點
    const innerRadius = outerRadius - thickness;
    vertices.push(
      cos * innerRadius,
      height,
      sin * innerRadius
    );
    uvs.push(i / radialSegments, 0.9);
    topInnerRim.push(topStart + i * 2 + 1);
  }

  // 生成頂部的面片
  for (let i = 0; i < radialSegments; i++) {
    // 頂部環形面片
    indices.push(topRim[i], topRim[i + 1], topInnerRim[i]);
    indices.push(topInnerRim[i], topRim[i + 1], topInnerRim[i + 1]);
  }

  // 生成底部面片
  const bottomStart = vertices.length / 3;
  const bottomRim = [];
  const bottomInnerRim = [];

  // 添加底部環形的頂點
  for (let i = 0; i <= radialSegments; i++) {
    const angle = (i / radialSegments) * Math.PI * 2;
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    // 外圈頂點
    vertices.push(
      cos * bottomRadius,
      0,
      sin * bottomRadius
    );
    uvs.push(i / radialSegments, 0);
    bottomRim.push(bottomStart + i * 2);

    // 內圈頂點
    const innerRadius = bottomRadius - thickness;
    vertices.push(
      cos * innerRadius,
      0,
      sin * innerRadius
    );
    uvs.push(i / radialSegments, 0.1);
    bottomInnerRim.push(bottomStart + i * 2 + 1);
  }

  // 添加底部中心點
  const bottomCenterOuter = vertices.length / 3;
  vertices.push(0, 0, 0);
  uvs.push(0.5, 0);

  const bottomCenterInner = bottomCenterOuter + 1;
  vertices.push(0, 0, 0);
  uvs.push(0.5, 0.1);

  // 生成底部的面片
  for (let i = 0; i < radialSegments; i++) {
    // 外部底面
    indices.push(bottomRim[i], bottomCenterOuter, bottomRim[i + 1]);
    
    // 內部底面（反向）
    indices.push(bottomInnerRim[i], bottomInnerRim[i + 1], bottomCenterInner);
  }

  // 創建幾何體
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  // 計算法向量
  geometry.computeVertexNormals();

  // 直接返回幾何體
  return geometry;
} 