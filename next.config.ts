/** @type {import('next').NextConfig} */

const { withSuperjson } = require("next-superjson");

const nextConfig = {
  reactStrictMode: false,
  compress: true,
  experimental: {
    // This is needed to allow the Next.js dev server to work with a custom domain
    allowedDevOrigins: ["*.nozsa.dev"],
  },
  images: {
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nauth-emails.s3.eu-north-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "nauth-avatars.s3.eu-north-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },

  output: "standalone",

  eslint: {
    ignoreDuringBuilds: true,
  },
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: false,
});
// module.exports = withBundleAnalyzer(withSuperjson()(nextConfig));
module.exports = withBundleAnalyzer(nextConfig);
