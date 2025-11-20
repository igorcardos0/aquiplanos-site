/** @type {import('next').NextConfig} */
const nextConfig = {
  // Só usa 'export' quando for build para produção
  // Em desenvolvimento (npm run dev), não usa export para permitir hot reload
  ...(process.env.NODE_ENV === 'production' && process.env.BUILD_EXPORT === 'true' 
    ? { output: 'export' } 
    : {}),

  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
