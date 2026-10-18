# Peta Masalah Angkatan — Presentasi Interaktif 3D

Presentasi 3D hasil *Problem Network Analysis* Ruang Tumbuh P3MD dengan komposisi seperti sistem planet: inti sembilan masalah yang mengorbit perlahan di tengah (dengan bola kaca dan cincin orbit), lima rumah ruang yang masing-masing berdiri di pulau melayangnya sendiri, dan garis aliran yang mengikuti inti secara langsung. Kamera berpindah halus dari langkah ke langkah; materi tampil di panel HTML yang tajam.

Dibangun dengan **React 19, TypeScript, Three.js, React Three Fiber, Drei, Vite, zustand**. Seluruh geometri prosedural; data berasal dari JSON statis.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # hasil di dist/
npm run preview
node scripts/gen-network.mjs   # regenerasi tata letak jaringan dari data
```

## Alur presentasi (12 langkah + lampiran)

| # | Langkah | Mode situs sumber | Yang terjadi di dunia 3D |
| --- | --- | --- | --- |
| 1 | Peta isu | 02 | Overview; 50 kata teratas (instanced) terbentuk bertahap di sekitar inti; stat tile 751 / 24 / 128 / 9 / 5 |
| 2 | Sembilan masalah & alirannya | 01 | Garis aliran tiap masalah dari inti ke rumah ruang terdekat (solid) dan pendukung (putus-putus); pilih masalah untuk menyorot |
| 3–7 | Ruang Aman, Bersama, Belajar, Inovasi, Masa Depan | 04 | Kamera mendekat ke rumah; panel bertab: Ringkasan · Masalah · Kata · Beban & keyakinan (`↑`/`↓`) |
| 8 | Rencana vs aspirasi | 05 | Token masalah berdiri di rumah rencana lalu berpindah ke rumah menurut data; tombol putar ulang |
| 9 | Beban ruang | 06 | Kolom balok di samping tiap rumah (utama / pendukung / data kurang / hanya rencana) + selisih |
| 10 | Keyakinan | 07 | Token membentuk cincin; busur stabilitas (ruang tetap sama) dan definisi kata solusi yang sepakat |
| 11 | Saling terkait | 08 | Garis antar sembilan masalah (kuat / sedang / lemah) + matriks di panel |
| 12 | Kesimpulan | 09 | Enam takeaway (klik = sorot rumah/masalah) + langkah berikutnya |
| — | Metodologi | 03 | Lampiran modal: tahap A–I, referensi, cara menghitung, batasan |

## Navigasi

| Aksi | Cara |
| --- | --- |
| Berikutnya / sebelumnya | **Next** / **Previous**, `→` `PageDown` / `←` `PageUp` |
| Tab di langkah rumah | `↑` / `↓` |
| Kembali ke peta | **Peta**, `Home`; `Escape` melepas sorotan lalu kembali ke peta |
| Lompat langkah | chip langkah di bar bawah, atau klik rumah 3D |
| Pilih masalah | chip masalah di panel, atau klik berlian masalah di 3D |
| Tema gelap (default) / terang | tombol matahari/bulan (tersimpan di `localStorage`) |
| Orbit manual | **Eksplorasi** (otomatis nonaktif saat presentasi dilanjutkan) |
| Layar penuh | **Fullscreen** |

## Mengganti data dan teks

- `src/data/ruang-tumbuh-p3md.json` — data analisis (objek `P` dari situs sumber). Setelah mengganti, jalankan `node scripts/gen-network.mjs`.
- `src/data/narrative.ts` — semua teks naratif: definisi & pesan tiap ruang, teks tiap langkah, takeaway, langkah berikutnya, metodologi, referensi.
- `src/data/derive.ts` — fungsi turunan (beban ruang, slot masalah per rumah, ringkasan verdict, nama pendek masalah).
- `src/config/presentation.ts` — rumah (urutan, sudut, varian, warna aksen situs), jarak pulau dari inti (`STAGE.houseRadius`), langkah presentasi, target kamera, palet tema. Sudut rumah harus sama dengan `ANGLE` di `scripts/gen-network.mjs`.

## Struktur

```
src/
  data/        ruang-tumbuh-p3md.json · types.ts · derive.ts · narrative.ts
  config/      presentation.ts (konfigurasi terpusat) · network.ts (dihasilkan)
  store/       useStore.ts — state presentasi (zustand)
  scene/       Scene, Lighting, Stage, CentralNetwork, ProblemTokens, ConnectionPaths,
               LoadColumns, HouseNode, Universe, CameraController, Labels, theme, geometry
  ui/          StepContent, PresentationPanel, NavigationControls, Appendix, Overlay, FallbackView, Icons
  hooks/ utils/  layout viewport, matematika kamera, deteksi WebGL
scripts/       gen-network.mjs — tata letak jaringan dari data
docs/          PLAN.md — rencana pengembangan
```

## Catatan teknis

- Satu pengendali kamera; perjalanan diinterpolasi polar mengelilingi pusat dengan kenaikan ketinggian sehingga kamera tidak menembus rumah, jaringan, atau cincin orbit. Durasi 900–1400 ms berbasis waktu.
- Inti mengorbit (cincin dalam dan luar berlawanan arah, melambat saat membaca rumah, diam pada langkah Keyakinan/Terkait dan saat reduced motion). Garis aliran dan relasi masalah→kata diperbarui tiap frame dari posisi token hidup.
- Framing menyesuaikan aspect ratio dan area panel (kanan di desktop, bottom sheet di mobile) serta mengikuti resize.
- Animasi objek di `useFrame` tanpa state React per frame; kata memakai `InstancedMesh`, garis kata satu `LineSegments`; label DOM diproyeksikan per frame.
- Tema gelap bernuansa alam semesta sebagai default (langit nebula via shader + dua lapis bintang berputar perlahan, hanya pada tema gelap) dan tema terang ivory; palet aksen ruang mengikuti situs sumber.
- `prefers-reduced-motion` mempersingkat transisi; tanpa WebGL, seluruh langkah tetap tersedia sebagai HTML.
