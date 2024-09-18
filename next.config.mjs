/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.fanart.tv',
        port: '',
        pathname: '/**',
      },
    ]
  }
};

export default nextConfig;
