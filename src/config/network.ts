// DIHASILKAN oleh scripts/gen-network.mjs dari src/data/ruang-tumbuh-p3md.json. Jangan ubah manual.
import type { RuangKey } from '../data/types'

export interface WordNodeLayout {
  id: string
  position: [number, number, number]
  size: number
  r: RuangKey
  f: number
  /** kata yang mewakili sebuah masalah ('masalah') atau kata solusi ('jangkar') */
  kind: 'masalah' | 'jangkar' | null
}

export const WORD_NODES: WordNodeLayout[] = [
  { id: "vuca", position: [-4.24, 4.32, 1.66], size: 0.22, r: 'aman', f: 12, kind: null },
  { id: "ketentuan", position: [-3.59, 6.15, -0.47], size: 0.21, r: 'aman', f: 9, kind: null },
  { id: "individu", position: [-3.41, 6.24, 1.46], size: 0.21, r: 'aman', f: 9, kind: null },
  { id: "aman", position: [-3.62, 4.27, 1], size: 0.21, r: 'aman', f: 9, kind: 'jangkar' },
  { id: "dukungan", position: [-4.51, 6.19, 0.3], size: 0.21, r: 'aman', f: 9, kind: 'jangkar' },
  { id: "kondisi", position: [-3.88, 3.05, 2.56], size: 0.21, r: 'aman', f: 9, kind: null },
  { id: "mental", position: [-3.35, 2.83, 0.2], size: 0.2, r: 'aman', f: 7, kind: 'masalah' },
  { id: "mekanisme", position: [-3.63, 5.23, 0.81], size: 0.2, r: 'aman', f: 7, kind: null },
  { id: "silo", position: [-4.62, 5.07, 0.09], size: 0.19, r: 'aman', f: 6, kind: 'masalah' },
  { id: "akses", position: [-3.17, 3.64, 2.05], size: 0.19, r: 'aman', f: 6, kind: null },
  { id: "aspirasi", position: [-3.24, 4.72, -3.41], size: 0.24, r: 'bersama', f: 21, kind: null },
  { id: "tanggung", position: [-2.6, 3.18, -2.11], size: 0.22, r: 'bersama', f: 13, kind: null },
  { id: "peran", position: [-2.42, 4.28, -2.61], size: 0.22, r: 'bersama', f: 12, kind: null },
  { id: "pelaksanaan", position: [-1.66, 4.86, -2.96], size: 0.21, r: 'bersama', f: 10, kind: null },
  { id: "kolaborasi", position: [-1.46, 4.38, -3.65], size: 0.21, r: 'bersama', f: 10, kind: 'jangkar' },
  { id: "keputusan", position: [-3.51, 5.15, -1.84], size: 0.21, r: 'bersama', f: 9, kind: null },
  { id: "mendengar", position: [-2.16, 5.13, -3.89], size: 0.21, r: 'bersama', f: 9, kind: null },
  { id: "pengasuh", position: [-2.32, 5.43, -2.62], size: 0.21, r: 'bersama', f: 9, kind: null },
  { id: "tindak lanjut", position: [-3.24, 3.96, -2.87], size: 0.21, r: 'bersama', f: 9, kind: null },
  { id: "bidang", position: [-0.95, 2.75, -3.17], size: 0.21, r: 'bersama', f: 9, kind: null },
  { id: "informasi", position: [1.58, 3, -4.09], size: 0.24, r: 'belajar', f: 21, kind: null },
  { id: "kebutuhan", position: [2.38, 5.38, -3.67], size: 0.23, r: 'belajar', f: 16, kind: null },
  { id: "kontribusi", position: [3.24, 2.79, -2.74], size: 0.23, r: 'belajar', f: 15, kind: null },
  { id: "pendidikan", position: [2.1, 4.76, -2.64], size: 0.22, r: 'belajar', f: 13, kind: null },
  { id: "adil", position: [0.54, 3.08, -3.75], size: 0.22, r: 'belajar', f: 13, kind: null },
  { id: "zulu", position: [0.91, 5.94, -4.49], size: 0.22, r: 'belajar', f: 12, kind: 'masalah' },
  { id: "kelas", position: [0.56, 4.25, -3.29], size: 0.22, r: 'belajar', f: 12, kind: 'masalah' },
  { id: "kopdes", position: [1.41, 4.26, -4], size: 0.21, r: 'belajar', f: 11, kind: 'masalah' },
  { id: "kesempatan", position: [2.28, 2.98, -2.83], size: 0.21, r: 'belajar', f: 10, kind: null },
  { id: "belajar", position: [3.18, 3.98, -1.53], size: 0.21, r: 'belajar', f: 9, kind: 'jangkar' },
  { id: "inovasi", position: [3.07, 3.08, 1.94], size: 0.22, r: 'inovasi', f: 14, kind: 'masalah' },
  { id: "ide", position: [4.58, 6.28, 0.1], size: 0.22, r: 'inovasi', f: 13, kind: 'jangkar' },
  { id: "pimpinan", position: [3.65, 5.79, 0.23], size: 0.21, r: 'inovasi', f: 9, kind: null },
  { id: "mewadahi", position: [3.24, 6.25, 2.13], size: 0.2, r: 'inovasi', f: 7, kind: 'masalah' },
  { id: "makan", position: [4.32, 5.75, -0.55], size: 0.2, r: 'inovasi', f: 7, kind: null },
  { id: "gagasan", position: [4.49, 3.91, -0.94], size: 0.19, r: 'inovasi', f: 6, kind: 'jangkar' },
  { id: "wadah", position: [3.27, 5.38, 2.22], size: 0.19, r: 'inovasi', f: 5, kind: 'jangkar' },
  { id: "strategi", position: [2.56, 4.49, 2.48], size: 0.19, r: 'inovasi', f: 5, kind: null },
  { id: "inisiatif", position: [4.13, 5.35, 1.08], size: 0.18, r: 'inovasi', f: 4, kind: 'masalah' },
  { id: "objektif", position: [3.54, 3.87, 0.17], size: 0.18, r: 'inovasi', f: 4, kind: 'masalah' },
  { id: "kerja", position: [-0.28, 3.74, 4.07], size: 0.22, r: 'masa', f: 12, kind: null },
  { id: "arah", position: [-1.68, 5.61, 4.25], size: 0.21, r: 'masa', f: 10, kind: 'jangkar' },
  { id: "kelompok", position: [0.8, 6.12, 3.75], size: 0.21, r: 'masa', f: 9, kind: 'masalah' },
  { id: "keberlanjutan", position: [0.46, 3.55, 4.63], size: 0.2, r: 'masa', f: 8, kind: 'jangkar' },
  { id: "tujuan pendidikan", position: [-0.57, 5.94, 4.53], size: 0.2, r: 'masa', f: 8, kind: null },
  { id: "kepemimpinan", position: [-0.36, 4.62, 4.32], size: 0.2, r: 'masa', f: 7, kind: null },
  { id: "sistem", position: [2.12, 5.91, 3.91], size: 0.19, r: 'masa', f: 6, kind: null },
  { id: "kedepan", position: [-0.16, 3.18, 3.33], size: 0.19, r: 'masa', f: 5, kind: 'jangkar' },
  { id: "prinsip", position: [-0.56, 5.64, 3.67], size: 0.19, r: 'masa', f: 5, kind: null },
  { id: "kepengurusan", position: [1.61, 3.77, 3.21], size: 0.19, r: 'masa', f: 5, kind: null },
]

/** [indeks a, indeks b, bobot] */
export const WORD_EDGES: [number, number, number][] = [
  [47, 40, 0.51], [15, 19, 0.57], [15, 18, 0.67], [2, 28, 0.44], [2, 12, 0.68], [2, 9, 0.53], [2, 22, 0.36], [2, 42, 0.46], [17, 10, 0.3], [17, 32, 0.46], [3, 0, 0.41], [3, 6, 0.62], [3, 8, 0.53], [39, 32, 0.6], [18, 24, 0.39], [18, 10, 0.41], [18, 12, 0.41], [18, 19, 0.57], [18, 20, 0.3], [18, 21, 0.35], [20, 10, 0.15], [20, 24, 0.24], [20, 21, 0.2], [20, 28, 0.28], [23, 22, 0.4], [23, 21, 0.39], [23, 26, 0.34], [23, 13, 0.37], [23, 10, 0.34], [23, 24, 0.32], [23, 1, 0.67], [23, 28, 0.37], [27, 25, 0.48], [33, 10, 0.35], [33, 32, 0.5], [33, 30, 0.42], [28, 24, 0.37], [28, 10, 0.28], [28, 22, 0.54], [28, 12, 0.49], [28, 16, 0.44], [28, 29, 0.44], [28, 1, 0.44], [28, 31, 0.37], [43, 42, 0.48], [43, 49, 0.58], [4, 24, 0.5], [4, 9, 0.65], [4, 29, 0.67], [4, 22, 0.47], [24, 10, 0.34], [24, 22, 0.48], [24, 21, 0.39], [24, 9, 0.58], [24, 29, 0.5], [24, 1, 0.39], [40, 45, 0.45], [45, 48, 0.61], [45, 41, 0.48], [19, 11, 0.39], [19, 14, 0.44], [19, 13, 0.44], [36, 38, 0.71], [36, 30, 0.48], [8, 42, 0.53], [41, 10, 0.28], [41, 0, 0.39], [41, 44, 0.46], [22, 10, 0.21], [22, 12, 0.42], [22, 9, 0.55], [22, 29, 0.47], [22, 1, 0.36], [31, 14, 0.48], [14, 13, 0.42], [21, 10, 0.37], [21, 32, 0.35], [21, 26, 0.4], [21, 1, 0.46], [21, 44, 0.48], [35, 30, 0.45], [10, 44, 0.59], [10, 32, 0.49], [10, 46, 0.38], [10, 1, 0.41], [10, 16, 0.3], [1, 7, 0.5], [42, 49, 0.69], [42, 11, 0.39], [9, 29, 0.65], [9, 11, 0.46], [13, 11, 0.48], [13, 7, 0.48], [44, 32, 0.48], [44, 46, 0.55], [49, 11, 0.61], [5, 9, 0.2], [34, 31, 0.2], [37, 36, 0.2],
]

/** Posisi inti tiap masalah (urutan = PROBLEM_ORDER). */
export const CORE_POSITIONS: { id: string; position: [number, number, number] }[] = [
  { id: 'risiko_zulu', position: [0, 4.95, -1.25] },
  { id: 'kopdes', position: [1.08, 5.17, 0.62] },
  { id: 'zulu_alpha', position: [-1.08, 4.73, 0.63] },
  { id: 'silo', position: [1.17, 4.45, -2.04] },
  { id: 'ruang_gerak', position: [2.35, 4.66, 0] },
  { id: 'akademis', position: [1.18, 4.23, 2.04] },
  { id: 'mental', position: [-1.17, 4.46, 2.04] },
  { id: 'inovasi', position: [-2.35, 4.66, 0] },
  { id: 'karier', position: [-1.17, 4.23, -2.04] },
]

/** [indeks masalah, indeks kata] untuk kata yang muncul dalam rantai alasan masalah. */
export const PROBLEM_WORD_EDGES: [number, number][] = [
  [0, 25], [0, 39], [0, 32], [0, 33], [1, 27], [1, 25], [3, 42], [3, 8], [3, 3], [3, 2], [3, 4], [4, 10], [5, 29], [5, 26], [2, 25], [2, 22], [2, 29], [6, 6], [6, 3], [7, 30], [7, 35], [8, 40], [8, 47], [8, 45], [8, 41],
]
