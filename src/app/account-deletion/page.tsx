export default function AccountDeletion() {
  return (
    <section className="mx-auto px-5 xl:px-0 max-w-[1024px] 2xl:max-w-[1440px]">
      {/* Header */}
      <div className="mt-7">
        <h1 className="text-[30px] font-bold">Permintaan Penghapusan Akun Travel Buddies</h1>
        <p className=" text-justify md:text-normal">
          Halaman ini disediakan untuk memenuhi ketentuan terkait akses penghapusan akun pengguna. Jika Anda ingin menghapus akun Travel Buddies,
          silakan membaca informasi berikut.
        </p>
      </div>

      <div className="mt-7">
        <h1 className="text-2xl font-bold">Ruang Lingkup Data yang Dihapus</h1>
        <p className="">Data berikut akan dihapus secara permanen dari sistem:</p>
        <ul className="list-disc  ml-10">
          <li>Informasi profil dan akun</li>
          <li>Data autentikasi</li>
          <li>Riwayat pemesanan dan transaksi</li>
          <li>Preferensi serta data penggunaan aplikasi</li>
          <li>Seluruh data pribadi lain yang terkait dengan akun Anda</li>
          <li>Data yang telah dihapus tidak dapat dipulihkan.</li>
        </ul>
      </div>

      <div className="mt-7">
        <h1 className="text-2xl font-bold">Waktu Pemrosesan</h1>
        <p className="">Permintaan penghapusan akan diproses dalam waktu maksimal 7 hari kerja.</p>
        <p className="">Konfirmasi akan dikirimkan melalui email setelah proses selesai.</p>
      </div>

      <div className="mt-7">
        <h1 className="text-2xl font-bold">Cara Mengajukan Penghapusan</h1>
        <p className=" text-justify">Silakan ajukan permintaan penghapusan akun melalui kontak yang telah disediakan di halaman ini.</p>
      </div>

      <div className="my-7">
        <h1 className="text-2xl font-bold">Informasi Lebih Lanjut</h1>
        <p className="">Untuk bantuan tambahan, silakan hubungi:</p>
        <p>
          📧{" "}
          <a href="mailto:support@travelbuddies.co.id" className="text-blue-500 hover:underline font-semibold">
            support@travelbuddies.co.id
          </a>
        </p>
      </div>
    </section>
  );
}
