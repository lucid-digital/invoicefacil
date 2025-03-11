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
    };
    return config;
  },
};

module.exports = nextConfig; 