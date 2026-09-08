import { GetPromoWebsite } from "@/features/promos/api/promo-api";
import type { MetadataRoute } from "next";
// import { promos } from "@/data/dummyPromo";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://travelbuddies.co.id";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/open-trip`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/promo`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/private-trip`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/daftar-agent-b2b`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/kebijakan-privasi`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/syarat-ketentuan`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Dynamic trip pages
  let tripUrls: MetadataRoute.Sitemap = [];
  let promoUrls: MetadataRoute.Sitemap = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/slug`, {
      next: { revalidate: 3600 }, // revalidate every 1 hour
    });

    if (res.ok) {
      const trips: { id: number; slug: string; isTripGuarantee?: boolean }[] = await res.json();

      const openTripUrls: MetadataRoute.Sitemap = trips
        .filter((trip) => trip.slug)
        .map((trip) => ({
          url: `${BASE_URL}/open-trip/${trip.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));

      const privateTripUrls: MetadataRoute.Sitemap = trips
        .filter((trip) => trip.slug && trip.isTripGuarantee)
        .map((trip) => ({
          url: `${BASE_URL}/private-trip/${trip.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));

      tripUrls = [...openTripUrls, ...privateTripUrls];
    }
  } catch (error) {
    console.error("Failed to fetch trip slugs for sitemap:", error);
  }

  try {
    const promoRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/promos/website`, {
      next: { revalidate: 3600 },
    });

    if (promoRes.ok) {
      const promosData: { items: GetPromoWebsite[] } = await promoRes.json();
      promoUrls = promosData.items
        ?.filter((promo) => promo.slug)
        .map((promo) => ({
          url: `${BASE_URL}/promo/${promo.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        })) ?? [];
    }
  } catch (error) {
    console.error("Failed to fetch promos for sitemap:", error);
  }

  return [...staticUrls, ...tripUrls, ...promoUrls];
}
