/**
 * KONTEN LIMA RUANG — disalin dari docs/5 Ruang.pdf.
 * Judul masalah/solusi ditampilkan sebagai poin; `detail` disimpan untuk pegangan kita bila ditanya
 * dan dapat dibuka dari panel (klik poin). Perbaiki teks di sini bila ada koreksi.
 */
import type { RuangKey } from './types'

export interface RuangPoint {
  title: string
  detail: string
}

export interface RuangContent {
  tagline: string
  ringkasan: string[]
  hasil: string
  /** judul jembatan: "Jembatan ke Ruang Bersama" atau "Penutup alur lima ruang" */
  jembatanTitle: string
  jembatan: string
  masalah: RuangPoint[]
  solusi: RuangPoint[]
}

export const RUANG_CONTENT: Record<RuangKey, RuangContent> = {
  aman: {
    tagline: 'Berani terbuka, saling menjaga, tumbuh bersama.',
    ringkasan: [
      'Ruang Aman adalah fondasi utama dari kebersamaan dan pertumbuhan P3MD. Ruang ini hadir bukan sekadar untuk membuat orang merasa nyaman, melainkan untuk memberikan keberanian bagi setiap serdik agar dapat menyampaikan kebenaran, meminta bantuan, belajar dari kesalahan, dan tumbuh bersama tanpa ketakutan akan dihakimi.',
      'Rasa aman tumbuh ketika peserta merasa diterima, didengar, dan diperlakukan adil; mengetahui kepada siapa dapat meminta bantuan; serta percaya bahwa persoalannya akan ditangani secara bertanggung jawab. Dengan fondasi ini, peserta lebih berani membuka diri dan membangun kepercayaan lintas kelompok.',
      'Keterbukaan tersebut berjalan bersama disiplin dan pertanggungjawaban. Kesalahan menjadi bahan pembelajaran dan perbaikan, sementara dugaan pelanggaran tetap ditangani melalui mekanisme yang berlaku.',
    ],
    hasil:
      'Saya merasa diterima utuh dan didengar tanpa takut dihakimi, memiliki keberanian untuk berani mencoba serta belajar dari kesalahan, dan yakin bahwa selalu ada akses bantuan sehingga saya tidak akan pernah berjuang sendirian.',
    jembatanTitle: 'Jembatan ke Ruang Bersama',
    jembatan:
      'Ketika peserta merasa aman untuk membuka diri, kepercayaan dapat tumbuh. Kepercayaan itulah yang membantu kita melampaui sekat kelompok, saling mendukung, dan membangun kebersamaan.',
    masalah: [
      {
        title: 'Kecemasan dan takut dinilai buruk',
        detail:
          'Tuntutan pendidikan serta kekhawatiran dianggap tidak kuat atau tidak mampu dapat membuat serdik menahan diri. Kesulitan akademis, kondisi fisik, maupun persoalan pribadi akhirnya dipendam karena takut memengaruhi pandangan orang lain terhadap dirinya.',
      },
      {
        title: 'Rasa aman yang terbatas pada kelompok sendiri',
        detail:
          'Sebagian peserta mungkin hanya merasa diterima dan mendapat dukungan dari rekan terdekat. Ketika kepercayaan terhadap lingkungan yang lebih luas belum terbentuk, kondisi ini dapat memperkuat sekat kelompok dan membuat serdik enggan mencari bantuan di luar lingkarannya.',
      },
      {
        title: 'Takut mengakui kesalahan dan menyampaikan kendala',
        detail:
          'Ketika kesalahan dipandang sebagai kegagalan pribadi atau ancaman terhadap reputasi, serdik dapat memilih menyembunyikan hambatan. Persoalan akhirnya terlambat diketahui dan kesempatan memperbaikinya ikut tertunda.',
      },
      {
        title: 'Akses pendampingan dan tindak lanjut belum jelas',
        detail:
          'Serdik belum sepenuhnya mengetahui siapa yang dapat dihubungi, bagaimana informasi pribadinya ditangani, dan apa yang terjadi setelah ia menyampaikan perkaranya. Akibatnya, serdik bisa merasa harus menyelesaikan semuanya sendiri.',
      },
    ],
    solusi: [
      {
        title: 'Membangun rasa diterima, didengar, dan diperlakukan adil',
        detail:
          'BPI memberi teladan melalui kehadiran dan cara merespons serdik: menyapa, mendengar secara aktif, mengundang pendapat, serta menerima koreksi tanpa mempermalukan. Perhatian dan bantuan diberikan berdasarkan kebutuhan, tanpa bergantung pada kedekatan pribadi atau kelompok. Pesan yang ingin dirasakan setiap serdik: "Kehadiran saya berarti, suara saya didengar, dan saya memiliki tempat di sini."',
      },
      {
        title: 'Mengoptimalkan Binkar sebagai penghubung pendampingan',
        detail:
          'Mengoptimalkan peran Binkar sebagai tempat serdik menyampaikan kesulitan, memperoleh pendampingan, dan terhubung dengan bantuan yang sesuai. Pendekatannya personal, sukarela, menjaga privasi, serta mengawal tindak lanjut sesuai kebutuhan dan kewenangan.',
      },
      {
        title: 'Menguatkan budaya Saling Jaga melalui buddy check',
        detail:
          'Mendorong serdik saling menanyakan keadaan, memperhatikan rekan yang membutuhkan dukungan, dan menawarkan bantuan secara wajar. Inisiatif dukungan sesama serdik yang sudah dirintis diperkuat dengan tetap menghargai perintisnya. Buddy check dilakukan secara sukarela dan tidak memaksa seseorang membuka persoalan pribadi. Ketika kebutuhan melampaui kemampuan teman sebaya, serdik dibantu menghubungi Binkar atau pihak yang tepat.',
      },
      {
        title: 'Menyediakan jalur penyampaian persoalan yang jelas dan bertanggung jawab',
        detail:
          'Memperjelas penghubung serta kanal untuk meminta bantuan, menyampaikan aspirasi, atau melaporkan dugaan pelanggaran. Pendampingan personal dan pelaporan resmi mengikuti mekanisme penanganan masing-masing. Persoalan yang memerlukan tindak lanjut korps memiliki penanggung jawab dan langkah berikutnya yang jelas; perkembangannya dikabarkan kembali kepada serdik. Informasi pribadi diakses secara terbatas sesuai kebutuhan penanganan, sedangkan pola kendala yang berulang dirangkum tanpa identitas sebagai bahan perbaikan bersama.',
      },
      {
        title: 'Menghargai kejujuran dan mengawal perbaikan',
        detail:
          'BPI membiasakan keterbukaan dengan mengakui kekeliruan, menerima masukan, dan menjelaskan tindakan perbaikannya. Serdik yang menyampaikan kendala atau kabar buruk didengar dengan tenang, kemudian informasinya diperiksa secara objektif. Kesempatan memperbaiki diri tetap diupayakan. Dugaan pelanggaran diteruskan melalui mekanisme resmi, dengan menjaga kerahasiaan informasi serta kesempatan klarifikasi sesuai ketentuan. Perlakuan yang sama berlaku bagi seluruh serdik, termasuk anggota BPI.',
      },
    ],
  },

  bersama: {
    tagline: 'Merangkul perbedaan, membuka peran, bergerak bersama.',
    ringkasan: [
      'Ruang Bersama merupakan wadah untuk membangun kebersamaan lintas grup dan elemen melalui kesempatan berkontribusi yang terbuka, kerja sama yang bermakna, serta penghargaan terhadap kemampuan setiap serdik.',
      'Kepercayaan yang dibangun melalui Ruang Aman perlu diwujudkan dalam pengalaman bekerja bersama. Serdik dapat saling mengenal melalui pembagian peran, penyelesaian tanggung jawab, dan kesempatan membantu rekan yang memiliki kebutuhan berbeda. Kebersamaan tumbuh ketika setiap orang merasakan bahwa kehadirannya berarti dan kontribusinya dibutuhkan.',
      'BPI berperan menghubungkan potensi serdik dengan kebutuhan angkatan, menjangkau rekan yang belum banyak terlibat, serta mendukung perjalanan perbaikan rekan Zulu sesuai ketentuan pendidikan. Setiap serdik memperoleh kesempatan untuk mengambil peran tanpa harus memiliki kedekatan dengan kelompok tertentu.',
    ],
    hasil:
      'Saya menjadi bagian dari angkatan ini. Saya memiliki kesempatan untuk berkontribusi, bekerja dengan rekan lintas kelompok, dan memperoleh dukungan ketika membutuhkan. Peran saya dihargai, dan saya ikut bertanggung jawab atas keberhasilan bersama.',
    jembatanTitle: 'Jembatan ke Ruang Belajar',
    jembatan:
      'Ketika serdik saling percaya dan terbiasa bekerja bersama, berbagi pengetahuan serta meminta bantuan menjadi lebih mudah. Perbedaan kemampuan dapat menjadi sumber kekuatan angkatan. Dari kebersamaan inilah kita membangun Ruang Belajar, tempat serdik saling membantu untuk meningkatkan pemahaman dan kompetensi.',
    masalah: [
      {
        title: 'Interaksi yang terbatas pada grup atau elemen sendiri',
        detail:
          'Kegiatan sehari-hari dapat membuat serdik lebih sering berinteraksi dengan orang yang sama. Akibatnya, kesempatan mengenal kemampuan, pengalaman, dan perspektif rekan dari kelompok lain menjadi terbatas.',
      },
      {
        title: 'Informasi dan kesempatan kontribusi belum merata',
        detail:
          'Sebagian kesempatan penugasan atau kegiatan mungkin lebih cepat diketahui oleh lingkaran tertentu. Serdik yang sebenarnya mampu dan bersedia membantu belum tentu mengetahui kebutuhan tersebut atau cara untuk terlibat.',
      },
      {
        title: 'Peran terkonsentrasi pada orang yang sama',
        detail:
          'Rekan yang sudah dikenal aktif cenderung kembali dilibatkan, sementara potensi serdik lain belum terlihat. Kondisi ini dapat menambah beban pada sebagian orang sekaligus membuat rekan lainnya merasa tidak memiliki tempat untuk berkontribusi.',
      },
      {
        title: 'Rekan Zulu membutuhkan dukungan dalam proses perbaikan',
        detail:
          'Rekan Zulu dapat menghadapi tantangan dalam membangun kembali kepercayaan diri dan menemukan kesempatan menunjukkan kontribusi. Pendampingan diperlukan agar proses perbaikan dapat dijalani dengan dukungan dan tanggung jawab yang jelas.',
      },
      {
        title: 'Kontribusi belum seluruhnya terlihat dan dihargai',
        detail:
          'Pekerjaan di balik layar, bantuan kepada rekan, dan inisiatif kecil yang bermanfaat dapat luput dari perhatian. Jika pengakuan hanya berpusat pada peran yang tampil, serdik bisa merasa bahwa sebagian bentuk kontribusi kurang bernilai.',
      },
    ],
    solusi: [
      {
        title: 'Membuka kesempatan kontribusi secara transparan',
        detail:
          'BPI bersama bidang terkait menyampaikan kebutuhan kegiatan dan penugasan melalui kanal yang dapat diakses seluruh serdik. Informasinya mencakup kebutuhan peran, tanggung jawab, waktu, serta cara menyatakan kesediaan. Pembagian peran mempertimbangkan kemampuan, minat, ketersediaan waktu, dan kesempatan belajar. BPI juga mengajak secara personal rekan yang belum banyak terlibat, tanpa memaksakan partisipasi di luar ketentuan pendidikan.',
      },
      {
        title: 'Memperkuat kolaborasi lintas grup dan bidang',
        detail:
          'Memanfaatkan kegiatan yang sudah ada untuk mempertemukan serdik lintas grup dan elemen dalam pekerjaan bersama. Setiap kegiatan memiliki tujuan, PIC, dan pembagian tanggung jawab yang jelas agar koordinasi berjalan serta hasilnya dapat dipertanggungjawabkan. Kolaborasi lintas bidang disesuaikan dengan kebutuhan, misalnya kegiatan olahraga melibatkan bidang olahraga, kesehatan, dan nilai resiliensi, dengan tetap menjaga kejelasan siapa yang memimpin pelaksanaannya.',
      },
      {
        title: 'Mendampingi kontribusi rekan Zulu',
        detail:
          'Memfasilitasi kesempatan bagi rekan Zulu untuk berkontribusi sesuai kemampuan dan arahan pengasuh, seperti membantu pembelajaran, digitalisasi, atau pelaksanaan kegiatan. Peran tersebut disertai hasil kerja yang jelas dan pendampingan sesuai kebutuhan. Kontribusi menjadi bagian dari proses belajar dan perbaikan. Perubahan status maupun penilaian tetap mengikuti kewenangan serta ketentuan pendidikan yang berlaku.',
      },
      {
        title: 'Menghadirkan BPI untuk menjangkau seluruh serdik',
        detail:
          'Melalui BPI Merumput, BPI hadir dan mendengar langsung pengalaman serdik lintas grup serta elemen. Perhatian juga diberikan kepada … (teks pada dokumen sumber terpotong di halaman 7; lengkapi di sini).',
      },
    ],
  },

  belajar: {
    tagline: 'Berbagi pengetahuan, menguatkan kemampuan.',
    ringkasan: [
      'Ruang Belajar merupakan wadah untuk membantu serdik meningkatkan pemahaman akademis dan mengembangkan kemampuan melalui pembelajaran bersama yang sesuai kebutuhan.',
      'Serdik membawa latar belakang pendidikan dan pengalaman kerja yang beragam: ada yang terbiasa dengan keuangan, analisis data, operasional, maupun komunikasi. Keahlian tersebut dapat dihubungkan agar menjadi sumber belajar bagi angkatan, sementara serdik yang masih kesulitan memperoleh pendampingan yang tepat.',
      'BPI memfasilitasi pemetaan kebutuhan belajar, menghubungkan serdik dengan rekan yang menguasai materi, serta mengawal masukan akademis melalui bidang terkait. Pelaksanaannya menyesuaikan jadwal dan ketentuan pendidikan, dengan tetap menjaga integritas tugas serta tanggung jawab belajar masing-masing.',
    ],
    hasil:
      'Saya tahu ke mana mencari bantuan belajar. Materi yang sebelumnya sulit menjadi lebih saya pahami, dan saya semakin mampu mengerjakannya secara mandiri. Ketika memiliki keahlian, saya juga dapat membantu rekan lain berkembang.',
    jembatanTitle: 'Jembatan ke Ruang Inovasi',
    jembatan:
      'Ketika pemahaman dan kemampuan berkembang, serdik memiliki bekal untuk menerapkannya pada persoalan nyata. Dari pembelajaran bersama, kita bergerak menuju Ruang Inovasi: mengolah pengetahuan menjadi gagasan, menguji solusi, dan menghasilkan manfaat bagi angkatan.',
    masalah: [
      {
        title: 'Perbedaan kemampuan awal dan pengalaman',
        detail:
          'Latar belakang serdik yang beragam membuat tingkat penguasaan materi berbeda. Konsep yang sudah familiar bagi sebagian serdik dapat menjadi tantangan baru bagi rekan lainnya.',
      },
      {
        title: 'Kesulitan belajar belum terpetakan secara spesifik',
        detail:
          'Keluhan tentang mata kuliah yang sulit belum selalu menjelaskan bagian yang menjadi hambatan. Serdik mungkin membutuhkan penguatan konsep dasar, penjelasan metode, atau latihan penerapan yang berbeda.',
      },
      {
        title: 'Keahlian dan kebutuhan belajar belum terhubung',
        detail:
          'Angkatan memiliki serdik dengan kemampuan yang dapat dibagikan, tetapi rekan yang membutuhkan bantuan belum tentu mengetahui siapa yang dapat dihubungi. Dukungan belajar akhirnya bergantung pada jaringan pertemanan masing-masing.',
      },
      {
        title: 'Waktu belajar terbatas dan sumber materi tersebar',
        detail:
          'Jadwal pendidikan yang padat membatasi waktu untuk mengulang materi. Ringkasan, referensi, dan latihan yang tersebar juga dapat menyulitkan serdik menemukan bahan belajar yang relevan dan diizinkan.',
      },
      {
        title: 'Kendala akademis belum selalu mendapat tindak lanjut',
        detail:
          'Persoalan terkait kejelasan instruksi, kebutuhan penguatan materi, atau pelaksanaan pembelajaran dapat berulang apabila masukan belum dihimpun dan disampaikan kepada pihak yang tepat.',
      },
    ],
    solusi: [
      {
        title: 'Memetakan kebutuhan belajar pada setiap kelas',
        detail:
          'BPI melalui bidang Operasional Pendidikan dan perwakilan kelas menghimpun topik yang belum dipahami serta bentuk bantuan yang dibutuhkan. Pemetaan dilakukan secara sederhana untuk menentukan prioritas pendampingan. Kebutuhan dibedakan antara pemahaman konsep, latihan penerapan, dan klarifikasi instruksi, sehingga bantuan belajar dapat diarahkan pada hambatan yang sebenarnya.',
      },
      {
        title: 'Memfasilitasi Brainly P3MD melalui tutor sebaya',
        detail:
          'Menghubungkan serdik yang membutuhkan bantuan dengan rekan yang bersedia berbagi keahlian. Brainly P3MD dapat dimulai sebagai jaringan tutor dan forum tanya jawab yang mudah diakses lintas grup. Pendampingan berfokus pada penjelasan konsep, cara berpikir, serta pembahasan latihan. Tugas individu tetap dikerjakan oleh masing-masing serdik sesuai ketentuan pendidikan.',
      },
      {
        title: 'Mengadakan pembelajaran singkat sesuai kebutuhan',
        detail:
          'Memfasilitasi kelompok belajar, diskusi kasus, atau klinik materi dengan topik yang jelas dan waktu yang menyesuaikan kegiatan pendidikan. Sesi diprioritaskan pada kebutuhan yang paling mendesak dan dapat dilakukan dalam kelompok kecil. Ketersediaan tutor serta beban serdik menjadi pertimbangan agar pendampingan dapat berjalan secara sukarela dan berkelanjutan.',
      },
      {
        title: 'Mempermudah akses terhadap materi yang diizinkan',
        detail:
          'Menghimpun tautan materi, ringkasan konsep, dan latihan yang boleh dibagikan melalui akses bersama yang tertata. Materi dikelompokkan berdasarkan mata kuliah atau topik, dengan sumber yang jelas dan penanggung jawab pembaruan. Akses ini dapat terhubung dengan portal terintegrasi agar serdik lebih mudah menemukan bahan belajar dan informasi pendampingan.',
      },
      {
        title: 'Mengawal masukan akademis dan mengevaluasi manfaat pendampingan',
        detail:
          'Masukan terkait proses pembelajaran dihimpun berdasarkan persoalan yang spesifik, kemudian disampaikan melalui bidang terkait kepada penyelenggara; perkembangan tindak lanjut dikabarkan kembali kepada serdik. Manfaat pendampingan diperiksa melalui kemampuan serdik menjelaskan kembali konsep, menyelesaikan latihan secara mandiri, serta menyampaikan bagian yang masih belum dipahami. Hasilnya menjadi dasar untuk menyesuaikan topik dan metode belajar berikutnya.',
      },
    ],
  },

  inovasi: {
    tagline: 'Mengembangkan gagasan, mewujudkan manfaat.',
    ringkasan: [
      'Ruang Inovasi merupakan wadah bagi serdik untuk menyampaikan gagasan, mengevaluasi kelayakannya, dan menguji inisiatif yang dapat meningkatkan kualitas kehidupan angkatan.',
      'Kemampuan yang berkembang melalui Ruang Belajar dapat diterapkan untuk menjawab persoalan nyata. Potensi serdik dari bidang teknologi, bisnis, sosial, seni, maupun pengalaman operasional dapat dipertemukan untuk menghasilkan solusi yang sesuai kebutuhan: alat bantu digital, penyederhanaan alur informasi, metode belajar, atau pendekatan baru dalam kegiatan angkatan.',
      'BPI berperan memfasilitasi dukungan, mempertemukan keahlian lintas bidang, dan membantu koordinasi serta pengajuan izin yang diperlukan. Perintis tetap menjadi PIC dan memperoleh pengakuan atas gagasannya. Setiap inisiatif dikembangkan berdasarkan manfaat, kelayakan, serta kesesuaiannya dengan tujuan pendidikan.',
    ],
    hasil:
      'Saya memiliki tempat untuk menyampaikan ide dan memperoleh masukan. Ada dukungan untuk menguji gagasan saya, kesempatan bekerja dengan rekan yang memiliki keahlian berbeda, dan penghargaan atas kontribusi yang saya hasilkan.',
    jembatanTitle: 'Jembatan ke Ruang Masa Depan',
    jembatan:
      'Pengalaman merumuskan masalah, bekerja lintas bidang, menguji gagasan, dan mempertanggungjawabkan hasil menjadi bekal menghadapi tantangan berikutnya. Melalui Ruang Masa Depan, pengalaman tersebut diarahkan untuk memperkuat kesiapan serdik dalam menjalani penugasan dan tanggung jawab setelah P3MD.',
    masalah: [
      {
        title: 'Gagasan dan inisiatif masih tersebar',
        detail:
          'Ide yang muncul pada tingkat individu, grup, atau elemen belum selalu diketahui oleh angkatan. Akibatnya, inisiatif yang berpotensi bermanfaat belum memperoleh kesempatan untuk dikembangkan atau digunakan lebih luas.',
      },
      {
        title: 'Perintis belum memperoleh dukungan yang dibutuhkan',
        detail:
          'Serdik dapat memiliki gagasan, tetapi membutuhkan rekan dengan keahlian lain, masukan pengguna, akses fasilitas, atau kejelasan izin untuk mewujudkannya. Tanpa penghubung yang jelas, gagasan berisiko berhenti pada pembicaraan.',
      },
      {
        title: 'Solusi belum selalu berangkat dari kebutuhan nyata',
        detail:
          'Antusiasme membuat aplikasi atau kegiatan baru dapat mendahului pemahaman terhadap masalah yang ingin diselesaikan. Hasilnya berpotensi kurang digunakan, tumpang tindih dengan inisiatif lain, atau menambah beban serdik.',
      },
      {
        title: 'Uji coba dan evaluasi manfaat belum terstruktur',
        detail:
          'Sebuah gagasan dapat terlihat menjanjikan, tetapi manfaat, kemudahan penggunaan, serta kebutuhan pemeliharaannya belum diketahui. Tanpa evaluasi, angkatan sulit menentukan inisiatif mana yang layak diteruskan.',
      },
      {
        title: 'Karya dan pembelajaran belum terdokumentasi dengan baik',
        detail:
          'Kontribusi perintis maupun tim pendukung dapat luput dari perhatian. Pengetahuan tentang cara menjalankan inisiatif juga berisiko hilang ketika PIC berganti atau masa kepengurusan berakhir.',
      },
    ],
    solusi: [
      {
        title: 'Menghimpun gagasan dan memetakan inisiatif yang sudah ada',
        detail:
          'BPI membuka jalur bagi serdik untuk menyampaikan gagasan dengan penjelasan sederhana: masalah yang dihadapi, pihak yang membutuhkan, solusi yang diusulkan, dan dukungan yang diperlukan. Inisiatif yang sudah berjalan turut dipetakan agar pengembangan berikutnya dapat memanfaatkan hasil kerja rekan-rekan, menghubungkan gagasan yang sejalan, dan mengurangi pekerjaan yang tumpang tindih.',
      },
      {
        title: 'Mempertemukan perintis dengan dukungan lintas bidang',
        detail:
          'Menghubungkan perintis dengan serdik atau bidang yang memiliki kemampuan dan sumber daya relevan. BPI membantu koordinasi serta pengajuan izin sesuai kebutuhan dan kewenangan. Perintis tetap menjadi PIC, dengan pembagian tugas yang disepakati bersama tim. Dukungan diberikan dengan mempertimbangkan ketersediaan waktu, fasilitas, dan prioritas pendidikan.',
      },
      {
        title: 'Menilai kelayakan dan menguji gagasan dalam skala kecil',
        detail:
          'Setiap gagasan ditinjau berdasarkan kebutuhan pengguna, manfaat yang diharapkan, kemudahan pelaksanaan, risiko, dan beban pengelolaannya. Inisiatif yang layak dapat diuji pada lingkup terbatas sesuai persetujuan yang diperlukan. Masukan pengguna menjadi dasar perbaikan. Inisiatif diperluas ketika manfaatnya terlihat dan pengelolaannya memungkinkan; jika belum membantu, pendekatannya disesuaikan atau pelaksanaannya dihentikan.',
      },
      {
        title: 'Mengembangkan akses digital yang terintegrasi sesuai kebutuhan',
        detail:
          'Bersama bidang terkait, BPI memfasilitasi satu pintu akses menuju informasi resmi, bantuan belajar, aspirasi, dan rekognisi. Pengembangan dimulai dengan menghubungkan sarana yang sudah tersedia dan menetapkan penanggung jawab pembaruannya. Akses pelaporan sensitif mengikuti mekanisme resmi dengan pembatasan akses sesuai kewenangan. Kemudahan penggunaan dan kemampuan pengelolaan menjadi pertimbangan utama dalam memilih sarana digital.',
      },
      {
        title: 'Memberikan ruang apresiasi dan menjaga keberlanjutan karya',
        detail:
          'Memfasilitasi kesempatan bagi serdik untuk memperkenalkan hasil uji coba, manfaat, serta pembelajaran dari inisiatifnya. Showcase atau kompetisi dapat diusulkan sesuai persetujuan penyelenggara, dengan kriteria yang jelas dan relevan terhadap tujuan pendidikan serta sembilan nilai inti. Rekognisi diberikan kepada perintis dan rekan yang berkontribusi berdasarkan pekerjaan yang dapat diverifikasi. Inisiatif yang diteruskan dilengkapi dokumentasi, penanggung jawab pemeliharaan, dan mekanisme serah terima agar manfaatnya berkelanjutan.',
      },
    ],
  },

  masa: {
    tagline: 'Memperjelas arah, mempersiapkan langkah.',
    ringkasan: [
      'Ruang Masa Depan merupakan wadah untuk membantu serdik mempersiapkan diri menghadapi penugasan dan perjalanan karier setelah P3MD. Pembelajaran, hubungan, serta pengalaman kontribusi selama pendidikan menjadi bekal untuk menjalankan tanggung jawab di lingkungan berikutnya.',
      'Ketidakpastian mengenai penugasan, penempatan, maupun perkembangan karier dapat menimbulkan pertanyaan tentang apa yang perlu dipersiapkan. Serdik membutuhkan informasi yang dapat dipercaya serta kesempatan untuk memahami tuntutan pekerjaan dan mengembangkan kemampuan yang relevan.',
      'BPI berperan menghimpun kebutuhan informasi, mengawal klarifikasi melalui jalur berwenang, dan memfasilitasi pertukaran pengalaman serta pengembangan diri. Komitmen ini dilaksanakan sesuai kewenangan korps, dengan tetap memahami bahwa keputusan penempatan dan kepegawaian berada pada pihak yang berwenang.',
    ],
    hasil:
      'Saya memahami informasi yang sudah pasti, mengetahui pertanyaan yang masih menunggu jawaban, dan memiliki langkah persiapan yang dapat saya lakukan. Pengalaman selama P3MD menjadi bekal untuk menghadapi tanggung jawab berikutnya dengan lebih siap.',
    jembatanTitle: 'Penutup alur lima ruang',
    jembatan:
      'Dari Ruang Aman, serdik berani membuka diri. Melalui Ruang Bersama, kepercayaan berkembang menjadi kerja sama. Di Ruang Belajar, kemampuan diperkuat. Melalui Ruang Inovasi, kemampuan diwujudkan menjadi kontribusi. Seluruh pengalaman tersebut menjadi bekal dalam Ruang Masa Depan, agar serdik semakin siap menjalankan amanah setelah pendidikan.',
    masalah: [
      {
        title: 'Informasi mengenai arah penugasan belum sepenuhnya jelas',
        detail:
          'Pertanyaan tentang peran, lokasi, tanggung jawab, atau proses penempatan dapat muncul ketika informasi resmi masih berkembang. Jika informasi dan asumsi bercampur, serdik dapat kesulitan menentukan persiapan yang tepat.',
      },
      {
        title: 'Keraguan terhadap kesiapan menghadapi pekerjaan nyata',
        detail:
          'Serdik dapat memahami materi pendidikan, tetapi belum yakin bagaimana menerapkannya dalam situasi lapangan. Lingkungan baru, keterbatasan sumber daya, dan tuntutan berinteraksi dengan berbagai pihak membutuhkan kesiapan yang lebih spesifik.',
      },
      {
        title: 'Pengalaman lintas BUMN belum dimanfaatkan secara optimal',
        detail:
          'Angkatan memiliki beragam pengalaman kerja yang dapat menjadi sumber pembelajaran. Namun, pengetahuan tentang adaptasi, pengelolaan tim, pelayanan masyarakat, dan penyelesaian masalah belum selalu tersampaikan kepada rekan yang membutuhkannya.',
      },
      {
        title: 'Arah pengembangan diri belum terumuskan',
        detail:
          'Serdik belum tentu mengetahui kemampuan apa yang perlu diperkuat, pengalaman apa yang dapat dijadikan bekal, dan langkah pengembangan yang realistis setelah pendidikan.',
      },
      {
        title: 'Pembelajaran dan jejaring berisiko tidak berlanjut',
        detail:
          'Materi, pengalaman kontribusi, serta hubungan yang dibangun selama P3MD dapat sulit dimanfaatkan kembali apabila tidak terdokumentasi dan tidak memiliki sarana komunikasi lanjutan yang disepakati.',
      },
    ],
    solusi: [
      {
        title: 'Mengawal kejelasan informasi melalui jalur resmi',
        detail:
          'BPI menghimpun pertanyaan serdik mengenai penugasan dan kebutuhan persiapan, kemudian mengoordinasikan permintaan klarifikasi kepada pihak berwenang. Informasi disampaikan dengan membedakan hal yang sudah dipastikan, hal yang masih menunggu keputusan, dan asumsi yang belum terverifikasi. Perkembangan tindak lanjut dikabarkan kembali agar serdik mengetahui status pertanyaannya.',
      },
      {
        title: 'Memetakan kebutuhan kesiapan sesuai arah penugasan',
        detail:
          'Berdasarkan arahan resmi yang tersedia, BPI bersama bidang terkait membantu menghimpun kemampuan yang perlu dipersiapkan: komunikasi dengan pemangku kepentingan, pemahaman proses kerja, analisis masalah, serta adaptasi terhadap lingkungan baru. Pemetaan ini menjadi dasar untuk menghubungkan serdik dengan materi, pengalaman, atau pendampingan yang relevan. Prioritasnya disesuaikan dengan kebutuhan nyata dan waktu yang tersedia.',
      },
      {
        title: 'Memfasilitasi berbagi pengalaman lintas BUMN',
        detail:
          'Membuka kesempatan bagi serdik untuk berbagi pengalaman menghadapi situasi kerja, seperti memimpin tim, berkoordinasi dengan masyarakat, mengelola kegiatan operasional, atau menyelesaikan persoalan dengan sumber daya terbatas. Pembahasan diarahkan pada kasus, pertimbangan keputusan, dan pembelajaran yang dapat diterapkan. Informasi yang dibagikan tetap memperhatikan kerahasiaan serta ketentuan organisasi masing-masing.',
      },
      {
        title: 'Mendorong rencana pengembangan diri yang sederhana',
        detail:
          'Memfasilitasi refleksi atas kemampuan yang sudah dimiliki, area yang perlu diperkuat, dan langkah pengembangan berikutnya. Setiap serdik dapat menyusun prioritas belajar serta tindakan yang realistis sesuai arah penugasannya. Pengalaman selama P3MD, termasuk kerja kelompok, pendampingan rekan, dan pengembangan inisiatif, dapat dicatat sebagai bahan refleksi tentang kemampuan dan tanggung jawab yang telah dijalankan.',
      },
      {
        title: 'Menjaga kesinambungan pembelajaran dan jejaring',
        detail:
          'Menghimpun materi yang boleh dibagikan, dokumentasi pengalaman, serta kontak berbagi keahlian berdasarkan kesediaan serdik. Sarana komunikasi lanjutan dapat disepakati agar hubungan antarrekan tetap mendukung pertukaran pengetahuan setelah pendidikan. Melalui Estafet Amanah, BPI juga menyiapkan dokumentasi pekerjaan, status persoalan yang belum selesai, dan serah terima akses sesuai ketentuan, sehingga dukungan terhadap kesiapan serdik tetap berlanjut saat kepengurusan berganti.',
      },
    ],
  },
}
