import Link from "next/link";

export const FamillyCommunitySubmit = () => {
  return (
    <div className="max-w-[1024px] 2xl:max-w-[1440px]  mx-auto my-30 text-center space-y-10 px-5 md:px-0">
      <h1 className="font-bold text-3xl tracking-wide">Mantap! Permintaan kamu sudah kami terima tim kami lagi siap-siap buat hubungi kamu! 🔥</h1>

      <p className="text-lg tracking-wider lg:w-[80%] mx-auto">
        Hore! Formulir private trip kamu sudah masuk ke sistem kami 🎉, Tim Travel Consultant kami bakal segera menghubungi Kakak buat bantu nyusun
        trip impianmu. Makasih banyak sudah sabar menunggu petualangan seru tinggal selangkah lagi! 🌿✈️
      </p>

      <Link
        href={"/"}
        className="py-3 px-5 text-center bg-blue-400 text-white font-semibold tracking-wider text-lg rounded-lg cursor-pointer hover:outline-none hover:text-blue-400 hover:ring-2 hover:ring-blue-400 hover:bg-white transition-all duration-300 shadow-lg"
      >
        Kembali ke halaman utama
      </Link>
    </div>
  );
};
