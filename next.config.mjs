const nextConfig = {
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
