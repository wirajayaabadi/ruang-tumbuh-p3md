/**
 * Teks naratif presentasi, diadaptasi dari situs Ruang Tumbuh P3MD.
 * Ubah di sini bila kalimat perlu disesuaikan; angka diambil dari data saat render.
 */
import type { RuangKey } from './types'

export const BRAND = {
  eyebrow: 'Ruang Tumbuh P3MD · Analisis Aspirasi Kelompok',
  title: 'Peta Masalah Angkatan',
  subtitle: 'Sembilan masalah angkatan, lima ruang program, dan aliran di antara keduanya menurut aspirasi kelompok.',
}

export interface RuangNarrative {
  definition: string
  message: string
  points: string[]
}

export const RUANG_NARRATIVE: Record<RuangKey, RuangNarrative> = {
  aman: {
    definition: 'Mitigasi risiko dan kepedulian terhadap serdik.',
    message: 'Direncanakan untuk lima masalah, tetapi aspirasi kelompok hanya menempatkan Kondisi mental di sini.',
    points: [
      'Kondisi mental paling mantap di antara semua masalah (100% stabil), dengan kata aman, dukungan, dan dukungan fisik.',
      'Silo / sirkel menjadikan Ruang Aman sebagai ruang pendukung, berdampingan dengan Ruang Bersama.',
      'Risiko Zulu, KDKMP / Kopdes, dan Ruang gerak lebih dekat ke ruang lain: fokuskan Ruang Aman pada kondisi mental dan dukungan.',
    ],
  },
  bersama: {
    definition: 'Menjawab persoalan silo dan sirkel serta mendukung perjalanan Zulu to Alpha.',
    message: 'Silo / sirkel dan Ruang gerak mengarah ke sini, tetapi keduanya masih bertumpu pada data yang tipis.',
    points: [
      'Kata penghubungnya: kebersamaan, lintas, apresiasi, dan kelompok; aspirasi terbanyak kedua (59 isu).',
      'Zulu → Alpha yang direncanakan di sini justru dibicarakan dengan bahasa Ruang Belajar.',
      'Bersama Ruang Aman membentuk klaster rasa aman: silo, ruang gerak, dan kondisi mental sering disebut bersama.',
    ],
  },
  belajar: {
    definition: 'Menampung masukan dan menghadirkan solusi permasalahan akademis.',
    message: 'Menanggung beban terbesar: empat masalah mengalir ke sini, padahal rencana tim hanya menitipkan dua.',
    points: [
      'Risiko Zulu, KDKMP / Kopdes, Zulu → Alpha, dan Isu akademis semuanya paling dekat dengan Ruang Belajar.',
      'Kata penghubungnya: zulu, mentoring, kopdes, akademis, belajar, kelas; ruang dengan isu terbanyak (63).',
      'Siapkan kapasitas tambahan, atau bagi sebagian program dengan ruang lain secara sadar.',
    ],
  },
  inovasi: {
    definition: 'Wadah untuk menyampaikan, menilai, dan menguji coba gagasan.',
    message: 'Satu-satunya ruang yang rencana dan aspirasinya persis sejalan: Wadah inovasi didukung data.',
    points: [
      'Kedekatan Wadah inovasi dengan ruang ini 87%, dengan kata inovasi, ide, gagasan, dan mewadahi.',
      'Masalahnya hampir selalu dibahas sendiri, tanpa terkait masalah lain.',
      'Beban rencana dan aspirasi sama: satu masalah, satu ruang.',
    ],
  },
  masa: {
    definition: 'Kesiapan karier setelah P3MD.',
    message: 'Rencana karier mengarah ke sini dengan kedekatan 96%, tetapi baru bersumber dari satu agent.',
    points: [
      'Kata penghubungnya: kerja, arah, keberlanjutan, dan kepemimpinan; ruang dengan isu paling sedikit (22).',
      'KDKMP / Kopdes yang direncanakan di sini ternyata mengalir ke Ruang Belajar.',
      'Jaring aspirasi tambahan sebelum program karier dikunci.',
    ],
  },
}

export const STEP_TEXT = {
  intro: {
    eyebrow: '02 · Peta isu',
    heading: 'Jaringan kata di tiap ruang',
    body: [
      '24 agent menghimpun 751 aspirasi dari kelompoknya (12/10–17/10), termasuk catatan notulensi rapat.',
      'Setiap bola kecil adalah satu kata yang sering dibahas, ditempatkan dekat rumah ruang yang paling dekat dengannya. Garis tipis menunjukkan kata yang dibahas bersama. Berlian di tengah adalah sembilan masalah angkatan.',
    ],
  },
  flow: {
    eyebrow: '01 · Masalah ke ruang',
    heading: 'Sembilan masalah, dan ke mana mereka mengalir',
    body: [
      'Sembilan masalah angkatan membentuk inti. Lima rumah ruang mengelilinginya, masing-masing dengan jaringan katanya sendiri.',
      'Garis menyala menunjukkan aliran tiap masalah ke ruang terdekat menurut aspirasi; garis putus-putus ke ruang pendukung. Pilih sebuah masalah untuk menyorot alirannya.',
    ],
  },
  move: {
    eyebrow: '05 · Rencana vs aspirasi',
    heading: 'Titik-titik masalah pindah ruang',
    body: [
      'Mula-mula tiap masalah berdiri di rumah yang direncanakan tim. Lalu ia pindah ke rumah yang ditunjukkan aspirasi kelompok. Masalah yang direncanakan untuk beberapa ruang menyatu menjadi satu.',
    ],
  },
  load: {
    eyebrow: '06 · Beban ruang',
    heading: 'Ruang mana yang paling banyak bekerja',
    body: [
      'Di samping tiap rumah berdiri satu kolom, satu balok untuk satu masalah: pekat = ruang utama menurut aspirasi, lebih tipis = ruang pendukung, samar = ruang utama tetapi datanya belum cukup, kaca = hanya direncanakan tim.',
      'Ruang Belajar paling banyak bekerja: empat masalah paling dekat dengannya, padahal rencana tim memberinya dua. Ruang Aman direncanakan untuk lima masalah, tetapi aspirasi kelompok hanya menempatkan satu di sana.',
    ],
  },
  confidence: {
    eyebrow: '07 · Keyakinan',
    heading: 'Seberapa yakin kita',
    body: [
      'Himpunan aspirasi diacak ulang 400 kali dan aspirasi tiap agent dikeluarkan bergantian (18 sumber). Setiap kali, ruang terdekat tiap masalah dihitung ulang.',
      'Cincin di sekeliling tiap masalah menunjukkan seberapa sering ruang terdekatnya tetap sama. Kondisi mental paling mantap (100%); Isu akademis dan Silo / sirkel masih goyah.',
    ],
  },
  relations: {
    eyebrow: '08 · Saling terkait',
    heading: 'Hubungan antar sembilan masalah',
    body: [
      'Dari 36 pasangan masalah: 2 kuat, 4 sedang, 14 lemah, dan 16 tidak pernah dibahas bersama. Garis tebal = kuat, tipis = sedang, putus-putus = lemah.',
      'Klaster Zulu (Risiko Zulu, Zulu → Alpha, KDKMP) paling erat. Klaster kedua yang lebih longgar ada di sekitar rasa aman: Silo, Ruang gerak, dan Kondisi mental. Isu akademis, Wadah inovasi, dan Rencana karier hampir selalu dibahas sendiri.',
    ],
  },
  closing: {
    eyebrow: '09 · Kesimpulan',
    heading: 'Apa artinya bagi Ruang Tumbuh',
  },
}

export interface Takeaway {
  title: string
  body: string
  evidence: string
  action: string
  /** sorotan di dunia 3D saat takeaway dipilih */
  highlight: { problems?: string[]; ruang?: RuangKey[] }
}

export const TAKEAWAYS: Takeaway[] = [
  {
    title: 'Rencana dan aspirasi baru sejalan untuk 4 dari 9 masalah',
    body: 'KDKMP / Kopdes, Isu akademis, Kondisi mental, dan Wadah inovasi berada di ruang yang memang direncanakan. Risiko Zulu dan Zulu → Alpha lebih banyak dibicarakan dengan bahasa ruang lain, sedangkan 3 masalah belum cukup datanya untuk dinilai.',
    evidence: 'Validasi: 3 didukung, 1 sebagian, 2 tidak didukung, 3 data kurang.',
    action: 'Tinjau ulang penempatan Risiko Zulu dan Zulu → Alpha sebelum program dikunci.',
    highlight: { problems: ['risiko_zulu', 'zulu_alpha'] },
  },
  {
    title: 'Ruang Belajar menanggung beban terbesar',
    body: '4 masalah paling dekat dengan Ruang Belajar (Risiko Zulu, KDKMP / Kopdes, Isu akademis, Zulu → Alpha), padahal rencana tim hanya menitipkan 2. Kata yang menghubungkannya: zulu, mentoring, kopdes, akademis, belajar, kelas.',
    evidence: 'Beban: rencana 2 → aspirasi 4 (+2).',
    action: 'Siapkan kapasitas Ruang Belajar, atau bagi sebagian programnya dengan ruang lain secara sadar.',
    highlight: { ruang: ['belajar'] },
  },
  {
    title: 'Ruang Aman perlu dirumuskan ulang',
    body: 'Ruang Aman direncanakan untuk 5 masalah, tetapi aspirasi kelompok hanya menempatkan Kondisi mental di sana. Risiko Zulu, KDKMP / Kopdes, Silo / sirkel, dan Ruang gerak lebih dekat ke ruang lain.',
    evidence: 'Beban: rencana 5 → aspirasi 1 (−4). Kondisi mental 100% stabil.',
    action: 'Fokuskan Ruang Aman pada kondisi mental dan dukungan, dengan bahasa yang dipakai angkatan.',
    highlight: { ruang: ['aman'] },
  },
  {
    title: 'Isu Zulu sebaiknya ditangani dalam satu program',
    body: 'Risiko Zulu, Zulu → Alpha, dan KDKMP / Kopdes paling erat terhubung di antara semua pasangan masalah, dan ketiganya mengarah ke Ruang Belajar.',
    evidence: 'Risiko Zulu – Zulu → Alpha: hubungan kuat, 12 aspirasi dari 6 agent. KDKMP / Kopdes – Zulu → Alpha: kuat.',
    action: 'Satukan dalam satu jalur program, sambil dikonfirmasi langsung ke angkatan.',
    highlight: { problems: ['risiko_zulu', 'zulu_alpha', 'kopdes'] },
  },
  {
    title: 'Ada klaster kedua di sekitar rasa aman',
    body: 'Silo / sirkel, Ruang gerak, dan Kondisi mental beberapa kali disebut bersama. Hubungannya lebih longgar daripada klaster Zulu, tetapi mengisyaratkan bahwa rasa aman, ruang bergerak, dan sekat antarkelompok sering dirasakan saling berkaitan.',
    evidence: 'Ruang gerak – Kondisi mental: sedang; Silo / sirkel – Kondisi mental: lemah.',
    action: 'Ruang Bersama dan Ruang Aman perlu bekerja berdampingan untuk isu ini.',
    highlight: { problems: ['silo', 'ruang_gerak', 'mental'], ruang: ['bersama', 'aman'] },
  },
  {
    title: '3 masalah perlu didengar langsung',
    body: 'Silo / sirkel, Ruang gerak, dan Rencana karier masih bertumpu pada satu sumber. Isu akademis, Wadah inovasi, dan Rencana karier juga hampir selalu dibahas sendiri, tanpa terkait masalah lain.',
    evidence: '8 dari 9 hasil berubah bila aspirasi satu agent dikeluarkan. Paling mantap: Kondisi mental (100%).',
    action: 'Jaring aspirasi tambahan, misalnya survei singkat per kelas, sebelum keputusan final.',
    highlight: { problems: ['silo', 'ruang_gerak', 'karier'] },
  },
]

export const NEXT_STEPS = [
  'Tinjau ulang penempatan masalah yang pindah ruang.',
  'Perkuat kapasitas Ruang Belajar.',
  'Rumuskan ulang Ruang Aman.',
  'Satukan isu Zulu dalam satu program.',
  'Jaring aspirasi tambahan untuk data yang masih tipis.',
]

export const HOW_WE_COUNT = [
  '751 aspirasi dibersihkan; kata umum dan nama dibuang.',
  'Dua kata terhubung bila sering muncul dalam aspirasi yang sama, dari minimal dua aspirasi berbeda: 128 kata dengan 329 sambungan.',
  'Setiap ruang diwakili kata-kata solusinya, setiap masalah diwakili kata-kata masalahnya.',
  '"Jalan acak" dimulai dari kata masalah; ruang yang paling sering dicapai, dibandingkan seberapa umum katanya, menjadi ruang terdekat.',
  'Hasil yang bertumpu pada satu agent atau satu tulisan beserta salinannya ditandai "data belum cukup".',
  'Keyakinan: 400 kali himpunan aspirasi diacak, 300 kali pengaturan diubah, enam daftar kata solusi berbeda, dan satu kali untuk tiap sumber yang dihapus.',
]

export const LIMITATIONS = [
  'Analisis membaca kata, bukan makna.',
  'Gagasan tim ikut dihitung bersama keluhan, sehingga sebagian kecocokan berasal dari rumusan tim sendiri.',
  'Data dari satu forum aspirasi tim dan satu notulensi rapat; kelompok yang belum diwakili agent di forum ini belum terdengar.',
  'Hubungan yang tampil adalah keterkaitan topik, bukan sebab-akibat.',
  'Tidak ada kutipan aspirasi, nama, atau nomor telepon di halaman ini.',
]

export interface MethodStage {
  code: string
  title: string
  body: string
  refs: string[]
}

export const METHOD_INTRO =
  'Metodologi mengikuti dokumen Metodologi Problem Network Analysis Ruang Tumbuh P3MD, tahap A sampai I. Angka berasal dari perhitungan ulang terbaru: 751 aspirasi dari 24 agent, semua dihitung tanpa membedakan keluhan dan gagasan, dengan daftar kata yang sudah dibersihkan.'

export const METHOD_STAGES: MethodStage[] = [
  {
    code: 'A',
    title: 'NLP dan text preprocessing',
    body: '751 aspirasi dibersihkan: duplikat dihitung sekali, ejaan dan sinonim disatukan (misalnya kdkmp → kopdes, coaching → mentoring), 18 frasa dikenali ("tindak lanjut", "tujuan pendidikan", "agen nilai", "arahan pimpinan"), 19 penyebutan yang dinegasikan ditandai, dan kata yang tidak bermakna isu dibuang. 506 aspirasi memuat isu; tiap aspirasi diberi label jenis: gagasan solusi (124), masalah (45), persepsi (40), hipotesis (32).',
    refs: [
      'Manning, C. D., & Schütze, H. (1999). Foundations of Statistical Natural Language Processing. MIT Press.',
      'Jurafsky, D., & Martin, J. H. (2025). Speech and Language Processing (3rd ed. draft).',
      'Tala, F. Z. (2003). A Study of Stemming Effects on Information Retrieval in Bahasa Indonesia. MSc thesis, Universiteit van Amsterdam.',
    ],
  },
  {
    code: 'B',
    title: 'Konstruksi graf',
    body: 'Isu menjadi node; dua isu tersambung bila muncul bersama di sedikitnya dua aspirasi berbeda dan asosiasinya di atas kebetulan (NPMI > 0,15). Jaringan utama berisi 75 isu dan 174 relasi; jaringan untuk pemetaan ruang (ambang longgar) berisi 128 isu dan 329 relasi.',
    refs: [
      'Church, K. W., & Hanks, P. (1990). Word association norms, mutual information, and lexicography. Computational Linguistics, 16(1), 22–29.',
      'Bouma, G. (2009). Normalized (pointwise) mutual information in collocation extraction. Proceedings of GSCL, 31–40.',
      'Newman, M. E. J. (2018). Networks (2nd ed.). Oxford University Press.',
    ],
  },
  {
    code: 'C',
    title: 'Eksperimen graf sintetis',
    body: 'Metode diuji pada graf buatan yang jawabannya diketahui. Pada campuran seperti jaringan kita (μ ≈ 0.28), Leiden memulihkan kelompok buatan dengan ARI ≈ 0.82. Struktur jaringan aspirasi jauh di atas graf acak: Erdős–Rényi z = 11, Barabási–Albert z = 9, Rewiring (derajat tetap) z = 18.4.',
    refs: [
      'Holland, P. W., Laskey, K. B., & Leinhardt, S. (1983). Stochastic blockmodels: First steps. Social Networks, 5(2), 109–137.',
      'Lancichinetti, A., Fortunato, S., & Radicchi, F. (2008). Benchmark graphs for testing community detection algorithms. Physical Review E, 78, 046110.',
      'Erdős, P., & Rényi, A. (1959). On random graphs I. Publicationes Mathematicae Debrecen, 6, 290–297.',
      'Barabási, A.-L., & Albert, R. (1999). Emergence of scaling in random networks. Science, 286(5439), 509–512.',
      'Maslov, S., & Sneppen, K. (2002). Specificity and stability in topology of protein networks. Science, 296(5569), 910–913.',
    ],
  },
  {
    code: 'D',
    title: 'Community detection',
    body: 'Louvain sebagai pembanding, Leiden sebagai metode utama, dengan resolusi γ = 1 dipilih dari delapan nilai × 30 seed. Hasilnya 9 kelompok isu, modularitas 0.57; kedua algoritma sepakat dengan ARI 0.87.',
    refs: [
      'Newman, M. E. J., & Girvan, M. (2004). Finding and evaluating community structure in networks. Physical Review E, 69, 026113.',
      'Blondel, V. D., Guillaume, J.-L., Lambiotte, R., & Lefebvre, E. (2008). Fast unfolding of communities in large networks. Journal of Statistical Mechanics, P10008.',
      'Traag, V. A., Waltman, L., & van Eck, N. J. (2019). From Louvain to Leiden: Guaranteeing well-connected communities. Scientific Reports, 9, 5233.',
      'Reichardt, J., & Bornholdt, S. (2006). Statistical mechanics of community detection. Physical Review E, 74, 016110.',
      'Fortunato, S. (2010). Community detection in graphs. Physics Reports, 486(3–5), 75–174.',
      'Hubert, L., & Arabie, P. (1985). Comparing partitions. Journal of Classification, 2, 193–218.',
    ],
  },
  {
    code: 'E',
    title: 'Personalized PageRank dan random walk',
    body: 'Jalan acak dimulai dari kata masalah dan kembali ke titik awal dengan peluang 15% (α = 0,85). Massa yang mendarat di kata solusi tiap ruang dibagi PageRank globalnya (lift), lalu dinormalkan menjadi porsi lima ruang. Simulasi 250 jalan acak per ruang sudah sejalan dengan hitungan eksak (Spearman 0.92).',
    refs: [
      'Page, L., Brin, S., Motwani, R., & Winograd, T. (1999). The PageRank Citation Ranking: Bringing Order to the Web. Stanford InfoLab Technical Report.',
      'Haveliwala, T. H. (2002). Topic-sensitive PageRank. Proceedings of WWW 2002, 517–526.',
      'Lovász, L. (1993). Random walks on graphs: A survey. Combinatorics, Paul Erdős is Eighty, 2, 1–46.',
      'Brin, S., Motwani, R., Ullman, J. D., & Tsur, S. (1997). Dynamic itemset counting and implication rules for market basket data. Proceedings of ACM SIGMOD, 255–264.',
    ],
  },
  {
    code: 'F',
    title: 'Monte Carlo dan sensitivitas',
    body: '499 run mengacak enam faktor sekaligus: cakupan aspirasi, bobot, ambang, α, resolusi, dan algoritma. Rata-rata: ARI 0.61, Spearman peringkat 0.8, top-10 sama 67%, pemetaan ruang sama 72%. Faktor paling berpengaruh: cakupan aspirasi (48% variasi peringkat).',
    refs: [
      'Metropolis, N., & Ulam, S. (1949). The Monte Carlo method. Journal of the American Statistical Association, 44(247), 335–341.',
      'Saltelli, A., et al. (2008). Global Sensitivity Analysis: The Primer. Wiley.',
      'Spearman, C. (1904). The proof and measurement of association between two things. American Journal of Psychology, 15(1), 72–101.',
    ],
  },
  {
    code: 'G',
    title: 'Bootstrap dan confidence interval',
    body: '369 replikasi mengambil ulang blok aspirasi dengan pengembalian. Modularitas 0.55 (CI 95%: 0.32–0.69), rata-rata 5.2 kelompok. Interval masih lebar karena jumlah aspirasi masih terbatas.',
    refs: [
      'Efron, B. (1979). Bootstrap methods: Another look at the jackknife. Annals of Statistics, 7(1), 1–26.',
      'Künsch, H. R. (1989). The jackknife and the bootstrap for general stationary observations. Annals of Statistics, 17(3), 1217–1241.',
      'Efron, B., & Tibshirani, R. J. (1993). An Introduction to the Bootstrap. Chapman & Hall.',
    ],
  },
  {
    code: 'H',
    title: 'Robustness dan ablation',
    body: 'Setiap komponen dimatikan bergantian. Yang paling menentukan bentuk kelompok: tanpa deduplikasi (ARI 0.38) dan filter node ketat (≥6) (ARI 0.57). Peringkat isu per ruang tetap stabil di hampir semua konfigurasi.',
    refs: ['Meyes, R., Lu, M., de Puiseau, C. W., & Meisen, T. (2019). Ablation studies in artificial neural networks. arXiv:1901.08644.'],
  },
  {
    code: 'I',
    title: 'Pemetaan masalah ke ruang dan validasi',
    body: 'Tiap masalah diuji dengan 300 simulasi dan enam definisi kata solusi. Verdict ditetapkan berurutan: istilah cukup muncul? bukti dari lebih dari satu agent? istilah inti masuk jaringan? lalu peluang ruang rencana menjadi terdekat. Hasil: 3 didukung, 1 didukung sebagian, 2 tidak didukung, 3 data kurang.',
    refs: ['Tahap I (aturan verdict dan sensitivitas jangkar) memakai gabungan metode di atas; rancangannya mengikuti dokumen metodologi tim.'],
  },
]

export const METHOD_NOTE =
  'Kedekatan di jaringan menunjukkan topik yang dibicarakan bersama, bukan sebab-akibat dan bukan tingkat keparahan masalah.'
