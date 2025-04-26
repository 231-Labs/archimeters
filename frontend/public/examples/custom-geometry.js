// 創建一個自定義幾何體
function createGeometry(THREE) {
  // 創建一個 BufferGeometry
  const geometry = new THREE.BufferGeometry();

  // 定義頂點
  const vertices = new Float32Array([
    // 前面（三角形）
    -1.0, -1.0,  1.0,  // v0
     1.0, -1.0,  1.0,  // v1
     0.0,  1.0,  0.0,  // v2

    // 右面（三角形）
     1.0, -1.0,  1.0,  // v3
     1.0, -1.0, -1.0,  // v4
     0.0,  1.0,  0.0,  // v5

    // 後面（三角形）
     1.0, -1.0, -1.0,  // v6
    -1.0, -1.0, -1.0,  // v7
     0.0,  1.0,  0.0,  // v8

    // 左面（三角形）
    -1.0, -1.0, -1.0,  // v9
    -1.0, -1.0,  1.0,  // v10
     0.0,  1.0,  0.0   // v11
  ]);

  // 定義法向量
  const normals = new Float32Array([
    // 前面
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,

    // 右面
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,

    // 後面
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,

    // 左面
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0
  ]);

  // 設置頂點位置
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  // 設置法向量
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  // 計算頂點法向量
  geometry.computeVertexNormals();

  return geometry;
} 