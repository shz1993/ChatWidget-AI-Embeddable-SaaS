import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Mengecualikan paket transformers dari bundling Serverless Vercel
  serverExternalPackages: ['@xenova/transformers', 'onnxruntime-node'],
};

export default nextConfig;