import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'images.unsplash.com',
      'lh3.googleusercontent.com',
      'familie-recepten.vercel.app',
      // voeg hier meer domeinen toe als je wilt
    ],
  },
  // andere config opties hier...
};

export default nextConfig;
