// components/TikTokEmbed.js
import Script from "next/script";

export default function TikTokEmbed() {
  return (
    <section className="container max-w-[1024px] 2xl:max-w-[1440px]  mx-auto px-5">
      {/* <div className="flex flex-col gap-y-3">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Ikuti Kami di Media Sosial
        </h2>
      </div> */}
      <blockquote
        className="tiktok-embed"
        cite="https://www.tiktok.com/@travelbuddiesid"
        data-embed-type="creator"
        data-video-id-list="7330203391559339269,7370320507452902661,7578832132718611719,7578452352865291528"
        data-embed-from="embed_page"
        data-unique-id="travelbuddiesid"
      >
        <section>
          <a target="_blank" href="https://www.tiktok.com?refer=embed_page">
            TikTok
          </a>
        </section>
      </blockquote>
      <script async src="https://www.tiktok.com/embed.js"></script>

      {/* TikTok Embed Script */}
      <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
      <style jsx global>{`
        .tiktok-embed,
        .tiktok-embed iframe {
          width: 100% !important;
          max-width: 100% !important;
        }

        .tiktok-embed .css-ekq38o {
          width: 100% !important;
          max-width: 100% !important;
        }
      `}</style>
    </section>
  );
}
