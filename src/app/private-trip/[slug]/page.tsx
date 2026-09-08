import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AppPromotion from "../../../components/sections/AppPromotion";
import { TripDetail } from "@/features/trips/components/TripDetail";
import { tripApi } from "@/features/trips/api/trip-api";

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

    const title = `Private Trip ${trip.title} - ${trip.subtitle} | Travel Buddies`;
    const description = trip.description
      ? trip.description.substring(0, 160) + "..."
      : "Temukan teman perjalanan seru dan destinasi impianmu di sini.";

    let imageUrl = "/images/logo/logo.png";
    if (trip.image) {
      imageUrl = trip.image;
    } else if (
      trip.images &&
      trip.images.length > 0 &&
      trip.images[0].images &&
      trip.images[0].images.length > 0
    ) {
      imageUrl = trip.images[0].images[0];
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://travelbuddies.id";
    const pageUrl = `${baseUrl}/private-trip/${slug}`;

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

export default async function TripGuaranteeDetailPage({ params }: Props) {
  const { slug } = await params;
  const trip = await tripApi.getTripById(slug);

  if (trip && !trip.isTripGuarantee) {
    redirect(`/open-trip/${slug}`);
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto py-8 space-y-6">
        <section className="px-5 mx-auto max-w-[1024px] 2xl:max-w-[1440px] ">
          <TripDetail slug={slug} isGuarantee={true} />
        </section>

        <AppPromotion />
      </main>
    </div>
  );
}
