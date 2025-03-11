/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['tandwqorhbatoktkgrqz.supabase.co'],
  },
  webpack: (config) => {
    // This is required for PDF generation to work with webpack 5
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      fs: false,
      os: false,
      path: false,
      stream: false,
      buffer: false,
      process: false,
      canvas: false,
      encoding: false,
      crypto: false,
    };
    
    // Disable sourcemaps in production
    if (process.env.NODE_ENV === 'production') {
      config.devtool = false;
    }
    
    return config;
  },
  // Increase the memory limit for the build process
  experimental: {
    serverComponentsExternalPackages: ['jspdf', '@react-pdf/renderer'],
  },
};

module.exports = nextConfig; 