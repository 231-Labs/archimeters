// 創建一個扭曲的環形 - 尺寸單位：毫米
const radius = 40;         // 環的半徑 40mm
const tubeRadius = 8;      // 管的半徑 8mm
const radialSegments = 100;  // 環的分段數
const tubularSegments = 50;  // 管的分段數

// 創建基礎環形幾何體
const geometry = new THREE.TorusGeometry(
  radius,
  tubeRadius,
  radialSegments,
  tubularSegments
);

// 對頂點進行扭曲變形
const positions = geometry.attributes.position;
const count = positions.count;

for (let i = 0; i < count; i++) {
  const x = positions.getX(i);
  const y = positions.getY(i);
  const z = positions.getZ(i);
  
  // 計算到中心的距離
  const distance = Math.sqrt(x * x + z * z);
  
  // 根據距離進行 Y 軸扭曲
  const twist = (distance / radius) * Math.PI * 0.75; // 增加扭曲程度到 0.75π
  
  // 應用扭曲變形
  const newX = x * Math.cos(twist) - z * Math.sin(twist);
  const newZ = x * Math.sin(twist) + z * Math.cos(twist);
  
  positions.setXYZ(i, newX, y, newZ);
}

positions.needsUpdate = true;
geometry.computeVertexNormals(); 