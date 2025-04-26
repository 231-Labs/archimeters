// 波浪形參數化設計
function generateGeometry(parameters) {
  const {
    width = 5,
    height = 5,
    depth = 0.5,
    segments = 32,
    waveX = 1,
    waveY = 1,
    waveZ = 1,
    waveFrequency = 1,
    waveAmplitude = 0.2,
    phase = 0
  } = parameters;

  // 創建基礎平面
  const geometry = new THREE.PlaneGeometry(width, height, segments, segments);

  // 獲取頂點位置
  const positions = geometry.attributes.position.array;
  const vertexCount = positions.length / 3;

  // 應用波浪變形
  for (let i = 0; i < vertexCount; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];

    // 計算波浪效果
    const waveXValue = Math.sin(y * waveFrequency + phase) * waveAmplitude * waveX;
    const waveYValue = Math.sin(x * waveFrequency + phase) * waveAmplitude * waveY;
    const waveZValue = Math.sin((x + y) * waveFrequency + phase) * waveAmplitude * waveZ;

    // 更新頂點位置
    positions[i * 3] += waveXValue;
    positions[i * 3 + 1] += waveYValue;
    positions[i * 3 + 2] = waveZValue * depth;
  }

  // 更新法線
  geometry.computeVertexNormals();

  return geometry;
} 