/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  transpilePackages: ['xterm', 'xterm-addon-fit'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'xterm': 'xterm/lib/xterm.js',
    };
    config.devtool = 'source-map';
    return config;
  },
}

module.exports = nextConfig