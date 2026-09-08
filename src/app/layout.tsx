import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import "react-loading-skeleton/dist/skeleton.css";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import { Providers } from "./providers";
import { Suspense } from "react";
import GoogleAnalytics from "@/lib/GoogleAnalytics";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/context/AuthContext";
import "react-day-picker/dist/style.css";
import LayoutClient from "./layout-client";
import Script from "next/script";

const nunito = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://travelbuddies.co.id",
  ),
  title: "Travel Buddies - Your Best Travelmate",
  description: "Temukan teman perjalanan seru dan destinasi impianmu di sini.",
  keywords: [
    "travel",
    "trip",
    "open trip",
    "travel buddies",
    "perjalanan",
    "wisata",
  ],
  authors: [{ name: "Travel Buddies" }],
  openGraph: {
    title: "Travel Buddies - Your Best Travelmate",
    description:
      "Temukan teman perjalanan seru dan destinasi impianmu di sini.",
    url: process.env.NEXT_PUBLIC_BASE_URL,
    siteName: "Travel Buddies",
    images: [
      {
        url: "/images/logo/logo.png",
        width: 1200,
        height: 630,
        alt: "Travel Buddies Logo",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Travel Buddies - Your Best Travelmate",
    description:
      "Temukan teman perjalanan seru dan destinasi impianmu di sini.",
    images: ["/images/logo/logo.png"],
  },
  robots: {
    index: process.env.NEXT_ENV === "production",
    follow: process.env.NEXT_ENV === "production",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isProd = process.env.NEXT_ENV === "production";
  return (
    <html lang="en">
      <head>
        {isProd && (
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                    (function(w,d,s,l,i){w[l]=w[l]||[];
                    w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
                    var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
                    j.async=true;
                    j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                    f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','GTM-T7FG9SJG');
                  `,
            }}
          />
        )}
      </head>
      <body className={`${nunito.className} min-h-screen flex flex-col`}>
        {/* Facebook Pixel Code */}
        {isProd && (
          <>
            <script>
              {`!function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window,document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}'); 
              fbq('track', 'PageView');`}
            </script>
            <noscript>
              <img
                height="1"
                width="1"
                src="https://www.facebook.com/tr?id=883348027662648&ev=PageView&noscript=1"
              />
            </noscript>
          </>
        )}

        {isProd && (
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-T7FG9SJG"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}

        <Providers>
          <AuthProvider>
            {/* <Suspense fallback={null}>
              <Header />
            </Suspense> */}
            <GoogleOAuthProvider
              clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
            >
              <LayoutClient>{children}</LayoutClient>
            </GoogleOAuthProvider>
            {process.env.NEXT_ENV === "production" && (
              <GoogleAnalytics GA_MEASUREMENT_ID="G-PN5GPHJ379" />
            )}
            {/* <Footer /> */}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
