/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "departman.ir" },
      { protocol: "https", hostname: "**.departman.ir" }
    ]
  },
  eslint: { ignoreDuringBuilds: true }
};

export default nextConfig;
