// 創建一個環面幾何體
function createGeometry(THREE) {
  return new THREE.TorusGeometry(
    2,    // 主半徑
    0.5,  // 管半徑
    16,   // 徑向分段
    100   // 管向分段
  );
} 