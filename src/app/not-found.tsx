import NotFoundCard from "@/components/sections/NotFoundCard";

export default function NotFoundPage() {
  return (
    <NotFoundCard
      mainHeading="Halaman Tidak Ditemukan"
      subHeading="Maaf, halaman atau artikel yang Anda cari tidak dapat kami temukan atau telah dipindahkan."
      redirect="/blog"
      redirectButtonText="Kembali ke Blog"
    />
  );
}
