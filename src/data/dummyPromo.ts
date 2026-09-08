// "use client";

// import { PromoData } from "@/components/sections/promo/PromoCard";
// import { PromoBadge } from "@/components/sections/promo/PromoBadge";
// import { BadgeType } from "@/components/sections/promo/PromoBadge";
// import { usePromoWebsite } from "@/features/promos/hooks/usePromo";

// export const promos: PromoDetail[] = [
  // THR Open Trip
  // {
  //   slug: "thr-open-trip",
  //   title: 'THR "Trip Hari Raya" Discount up to 50%',
  //   description:
  //     "Rayakan momen Ramadhan dan Lebaran dengan liburan lebih hemat bersama Promo THR (Tunjangan Hari Raya) Travel Buddies. Nikmati penawaran spesial untuk seluruh destinasi Open Trip serta benefit diskon hingga 50% yang dapat digunakan untuk perjalanan berikutnya. Waktunya manfaatkan THR kamu untuk pengalaman traveling yang lebih seru, nyaman, dan terjangkau bersama Travel Buddies.",
  //   description_full:
  //     "Rayakan momen Ramadhan dan Lebaran dengan liburan lebih hemat bersama Promo THR (Tunjangan Hari Raya) Travel Buddies. Nikmati penawaran spesial untuk seluruh destinasi Open Trip serta benefit diskon hingga 50% yang dapat digunakan untuk perjalanan berikutnya. Waktunya manfaatkan THR kamu untuk pengalaman traveling yang lebih seru, nyaman, dan terjangkau bersama Travel Buddies.",
  //   imageUrl: "/images/promo/banner-promo-thr.png",
  //   bannerUrl: "/images/promo/banner-promo-thr.png",

  //   badgeType: "openTrip",
  //   category: "voucher",

  //   buttonTitle: "Jalan Bareng Sekarang",
  //   validUntil: "10 - 20 Mar 2026",

  //   discount: "Discount up to 50%",

  //   terms: [
  //     "Promo THR berlaku selama 10 – 20 Mar 2026.",
  //     "Promo berlaku hanya untuk pemesanan melalui aplikasi Travel Buddies (Android & iOS).",
  //     "Periode keberangkatan: Maret – Desember 2026. Tidak berlaku pada High Season.",
  //     "Promo tidak dapat digabungkan dengan promo, diskon, atau voucher lainnya.",
  //     "Kuota promo terbatas dan berlaku selama slot masih tersedia.",
  //   ],

  //   howToUse: [
  //     "Pilih destinasi dan jadwal Open Trip yang tersedia pada periode keberangkatan Maret – Desember 2026 (di luar periode High Season).",
  //     "Lakukan pemesanan melalui aplikasi Travel Buddies di Android atau iOS.",
  //     "Promo THR berlaku untuk pemesanan pada periode 10 – 20 Maret 2026.Lengkapi data peserta dan selesaikan proses pembayaran sesuai instruksi di aplikasi.",
  //     "Diskon promo akan otomatis diterapkan pada pemesanan yang memenuhi ketentuan.",
  //     "Promo tidak dapat digabungkan dengan promo, diskon, atau voucher lainnya.",
  //     "Kuota promo terbatas dan berlaku selama slot masih tersedia.",
  //   ],

  //   // openTrip: {
  //   //   title: "Diskon up to 50%",
  //   //   discount: "Diskon up to 50%",
  //   //   destinasi: "all",
  //   //   validUntil: "1–28 Feb 2026",
  //   //   terms: [
  //   //     "Promo berlaku selama periode campaign (1–28 Februari)",
  //   //     "Diskon hanya berlaku untuk trip yang termasuk dalam kategori Trip Special Valentine",
  //   //     "Berlaku untuk pemesanan minimum 2 peserta dalam 1 booking",
  //   //     "Promo tidak dapat digabungkan dengan promo atau voucher lainnya",
  //   //     "Kuota promo terbatas dan dapat berakhir sewaktu-waktu tanpa pemberitahuan",
  //   //     "Keberangkatan mengikuti jadwal trip yang tersedia",
  //   //     "Syarat dan ketentuan tambahan dapat menyesuaikan kebijakan Travel Buddies",
  //   //   ],
  //   //   howToUse: [
  //   //     "Pilih trip yang termasuk dalam kategori Trip Special Valentine.",
  //   //     "Pastikan pemesanan dilakukan untuk minimal 2 peserta atau lebih dalam 1 booking.",
  //   //     "Selesaikan proses pembayaran sesuai instruksi yang tersedia.",
  //   //     "Setelah memenuhi ketentuan, harga promo akan otomatis terpotong pada total pembayaran.",
  //   //   ],
  //   // },

  //   // privateTrip: {
  //   //   title: "Diskon up to 50%",
  //   //   discount: "Promo Diskon Khusus Trip 10%",
  //   //   destinasi: "all",
  //   //   validUntil: "1–28 Feb 2026",
  //   //   terms: ["No Minimum Quota", "Periode booking 26 Januari – 21 Februari", "Periode trip Februari (1–28 Feb 2026)"],
  //   //   howToUse: [
  //   //     "Lakukan pemesanan melalui form Inquiry Private Trip di website Travel Buddies.",
  //   //     "Pada bagian catatan, tambahkan kode promo: CUAN untuk mendapatkan penawaran spesial.",
  //   //     "Setelah form dikirim, tim Travel Consultant/Sales Travel Buddies akan menghubungi kamu untuk konfirmasi detail dan penawaran terbaik.",
  //   //   ],
  //   // },
  // },

  // // PDKT Open Trip
  // {
  //   slug: "pdkt-valentine-open-trip",
  //   title: 'PDKT "Promo Diskon Khusus Trip Special Valentine"',
  //   description: "PDKT nggak harus ribet! Kadang cukup jalan bareng.",
  //   description_full:
  //     "Rayakan momen Valentine bareng Travel Buddies! Nikmati diskon hingga 50% untuk Trip Special Valentine, baik Open Trip maupun Private Trip. Promo berlaku selama periode campaign dengan kuota terbatas.",
  //   imageUrl: "/images/promo/banner-promo-pdkt-v2.jpeg",
  //   bannerUrl: "/images/promo/banner-promo-pdkt-v2.jpeg",

// export const promos: PromoDetail[] = [
//   // PDKT Open Trip
//   {
//     slug: "pdkt-valentine-open-trip",
//     title: 'PDKT "Promo Diskon Khusus Trip Special Valentine"',
//     description: "PDKT nggak harus ribet! Kadang cukup jalan bareng.",
//     description_full: "Rayakan momen Valentine bareng Travel Buddies! Nikmati diskon hingga 50% untuk Trip Special Valentine, baik Open Trip maupun Private Trip. Promo berlaku selama periode campaign dengan kuota terbatas.",
//     imageUrl: "/images/promo/banner-promo-pdkt-v2.jpeg",
//     bannerUrl: "/images/promo/banner-promo-pdkt-v2.jpeg",

//     badgeType: "openTrip",
//     category: "voucher",

//     buttonTitle: "Jalan Bareng Sekarang",
//     validUntil: "1–28 Feb 2026",

//     discount: "Diskon up to 50%",
//     terms: ["Promo berlaku untuk seluruh destinasi.", "Promo berlaku hanya untuk pemesanan atau transaksi melalui aplikasi travel buddies", "Minimum pemesanan 2 peserta dalam satu booking.", "Tidak dapat digabungkan dengan promo, voucher, atau penawaran lainnya.", "Kuota promo terbatas dan dapat berakhir sewaktu-waktu tanpa pemberitahuan.", "Periode Keberangkatan: Februari – Desember 2026, Tidak berlaku pada: 20 – 31 Maret 2026 (Lebaran) & 25 – 31 Desember 2026 (Nataru)", "Travel Buddies berhak menyesuaikan ketentuan sesuai kebijakan yang berlaku."],
//     howToUse: ["Pilih paket Trip Special Valentine dari katalog Open Trip Travel Buddies.", "Lakukan pemesanan untuk minimal 2 peserta dalam 1 booking.", "Lengkapi data peserta dan selesaikan pembayaran sesuai instruksi.", 'Setelah ketentuan terpenuhi, gunakan atau pilih diskon "Promo PDKT" pada halaman pembayaran.'],

//     // openTrip: {
//     //   title: "Diskon up to 50%",
//     //   discount: "Diskon up to 50%",
//     //   destinasi: "all",
//     //   validUntil: "1–28 Feb 2026",
//     //   terms: [
//     //     "Promo berlaku selama periode campaign (1–28 Februari)",
//     //     "Diskon hanya berlaku untuk trip yang termasuk dalam kategori Trip Special Valentine",
//     //     "Berlaku untuk pemesanan minimum 2 peserta dalam 1 booking",
//     //     "Promo tidak dapat digabungkan dengan promo atau voucher lainnya",
//     //     "Kuota promo terbatas dan dapat berakhir sewaktu-waktu tanpa pemberitahuan",
//     //     "Keberangkatan mengikuti jadwal trip yang tersedia",
//     //     "Syarat dan ketentuan tambahan dapat menyesuaikan kebijakan Travel Buddies",
//     //   ],
//     //   howToUse: [
//     //     "Pilih trip yang termasuk dalam kategori Trip Special Valentine.",
//     //     "Pastikan pemesanan dilakukan untuk minimal 2 peserta atau lebih dalam 1 booking.",
//     //     "Selesaikan proses pembayaran sesuai instruksi yang tersedia.",
//     //     "Setelah memenuhi ketentuan, harga promo akan otomatis terpotong pada total pembayaran.",
//     //   ],
//     // },

//     // privateTrip: {
//     //   title: "Diskon up to 50%",
//     //   discount: "Promo Diskon Khusus Trip 10%",
//     //   destinasi: "all",
//     //   validUntil: "1–28 Feb 2026",
//     //   terms: ["No Minimum Quota", "Periode booking 26 Januari – 21 Februari", "Periode trip Februari (1–28 Feb 2026)"],
//     //   howToUse: [
//     //     "Lakukan pemesanan melalui form Inquiry Private Trip di website Travel Buddies.",
//     //     "Pada bagian catatan, tambahkan kode promo: CUAN untuk mendapatkan penawaran spesial.",
//     //     "Setelah form dikirim, tim Travel Consultant/Sales Travel Buddies akan menghubungi kamu untuk konfirmasi detail dan penawaran terbaik.",
//     //   ],
//     // },
//   },

//   // PDKT Private Trip
//   {
//     slug: "pdkt-valentine-private-trip",
//     title: 'PDKT "Promo Diskon Khusus Trip Special Valentine"',
//     description: "PDKT nggak harus ribet! Kadang cukup jalan bareng.",
//     description_full: "Rayakan momen Valentine bareng Travel Buddies! Nikmati diskon hingga 50% untuk Trip Special Valentine, baik Open Trip maupun Private Trip. Promo berlaku selama periode campaign dengan kuota terbatas.",
//     imageUrl: "/images/promo/banner-promo-pdkt-private-trip-v2.jpeg",
//     bannerUrl: "/images/promo/banner-promo-pdkt-private-trip-v2.jpeg",

//     badgeType: "privateTrip",
//     category: "voucher",

//     buttonTitle: "Jalan Bareng Sekarang",
//     validUntil: "1–28 Feb 2026",

//     discount: "Promo Diskon Khusus Trip 8% s/d 88rb ",
//     terms: ["Promo berlaku selama periode campaign (1–28 Februari)", "Diskon hanya berlaku untuk trip yang termasuk dalam kategori Trip Special Valentine", "Berlaku untuk pemesanan minimum 2 peserta dalam 1 booking", "Promo tidak dapat digabungkan dengan promo atau voucher lainnya", "Kuota promo terbatas dan dapat berakhir sewaktu-waktu tanpa pemberitahuan", "Keberangkatan mengikuti jadwal trip yang tersedia", "Syarat dan ketentuan tambahan dapat menyesuaikan kebijakan Travel Buddies"],
//     howToUse: ["Lakukan pemesanan melalui form Inquiry Private Trip di website Travel Buddies.", "Pada bagian catatan, tambahkan kode promo: CUAN untuk mendapatkan penawaran spesial.", "Setelah form dikirim, tim Travel Consultant/Sales Travel Buddies akan menghubungi kamu untuk konfirmasi detail dan penawaran terbaik."],

//     // openTrip: {
//     //   title: "Diskon up to 50%",
//     //   discount: "Diskon up to 50%",
//     //   destinasi: "all",
//     //   validUntil: "1–28 Feb 2026",
//     //   terms: [
//     //     "Promo berlaku selama periode campaign (1–28 Februari)",
//     //     "Diskon hanya berlaku untuk trip yang termasuk dalam kategori Trip Special Valentine",
//     //     "Berlaku untuk pemesanan minimum 2 peserta dalam 1 booking",
//     //     "Promo tidak dapat digabungkan dengan promo atau voucher lainnya",
//     //     "Kuota promo terbatas dan dapat berakhir sewaktu-waktu tanpa pemberitahuan",
//     //     "Keberangkatan mengikuti jadwal trip yang tersedia",
//     //     "Syarat dan ketentuan tambahan dapat menyesuaikan kebijakan Travel Buddies",
//     //   ],
//     //   howToUse: [
//     //     "Pilih trip yang termasuk dalam kategori Trip Special Valentine.",
//     //     "Pastikan pemesanan dilakukan untuk minimal 2 peserta atau lebih dalam 1 booking.",
//     //     "Selesaikan proses pembayaran sesuai instruksi yang tersedia.",
//     //     "Setelah memenuhi ketentuan, harga promo akan otomatis terpotong pada total pembayaran.",
//     //   ],
//     // },

//     // privateTrip: {
//     //   title: "Diskon up to 50%",
//     //   discount: "Promo Diskon Khusus Trip 10%",
//     //   destinasi: "all",
//     //   validUntil: "1–28 Feb 2026",
//     //   terms: ["No Minimum Quota", "Periode booking 26 Januari – 21 Februari", "Periode trip Februari (1–28 Feb 2026)"],
//     //   howToUse: [
//     //     "Lakukan pemesanan melalui form Inquiry Private Trip di website Travel Buddies.",
//     //     "Pada bagian catatan, tambahkan kode promo: CUAN untuk mendapatkan penawaran spesial.",
//     //     "Setelah form dikirim, tim Travel Consultant/Sales Travel Buddies akan menghubungi kamu untuk konfirmasi detail dan penawaran terbaik.",
//     //   ],
//     // },
//   },

//   // THR Open Trip
//   // {
//   //   slug: "thr-open-trip",
//   //   title: 'THR "Tunjangan Hari Raya" Cashback s/d Rp 1 jt',
//   //   description:
//   //     "Rayakan momen Ramadhan dan Lebaran dengan liburan lebih hemat bersama Promo THR (Tunjangan Hari Raya) Travel Buddies. Nikmati penawaran spesial untuk seluruh destinasi Open Trip serta benefit cashback yang dapat digunakan untuk perjalanan berikutnya. Waktunya manfaatkan THR kamu untuk pengalaman traveling yang lebih seru, nyaman, dan terjangkau bersama Travel Buddies.",
//   //   description_full:
//   //     "Paket perjalanan wisata dengan jadwal keberangkatan tetap di mana Anda dapat bergabung bersama peserta lain dalam satu grup. Seluruh kebutuhan perjalanan telah kami siapkan mulai dari itinerary, transportasi, akomodasi, hingga pendamping tour leader, sehingga Anda bisa menikmati liburan dengan lebih praktis, terjangkau, dan tanpa repot mengatur detail teknis. Cocok untuk solo traveler maupun grup kecil yang ingin pengalaman seru dengan teman perjalanan baru.",
//   //   imageUrl: "/images/promo/banner-promo-thr-open-trip.png",
//   //   bannerUrl: "/images/promo/banner-promo-thr-open-trip.png",

//   //   badgeType: "openTrip",
//   //   category: "voucher",

//   //   buttonTitle: "Jalan Bareng Sekarang",
//   //   validUntil: "1-31 Mar",

//   //   discount: "Cashback s/d Rp. 1 jt",
//   //   terms: [
//   //     "Promo THR berlaku selama periode campaign Ramadhan - Lebaran (13 Feb - 31 Maret).",
//   //     "Promo berlaku untuk seluruh destinasi",
//   //     "Periode keberangkatan: Maret – Desember 2026, Tidak berlaku pada: 20 – 31 Maret 2026 (Lebaran) & 25 – 31 Desember 2026 (Nataru)",
//   //     "Promo tidak dapat digabungkan dengan promo, diskon, atau voucher lainnya.",
//   //     "Kuota promo terbatas dan berlaku selama slot masih tersedia.",
//   //     "Jadwal keberangkatan mengikuti ketersediaan trip yang berlaku.",
//   //     "Travel Buddies berhak mengubah syarat & ketentuan tanpa pemberitahuan sebelumnya.",
//   //   ],
//   //   howToUse: [
//   //     "Pilih destinasi dan jadwal Open Trip yang tersedia di periode keberangkatan.",
//   //     "Lakukan pemesanan trip selama periode campaign THR (13 Februari – 31 Maret).",
//   //     "Lengkapi data peserta dan selesaikan proses pembayaran sesuai instruksi.",
//   //     "Setelah transaksi berhasil, benefit promo atau voucher cashback akan otomatis tercatat pada sistem.",
//   //     "Voucher cashback dapat digunakan untuk pemesanan trip berikutnya di luar periode campaign THR, sesuai ketentuan yang berlaku.",
//   //   ],

//   //   // openTrip: {
//   //   //   title: "Diskon up to 50%",
//   //   //   discount: "Diskon up to 50%",
//   //   //   destinasi: "all",
//   //   //   validUntil: "1–28 Feb 2026",
//   //   //   terms: [
//   //   //     "Promo berlaku selama periode campaign (1–28 Februari)",
//   //   //     "Diskon hanya berlaku untuk trip yang termasuk dalam kategori Trip Special Valentine",
//   //   //     "Berlaku untuk pemesanan minimum 2 peserta dalam 1 booking",
//   //   //     "Promo tidak dapat digabungkan dengan promo atau voucher lainnya",
//   //   //     "Kuota promo terbatas dan dapat berakhir sewaktu-waktu tanpa pemberitahuan",
//   //   //     "Keberangkatan mengikuti jadwal trip yang tersedia",
//   //   //     "Syarat dan ketentuan tambahan dapat menyesuaikan kebijakan Travel Buddies",
//   //   //   ],
//   //   //   howToUse: [
//   //   //     "Pilih trip yang termasuk dalam kategori Trip Special Valentine.",
//   //   //     "Pastikan pemesanan dilakukan untuk minimal 2 peserta atau lebih dalam 1 booking.",
//   //   //     "Selesaikan proses pembayaran sesuai instruksi yang tersedia.",
//   //   //     "Setelah memenuhi ketentuan, harga promo akan otomatis terpotong pada total pembayaran.",
//   //   //   ],
//   //   // },

//   //   // privateTrip: {
//   //   //   title: "Diskon up to 50%",
//   //   //   discount: "Promo Diskon Khusus Trip 10%",
//   //   //   destinasi: "all",
//   //   //   validUntil: "1–28 Feb 2026",
//   //   //   terms: ["No Minimum Quota", "Periode booking 26 Januari – 21 Februari", "Periode trip Februari (1–28 Feb 2026)"],
//   //   //   howToUse: [
//   //   //     "Lakukan pemesanan melalui form Inquiry Private Trip di website Travel Buddies.",
//   //   //     "Pada bagian catatan, tambahkan kode promo: CUAN untuk mendapatkan penawaran spesial.",
//   //   //     "Setelah form dikirim, tim Travel Consultant/Sales Travel Buddies akan menghubungi kamu untuk konfirmasi detail dan penawaran terbaik.",
//   //   //   ],
//   //   // },
//   // },

//   // THR
//   // {
//   //   slug: "thr-tunjangan-hari-raya",
//   //   title: 'THR "Tunjangan Hari Raya" Diskon 20% + Cashback Potongan 100K (Min.5 Pax)',
//   //   description: "Rayakan Lebaran, Yuk Ajak Jalan!",
//   //   description_full:
//   //     "Rayakan momen Valentine bareng Travel Buddies! Nikmati diskon hingga 50% untuk Trip Special Valentine, baik Open Trip maupun Private Trip. Promo berlaku selama periode campaign dengan kuota terbatas.",

//   //     imageUrl: "/images/promo/banner-promo-private-trip.png",
//   //     bannerUrl: "/images/promo/banner-promo-private-trip.png",

//   //   badgeType: "promo",
//   //   category: "voucher",

//   //   buttonTitle: "Jalan Bareng Sekarang",
//   //   validUntil: "1-31 Mar 2026",

//   //   howToUse: ["Katalog", "Flyer", "Reels"],

//   //   openTrip: {
//   //     discount: "Diskon up to 20%",
//   //     destinasi: "all",
//   //     validUntil: "1-31 Mar 2026",
//   //     terms: [
//   //       "Promo THR berlaku selama periode campaign Ramadhan - Lebaran",
//   //       "Berlaku untuk pemesanan minimum 5 peserta dalam 1 booking",
//   //       "Berlaku untuk seluruh destinasi",
//   //       "Promo hanya berlaku untuk pemesanan dalam periode promo",
//   //       "Promo tidak dapat digabungkan dengan promo, diskon, atau voucher lainnya",
//   //       "Kuota promo terbatas dan berlaku selama slot masih tersedia",
//   //       "Jadwal keberangkatan mengikuti ketersediaan trip yang berlaku",
//   //       "Travel Buddies berhak mengubah syarat & ketentuan tanpa pemberitahuan sebelumnya",
//   //     ],
//   //   },

//   //   privateTrip: {
//   //     discount: "THR Cashback/Potongan 100k/pax",
//   //     destinasi: ["Jogja", "Dieng", "Bali", "Lombok", "Pahawang"],
//   //     validUntil: "1-31 Mar 2026",
//   //     terms: ["Minimum 15 Pax/Group", "Trip Periode sepanjang 2026", "Pembookingan Periode di Bulan Puasa"],
//   //   },
//   // },

//   // DUMMY
//   // {
//   //   slug: "diskon-pengguna-baru",
//   //   title: "Diskon 15% untuk Pengguna Baru",
//   //   description: "Nikmati potongan harga spesial untuk pendaftaran pertamamu di Travel Buddies.",
//   //   description_full:
//   //     "Khusus untuk kamu yang baru bergabung dengan Travel Buddies! Dapatkan diskon 15% untuk semua paket perjalanan Open Trip dan Private Trip. Promo ini berlaku untuk pemesanan pertama dengan minimal transaksi Rp 2.000.000.",
//   //   imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop",
//   //   bannerUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=600&fit=crop",
//   //   badgeType: "new",
//   //   validUntil: "31 Mar 2026",
//   //   category: "voucher",
//   //   discount: "15%",
//   //   code: "NEWBUDDY15",
//   //   terms: [
//   //     "Promo berlaku untuk pengguna baru Travel Buddies",
//   //     "Minimal transaksi Rp 2.000.000",
//   //     "Maksimal potongan Rp 500.000",
//   //     "Berlaku untuk Open Trip dan Private Trip",
//   //     "Tidak dapat digabungkan dengan promo lain",
//   //     "Promo berlaku hingga 31 Maret 2026",
//   //   ],
//   //   howToUse: [
//   //     "Daftar akun baru di Travel Buddies",
//   //     "Pilih destinasi dan paket trip yang diinginkan",
//   //     "Masukkan kode promo NEWBUDDY15 saat checkout",
//   //     "Selesaikan pembayaran dan nikmati diskonnya!",
//   //   ],
//   // },
// ];

// export function getPromoBySlug(slug: string): PromoDetail | undefined {
//   return promos.find((promo) => promo.slug === slug);
// }

// export function filterPromos(category: string, searchQuery: string): PromoDetail[] {
//   return promos.filter((promo) => {
//     const matchesCategory = category === "all" || promo.category === category;
//     const matchesSearch = !searchQuery || promo?.title?.toLowerCase().includes(searchQuery.toLowerCase()) || promo?.description?.toLowerCase().includes(searchQuery.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });
// }
