// Multi-Color Cube - 3D Printable Example
// Demonstrates vertex color support in 3D printable artworks
// @printable true

const parameters = {
  size: {
    label: 'Cube Size',
    type: 'number',
    default: 15,
    min: 5,
    max: 30,
    step: 1
  },
  color1: {
    label: 'Front & Bottom Color',
    type: 'color',
    default: '#ff6b9d'
  },
  color2: {
    label: 'Back & Right Color',
    type: 'color',
    default: '#4ecdc4'
  },
  color3: {
    label: 'Top & Left Color',
    type: 'color',
    default: '#ffe66d'
  }
};

// Helper function to convert hex to RGB
function hexToRGB(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 1, g: 0.4, b: 0.6 };
}

function createGeometry(THREE, params) {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const colors = [];
  const indices = [];
  
  const size = params.size || 15;
  const color1 = hexToRGB(params.color1 || '#ff6b9d');
  const color2 = hexToRGB(params.color2 || '#4ecdc4');
  const color3 = hexToRGB(params.color3 || '#ffe66d');
  
  const halfSize = size / 2;
  
  // Define the 8 corners of the cube
  const cubeVertices = [
    [-halfSize, -halfSize, -halfSize], // 0
    [halfSize, -halfSize, -halfSize],  // 1
    [halfSize, halfSize, -halfSize],   // 2
    [-halfSize, halfSize, -halfSize],  // 3
    [-halfSize, -halfSize, halfSize],  // 4
    [halfSize, -halfSize, halfSize],   // 5
    [halfSize, halfSize, halfSize],    // 6
    [-halfSize, halfSize, halfSize]    // 7
  ];
  
  // Define faces with different colors
  const faces = [
    // Front face (color1) - Z+
    { vertices: [4, 5, 6, 7], color: color1, name: 'front' },
    // Back face (color2) - Z-
    { vertices: [1, 0, 3, 2], color: color2, name: 'back' },
    // Top face (color3) - Y+
    { vertices: [7, 6, 2, 3], color: color3, name: 'top' },
    // Bottom face (color1) - Y-
    { vertices: [4, 5, 1, 0], color: color1, name: 'bottom' },
    // Right face (color2) - X+
    { vertices: [5, 1, 2, 6], color: color2, name: 'right' },
    // Left face (color3) - X-
    { vertices: [0, 4, 7, 3], color: color3, name: 'left' }
  ];
  
  // Build geometry face by face
  let vertexIndex = 0;
  
  faces.forEach(face => {
    const startIndex = vertexIndex;
    
    // Add vertices for this face (need 4 vertices per face)
    face.vertices.forEach(vIdx => {
      vertices.push(...cubeVertices[vIdx]);
      colors.push(face.color.r, face.color.g, face.color.b);
      vertexIndex++;
    });
    
    // Add two triangles for this face (quad = 2 triangles)
    indices.push(
      startIndex, startIndex + 1, startIndex + 2,
      startIndex, startIndex + 2, startIndex + 3
    );
  });
  
  // Set geometry attributes
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  
  // Compute normals for proper lighting
  geometry.computeVertexNormals();
  
  // Compute bounding box (required for proper positioning)
  geometry.computeBoundingBox();
  
  return geometry;
}

