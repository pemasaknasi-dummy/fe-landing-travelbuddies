import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://travelbuddies.co.id";

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.NEXT_ENV === "production";

  return {
    rules: isProduction
      ? {
          userAgent: "*",
          allow: "/",
          disallow: ["/profile/", "/booking/", "/login", "/register", "/forgot-password"],
        }
      : {
          userAgent: "*",
          disallow: "/", // block all crawlers in non-production
        },
    sitemap: isProduction ? `${BASE_URL}/sitemap.xml` : undefined,
  };
}
