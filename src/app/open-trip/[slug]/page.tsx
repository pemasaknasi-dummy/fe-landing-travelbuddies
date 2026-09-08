import type { Metadata } from "next";
import { TripDetail } from "@/features/trips/components/TripDetail";
import { tripApi } from "@/features/trips/api/trip-api";
import { Suspense } from "react";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const trip = await tripApi.getTripById(slug);

    if (!trip) {
      return {
        title: "Trip Not Found | Travel Buddies",
      };
    }

    const title = `Open Trip ${trip.title} - ${trip.subtitle} | Travel Buddies`;
    const description = trip.description
      ? trip.description.substring(0, 160) + "..."
      : "Temukan teman perjalanan seru dan destinasi impianmu di sini.";

    // Improved image extraction logic based on the nested structure
    let imageUrl = "/images/logo/logo.png";
    if (trip.image) {
      imageUrl = trip.image;
    } else if (trip.images && trip.images.length > 0 && trip.images[0].images && trip.images[0].images.length > 0) {
      imageUrl = trip.images[0].images[0];
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://travelbuddies.id";
    const pageUrl = `${baseUrl}/open-trip/${slug}`;

    return {
      title,
      description,
      alternates: {
        canonical: pageUrl,
      },
      openGraph: {
        title,
        description,
        url: pageUrl,
        siteName: "Travel Buddies",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: trip.title,
          },
        ],
        locale: "id_ID",
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Trip Detail | Travel Buddies",
    };
  }
}

export default async function TripDetailPage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="min-h-screen">
      <main className="mx-auto py-8 space-y-6">
        <section className="px-5 mx-auto max-w-[1024px] 2xl:max-w-[1440px] ">
          <Suspense fallback={<div className="animate-pulse h-96 bg-gray-100 rounded-2xl"></div>}>
            <TripDetail slug={slug} />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
