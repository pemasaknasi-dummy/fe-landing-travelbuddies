import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: process.env.NODE_ENV === "development",
    domains: [
      "images.unsplash.com",
      "upload.wikimedia.org",
      "banana-api.travelbuddies.co.id",
      "api.travelbuddies.co.id",
      "picsum.photos",
      "lh3.googleusercontent.com",
    ],

     remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3010",
        pathname: "/uploads/**",
      },
    ],
  },

  async redirects() {
    return [
      {
        source: "/trip/search",
        destination: "/open-trip",
        permanent: true,
      },
      {
        source: "/trip/:slug/booking",
        destination: "/open-trip/:slug/booking",
        permanent: true,
      },
      {
        source: "/trip/:slug",
        destination: "/open-trip/:slug",
        permanent: true,
      },
      {
        source: "/agent-submission",
        destination: "/daftar-agent-b2b",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        headers: [
          {
            key: "Content-Type",
            value: "application/json",
          },
        ],
      },
      {
        source: "/.well-known/assetlinks.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/json",
          },
        ],
      },
    ];
  },
};

export default nextConfig;