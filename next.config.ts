import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Mengecualikan transformers dan onnxruntime dari bundling Turbopack/Webpack serverless
  serverExternalPackages: ['@xenova/transformers', 'onnxruntime-node', 'onnxruntime-web'],
};

export default nextConfig;