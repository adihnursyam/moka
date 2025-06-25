const MD = [
  { no: 1, name: 'Alfiah Ainun Mardatilah' },
  { no: 2, name: 'Cecilia Clairin Rimayansyah' },
  { no: 3, name: 'Gestie Alfiah Soumi' },
  { no: 4, name: 'Ghaida Salsabila' },
  { no: 5, name: 'Inneu Rahmawati' },
  { no: 6, name: 'Kirana Ajeng Pratiwi' },
  { no: 7, name: 'Marsha Azkia Fauziah' },
  { no: 8, name: 'Novi Nurdiyanti' },
  { no: 9, name: 'Puput Andini' },
  { no: 10, name: 'Raani Yuliani' },
  { no: 11, name: 'Rachil' },
  { no: 12, name: 'Rida Faridah' },
  { no: 13, name: 'Rosa Nursyamsiah' },
  { no: 14, name: 'Tiara Febrianti' },
  { no: 15, name: 'Viola Fitri Rahayu' },
  { no: 16, name: 'Zihan Nur Aulia' },
];

const JD = [
  { no: 1, name: 'Ade Nugraha' },
  { no: 2, name: 'Alam Muharam' },
  { no: 3, name: 'Arya Nugraha' },
  { no: 4, name: 'Deka Arianda' },
  { no: 5, name: 'Deni Septiaji' },
  { no: 6, name: 'Hamim Nuryadi' },
  { no: 7, name: 'M Habib An Nazar' },
  { no: 8, name: 'Marcel Laksono Putra' },
  { no: 9, name: 'Mirza Raihan Pamugar' },
  { no: 10, name: 'Mohamad Febrian Zilham Sopandi' },
  { no: 11, name: 'Muhammad Alvin Maulana' },
  { no: 12, name: 'Muhammad Exsel Al Syiamudawan' },
  { no: 13, name: 'Rendy Ahmad Mutaqin' },
  { no: 14, name: 'Rizki Bagus Hidayatulloh' },
  { no: 15, name: 'Ujang Sulton' },
  { no: 16, name: 'Wildan Septi Ramadhan' },
];

const JR = [
  { no: 1, name: 'Akbar Abdul Rojak' },
  { no: 2, name: 'Al Fauzan Bintang Setiawan' },
  { no: 3, name: 'Dhafin Mochamad Ramdhani' },
  { no: 4, name: 'Fadhil Arya Rachman' },
  { no: 5, name: 'Fahri Nuryadin Putra' },
  { no: 6, name: 'Hafiz Firza' },
  { no: 7, name: 'Hardhika Wahyu Kusuma' },
  { no: 8, name: 'Jamian Rava Benati' },
  { no: 9, name: 'M Nazril Abdullah' },
  { no: 10, name: 'Muhamad Satria Sunda' },
  { no: 11, name: 'Muhammad Bintang Kevin Alyuva' },
  { no: 12, name: 'Nandang Soleh' },
  { no: 13, name: 'Raditya Rizqullah' },
  { no: 14, name: 'Rd Muhammad Kaisyar Al-Hasby' },
  { no: 15, name: 'Rillo Faiq Mochammad Wibowo' },
  { no: 16, name: 'Zaidan Salim Jundan' },
];

const MR = [
  { no: 1, name: 'Arella Kireida Andriani' },
  { no: 2, name: 'Cinta Putri Vidianta' },
  { no: 3, name: 'Cinta Shafa Shahasya' },
  { no: 4, name: 'Davina Apriliana' },
  { no: 5, name: 'Disty Hutami Dwi Aryani' },
  { no: 6, name: 'Khaila Elysia Afandie' },
  { no: 7, name: 'Mutiara Ramadhani' },
  { no: 8, name: 'Nazhira Putri Syawalina Oktaviani' },
  { no: 9, name: 'Nazwa Aulia Qurota Ayuni' },
  { no: 10, name: 'Nurlaifatul Fajar Hafidhoh' },
  { no: 11, name: 'Rahmatunnisa Muliawati' },
  { no: 12, name: 'Rivani Marva Haura' },
  { no: 13, name: 'Syaila Zahratunnisa' },
  { no: 14, name: 'Vina Faulina' },
  { no: 15, name: 'Zahra Kirana Rizkya Metta' },
  { no: 16, name: 'Zelinda Naflah Firyal' },
];

export const news = [
  {
    title:
      'Pasanggiri Mojang Jajaka Garut 2025 Sukses Digelar, Lahirkan Duta Muda Berbakat',
    description:
      'Ajang tahunan Pasanggiri Mojang Jajaka Kabupaten Garut telah sukses diselenggarakan pada akhir pekan lalu, melahirkan pasangan duta muda yang siap berkontribusi untuk kemajuan pariwisata dan budaya Garut.',
    imageUrl: '/activity.jpg', // Atau pilih salah satu dari daftar Anda
    date: new Date(2025, 4, 5), // Contoh: 5 Mei 2025 (bulan di JS 0-11, jadi 4 adalah Mei)
    link: '/berita/pasanggiri-moka-garut-2025-sukses',
  },
  {
    title:
      'Pamoka Garut Hadiri Festival Budaya Jawa Barat, Kenalkan Kesenian Khas Garut',
    description:
      'Delegasi Pamoka Garut turut memeriahkan Festival Budaya Jawa Barat di Bandung dengan menampilkan ragam kesenian dan produk unggulan khas Kabupaten Garut, mendapatkan apresiasi positif dari pengunjung.',
    imageUrl: '/babancong.png', // Atau pilih salah satu dari daftar Anda
    date: new Date(2025, 3, 28), // Contoh: 28 April 2025
    link: '/berita/pamoka-garut-festival-budaya-jabar',
  },
  {
    title:
      'Kolaborasi Pamoka Garut dan Disparbud: Workshop Ekonomi Kreatif untuk Pemuda',
    description:
      'Pamoka Garut bekerja sama dengan Dinas Pariwisata dan Kebudayaan Garut mengadakan workshop pengembangan ekonomi kreatif yang menyasar para pemuda Garut untuk meningkatkan keterampilan dan inovasi.',
    imageUrl: '/college-in-lab.jpg', // Atau pilih salah satu dari daftar Anda
    date: new Date(2025, 3, 15), // Contoh: 15 April 2025
    link: '/berita/workshop-ekraf-pamoka-disparbud',
  },
  {
    title:
      'Kunjungan Inspiratif Pamoka Garut ke Sentra Batik Garutan: Upaya Lestarikan Warisan',
    description:
      'Dalam rangka memperdalam pengetahuan dan kecintaan terhadap warisan budaya, anggota Pamoka Garut melakukan kunjungan inspiratif ke salah satu sentra pengrajin Batik Garutan yang legendaris.',
    imageUrl: '/college-spring.jpg', // Atau pilih salah satu dari daftar Anda
    date: new Date(2025, 2, 20), // Contoh: 20 Maret 2025
    link: '/berita/pamoka-kunjungan-batik-garutan',
  },
  {
    title:
      'Pamoka Garut Gelar Aksi Sosial Peduli Lingkungan di Area Wisata Curug Orok',
    description:
      'Sebagai bentuk kepedulian terhadap kelestarian alam dan kenyamanan wisatawan, Pamoka Garut menginisiasi kegiatan bersih-bersih sampah di sekitar area wisata Curug Orok, Cilawu.',
    imageUrl: '/activity.jpg', // Atau pilih salah satu dari daftar Anda
    date: new Date(2025, 2, 5), // Contoh: 5 Maret 2025
    link: '/berita/aksi-sosial-pamoka-curug-orok',
  },
  {
    title:
      'Audiensi Pamoka Garut dengan Bupati: Sinergi Membangun Generasi Unggul Garut',
    description:
      'Jajaran pengurus Pamoka Garut diterima secara resmi oleh Bupati Garut untuk membahas program kerja dan sinergi dalam upaya membangun generasi muda Garut yang unggul dan berkarakter.',
    imageUrl: '/meeting.jpg', // Atau pilih salah satu dari daftar Anda
    date: new Date(2025, 1, 25), // Contoh: 25 Februari 2025
    link: '/berita/audiensi-pamoka-bupati-garut',
  },
  {
    title:
      'Pelatihan Public Speaking untuk Anggota Pamoka Garut Tingkatkan Kepercayaan Diri',
    description:
      'Untuk meningkatkan kapabilitas anggotanya sebagai duta daerah, Pamoka Garut menyelenggarakan pelatihan public speaking intensif yang dibimbing oleh praktisi komunikasi ternama.',
    imageUrl: '/college-in-lab.jpg', // Atau pilih salah satu dari daftar Anda
    date: new Date(2025, 1, 10), // Contoh: 10 Februari 2025
    link: '/berita/pelatihan-public-speaking-pamoka',
  },
];

export const finalists = [
  {
    name: 'Dikri Faturohman',
    title: 'Jajaka Pinilih 2023',
  },
  {
    name: 'Nurunisa',
    title: 'Mojang Pinilih 2023',
  },
  {
    name: 'Nabil Nazwa',
    title: 'Jajaka Wakil I 2023',
  },
  {
    name: 'Arni Kinanti Asri',
    title: 'Mojang Wakil I 2023',
  },
  {
    name: 'Angga M. Rizki',
    title: 'Jajaka Wakil II 2023',
  },
  {
    name: 'Renisa Nur Aliza',
    title: 'Mojang Wakil II 2023',
  },
  {
    name: 'Hisam Sambadi',
    title: 'Jajaka Harapan I 2023',
  },
  {
    name: 'Oktavia',
    title: 'Mojang Harapan I 2023',
  },
  {
    name: 'Farhan Sidik Hasan',
    title: 'Jajaka Harapan II 2023',
  },
  {
    name: 'Amanda Tristianti',
    title: 'Mojang Harapan II 2023',
  },
  {
    name: 'Tegar Tantangan',
    title: 'Jajaka Harapan III 2023',
  },
  {
    name: 'Nurul Alfa Rahmat',
    title: 'Mojang Harapan III 2023',
  },
  {
    name: 'Al Kahfi Ramadhan',
    title: 'Jajaka Pinilih Rumaja 2023',
  },
  {
    name: 'Talitha Mughni',
    title: 'Mojang Pinilih Rumaja 2023',
  },
  {
    name: 'Mohamad Rapli',
    title: 'Jajaka Wakil I Rumaja 2023',
  },
  {
    name: 'Febrina Putri Firdaus',
    title: 'Mojang Wakil I Rumaja 2023',
  },
  {
    name: 'M. Bagas Saputra',
    title: 'Jajaka Wakil II Rumaja 2023',
  },
  {
    name: 'Keyla Permata Dini',
    title: 'Mojang Wakil II Rumaja 2023',
  },
  {
    name: 'Hafizh Alif Fakhratama',
    title: 'Jajaka Harapan I Rumaja 2023',
  },
  {
    name: 'Kayla Nisa Hanan',
    title: 'Mojang Harapan I Rumaja 2023',
  },
  {
    name: 'Agung Setiawan',
    title: 'Jajaka Harapan II Rumaja 2023',
  },
  {
    name: 'Saharani Nurul Aghni',
    title: 'Mojang Harapan II Rumaja 2023',
  },
  {
    name: 'Nicolas Saputra',
    title: 'Jajaka Harapan III Rumaja 2023',
  },
  {
    name: 'Fadninta Alana Qolbi',
    title: 'Mojang Harapan III Rumaja 2023',
  },
  {
    name: 'Moch Afdal Hambali',
    title: 'Jajaka Mmitran 2023',
  },
  {
    name: 'Patonah',
    title: 'Mojang Mmitran 2023',
  },
  {
    name: 'Adi Haditya Nursyam',
    title: 'Jajaka Calakan 2023',
  },
  {
    name: 'Adhyaa Putri Rayhanum',
    title: 'Mojang Calakan 2023',
  },
  {
    name: 'Naila Alivia Choerunnisa',
    title: 'Mojang Kameumeut 2023',
  },
  {
    name: 'Dede Restu',
    title: 'Jajaka Kameumeut 2023',
  },
  {
    name: 'Annisa Purnama Sari',
    title: 'Mojang Kameumeut Rumaja 2023',
  },
  {
    name: 'M Haiqal Firdaus',
    title: 'Jajaka Kameumeut Rumaja 2023',
  },
  {
    name: 'Azeng Virginiawati',
    title: 'Mojang Parigel 2023',
  },
  {
    name: 'Wildan M Qurtubi',
    title: 'Jajaka Parigel 2023',
  },
  {
    name: 'Syaila Alya',
    title: 'Mojang Parigel Rumaja 2023',
  },
  {
    name: 'Gilang Nugraha',
    title: 'Jajaka Parigel Rumaja 2023',
  },
  {
    name: 'Aulia Siti Humaira',
    title: 'Mojang Motekar 2023',
  },
  {
    name: 'M Taufan Amarullah',
    title: 'Jajaka Motekar 2023',
  },
  {
    name: 'Nisrina Shofa Ramadani',
    title: 'Mojang Motekar Rumaja 2023',
  },
  {
    name: 'Angga Irsan Attala',
    title: 'Jajaka Motekar Rumaja 2023',
  },
  {
    name: 'Raynatha Velga',
    title: 'Mojang Gandes 2023',
  },
  {
    name: 'Sandika Adi Nugraha',
    title: 'Jajaka Kewes 2023',
  },
  {
    name: 'Nabila Azma Padila',
    title: 'Mojang Gandes Rumaja 2023',
  },
  {
    name: 'Muhammad Mutakhir',
    title: 'Jajaka Kewes Rumaja 2023',
  },
];

export const sponsors = [
  {
    src: '/sponsors/qwest-communications-logo.png',
    name: 'Qwest Communications',
  },
  { src: '/sponsors/iveco-logo-black-and-white-1.png', name: 'Iveco' },
  { src: '/sponsors/fx4-off-road-logo.png', name: 'FX4 Off-Road' },
  { src: '/sponsors/zwave-logo-vector.svg', name: 'Z-Wave' },
  { src: '/sponsors/coca-cola-logo.png', name: 'Coca-Cola' },
  { src: '/sponsors/chanel-logo.png', name: 'Chanel' },
  { src: '/sponsors/adidas-logo.png', name: 'Adidas' },
  { src: '/sponsors/citibank-logo.png', name: 'Citibank' },
  { src: '/sponsors/audi-logo.png', name: 'Audi' },
];

export const categories: {name: string, slug: string, list: typeof MR, abrev: 'MR' | 'JR' | 'MD' | 'JD'}[] = [
  { name: 'Mojang Rumaja', slug: 'mojang-rumaja', list: MR, abrev: 'MR' },
  { name: 'Jajaka Rumaja', slug: 'jajaka-rumaja', list: JR, abrev: 'JR' },
  { name: 'Mojang Dewasa', slug: 'mojang-dewasa', list: MD, abrev: 'MD' },
  { name: 'Jajaka Dewasa', slug: 'jajaka-dewasa', list: JD, abrev: 'JD' },
];

