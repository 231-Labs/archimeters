const parameters = [
    { "key": "radius", "label": "半徑", "type": "number", "min": 10, "max": 100, "default": 50 }
  ];
  
  function generate(scene, params = {}) {
    const radius = params.radius || 50;
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x00eaff,
      metalness: 0.3,
      roughness: 0.4
    });
    const mesh = new THREE.Mesh(geometry, material);
    
    // 設置位置和旋轉
    mesh.position.set(0, 0, 0);
    mesh.rotation.set(0, 0, 0);
    
    return mesh;
  }
  
  // 導出模組
  if (typeof module !== 'undefined') {
    module.parameters = parameters;
    module.generate = generate;
  } else {
    // 如果不在 Node.js 環境中，則使用全局變數
    globalThis.parameters = parameters;
    globalThis.generate = generate;
  }