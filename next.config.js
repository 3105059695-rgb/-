/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  experimental: {
    serverComponentsExternalPackages: ["@pinecone-database/pinecone"],
  },
};

module.exports = nextConfig;
