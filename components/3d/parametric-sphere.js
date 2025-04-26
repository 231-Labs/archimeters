const parameters = [
  { 
    key: 'radius', 
    label: '球體半徑', 
    type: 'number', 
    min: 1, 
    max: 10, 
    default: 3 
  },
  { 
    key: 'segments', 
    label: '細分度', 
    type: 'number', 
    min: 8, 
    max: 64, 
    default: 32 
  },
  { 
    key: 'metalness', 
    label: '金屬度', 
    type: 'number', 
    min: 0, 
    max: 1, 
    default: 0.5 
  },
  { 
    key: 'roughness', 
    label: '粗糙度', 
    type: 'number', 
    min: 0, 
    max: 1, 
    default: 0.3 
  },
  { 
    key: 'color', 
    label: '顏色', 
    type: 'color', 
    default: '#00a5ff' 
  }
];

function generate(scene, params) {
  const {
    radius = 3,
    segments = 32,
    metalness = 0.5,
    roughness = 0.3,
    color = '#00a5ff'
  } = params;

  // 創建球體幾何體
  const geometry = new THREE.SphereGeometry(
    radius,
    segments,
    segments
  );

  // 創建材質
  const material = new THREE.MeshStandardMaterial({
    color: color,
    metalness: metalness,
    roughness: roughness,
    side: THREE.DoubleSide
  });

  // 創建網格
  const mesh = new THREE.Mesh(geometry, material);
  
  return mesh;
}

module.parameters = parameters;
module.generate = generate; 