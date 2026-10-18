# Rencana Pengembangan Konten: "Lima Rumah" × Ruang Tumbuh P3MD

> **Status (18 Okt 2026): diimplementasikan, lalu dipangkas atas permintaan user menjadi 7 langkah (Peta isu, Aliran, 5 rumah). Langkah 05–09 dihapus; animasi cincin keyakinan (07) dan garis keterkaitan (08) dipindahkan ke inti dan tampil sejak awal.** Revisi komposisi: lantai lingkaran dihapus, tiap rumah di pulau melayang sendiri (metafora planet), inti sembilan masalah mengorbit dengan cincin orbit, aliran mengikuti inti. Keputusan: tema ivory + toggle gelap; semua 9 mode diadopsi (12 langkah); Metodologi sebagai lampiran modal; data dari JSON statis (`src/data/ruang-tumbuh-p3md.json`); tanpa glosarium (internal). Lihat README untuk alur akhir.

Sumber: https://ruang-tumbuh-p3md.vercel.app/ (Peta Masalah Angkatan · Analisis Aspirasi Kelompok).
Data mentah situs sudah disalin ke `src/data/ruang-tumbuh-p3md.json` (objek `P` yang tertanam di HTML situs).

---

## 1. Pemahaman situs sumber

**Apa itu.** Satu halaman "ruang kendali" (HUD gelap, canvas 2D yang dirender seperti 3D) yang memvisualkan hasil *Problem Network Analysis* atas aspirasi kelompok angkatan P3MD. Inti tengah berisi 9 masalah angkatan; 5 globe "ruang" mengorbit inti, masing-masing membawa jaringan kata isunya. Garis dari inti ke globe menunjukkan ke ruang mana tiap masalah "mengalir" menurut aspirasi.

**Angka kunci (meta).**

| Metrik | Nilai |
| --- | --- |
| Aspirasi | 751 (12/10–17/10, 506 memuat isu) |
| Agent (pengumpul) | 24 |
| Isu (kata) | 128 jaringan utama · 209 ditampilkan |
| Relasi kata | 329 (349 ditampilkan, 94 lintas ruang) |
| Masalah | 9 |
| Ruang | 5 |
| Validasi | 3 didukung · 1 sebagian · 2 tidak didukung · 3 data kurang |

**Lima ruang = lima rumah kita.** Nama, warna, dan definisinya sudah ada di situs:

| Ruang | Warna situs | Definisi (dari situs) | Kata solusi | Isu |
| --- | --- | --- | --- | --- |
| Aman | `#4a90ea` | Mitigasi risiko dan kepedulian terhadap serdik. | aman, dukungan, dukungan fisik, kepedulian, perlindungan, privat, kerahasiaan | 35 |
| Bersama | `#e8673a` | Menjawab persoalan silo dan sirkel serta mendukung perjalanan Zulu to Alpha. | kebersamaan, merangkul, kolaborasi, lintas, apresiasi | 59 |
| Belajar | `#22b585` | Menampung masukan dan menghadirkan solusi permasalahan akademis. | belajar, mentoring, materi, pengembangan, kompetensi | 63 |
| Inovasi | `#e3a21a` | Wadah untuk menyampaikan, menilai, dan menguji coba gagasan. | ide, gagasan, kreativitas, kompetisi, inventor, wadah, digital | 30 |
| Masa Depan | `#e0679a` | Kesiapan karier setelah P3MD. | kedepan, arah, perencanaan, keberlanjutan | 22 |

**Sembilan masalah dan alirannya** (rencana tim → ruang terdekat menurut aspirasi):

| Masalah | Rencana tim | Data | Verdict | Stabil |
| --- | --- | --- | --- | --- |
| Risiko Zulu | Aman | Belajar (52%) | tidak didukung ⇄ | 67% |
| KDKMP / Kopdes | Masa Depan/Belajar/Aman | Belajar (78%) | sebagian | 79% |
| Zulu → Alpha | Bersama | Belajar (69%) | tidak didukung ⇄ | 61% |
| Silo / sirkel | Bersama/Aman | Bersama (40%), dukung Aman (35%) | data kurang ? | 50% |
| Ruang gerak terbatas | Aman | Bersama (76%) | data kurang ? | 80% |
| Isu akademis di kelas | Belajar | Belajar (65%) | didukung | 58% |
| Kondisi mental | Aman | Aman (93%) | didukung | 100% |
| Wadah inovasi | Inovasi | Inovasi (87%) | didukung | 68% |
| Rencana karier setelah P3MD | Masa Depan | Masa Depan (96%) | data kurang ? | 100% |

**Beban ruang** (rencana → aspirasi): Aman 5 → 1 (−4) · Bersama 2 → 0 (−2, 2 masalah berdata tipis) · Belajar 2 → 4 (+2) · Inovasi 1 → 1 · Masa Depan 2 → 0 (−2, 1 berdata tipis).

**Saling terkait.** 36 pasangan: 2 kuat (Risiko Zulu–Zulu→Alpha 12 aspirasi/6 agent; KDKMP–Zulu→Alpha), 4 sedang, 14 lemah, 16 tidak pernah bersama. Klaster Zulu paling erat; klaster longgar kedua di sekitar rasa aman (Silo, Ruang gerak, Kondisi mental).

**Sembilan mode narasi situs** (sidebar kiri): 01 Sembilan masalah & alirannya · 02 Peta isu · 03 Metodologi (tahap A–I + referensi) · 04 Lima ruang · 05 Rencana vs aspirasi · 06 Beban ruang · 07 Keyakinan · 08 Saling terkait · 09 Kesimpulan (6 takeaway + 5 langkah berikutnya).

---

## 2. Prinsip pemetaan ke dunia 3D kita

| Elemen situs | Elemen di presentasi 3D |
| --- | --- |
| 5 globe ruang | 5 rumah (sudah ada), warna aksen diganti ke palet situs |
| Inti "Cluster Masalah" (9 masalah) | Jaringan pusat: 9 node masalah sebagai node besar (inti), dikelilingi node kata isu |
| Kata isu per ruang (209) | Node kecil di jaringan pusat, dikelompokkan per ruang (warna ruang); dibatasi ±10 kata teratas per ruang agar terbaca (≈ 9 + 50 node) |
| Garis aliran masalah → ruang (menyala/putus-putus) | Jalur 3D pusat → rumah; per masalah, satu pulsa dari node masalah ke rumah tujuan; jalur pendukung putus-putus |
| ◆ berisi / ◇ kosong di permukaan globe | Penanda kecil di alas rumah: berlian isi = masalah yang mengalir ke sini, berlian kosong = hanya rencana tim |
| Mode 05 (titik pindah ruang) | Animasi "pindah rumah": token masalah berjalan dari rumah rencana ke rumah data |
| Mode 06 (kolom beban) | Tumpukan balok kecil di samping tiap rumah (1 balok = 1 masalah) + angka selisih |
| Mode 07 (cincin keyakinan) | Cincin stabilitas pada token masalah (persen tetap sama) |
| Mode 08 (matriks hubungan) | Garis antar node masalah di inti dengan ketebalan sesuai level |
| Mode 09 (kesimpulan) | Overview penutup: panel takeaway + langkah berikutnya, semua jalur disorot |

Gaya visual tetap ivory/matte milik kita (ramah proyektor), tetapi palet aksen ruang mengikuti situs supaya konsisten dengan dokumen Ruang Tumbuh. Opsi tema gelap "HUD" bisa ditambahkan belakangan sebagai toggle.

---

## 3. Alur presentasi baru

Langkah tetap linier (Prev/Next), tetapi tiap langkah bisa punya **sub-bagian** (tab di panel, keyboard ↑/↓ atau Space) agar materi situs yang kaya tetap muat tanpa menambah banyak perjalanan kamera.

1. **Pembuka — Peta Masalah Angkatan** (overview). Judul, 5 stat tile (751 aspirasi · 24 agent · 128 isu · 9 masalah · 5 ruang), jaringan terbentuk bertahap: 9 masalah muncul dulu di inti, lalu kata-kata per ruang.
2. **Sembilan masalah & alirannya** (overview, kamera sedikit lebih rendah). Pulsa dari tiap node masalah ke rumah tujuannya; legenda 9 masalah di panel; klik masalah = sorot jalurnya.
3. **Rumah Aman** → 4. **Rumah Bersama** → 5. **Rumah Belajar** → 6. **Rumah Inovasi** → 7. **Rumah Masa Depan**. Tiap rumah punya sub-bagian panel:
   - *Ringkasan*: definisi ruang (dari situs), kalimat utama (hasil analisis), 3 poin.
   - *Masalah*: daftar masalah utama/pendukung/hanya-rencana dengan verdict dan persentase kedekatan (bar).
   - *Kata*: kata solusi (chip) + 8–10 isu teratas dengan frekuensi.
   - *Beban & keyakinan*: rencana → aspirasi (selisih), stabilitas tiap masalah terkait.
   Urutan rumah mengikuti urutan situs (Aman, Bersama, Belajar, Inovasi, Masa Depan); posisi melingkar disesuaikan.
8. **Rencana vs aspirasi** (overview). Animasi token masalah berpindah rumah (2 pindah, 4 sesuai, 3 berdata tipis) dengan tombol "Putar ulang".
9. **Saling terkait** (kamera fokus ke inti). Garis antar 9 masalah (kuat/sedang/lemah), sorotan klaster Zulu dan klaster rasa aman.
10. **Kesimpulan** (overview penutup). 6 takeaway (klik = sorot rumah/masalah) + 5 langkah berikutnya + ringkasan 4/2/3.
11. **Lampiran: Metodologi** (opsional, di luar alur Next; dibuka dari tombol "Metodologi"). Tahap A–I sebagai akordeon, referensi sebagai daftar; tanpa 3D baru.

Catatan konten per rumah (draf kalimat utama, berdasarkan data situs):

- **Aman** — "Direncanakan untuk 5 masalah, tetapi aspirasi hanya menempatkan Kondisi mental di sini (100% stabil)." Poin: fokuskan pada kondisi mental & dukungan; Silo/sirkel sebagai pendukung; Risiko Zulu, KDKMP, Ruang gerak lebih dekat ke ruang lain.
- **Bersama** — "Silo/sirkel dan Ruang gerak mengarah ke sini, tetapi datanya masih tipis." Poin: bekerja berdampingan dengan Ruang Aman; Zulu → Alpha yang direncanakan di sini justru bicara bahasa Belajar; jaring aspirasi tambahan.
- **Belajar** — "Menanggung beban terbesar: 4 masalah mengalir ke sini, rencana hanya 2 (+2)." Poin: Risiko Zulu, KDKMP, Zulu → Alpha, Isu akademis; kata penghubung zulu, mentoring, kopdes, kelas; siapkan kapasitas atau bagi program.
- **Inovasi** — "Satu-satunya ruang yang rencana dan aspirasinya persis sejalan." Poin: Wadah inovasi didukung (87%); kata: ide, gagasan, mewadahi, pimpinan; hampir selalu dibahas sendiri.
- **Masa Depan** — "Rencana karier setelah P3MD mengarah ke sini (96%), tetapi baru 1 sumber." Poin: kata kerja, arah, keberlanjutan, kepemimpinan; KDKMP yang direncanakan di sini ternyata ke Belajar; dengarkan langsung angkatan.

---

## 4. Perubahan teknis

### 4.1 Lapisan data (baru)
- `data/ruang-tumbuh-p3md.json` sebagai sumber tunggal (sudah disalin). Tambahkan tipe TypeScript `src/data/types.ts` untuk `meta`, `anchors`, `nodes`, `links`, `problems`, `relall`, `load`, `method`.
- `src/data/derive.ts`: fungsi turunan murni (dipakai config & komponen): kata teratas per ruang, beban rencana vs data, masalah per ruang (utama/pendukung/rencana), level hubungan, label pendek masalah (`SN` di situs: "KDKMP / Kopdes", "Zulu → Alpha", "Ruang gerak", "Wadah inovasi", "Rencana karier").
- `scripts/gen-network.mjs` (ganti generator lama): bangun koordinat jaringan **dari data**: 9 node masalah di inti (dua cincin: 3 dalam, 6 luar, seperti situs), kata teratas per ruang di sektor sudut rumahnya (klaster = ruang), tepi dari `links` yang kedua ujungnya tampil. Hasil tetap disimpan sebagai literal agar komposisi stabil.

### 4.2 Konfigurasi
- `HOUSES`: urutan & sudut baru (Aman, Bersama, Belajar, Inovasi, Masa Depan), `accent` palet situs, `definition`, `solutionWords`, `ruangKey`. Konten per rumah menjadi beberapa `sections` (Ringkasan/Masalah/Kata/Beban) alih-alih satu blok.
- `PRESENTATION_ORDER` menjadi daftar langkah bertipe: `{ kind: 'overview' | 'house' | 'flow' | 'relations' | 'closing', ... }` dengan target kamera per jenis.
- `CLOSING_CONTENT` → `TAKEAWAYS` (6) + `NEXT_STEPS` (5) + ringkasan.

### 4.3 Komponen 3D
- `CentralNetwork`: dua kelas node (masalah besar dengan cincin, kata kecil), warna per ruang, reveal bertahap masalah → kata. Sorot node masalah + tetangganya saat masalah dipilih.
- `ConnectionPaths`: jalur per **masalah** (bukan per rumah): utama solid, pendukung putus-putus (dash via `LineDashedMaterial` atau tabung bersegmen). Pulsa per masalah. Mode "semua" di langkah 2 dan penutup.
- `ProblemTokens` (baru): 9 token berlian; di langkah "Rencana vs aspirasi" bergerak dari rumah rencana ke rumah data sepanjang kurva, berbasis waktu, dengan tombol putar ulang.
- `LoadColumns` (baru): tumpukan balok di samping tiap rumah (utama pekat, pendukung tipis, "?" samar, rencana kaca) + label selisih; muncul hanya pada langkah Beban/rumah aktif.
- `ProblemRelations` (baru): garis antar token di inti untuk langkah "Saling terkait", ketebalan/dash sesuai level.
- `HouseNode`: penanda ◆/◇ di alas, warna aksen baru; varian bentuk dipetakan ulang ke urutan ruang.

### 4.4 UI
- `PresentationPanel`: sub-bagian (tab) + komponen kecil: stat tile, bar persentase kedekatan, chip kata, tabel beban, cincin stabilitas (SVG). Tetap maksimal 3 poin di tab Ringkasan.
- `NavigationControls`: indikator "3 / 10 — Rumah Belajar · Masalah", tombol "Metodologi" (modal/lampiran), pemilih masalah (9 chip) saat langkah aliran/relasi.
- Fallback HTML: render semua langkah & tab sebagai halaman panjang.

### 4.5 Performa
- Node ≈ 60, tepi ≈ 120: tetap satu `InstancedMesh` + satu `LineSegments`. Token/kolom ≤ 9 + 5×≤6 mesh; geometri dibagi.
- Semua animasi tetap di `useFrame`; data turunan dihitung sekali (`useMemo`/modul).

---

## 5. Tahapan kerja

| Tahap | Isi | Perkiraan |
| --- | --- | --- |
| 1. Data | Tipe + fungsi turunan + generator jaringan dari data; uji snapshot angka vs situs (751/24/128/9/5, beban 5→1 dst.) | 0,5 hari |
| 2. Konfigurasi & konten | Palet, urutan rumah, konten 5 rumah (4 tab), takeaway penutup, langkah bertipe | 0,5 hari |
| 3. Jaringan & jalur | Node masalah + kata, jalur per masalah (utama/pendukung), pulsa, sorotan | 1 hari |
| 4. Visual tambahan | ProblemTokens (pindah ruang), LoadColumns, ProblemRelations, penanda ◆/◇ | 1–1,5 hari |
| 5. Panel & navigasi | Tab panel, stat tile, bar, chip, cincin stabilitas, pemilih masalah, lampiran Metodologi | 1 hari |
| 6. QA | Walkthrough Playwright desktop/mobile, reduced motion, fallback, resize, perbandingan angka dengan situs | 0,5 hari |

Total ≈ 4,5–5 hari kerja. Tahap 1–3 sudah menghasilkan presentasi yang utuh; tahap 4–5 menambah kedalaman.

---

## 6. Keputusan yang perlu dikonfirmasi

1. **Tema**: tetap ivory (ramah proyektor) dengan palet aksen situs, atau ikut gelap HUD seperti situs? Usulan: ivory default + toggle gelap.
2. **Kedalaman**: semua 9 mode diadopsi (alur 10 langkah + lampiran) atau cukup 5 rumah + pembuka/penutup dengan data nyata? Usulan: alur penuh, karena panel bertab menjaga tiap langkah tetap ringkas.
3. **Metodologi & referensi**: sebagai lampiran (usulan) atau langkah dalam alur Next?
4. **Sumber data**: JSON statis yang disalin (usulan; stabil untuk presentasi) atau diambil langsung dari situs saat runtime?
5. **Istilah internal** (Zulu, Alpha, KDKMP/Kopdes, serdik): perlu glosarium kecil di panel untuk audiens luar?
