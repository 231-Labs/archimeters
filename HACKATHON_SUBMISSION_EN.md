# Archimeters - Changelog for Walrus Haulout Hackathon

## 📋 Project Overview

Archimeters is a parametric 3D design platform and marketplace built on the Sui blockchain. Creators can upload custom `three.js` 3D algorithms, and users can generate personalized designs through parameter adjustments and mint them as NFTs. This hackathon adds support for abstract 3D (non-printable objects) and implements complete data trading and encryption protection mechanisms.

### Business Model

**Reusable Design Algorithm Sales**: Unlike traditional one-time sales, Archimeters enables a "one algorithm, multiple revenue streams" business model. After creators upload a parametric design algorithm (Atelier), they earn revenue every time a user mints a Sculpt using that algorithm. This means an excellent design can generate continuous income rather than a one-time transaction, providing creators with a sustainable revenue source.

**User Participation in Creation**: Unlike traditional NFT platforms where users can only purchase random or preset images, Archimeters allows users to actively participate in the creation process by adjusting parameters. Users can preview parameter adjustments in real-time, find the parameter combination that best matches their preferences, and then mint, truly achieving a "co-creation" rather than "passive purchase" experience.

---

## 📋 Summary of Changes

This hackathon implemented:

1. ✅ **Kiosk Standard Trading Mechanism**: Secondary market for Sculpt NFTs with automatic royalty distribution
2. ✅ **Seal Layered Encryption**: GLB free preview + STL encryption protection, balancing user experience and IP protection
3. ✅ **Contract Enhancements**: Generic type safety + parameter range validation, ensuring design integrity and security
4. ✅ **UI/UX Optimization**: Simplified Publisher, redesigned Marketplace, enhanced Vault functionality

---

## 🎯 Core Modifications During This Hackathon (Detailed Description)

### 1. Kiosk Standard Trading Mechanism ⭐

**Implementation:**
- Complete integration with Sui Kiosk protocol, enabling secondary market trading for Sculpt NFTs
- Support for complete trading workflows including listing, purchasing, and delisting
- Automatic royalty distribution (creator royalties + platform fees)

**Future Plans:**
- Plan to implement AtelierCap trading mechanism, allowing 3D algorithms themselves to be traded

---

### 2. Seal Encryption Mechanism 🔐

**Layered Encryption Strategy:**
- **GLB Files**: Stored unencrypted on Walrus for free user preview
- **STL Files**: Encrypted with Seal and stored to protect commercial value

**Decryption Workflow:**
1. Sculpt Owner publishes Printjob to authorized Printer
2. Printer calls `seal_approve_printer`, Move contract verifies Printjob ownership
3. Obtain decryption key through Seal Key Servers
4. Decrypt STL file at manufacturing end (Demo modified to download decrypted file for demonstration)

**Innovation Points:**
- **Layered Access Control**: Free preview + paid collection, balancing user experience and IP protection
- **On-chain Authorization Verification**: Decentralized access control through Sui Move smart contracts

---

### 3. Contract Enhancements and Security Mechanisms 🔒

**Generics and Type Safety:**
- Complete generics for Atelier and Sculpt contracts: `Atelier<phantom T>` and `Sculpt<phantom ATELIER>`
- Compile-time type checking ensures each Sculpt must correspond to the correct Atelier
- Prevents type mismatches in operations such as trading and royalty distribution

**Parameter Range Validation:**
- On-chain validation of all parameter values within design range during `mint_sculpt`
- Use `ParameterRules` to store parameter rules (min_value, max_value, default_value)
- Any parameter exceeding the range will abort the transaction, preventing generation of Sculpts outside the design range

**Technical Advantages:**
- **Type Safety**: Compile-time verification, cannot mix Sculpts from different Ateliers
- **Design Integrity**: Ensures all minted Sculpts are within the creator's design range
- **On-chain Guarantee**: All validation executed at the smart contract layer, cannot be bypassed

---

### 4. UI/UX Optimization 🎨

- **Vault Detail Page**: Atelier/Sculpt details, one-click Withdraw, print job dispatch
- **Publisher Simplification**: Changed from multi-step to single-page, automatic identification of printable objects
- **Marketplace Redesign**: Dual Tab design (Browse Ateliers / Sculpt Market), List/Grid view toggle

