const parameters = [
  { 
    key: 'radius', 
    label: '主半徑', 
    type: 'number', 
    min: 2, 
    max: 10, 
    default: 5 
  },
  { 
    key: 'tubeRadius', 
    label: '管半徑', 
    type: 'number', 
    min: 0.5, 
    max: 3, 
    default: 1 
  },
  { 
    key: 'radialSegments', 
    label: '徑向分段', 
    type: 'number', 
    min: 8, 
    max: 50, 
    default: 30 
  },
  { 
    key: 'tubularSegments', 
    label: '管向分段', 
    type: 'number', 
    min: 8, 
    max: 100, 
    default: 50 
  },
  { 
    key: 'emissive', 
    label: '發光顏色', 
    type: 'color', 
    default: '#000000' 
  },
  { 
    key: 'color', 
    label: '主顏色', 
    type: 'color', 
    default: '#ff3366' 
  }
];

function generate(scene, params) {
  const {
    radius = 5,
    tubeRadius = 1,
    radialSegments = 30,
    tubularSegments = 50,
    emissive = '#000000',
    color = '#ff3366'
  } = params;

  // 創建環面幾何體
  const geometry = new THREE.TorusGeometry(
    radius,
    tubeRadius,
    radialSegments,
    tubularSegments
  );

  // 創建材質
  const material = new THREE.MeshStandardMaterial({
    color: color,
    emissive: emissive,
    metalness: 0.3,
    roughness: 0.4,
    side: THREE.DoubleSide
  });

  // 創建網格
  const mesh = new THREE.Mesh(geometry, material);
  
  return mesh;
}

module.parameters = parameters;
module.generate = generate; 