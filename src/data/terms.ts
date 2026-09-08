interface Terms {
  section: string;
  items: string | string[];
}

export const terms: Terms[] = [
  {
    section: "A. Pembayaran dan Pembatalan",
    items: [
      "Permintaan reschedule oleh Peserta atas perubahan jadwal keberangkatan tidak mengembalikan pembayaran yang telah dilakukan.",
      "Jika terjadi Force Majeure, pembayaran tidak dapat dikembalikan, namun Peserta berhak melakukan reschedule ke jadwal lain yang tersedia.",
      "Apabila trip dibatalkan oleh pihak Travel Buddies karena kuota tidak mencukupi, Peserta berhak memilih antara pengembalian dana 100% atau reschedule ke jadwal berikutnya.",
    ],
  },
  {
    section: "B. Pelaksanaan",
    items: [
      "Travel Buddies tidak bertanggung jawab atas kehilangan, kerusakan, atau kerugian terhadap barang pribadi Peserta selama perjalanan.",
      "Travel Buddies tidak bertanggung jawab atas keterlambatan atau pembatalan jadwal transportasi umum yang menyebabkan keterlambatan atau ketidakhadiran Peserta.",
      "Perubahan atau pengurangan program perjalanan akibat kondisi yang tidak memungkinkan (Force Majeure) dapat terjadi; jika demikian, tidak ada pengembalian dana (refund).",
      "Travel Buddies tidak bertanggung jawab secara langsung atas penyakit, cedera, atau kecelakaan yang dialami Peserta selama kegiatan trip berlangsung. Namun demikian, setiap Peserta telah mendapatkan perlindungan asuransi perjalanan yang termasuk dalam paket trip, sesuai dengan ketentuan dan cakupan yang berlaku pada polis asuransi tersebut.",
      "Program trip ini direkomendasikan bagi wisatawan mandiri dengan rentang usia 17–45 tahun. Peserta di luar rentang usia tersebut tetap dapat mengikuti trip dengan pendampingan orang tua, wali, atau pendamping yang bertanggung jawab.",
      "Harga trip berlaku untuk Warga Negara Indonesia (WNI). Penyesuaian harga dapat dikenakan untuk Warga Negara Asing (WNA).",
      "Peserta dilarang membawa benda tajam, minuman beralkohol, obat-obatan terlarang, atau hewan peliharaan. Pelanggaran dapat berakibat pada pengeluaran peserta dari grup tanpa pengembalian dana.",
      "Perubahan kondisi atau fasilitas (akomodasi, transportasi, dll.) dapat terjadi selama perjalanan. Peserta wajib mematuhi penyesuaian yang diberlakukan.",
      "Peserta yang terlambat hadir dari waktu yang telah ditetapkan dan yang telah diberi toleransi akan ditinggalkan tanpa penggantian dana.",
      "Peserta wajib menjaga kebersihan lingkungan selama kegiatan berlangsung.",
    ],
  },
  {
    section: "Force Majeure",
    items:
      "Force Majeure adalah kejadian di luar kemampuan manusia dan tidak dapat dihindarkan yang menyebabkan kegiatan tidak dapat dilaksanakan sebagaimana mestinya. Contoh: bencana alam, wabah penyakit, kerusuhan, kebijakan pemerintah, kondisi cuaca ekstrem, penutupan akses transportasi, dan keadaan darurat lainnya.",
  },
];
