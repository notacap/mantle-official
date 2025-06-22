/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.mantle-clothing.com'],
  },
  experimental: {
    edge: ['middleware'],
  },
};

export default nextConfig;
