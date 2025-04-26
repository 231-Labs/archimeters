// 創建一個環形結（Torus Knot）- 尺寸單位：毫米
const radius = 30;        // 主半徑 30mm
const tube = 8;          // 管道半徑 8mm
const tubularSegments = 100; // 管道分段數
const radialSegments = 20;   // 徑向分段數
const p = 2;             // 環繞主圓的次數
const q = 3;             // 環繞管道的次數

const geometry = new THREE.TorusKnotGeometry(
  radius,
  tube,
  tubularSegments,
  radialSegments,
  p,
  q
); 