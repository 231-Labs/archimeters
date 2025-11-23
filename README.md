# Archimeters 🏛️
![archimeters_main_vision](https://github.com/user-attachments/assets/5aade832-2568-46e2-9600-336a13353681)

A parametric 3D design platform and marketplace on the Sui blockchain. Creators upload custom algorithms, users co-create personalized designs through parameter adjustment, and mint them as NFTs with secondary market trading. Features Seal encryption for IP protection and connects digital designs to physical manufacturing.  

[Live Demo](https://archimeters.vercel.app/) 👩🏻‍💻
  
[繁體中文版](README.zh-TW.md) 🌏

## About 🔮

Archimeters connects digital designs with practical applications. Unlike traditional NFTs that often focus on community value, we emphasize functional utility:

- **Reusable Design Algorithm Sales**: Creators earn revenue every time users mint designs using their algorithms, enabling sustainable "one algorithm, multiple revenue streams" business model
- **User Participation in Creation**: Users actively participate by adjusting parameters, previewing in real-time, and minting personalized designs—true "co-creation" experience
- **Physical Production**: Digital designs can be manufactured into physical products through the Eureka project
- **Decentralized Storage**: Using Sui Walrus for design storage with Seal encryption protection

## Quick Start 🚀

1. Clone the project and install dependencies:
```bash
git clone https://github.com/231-Labs/archimeters.git
cd archimeters/frontend
npm install --legacy-peer-deps
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser 🌐

## Main Components ✨

### 🎨 For Designers — Atelier (Design Studio)
- **Parametric Design Creation**: Create designs with adjustable parameters
- **Visual Preview**: See 3D models as you modify parameters
- **Blockchain Publishing**: Publish your designs on the Sui blockchain
- **Royalty System**: Receive fees when others use your designs

### 💎 For Collectors — Gallery (Showcase Platform)
- **Browse Designs**: Find and purchase parametric designs
- **Customize**: Adjust parameters to create variants of purchased designs
- **Digital Ownership**: Store your designs as NFTs on the blockchain

### 🔐 Asset Management — Vault
- **Design Dashboard**: View and manage your designs in one interface
- **Revenue Tracking**: Track earnings from your published designs
- **Manufacturing Options**: Connect to Eureka to produce physical versions

### 💻 Documentation Interface — Terminal
- **Technical Interface**: Access documentation through a terminal-style UI
- **Project Information**: View team and feature information in an interactive format
- **Command-line Experience**: Navigate project details using text commands

## Key Features ⭐

- **Kiosk Standard Trading**: Secondary market for Sculpt NFTs with automatic royalty distribution
- **Seal Layered Encryption**: GLB free preview + STL encryption protection, balancing UX and IP protection
- **Type-Safe Contracts**: Generic type safety with parameter range validation ensuring design integrity
- **Enhanced UI/UX**: Simplified Publisher, redesigned Marketplace, and improved Vault functionality

## Sui Blockchain Integration 🔄

Archimeters uses Sui blockchain for:
- **Walrus Storage**: Storing design files and parameters
- **Seal Encryption**: Layered encryption (GLB preview + encrypted STL) for IP protection
- **Sui Move Contracts**: Ownership verification, fee distribution, and on-chain parameter validation
- **Kiosk Protocol**: Standard NFT trading with automatic royalties

## Technology Stack 🛠️

- **Next.js 14**: React framework for the frontend
- **React Three Fiber**: 3D visualization for parametric models
- **xterm.js**: Terminal interface functionality
- **Tailwind CSS**: UI styling system
- **Three.js**: 3D model rendering engine

## Development 👩‍💻

Make sure you are in the `frontend` directory before running these commands:

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Future Plans 🚀

- **AtelierCap Trading**: Enable trading of 3D algorithms themselves
- **AI Integration**: Parameter optimization tools
- **Manufacturing Network**: Production partnerships for physical items

---

📋 **Detailed changelog**: See [HACKATHON_SUBMISSION_EN.md](HACKATHON_SUBMISSION_EN.md) for complete hackathon updates
