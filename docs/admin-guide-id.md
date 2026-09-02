# Panduan singkat PAMOKA CMS

## Masuk dan meminta akses

1. Buka `/admin/login` lalu masuk dengan Google.
2. Jika akun baru, buka **Minta akses**, jelaskan tugas, dan pilih area yang diperlukan.
3. Role Administrator menyetujui permintaan dari menu **Pengguna**. Satu admin dapat memiliki beberapa role.

## Alur kerja konten

- Gunakan **Dashboard** untuk melihat edisi aktif, jumlah peserta, berita, media, permintaan akses, dan perubahan terbaru.
- **Langsung tayang** dipakai hanya untuk field singkat yang ditandai demikian, misalnya nama sponsor atau deskripsi singkat.
- **Draft** dipakai untuk berita, hero, teks panjang, peserta, acara, dan komposisi galeri. Simpan, periksa preview, lalu minta pengguna dengan izin publish menayangkannya.
- Pilih **Edisi** sebelum mengisi konten tahunan. Buat kategori sebelum peserta. Aktivasi edisi membutuhkan alasan dan izin pengaturan.

## Media

Menu **Pustaka media** memakai struktur folder seperti file explorer:

1. Pilih **Root media** atau folder tujuan.
2. Gunakan **Buat folder** untuk menambah folder di lokasi aktif. Folder dapat bertingkat.
3. Unggah gambar setelah folder tujuan aktif. File baru langsung tercatat pada folder tersebut.
4. Pilih sebuah file untuk membuka detail, menyalin URL, membuka file, atau memindahkannya ke folder lain.
5. Pilih sebuah folder untuk mengganti namanya.

Pemindahan folder tidak mengubah ID, URL, atau provider key media, sehingga referensi konten tetap stabil. Pembuatan folder, penggantian nama, pemindahan file, dan upload dicatat ke Audit. Isi alt text untuk gambar informatif dan gunakan aset yang sama di konten lain. Batas aplikasi gambar 20 MB; video dan PDF mengikuti batas route yang dikonfigurasi. Jangan mengunggah data pribadi atau dokumen rahasia.

## Voting manual

Voting dikelola per edisi. Kampanye 2025 dan seluruh tally-nya tetap menjadi arsip ketika kampanye 2026 dibuat.

1. Pastikan peserta tahun berjalan sudah dibuat sebagai finalis aktif pada edisi yang benar.
2. Unggah gambar QRIS ke **Pustaka media**, lalu pilih aset tersebut pada field **Gambar QRIS** di editor peserta.
3. Buka **Voting**, lalu buat kampanye draft untuk edisi yang dipilih. Tentukan harga per vote dan periode dalam WIB.
4. Pilih kampanye. Workspace hanya menampilkan finalis aktif dari edisi kampanye tersebut.
5. Pilih finalis dan tanggal rekap. Masukkan total pemasukan peserta pada merchant app untuk tanggal tersebut, bukan selisih dari pembaruan terakhir.
6. Sistem menghitung vote dari total pemasukan dibagi harga per vote. Sisa nominal yang belum mencapai satu vote tidak dibulatkan ke atas.
7. Isi catatan interval pengecekan, lalu simpan. Pembaruan pada peserta dan tanggal yang sama mengganti nilai harian sebelumnya dengan pemeriksaan versi.

Permintaan yang mencoba memasukkan peserta dari edisi lain, semifinalis, peserta nonaktif, atau tanggal di luar periode kampanye akan ditolak di server. Koreksi tidak menghapus riwayat karena nilai sebelum dan sesudah tetap masuk Audit.

## Pengguna dan audit

Role Administrator dapat menyetujui akses serta memilih satu atau beberapa role. Jangan memberi `super_admin`; bootstrap pertama dilakukan manual melalui Turso sesuai runbook. Menu **Audit** menunjukkan siapa, kapan, resource, dan field yang berubah.

## Persiapan tahun baru

1. Buat edisi draft.
2. Tambah kategori dan peserta.
3. Isi kepengurusan, sponsor, acara, dan galeri.
4. Tetapkan finalis dan QRIS masing-masing, lalu siapkan kampanye voting baru. Tally edisi lama tidak disalin.
5. Periksa kelengkapan dan preview.
6. Aktivasi hanya setelah review; edisi aktif lama akan diarsipkan.

## Hal yang tidak boleh dilakukan

- Jangan mengedit Turso production kecuali menjalankan runbook yang telah disetujui.
- Jangan mengaktifkan edisi atau memigrasi konten hardcoded sebelum backup dan parity disetujui.
- Jangan membagikan secret Google, Better Auth, UploadThing, atau database.
- Jangan menggunakan tally negatif atau mengoreksi tally tanpa alasan yang nyata.
