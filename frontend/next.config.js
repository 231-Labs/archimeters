/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  webpack: (config, { dev, isServer }) => {
    // Ensure xterm.js loads correctly on client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    
    // Optimize chunk splitting
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          xterm: {
            test: /[\\/]node_modules[\\/]@xterm[\\/]/,
            name: 'xterm',
            chunks: 'all',
            priority: 10,
          },
        },
      },
    };
    
    return config;
  },
}

module.exports = nextConfig