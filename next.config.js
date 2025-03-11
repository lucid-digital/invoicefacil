/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['tandwqorhbatoktkgrqz.supabase.co'], // Add your Supabase domain for image hosting
    formats: ['image/avif', 'image/webp'],
  },
  webpack: (config) => {
    // Fixes npm packages that depend on `fs` module
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
};

module.exports = nextConfig; 