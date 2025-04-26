// 螺旋形參數化設計
function generateGeometry(parameters) {
  const {
    radius = 1,
    height = 5,
    turns = 5,
    segments = 32,
    thickness = 0.2,
    wave = 0,
    waveFrequency = 1,
    waveAmplitude = 0.1,
    spiralRadius = 0.5
  } = parameters;

  // 創建基礎圓柱體
  const geometry = new THREE.CylinderGeometry(radius, radius, height, segments);

  // 獲取頂點位置
  const positions = geometry.attributes.position.array;
  const vertexCount = positions.length / 3;

  // 應用螺旋變形
  for (let i = 0; i < vertexCount; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];

    // 計算到中心的距離
    const distance = Math.sqrt(x * x + z * z);
    const angle = Math.atan2(z, x);

    // 計算螺旋角度
    const spiralAngle = (y / height) * turns * Math.PI * 2;
    const newAngle = angle + spiralAngle;

    // 計算螺旋半徑
    const currentSpiralRadius = spiralRadius * (1 + Math.sin(y * waveFrequency) * waveAmplitude);

    // 更新頂點位置
    positions[i * 3] = Math.cos(newAngle) * currentSpiralRadius;
    positions[i * 3 + 2] = Math.sin(newAngle) * currentSpiralRadius;
  }

  // 更新法線
  geometry.computeVertexNormals();

  return geometry;
} 