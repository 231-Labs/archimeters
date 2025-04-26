const parameters = [
    { "key": "radius", "label": "半徑", "type": "number", "min": 20, "max": 80, "default": 50 },
    { "key": "thickness", "label": "殼厚", "type": "number", "min": 2, "max": 20, "default": 6 },
    { "key": "holeCount", "label": "孔洞數", "type": "number", "min": 3, "max": 24, "default": 8 },
    { "key": "twist", "label": "扭轉度", "type": "number", "min": 0, "max": 2, "default": 1 },
    { "key": "color", "label": "顏色", "type": "color", "default": "#00eaff" }
  ];
  
  function generate(scene, params) {
    const {
      radius = 50,
      thickness = 6,
      holeCount = 8,
      twist = 1,
      color = '#00eaff'
    } = params;
  
    const segments = 128;
    const rings = 64;
    const holes = Math.max(3, Math.floor(holeCount));
    const phiStep = (2 * Math.PI) / holes;
  
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const normals = [];
    const indices = [];
  
    for (let i = 0; i <= rings; i++) {
      const v = i / rings;
      const theta = v * Math.PI;
      for (let j = 0; j <= segments; j++) {
        const u = j / segments;
        let phi = u * 2 * Math.PI;
        phi += twist * Math.sin(theta * holes + phi * holes);
  
        let skip = false;
        for (let h = 0; h < holes; h++) {
          const holePhi = h * phiStep;
          const dPhi = Math.abs(phi - holePhi) % (2 * Math.PI);
          if (dPhi < 0.18 + 0.12 * Math.sin(theta * 2)) {
            skip = true;
            break;
          }
        }
        if (skip) {
          positions.push(NaN, NaN, NaN);
          normals.push(0, 0, 0);
          continue;
        }
  
        const r = radius + thickness * Math.sin(holes * phi + theta * 2);
        const x = r * Math.sin(theta) * Math.cos(phi);
        const y = r * Math.cos(theta);
        const z = r * Math.sin(theta) * Math.sin(phi);
  
        positions.push(x, y, z);
  
        const nx = Math.sin(theta) * Math.cos(phi);
        const ny = Math.cos(theta);
        const nz = Math.sin(theta) * Math.sin(phi);
        normals.push(nx, ny, nz);
      }
    }
  
    for (let i = 0; i < rings; i++) {
      for (let j = 0; j < segments; j++) {
        const a = i * (segments + 1) + j;
        const b = a + segments + 1;
        const c = b + 1;
        const d = a + 1;
  
        if (
          isNaN(positions[a * 3]) || isNaN(positions[b * 3]) ||
          isNaN(positions[c * 3]) || isNaN(positions[d * 3])
        ) continue;
  
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }
  
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setIndex(indices);
  
    const mat = new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.3,
      roughness: 0.15,
      transmission: 0.7,
      thickness: 2,
      side: THREE.DoubleSide,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2
    });
  
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.set(0, 0, 0);
    return mesh;
  }
  
  module.parameters = parameters;
  module.generate = generate;