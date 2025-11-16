# Animated Sculpt Support - Implementation Plan

## 📋 Current Status

### ✅ What We Already Have

**Contract (`sculpt.move`):**
```move
public struct Sculpt<phantom ATELIER> has key, store {
    atelier_id: ID,              // ✅ Links to parent Atelier
    parameters: VecMap<String, u64>,  // ✅ Stores parameter values
    glb_file: String,            // ✅ Static model backup
    // ... other fields
}
```

**Data Flow:**
1. Mint Sculpt → `param_keys` & `param_values` validated against Atelier rules
2. Parameters saved to `Sculpt.parameters` (VecMap)
3. GLB exported as static snapshot

### ❌ What's Missing

1. **Parameter read function** (contract)
   - Can't retrieve `parameters` from Sculpt
   
2. **Frontend rendering logic** (Pavilion)
   - No logic to detect animated artworks
   - No dynamic rendering for animated Sculpts

---

## 🎯 Implementation Plan

### Phase 1: Contract Changes (Minimal)

**Add parameter getter functions to `sculpt.move`:**

```move
/// Get all parameters as VecMap
public fun get_parameters<T>(sculpt: &Sculpt<T>): &VecMap<String, u64> {
    &sculpt.parameters
}

/// Get parameter keys and values as vectors
public fun get_parameter_keys_and_values<T>(sculpt: &Sculpt<T>): (vector<String>, vector<u64>) {
    let keys = vec_map::keys(&sculpt.parameters);
    let values = vec_map::values(&sculpt.parameters);
    (keys, values)
}
```

**Status:** Not implemented yet

---

### Phase 2: Frontend Logic

**Pavilion Rendering Strategy:**

```typescript
// Fetch Sculpt data
const sculpt = await fetchSculpt(sculptId);
const atelier = await fetchAtelier(sculpt.atelier_id);

// Determine artwork type
const isPrintable = atelier.metadata?.isPrintable ?? true;

// Render based on type
if (isPrintable) {
  // 3D Printable → Static GLB
  return <GLBViewer blobId={sculpt.glb_file} />;
} else {
  // 2D/Animated → Dynamic rendering
  const params = reconstructParameters(sculpt.parameters, atelier.parameters);
  return (
    <ParametricViewer
      userScript={atelier.algorithm_content}
      parameters={params}
      isPrintable={false}
    />
  );
}
```

**Status:** Not implemented yet

---

## 📊 Data Architecture

### Reference-Based Approach (Recommended)

```
┌─────────────────────────────────┐
│ Atelier (Template)              │
├─────────────────────────────────┤
│ - algorithm_content (JS code)  │
│ - parameters (definitions)     │
│ - isPrintable: false           │
└─────────────────────────────────┘
             ↑ Reference
             │
┌────────────┴────────────────────┐
│ Sculpt A (Instance 1)          │
├─────────────────────────────────┤
│ - atelier_id: "0xABC"          │
│ - parameters: {speed: 50}      │ ← Unique values
│ - glb_file: "blob123"          │ ← Static backup
└─────────────────────────────────┘

Result:
✅ Shares algorithm (saves storage)
✅ Each Sculpt has unique parameters
✅ Each Sculpt shows different animation
```

**Benefits:**
- Low storage cost (algorithm stored once in Atelier)
- Fast minting (only upload GLB)
- Consistent algorithm across all Sculpts
- Each Sculpt maintains unique parameter values

---

## 🔧 Parameter Reconstruction

**From chain to viewer:**

```typescript
// Chain format
sculpt.parameters = VecMap<String, u64>
  { "speed": 280, "amplitude": 35, "color": 16711935 }

// Atelier parameter definitions
atelier.parameters = {
  speed: { min: 0, max: 300, default: 100 },
  amplitude: { min: 5, max: 40, default: 15 },
  color: { type: 'color', default: '#00ffff' }
}

// Reconstruct for viewer
function reconstructParameters(sculptParams, atelierParams) {
  return Object.fromEntries(
    sculptParams.map(([key, chainValue]) => {
      const def = atelierParams[key];
      const actualValue = convertFromChain(chainValue, def);
      return [key, actualValue];
    })
  );
}

// Result
{ speed: 2.8, amplitude: 35, color: '#00ffff' }
```

---

## 🎨 Use Cases

### Animated Waves Example

**Single Atelier:**
- Algorithm: `animated_waves.js` (100KB)
- Parameters: speed, amplitude, color

**Multiple Sculpts with unique animations:**

| Sculpt | Speed | Amplitude | Color | Effect |
|--------|-------|-----------|-------|--------|
| A | 0.3 | 8 | Blue | Calm ocean |
| B | 2.8 | 35 | Red | Storm |
| C | 1.0 | 15 | Cyan | Normal |

**Storage:**
- Atelier: 100KB (algorithm)
- Sculpt A-C: 3×2MB (GLB only)
- Total: 100KB + 6MB = 6.1MB

**Alternative (store algorithm in each Sculpt):**
- Total: 300KB + 6MB = 6.3MB
- Not recommended

---

## ⚠️ Important Notes

### Current Limitations

1. **GLB files don't contain animations**
   - `exportScene()` only exports current geometry state
   - JavaScript `animate()` functions are NOT saved in GLB
   - GLB is purely a static snapshot

2. **Pavilion display requirements**
   - MUST use Atelier's `algorithm_content` for animations
   - MUST use Sculpt's `parameters` for unique values
   - GLB can serve as fallback/thumbnail

3. **Type detection**
   - `isPrintable` flag from Atelier metadata
   - Runtime detection from algorithm code (backup)
   - See `ARTWORK_TYPES.md` for details

---

## 🚀 Next Steps

### High Priority
1. [ ] Add parameter getter functions to contract
2. [ ] Deploy contract update
3. [ ] Test parameter retrieval from chain

### Medium Priority
4. [ ] Implement Pavilion rendering logic
5. [ ] Add parameter reconstruction utility
6. [ ] Test with animated artworks

### Low Priority
7. [ ] Add type indicators in Pavilion UI
8. [ ] Performance optimization for large datasets
9. [ ] Error handling for missing Ateliers

---

## 📝 Related Documents

- `ARTWORK_TYPES.md` - Artwork type system (3D vs 2D/Animated)
- `contract/sources/sculpt/sculpt.move` - Sculpt contract
- `contract/sources/atelier/atelier.move` - Atelier contract

---

**Last Updated:** 2025-11-16  
**Status:** Planning Phase  
**Priority:** Medium (deferred)

