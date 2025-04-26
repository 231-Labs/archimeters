// 創建一個帶波浪紋理的球體 - 尺寸單位：毫米
const radius = 40;          // 球體半徑 40mm
const widthSegments = 64;   // 經度分段數（增加以獲得更平滑的表面）
const heightSegments = 64;  // 緯度分段數（增加以獲得更平滑的表面）

// 創建一個球體
const geometry = new THREE.SphereGeometry(
  radius,
  widthSegments,
  heightSegments,
  0,          // phiStart
  Math.PI * 2,// phiLength
  0,          // thetaStart
  Math.PI     // thetaLength
);

// 創建波浪紋理
const positions = geometry.attributes.position;
const count = positions.count;

for (let i = 0; i < count; i++) {
  const x = positions.getX(i);
  const y = positions.getY(i);
  const z = positions.getZ(i);
  
  // 計算球面坐標
  const r = Math.sqrt(x * x + y * y + z * z);
  const theta = Math.acos(y / r);
  const phi = Math.atan2(z, x);
  
  // 添加波浪效果
  const waves = 8;
  const amplitude = 4;    // 波浪振幅 4mm
  const newRadius = r + Math.sin(theta * waves) * amplitude;
  
  // 轉換回笛卡爾坐標
  const newX = newRadius * Math.sin(theta) * Math.cos(phi);
  const newY = newRadius * Math.cos(theta);
  const newZ = newRadius * Math.sin(theta) * Math.sin(phi);
  
  positions.setXYZ(i, newX, newY, newZ);
}

positions.needsUpdate = true;
geometry.computeVertexNormals(); 