import AppPromotion from "@/components/sections/AppPromotion";

export default function PrivacyPolicy() {
  return (
    <main>
      <div className="max-w-[1024px] 2xl:max-w-[1440px]  mx-auto mb-30 px-5 xl:px-0">
        <h1 className="font-bold text-3xl mt-5">Kebijakan Privasi Travel Buddies</h1>

        <p>
          Travel Buddies berkomitmen untuk melindungi privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan,
          menyimpan, dan melindungi informasi pribadi Anda ketika Anda menggunakan situs web atau layanan kami.
        </p>

        <div>
          <h1 className="font-bold text-2xl mt-5 mb-2">1. Informasi yang Kami Kumpulkan</h1>
          <p>Kami dapat mengumpulkan informasi pribadi dari Anda melalui beberapa cara, antara lain:</p>
          <p className="leading-7">
            Informasi yang Anda berikan secara langsung, seperti nama, alamat email, nomor telepon, alamat, dan data pembayaran saat melakukan
            pemesanan trip. Informasi penggunaan secara otomatis, seperti alamat IP, jenis browser, waktu akses, halaman yang dikunjungi, serta
            aktivitas Anda di situs web kami. Informasi perangkat, termasuk jenis perangkat, sistem operasi, dan jenis koneksi yang digunakan.
          </p>
        </div>

        <div>
          <h1 className="font-bold text-2xl mt-5 mb-2">2. Tujuan Penggunaan Informasi</h1>
          <p className="leading-7">
            Kami menggunakan informasi pribadi Anda untuk: Memproses pemesanan trip dan layanan terkait. Berkomunikasi dengan Anda terkait konfirmasi,
            informasi perjalanan, dan pembaruan layanan. Memproses pembayaran dan mengelola transaksi Anda. Meningkatkan pengalaman pengguna serta
            mengembangkan produk dan layanan kami. Melakukan analisis data, riset internal, dan evaluasi kualitas layanan. Mengirimkan informasi
            promosi, penawaran, atau konten yang relevan (dengan persetujuan Anda bila diperlukan).
          </p>
        </div>

        <div>
          <h1 className="font-bold text-2xl mt-5 mb-2">3. Pengungkapan dan Pembagian Informasi</h1>
          <p className="leading-7">
            Kami tidak akan menjual data pribadi Anda kepada pihak ketiga. Namun, kami dapat membagikan informasi dengan: Penyedia layanan pihak
            ketiga (seperti sistem pembayaran, penyimpanan data, dan penyedia email) untuk membantu operasional kami. Otoritas hukum atau lembaga
            pemerintah jika diwajibkan oleh undang-undang. Afiliasi atau mitra resmi Travel Buddies yang membantu dalam pelaksanaan layanan.
          </p>
        </div>

        <div>
          <h1 className="font-bold text-2xl mt-5 mb-2">4. Keamanan Informasi</h1>
          <p className="leading-7">
            Kami menerapkan langkah-langkah keamanan teknis dan organisasi untuk melindungi data pribadi Anda dari akses tidak sah, pengungkapan,
            perubahan, atau penghancuran. Namun, Anda memahami bahwa tidak ada sistem keamanan digital yang sepenuhnya aman, dan kami tidak dapat
            menjamin keamanan absolut atas data yang dikirimkan melalui internet.
          </p>
        </div>

        <div>
          <h1 className="font-bold text-2xl mt-5 mb-2">5. Penyimpanan dan Retensi Data</h1>
          <p className="leading-7">
            Kami akan menyimpan data pribadi Anda selama diperlukan untuk memenuhi tujuan yang dijelaskan dalam kebijakan ini atau selama diwajibkan
            oleh hukum. Setelah tidak lagi dibutuhkan, data akan dihapus atau diubah menjadi bentuk anonim.
          </p>
        </div>

        <div>
          <h1 className="font-bold text-2xl mt-5 mb-2">6. Hak Anda</h1>
          <p>Sebagai pengguna, Anda memiliki hak-hak berikut:</p>
          <ul className="list-[lower-alpha] ml-12 space-y-1">
            <li>Hak untuk mengakses data pribadi yang kami miliki tentang Anda.</li>
            <li>Hak untuk memperbaiki atau memperbarui data yang tidak akurat.</li>
            <li>Hak untuk meminta penghapusan data pribadi Anda jika tidak lagi dibutuhkan.</li>
            <li>Hak untuk menolak penggunaan data untuk tujuan pemasaran.</li>
            <li>Hak untuk menarik persetujuan atas pengumpulan atau pemrosesan data tertentu kapan saja.</li>
          </ul>
        </div>

        <div>
          <h1 className="font-bold text-2xl mt-5 mb-2">7. Cookies dan Teknologi Pelacakan</h1>
          <p>Kami menggunakan cookies dan teknologi serupa untuk:</p>
          <p className="leading-7">
            Meningkatkan pengalaman Anda di situs web kami. Menganalisis perilaku pengguna dan mengoptimalkan konten. Menampilkan promosi dan iklan
            yang relevan dengan preferensi Anda. Anda dapat menonaktifkan cookies melalui pengaturan browser, meskipun hal tersebut dapat memengaruhi
            pengalaman Anda dalam menggunakan situs kami.
          </p>
        </div>

        <div>
          <h1 className="font-bold text-2xl mt-5 mb-2">8. Perubahan Kebijakan Privasi</h1>
          <p className="leading-7">
            Kebijakan Privasi ini dapat diperbarui dari waktu ke waktu. Setiap perubahan akan diumumkan melalui situs web Travel Buddies dengan
            mencantumkan tanggal pembaruan terakhir di bagian atas dokumen ini.
          </p>
        </div>

        <div>
          <h1 className="font-bold text-2xl mt-5 mb-2">9. Kontak Kami</h1>
          <p>Apabila Anda memiliki pertanyaan, permintaan, atau keluhan terkait Kebijakan Privasi ini, silakan hubungi kami melalui:</p>
          <p className="leading-7">
            📧 Email:{" "}
            <a href="mailto:support@travelbuddies.co.id" className="hover:underline text-blue-500 font-semibold">
              support@travelbuddies.co.id
            </a>
          </p>
        </div>
      </div>

      <div className="my-10">
        <AppPromotion />
      </div>
    </main>
  );
}
