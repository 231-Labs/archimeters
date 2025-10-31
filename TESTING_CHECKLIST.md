# Testing & Code Review Checklist

**Branch:** `feature/kiosk-royalty-and-params-validation`  
**Status:** ⚠️ **PENDING REVIEW AND TESTING**  
**Date:** 2025-10-31

---

## 🔴 Important Notice

**This version has NOT been reviewed or tested yet.**  
All items below require thorough testing and verification before merging to main.

---

## 📋 Changes Overview

### 1. Move Smart Contract Changes

#### `sculpt.move`
- ✅ Integrated Sui Kiosk standard for creator royalties
- ✅ Added TransferPolicy and TransferPolicyCap initialization
- ✅ Added `set_royalty_rate` entry function
- ✅ Modified `mint_sculpt` to place items in Kiosk
- ⚠️ **REQUIRES TESTING**

#### `atelier.move`
- ✅ Added ParameterRule struct with basis points support
- ✅ Added ParameterRules container using VecMap
- ✅ Modified `mint_atelier` to accept parameter rules
- ✅ Added `validate_parameter` function (package level)
- ✅ Added getter functions for parameter rules
- ⚠️ **REQUIRES TESTING**

### 2. Frontend Refactoring

#### Type Definitions (`types/index.ts`)
- ✅ Added GeometryParameter interface
- ✅ Added ParameterRule interface
- ✅ Added ParameterRules interface
- ⚠️ **REQUIRES REVIEW**

#### New Hooks
- ✅ `useAlgorithmFile.ts` - File upload logic
- ✅ `useGeometryScript.ts` - Geometry script processing
- ✅ Enhanced `useParameters.ts` with basis points conversion
- ⚠️ **REQUIRES TESTING**

#### New Components
- ✅ `AlgorithmFileUploader.tsx`
- ✅ `ParameterList.tsx`
- ✅ `DesignSettings.tsx`
- ⚠️ **REQUIRES TESTING**

#### Refactored Components
- ✅ `AlgorithmPage.tsx` - Fully refactored
- ✅ `ParametricViewer.tsx` - Cleaned up
- ✅ `index.tsx` - Cleaned up
- ⚠️ **REQUIRES TESTING**

---

## 🧪 Testing Checklist

### Move Contract Testing

#### `sculpt.move`
- [ ] **Init Function**
  - [ ] Verify TransferPolicy is created correctly
  - [ ] Verify initial royalty is set to 0%
  - [ ] Verify TransferPolicyCap is transferred to deployer
  - [ ] Verify Publisher is transferred correctly

- [ ] **set_royalty_rate Function**
  - [ ] Test setting royalty rate (e.g., 500 = 5%)
  - [ ] Test rate validation (should not exceed 10000 basis points)
  - [ ] Test permission check (only TransferPolicyCap owner can call)
  - [ ] Verify RoyaltyUpdated event is emitted

- [ ] **mint_sculpt Function**
  - [ ] Test with valid Kiosk and KioskOwnerCap
  - [ ] Verify Sculpt is placed in Kiosk (not transferred directly)
  - [ ] Test payment validation
  - [ ] Test with insufficient payment
  - [ ] Verify all IDs are added correctly (membership, atelier)
  - [ ] Verify New_sculpt event is emitted

#### `atelier.move`
- [ ] **mint_atelier Function**
  - [ ] Test with valid parameter rules
  - [ ] Test with empty parameter rules
  - [ ] Test with mismatched vector lengths (should fail)
  - [ ] Verify ParameterRules are stored correctly
  - [ ] Test basis points conversion (e.g., 5.25 → 525)

- [ ] **validate_parameter Function**
  - [ ] Test with valid parameter within range
  - [ ] Test with parameter below min_value
  - [ ] Test with parameter above max_value
  - [ ] Test with non-existent parameter key
  - [ ] Verify basis points comparison works correctly

- [ ] **Parameter Getter Functions**
  - [ ] Test get_parameter_rule with valid key
  - [ ] Test get_parameter_rule with invalid key (should abort)
  - [ ] Test get_parameter_rules returns correct structure

### Frontend Testing

#### File Upload
- [ ] **Algorithm File Upload**
  - [ ] Test .js file upload
  - [ ] Test .ts file upload
  - [ ] Test .tsx file upload
  - [ ] Test invalid file type (should show error)
  - [ ] Test file type error message display
  - [ ] Verify file content is read correctly

#### Parameter Parsing
- [ ] **useParameters Hook**
  - [ ] Test parameter extraction from various formats
  - [ ] Test basis points conversion (multiply by 100)
  - [ ] Test exportParameterRules function
  - [ ] Test with number parameters
  - [ ] Test with color parameters
  - [ ] Test with mixed parameter types
  - [ ] Test error handling for invalid code

#### UI Components
- [ ] **AlgorithmPage**
  - [ ] Test file uploader display
  - [ ] Test preview mode toggle
  - [ ] Test parameter list display
  - [ ] Test design settings (disabled state)
  - [ ] Verify all sub-components render correctly

- [ ] **AlgorithmFileUploader**
  - [ ] Test drag and drop functionality
  - [ ] Test file input click
  - [ ] Test error state display
  - [ ] Test required state display

- [ ] **ParameterList**
  - [ ] Test with extracted parameters
  - [ ] Test empty state (no file uploaded)
  - [ ] Test processing state
  - [ ] Verify parameter display formatting

- [ ] **DesignSettings**
  - [ ] Verify style selector is disabled
  - [ ] Verify font style selector is disabled
  - [ ] Test selector values are correct

#### 3D Viewer
- [ ] **ParametricViewer**
  - [ ] Test with valid geometry script
  - [ ] Test with no script (should show placeholder)
  - [ ] Test parameter updates trigger re-render
  - [ ] Test error state display
  - [ ] Verify scene loads correctly

#### Integration Testing
- [ ] **Full Workflow**
  - [ ] Upload algorithm file
  - [ ] Verify parameters are extracted
  - [ ] Toggle preview mode
  - [ ] Verify 3D preview renders
  - [ ] Check parameter rules can be exported
  - [ ] Test navigation between pages
  - [ ] Verify data persists across page changes

---

## 🔍 Code Review Checklist

### Move Contracts

#### Security
- [ ] No unauthorized access to admin functions
- [ ] Proper permission checks using capabilities
- [ ] No integer overflow/underflow risks
- [ ] Proper error handling with meaningful error codes

#### Logic
- [ ] Basis points calculation is correct (divide by 100 for decimals)
- [ ] Vector operations are safe (no index out of bounds)
- [ ] VecMap operations handle duplicates correctly
- [ ] TransferPolicy integration follows Sui standards

#### Gas Optimization
- [ ] Unnecessary computations removed
- [ ] Efficient data structures used (VecMap vs Table)
- [ ] No redundant storage operations

### Frontend

#### Code Quality
- [ ] No unused variables or imports
- [ ] No console.log statements (except error handling)
- [ ] Consistent naming conventions
- [ ] Proper TypeScript types (no `any` unless necessary)
- [ ] No Chinese comments (all English)

#### React Best Practices
- [ ] Proper use of useCallback and useMemo
- [ ] No unnecessary re-renders
- [ ] Proper cleanup in useEffect
- [ ] Refs used appropriately
- [ ] No prop drilling (use composition)

#### Component Architecture
- [ ] Components are single-responsibility
- [ ] Proper separation of concerns
- [ ] Reusable components extracted
- [ ] Clear component hierarchy
- [ ] Props are well-typed and documented

#### Error Handling
- [ ] User-friendly error messages
- [ ] Proper error boundaries
- [ ] Loading states handled
- [ ] Edge cases covered

---

## 🔗 Integration Points to Verify

### Contract ↔ Frontend
- [ ] Parameter rules format matches between Move and TypeScript
- [ ] Basis points conversion is consistent (×100 frontend → Move)
- [ ] Kiosk and KioskOwnerCap are properly created before minting
- [ ] Transaction builder includes all new parameters
- [ ] Event listeners capture new events (RoyaltyUpdated)

### Component Communication
- [ ] Props are passed correctly between parent and children
- [ ] State updates propagate as expected
- [ ] Callback functions work correctly
- [ ] No circular dependencies

---

## 📊 Performance Testing

### Frontend
- [ ] Initial page load time
- [ ] File upload responsiveness
- [ ] 3D rendering performance
- [ ] Parameter update lag
- [ ] Memory leaks check

### Contracts
- [ ] Gas costs for mint_atelier with parameters
- [ ] Gas costs for mint_sculpt with Kiosk
- [ ] Gas costs for set_royalty_rate
- [ ] Storage costs comparison (before/after)

---

## 🚨 Known Issues / Limitations

### Current Limitations
1. **Kiosk Requirement**: Users must have a Kiosk and KioskOwnerCap before minting Sculpts
2. **Basis Points**: Limited to 2 decimal places (e.g., 5.25 max precision)
3. **Parameter Types**: Only 'number' and 'color' types supported
4. **Design Settings**: Currently disabled in UI

### Potential Issues
1. **Migration**: Existing contracts won't have ParameterRules
2. **Backwards Compatibility**: Old frontend may not work with new contracts
3. **Kiosk Setup**: Need to ensure users can create Kiosk easily

---

## ✅ Acceptance Criteria

### Must Have (Before Merge)
- [ ] All Move contract functions tested on testnet
- [ ] All frontend components tested manually
- [ ] No TypeScript errors
- [ ] No linter errors
- [ ] Integration test passes end-to-end
- [ ] Code review completed by at least one other developer

### Nice to Have
- [ ] Unit tests for hooks
- [ ] Unit tests for Move contracts
- [ ] E2E tests with Playwright/Cypress
- [ ] Performance benchmarks
- [ ] Documentation updated

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] All tests passed
- [ ] Code review approved
- [ ] Update contract addresses in frontend config
- [ ] Backup existing contract state
- [ ] Create deployment script with new parameters

### Deployment Steps
1. [ ] Deploy new contracts to testnet
2. [ ] Verify contracts on explorer
3. [ ] Test with frontend on testnet
4. [ ] Deploy frontend to staging
5. [ ] Full integration test on staging
6. [ ] Deploy to mainnet (if approved)
7. [ ] Update documentation

### Post-Deployment
- [ ] Monitor for errors in production
- [ ] Verify gas costs are acceptable
- [ ] Check user feedback
- [ ] Update changelog

---

## 🔄 Rollback Plan

If critical issues are found:
1. Revert frontend deployment
2. Keep contracts (immutable on-chain)
3. Deploy hotfix or previous version frontend
4. Notify users of temporary service changes
5. Create incident report

---

## 📞 Review Sign-off

- [ ] **Developer**: _________________ (Date: _________)
- [ ] **Reviewer 1**: _________________ (Date: _________)
- [ ] **Reviewer 2**: _________________ (Date: _________)
- [ ] **QA Tester**: _________________ (Date: _________)

---

**Last Updated**: 2025-10-31  
**Next Review Date**: TBD after initial testing

