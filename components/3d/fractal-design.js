// 分形參數化設計
function generateGeometry(parameters) {
  const {
    size = 2,
    iterations = 3,
    detail = 32,
    noise = 0.1,
    noiseScale = 1
  } = parameters;

  // 創建基礎立方體
  const geometry = new THREE.BoxGeometry(size, size, size, detail, detail, detail);

  // 獲取頂點位置
  const positions = geometry.attributes.position.array;
  const vertexCount = positions.length / 3;

  // 應用分形變形
  for (let i = 0; i < vertexCount; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];

    // 計算到中心的距離
    const distance = Math.sqrt(x * x + y * y + z * z);
    const maxDistance = size / 2;

    // 應用分形變形
    let newDistance = distance;
    for (let j = 0; j < iterations; j++) {
      const scale = Math.pow(2, j);
      const angle = Math.atan2(y, x) * scale;
      const height = z * scale;
      
      // 添加噪聲
      const noiseValue = Math.sin(angle + height) * noise;
      newDistance = newDistance * (1 + noiseValue * noiseScale);
    }

    // 更新頂點位置
    const scale = newDistance / distance;
    positions[i * 3] *= scale;
    positions[i * 3 + 1] *= scale;
    positions[i * 3 + 2] *= scale;
  }

  // 更新法線
  geometry.computeVertexNormals();

  return geometry;
} 