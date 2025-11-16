# Multi-Color Support for 3D Printable Artworks

## Overview

As of the latest update, both 3D printable and 2D animated artworks now support **vertex colors**. This means you can create geometries with multiple colors by assigning colors to individual vertices.

## How It Works

### Automatic Detection

The rendering system now automatically detects whether a geometry has vertex colors:

1. When you create geometry with a `color` attribute, the system will use `vertexColors: true`
2. When geometry has no `color` attribute, it falls back to using the `color` parameter (single color)
3. This is fully backward compatible - existing single-color artworks continue to work

### Technical Implementation

**Before (Single Color Only):**
```javascript
const material = new THREE.MeshPhongMaterial({
  color: params.color || 0xff3366,
  // ... other properties
});
```

**After (Multi-Color Support):**
```javascript
const hasVertexColors = geometry.getAttribute('color') !== undefined;

const material = new THREE.MeshPhongMaterial({
  color: hasVertexColors ? 0xffffff : (params.color || 0xff3366),
  vertexColors: hasVertexColors,
  // ... other properties
});
```

## Usage Example: Creating Multi-Color Geometry

Here's how to create a 3D printable artwork with multiple colors:

```javascript
const parameters = {
  size: {
    label: 'Size',
    type: 'number',
    default: 10,
    min: 5,
    max: 20
  },
  color1: {
    label: 'Color 1',
    type: 'color',
    default: '#ff6b9d'
  },
  color2: {
    label: 'Color 2',
    type: 'color',
    default: '#4ecdc4'
  },
  color3: {
    label: 'Color 3',
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
  } : { r: 1, g: 0, b: 0 };
}

function createGeometry(THREE, params) {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const colors = [];
  const indices = [];
  
  const size = params.size || 10;
  const color1 = hexToRGB(params.color1 || '#ff6b9d');
  const color2 = hexToRGB(params.color2 || '#4ecdc4');
  const color3 = hexToRGB(params.color3 || '#ffe66d');
  
  // Example: Create a cube with different colored faces
  const halfSize = size / 2;
  
  // Define vertices (8 corners of a cube)
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
    // Front face (color1)
    { vertices: [4, 5, 6, 7], color: color1 },
    // Back face (color2)
    { vertices: [0, 1, 2, 3], color: color2 },
    // Top face (color3)
    { vertices: [3, 2, 6, 7], color: color3 },
    // Bottom face (color1)
    { vertices: [0, 1, 5, 4], color: color1 },
    // Right face (color2)
    { vertices: [1, 5, 6, 2], color: color2 },
    // Left face (color3)
    { vertices: [0, 4, 7, 3], color: color3 }
  ];
  
  // Build geometry
  let vertexIndex = 0;
  faces.forEach(face => {
    const startIndex = vertexIndex;
    
    // Add vertices for this face
    face.vertices.forEach(vIdx => {
      vertices.push(...cubeVertices[vIdx]);
      colors.push(face.color.r, face.color.g, face.color.b);
      vertexIndex++;
    });
    
    // Add triangles for this face (two triangles per quad)
    indices.push(
      startIndex, startIndex + 1, startIndex + 2,
      startIndex, startIndex + 2, startIndex + 3
    );
  });
  
  // Set attributes
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  
  return geometry;
}
```

## Benefits

### For 3D Printable Artworks
- **Multi-material printing**: Useful for planning multi-color 3D prints
- **Visual appeal**: Better preview of how the final piece will look
- **Design flexibility**: More creative freedom in parametric designs

### For 2D Animated Artworks
- Already supported with `MeshBasicMaterial` and `vertexColors: true`
- Now also works when falling back to static geometry mode

## Backward Compatibility

✅ **All existing artworks continue to work without changes**

- Artworks without vertex colors use the `color` parameter as before
- The system automatically detects and handles both cases
- No migration needed for existing designs

## Best Practices

1. **Use color parameters**: Define color parameters in your `parameters` object so users can customize colors
2. **Convert hex to RGB**: Use the `hexToRGB()` helper function to convert hex colors to RGB values (0-1 range)
3. **Assign per-vertex colors**: Set colors for each vertex using `geometry.setAttribute('color', ...)`
4. **Compute normals**: Always call `geometry.computeVertexNormals()` for proper lighting

## Technical Notes

- **Material**: Uses `MeshPhongMaterial` with `vertexColors: true` when colors are detected
- **Lighting**: Vertex colors work with the scene's lighting system (PhongMaterial)
- **Performance**: No performance impact - detection happens once during geometry creation
- **STL Export**: For 3D printing, STL files don't support colors (they're geometry-only), but the preview shows your color design

## See Also

- [ANIMATED_SCULPT_SUPPORT.md](./ANIMATED_SCULPT_SUPPORT.md) - For animated artwork features
- [ARTWORK_TYPES.md](./ARTWORK_TYPES.md) - Understanding different artwork types

