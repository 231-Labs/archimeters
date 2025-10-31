/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  transpilePackages: ['xterm', 'xterm-addon-fit'],
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  webpack: (config, { dev, isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'xterm': 'xterm/lib/xterm.js',
    };
    if (!dev && isServer) {
      config.devtool = 'source-map';
    }
    return config;
  },
}

module.exports = nextConfig