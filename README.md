# Peta 5 Ruang Tumbuh — Presentasi Interaktif 3D

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

## Alur presentasi (8 langkah)

| # | Langkah | Mode situs sumber | Yang terjadi di dunia 3D |
| --- | --- | --- | --- |
| 1 | Peta 5 Ruang | — | Overview; kartu lima ruang (klik = kunjungi); jaringan kata terbentuk bertahap di sekitar inti |
| 2 | Sembilan masalah & alirannya | 01 + 07 + 08 | Garis aliran tiap masalah dari inti ke rumah ruang terdekat (solid) dan pendukung (putus-putus); pilih masalah untuk menyorot aliran, cincin keyakinan, dan keterkaitannya |
| 3 | Aspirasimu | — | Formulir aspirasi pengunjung (ruang tujuan, teks, nama/kontak opsional atau anonim); tiap kiriman memunculkan bintang baru yang melesat dari inti ke langit |
| 4–8 | Ruang Aman, Bersama, Belajar, Inovasi, Masa Depan | docs/5 Ruang.pdf | Kamera mendekat ke rumah; panel bertab (`↑`/`↓`): Ringkasan (ringkasan, hasil yang ingin dirasakan, jembatan ke ruang berikutnya) · Masalah (daftar poin) · Solusi (daftar poin) |

Hiasan dunia: tujuh planet hias (Merkurius, Venus, Mars, Jupiter berpita, Saturnus bercincin, Uranus berporos miring, Neptunus) yang mengorbit perlahan di sabuk langit pada ketinggian berbeda, meteor biru yang sesekali melintas di langit (tema gelap, acak tiap 5–14 detik, dilewati saat reduced motion), matahari hias dengan halo berdenyut dan bulan berkawah dengan halo biru yang mengorbit perlahan mengelilingi dunia secara berseberangan (satu putaran ≈ 4 menit; arah awal di `SUN_DIRECTION`), masing-masing membawa cahaya tepi hangat dan biru, rumput dan bunga prosedural di tepi tiap pulau (instanced), serta satu kelelawar kecil per rumah (bergantian terinspirasi Zubat, Noibat, Woobat; model prosedural low-poly di `Bats.tsx`) yang terbang mengitari rumah dengan jalur mengembara, sesekali menukik atau melayang, miring saat berbelok, dan memberi semangat (`FAIRY_PHRASES` di narrative.ts).

Inti selalu menampilkan dua animasi sejak awal: **cincin keyakinan** pada tiap berlian masalah (cincin luar = ruang terdekat tetap sama saat aspirasi diacak ulang; cincin dalam = definisi kata solusi yang sepakat) dan **garis keterkaitan** antar berlian (tebal = kuat, tipis = sedang, putus-putus = lemah), keduanya mengikuti berlian yang mengorbit.

## Navigasi

| Aksi | Cara |
| --- | --- |
| Berikutnya / sebelumnya | **Next** / **Previous**, `→` `PageDown` / `←` `PageUp` |
| Tab di langkah rumah | `↑` / `↓` |
| Kembali ke peta | **Peta**, `Home`; `Escape` melepas sorotan lalu kembali ke peta |
| Lompat langkah | chip langkah di bar bawah, atau klik rumah 3D |
| Pilih masalah | chip masalah di panel, atau klik berlian masalah di 3D; `Escape` melepas pilihan |
| Musik latar | tombol speaker di bar atas atau pojok layar pembuka; musik ambien ruang angkasa disintesis dengan Web Audio (tanpa berkas audio), mulai saat Let's Explore ditekan, preferensi tersimpan |
| Tema gelap (default) / terang | tombol matahari/bulan (tersimpan di `localStorage`) |
| Kamera bebas | **Eksplorasi** (orang pertama): seret kiri = menoleh di tempat mengikuti pandangan kamera, klik kanan seret / Shift+seret / dua jari = geser, gulir / cubit = maju-mundur ke arah kursor, `W` `A` `S` `D` / panah = bergerak, `Q`/`E` = turun/naik, `Shift` = cepat, `Esc` atau **Lanjutkan Presentasi** = kembali |
| Layar penuh | **Fullscreen** |

## Mengganti data dan teks

- `src/data/ruang-tumbuh-p3md.json` — data analisis (objek `P` dari situs sumber). Setelah mengganti, jalankan `node scripts/gen-network.mjs`.
- `src/data/ruang.ts` — konten lima ruang dari `docs/5 Ruang.pdf`: tagline, ringkasan, hasil yang ingin dirasakan, jembatan, masalah & solusi (judul + detail).
- `src/data/narrative.ts` — teks merek (judul, motto), sambutan VUCA, teks langkah, ucapan peri.
- `src/data/derive.ts` — fungsi turunan (beban ruang, slot masalah per rumah, ringkasan verdict, nama pendek masalah).
- `src/config/presentation.ts` — rumah (urutan, sudut, varian, warna aksen situs), jarak pulau dari inti (`STAGE.houseRadius`), langkah presentasi, target kamera, palet tema. Sudut rumah harus sama dengan `ANGLE` di `scripts/gen-network.mjs`.

## Struktur

```
src/
  data/        ruang-tumbuh-p3md.json · types.ts · derive.ts · narrative.ts
  config/      presentation.ts (konfigurasi terpusat) · network.ts (dihasilkan)
  store/       useStore.ts — state presentasi (zustand)
  scene/       Scene, Lighting, Stage, CentralNetwork, ProblemTokens, ConnectionPaths,
               HouseNode, Universe, Sun, Decorations, Bats, CameraController, ExploreControls, Labels, theme, geometry
  ui/          StepContent, PresentationPanel, NavigationControls, LoadingScreen, Overlay, FallbackView, Icons
  hooks/ utils/  layout viewport, matematika kamera, deteksi WebGL
scripts/       gen-network.mjs — tata letak jaringan dari data
docs/          PLAN.md — rencana pengembangan
```

## Pengumpulan aspirasi

Aspirasi selalu tersimpan di perangkat pengunjung (`localStorage`). Agar juga terkirim ke tim, isi `VITE_ASPIRASI_WEBHOOK` (lihat `.env.example`; di Vercel atur sebagai Environment Variable) dengan URL yang menerima POST JSON. Cara termudah tanpa server: Google Apps Script yang menulis ke Spreadsheet:

```js
// Apps Script: Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone)
function doPost(e) {
  const d = JSON.parse(e.postData.contents)
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Aspirasi')
    .appendRow([d.createdAt, d.ruang, d.text, d.name, d.contact, d.id, d.ua])
  return ContentService.createTextOutput('ok')
}
```

Buat sheet bernama `Aspirasi` di spreadsheet yang terkait, lalu tempel URL Web App-nya ke variabel di atas.

## Pratinjau tautan

Meta Open Graph dan Twitter Card ada di `index.html` dengan URL absolut ke `https://ruang-tumbuh-p3md-swart.vercel.app/`; gambar pratinjau 1200×630 di `public/og-image.jpg` (dibuat dari logo + latar galaksi). Jika domain berubah, perbarui URL di `index.html`. WhatsApp menyimpan cache pratinjau; kirim tautan dengan parameter baru (misalnya `?v=2`) untuk memaksa pratinjau baru.

## Catatan teknis

- Satu pengendali kamera; perjalanan diinterpolasi polar mengelilingi pusat dengan kenaikan ketinggian sehingga kamera tidak menembus rumah, jaringan, atau cincin orbit. Durasi 900–1400 ms berbasis waktu.
- Inti mengorbit (cincin dalam dan luar berlawanan arah, melambat saat membaca rumah, diam pada langkah Keyakinan/Terkait dan saat reduced motion). Garis aliran dan relasi masalah→kata diperbarui tiap frame dari posisi token hidup.
- Framing menyesuaikan aspect ratio dan area panel (kanan di desktop, bottom sheet di mobile) serta mengikuti resize.
- Animasi objek di `useFrame` tanpa state React per frame; kata memakai `InstancedMesh`, garis kata satu `LineSegments`; label DOM diproyeksikan per frame.
- Tema gelap bernuansa alam semesta sebagai default (langit nebula via shader + dua lapis bintang berputar perlahan, hanya pada tema gelap) dan tema terang ivory; palet aksen ruang mengikuti situs sumber.
- `prefers-reduced-motion` mempersingkat transisi; tanpa WebGL, seluruh langkah tetap tersedia sebagai HTML.
