import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  allowedDevOrigins: ['*'],
  async rewrites() {
    return [
      {
        source: '/api/paraphrase-with-variantV2',
        destination: 'http://127.0.0.1:8080/api/v1/paraphrase',
      },
      {
        source: '/api/paraphrase/:path*',
        destination: 'http://127.0.0.1:8080/api/v1/paraphrase/:path*',
      },
    ];
  },
};

export default nextConfig;
