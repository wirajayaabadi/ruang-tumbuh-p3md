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
  { id: "vuca", position: [-3.77, 4.32, 1.48], size: 0.22, r: 'aman', f: 12, kind: null },
  { id: "ketentuan", position: [-3.02, 6.15, -0.39], size: 0.21, r: 'aman', f: 9, kind: null },
  { id: "individu", position: [-2.88, 6.24, 1.23], size: 0.21, r: 'aman', f: 9, kind: null },
  { id: "aman", position: [-3.07, 4.27, 0.85], size: 0.21, r: 'aman', f: 9, kind: 'jangkar' },
  { id: "dukungan", position: [-4, 6.19, 0.27], size: 0.21, r: 'aman', f: 9, kind: 'jangkar' },
  { id: "kondisi", position: [-3.46, 3.05, 2.28], size: 0.21, r: 'aman', f: 9, kind: null },
  { id: "mental", position: [-2.75, 2.83, 0.16], size: 0.2, r: 'aman', f: 7, kind: 'masalah' },
  { id: "mekanisme", position: [-3.08, 5.23, 0.68], size: 0.2, r: 'aman', f: 7, kind: null },
  { id: "silo", position: [-4.11, 5.07, 0.08], size: 0.19, r: 'aman', f: 6, kind: 'masalah' },
  { id: "akses", position: [-2.7, 3.64, 1.75], size: 0.19, r: 'aman', f: 6, kind: null },
  { id: "aspirasi", position: [-2.89, 4.72, -3.04], size: 0.24, r: 'bersama', f: 21, kind: null },
  { id: "tanggung", position: [-2.14, 3.18, -1.73], size: 0.22, r: 'bersama', f: 13, kind: null },
  { id: "peran", position: [-2.03, 4.28, -2.19], size: 0.22, r: 'bersama', f: 12, kind: null },
  { id: "pelaksanaan", position: [-1.37, 4.86, -2.45], size: 0.21, r: 'bersama', f: 10, kind: null },
  { id: "kolaborasi", position: [-1.25, 4.38, -3.13], size: 0.21, r: 'bersama', f: 10, kind: 'jangkar' },
  { id: "keputusan", position: [-3.02, 5.15, -1.58], size: 0.21, r: 'bersama', f: 9, kind: null },
  { id: "mendengar", position: [-1.91, 5.13, -3.44], size: 0.21, r: 'bersama', f: 9, kind: null },
  { id: "pengasuh", position: [-1.93, 5.43, -2.18], size: 0.21, r: 'bersama', f: 9, kind: null },
  { id: "tindak lanjut", position: [-2.85, 3.96, -2.52], size: 0.21, r: 'bersama', f: 9, kind: null },
  { id: "bidang", position: [-0.78, 2.75, -2.6], size: 0.21, r: 'bersama', f: 9, kind: null },
  { id: "informasi", position: [1.39, 3, -3.6], size: 0.24, r: 'belajar', f: 21, kind: null },
  { id: "kebutuhan", position: [2.09, 5.38, -3.23], size: 0.23, r: 'belajar', f: 16, kind: null },
  { id: "kontribusi", position: [2.83, 2.79, -2.4], size: 0.23, r: 'belajar', f: 15, kind: null },
  { id: "pendidikan", position: [1.73, 4.76, -2.17], size: 0.22, r: 'belajar', f: 13, kind: null },
  { id: "adil", position: [0.46, 3.08, -3.19], size: 0.22, r: 'belajar', f: 13, kind: null },
  { id: "zulu", position: [0.81, 5.94, -3.99], size: 0.22, r: 'belajar', f: 12, kind: 'masalah' },
  { id: "kelas", position: [0.46, 4.25, -2.7], size: 0.22, r: 'belajar', f: 12, kind: 'masalah' },
  { id: "kopdes", position: [1.23, 4.26, -3.49], size: 0.21, r: 'belajar', f: 11, kind: 'masalah' },
  { id: "kesempatan", position: [1.92, 2.98, -2.38], size: 0.21, r: 'belajar', f: 10, kind: null },
  { id: "belajar", position: [2.65, 3.98, -1.27], size: 0.21, r: 'belajar', f: 9, kind: 'jangkar' },
  { id: "inovasi", position: [2.58, 3.08, 1.63], size: 0.22, r: 'inovasi', f: 14, kind: 'masalah' },
  { id: "ide", position: [4.07, 6.28, 0.09], size: 0.22, r: 'inovasi', f: 13, kind: 'jangkar' },
  { id: "pimpinan", position: [3.08, 5.79, 0.2], size: 0.21, r: 'inovasi', f: 9, kind: null },
  { id: "mewadahi", position: [2.77, 6.25, 1.83], size: 0.2, r: 'inovasi', f: 7, kind: 'masalah' },
  { id: "makan", position: [3.8, 5.75, -0.48], size: 0.2, r: 'inovasi', f: 7, kind: null },
  { id: "gagasan", position: [3.99, 3.91, -0.84], size: 0.19, r: 'inovasi', f: 6, kind: 'jangkar' },
  { id: "wadah", position: [2.81, 5.38, 1.91], size: 0.19, r: 'inovasi', f: 5, kind: 'jangkar' },
  { id: "strategi", position: [2.14, 4.49, 2.08], size: 0.19, r: 'inovasi', f: 5, kind: null },
  { id: "inisiatif", position: [3.62, 5.35, 0.95], size: 0.18, r: 'inovasi', f: 4, kind: 'masalah' },
  { id: "objektif", position: [2.96, 3.87, 0.14], size: 0.18, r: 'inovasi', f: 4, kind: 'masalah' },
  { id: "kerja", position: [-0.24, 3.74, 3.52], size: 0.22, r: 'masa', f: 12, kind: null },
  { id: "arah", position: [-1.49, 5.61, 3.78], size: 0.21, r: 'masa', f: 10, kind: 'jangkar' },
  { id: "kelompok", position: [0.68, 6.12, 3.2], size: 0.21, r: 'masa', f: 9, kind: 'masalah' },
  { id: "keberlanjutan", position: [0.41, 3.55, 4.13], size: 0.2, r: 'masa', f: 8, kind: 'jangkar' },
  { id: "tujuan pendidikan", position: [-0.5, 5.94, 4.03], size: 0.2, r: 'masa', f: 8, kind: null },
  { id: "kepemimpinan", position: [-0.32, 4.62, 3.8], size: 0.2, r: 'masa', f: 7, kind: null },
  { id: "sistem", position: [1.87, 5.91, 3.46], size: 0.19, r: 'masa', f: 6, kind: null },
  { id: "kedepan", position: [-0.13, 3.18, 2.73], size: 0.19, r: 'masa', f: 5, kind: 'jangkar' },
  { id: "prinsip", position: [-0.48, 5.64, 3.11], size: 0.19, r: 'masa', f: 5, kind: null },
  { id: "kepengurusan", position: [1.35, 3.77, 2.69], size: 0.19, r: 'masa', f: 5, kind: null },
]

/** [indeks a, indeks b, bobot] */
export const WORD_EDGES: [number, number, number][] = [
  [47, 40, 0.51], [15, 19, 0.57], [15, 18, 0.67], [2, 28, 0.44], [2, 12, 0.68], [2, 9, 0.53], [2, 22, 0.36], [2, 42, 0.46], [17, 10, 0.3], [17, 32, 0.46], [3, 0, 0.41], [3, 6, 0.62], [3, 8, 0.53], [39, 32, 0.6], [18, 24, 0.39], [18, 10, 0.41], [18, 12, 0.41], [18, 19, 0.57], [18, 20, 0.3], [18, 21, 0.35], [20, 10, 0.15], [20, 24, 0.24], [20, 21, 0.2], [20, 28, 0.28], [23, 22, 0.4], [23, 21, 0.39], [23, 26, 0.34], [23, 13, 0.37], [23, 10, 0.34], [23, 24, 0.32], [23, 1, 0.67], [23, 28, 0.37], [27, 25, 0.48], [33, 10, 0.35], [33, 32, 0.5], [33, 30, 0.42], [28, 24, 0.37], [28, 10, 0.28], [28, 22, 0.54], [28, 12, 0.49], [28, 16, 0.44], [28, 29, 0.44], [28, 1, 0.44], [28, 31, 0.37], [43, 42, 0.48], [43, 49, 0.58], [4, 24, 0.5], [4, 9, 0.65], [4, 29, 0.67], [4, 22, 0.47], [24, 10, 0.34], [24, 22, 0.48], [24, 21, 0.39], [24, 9, 0.58], [24, 29, 0.5], [24, 1, 0.39], [40, 45, 0.45], [45, 48, 0.61], [45, 41, 0.48], [19, 11, 0.39], [19, 14, 0.44], [19, 13, 0.44], [36, 38, 0.71], [36, 30, 0.48], [8, 42, 0.53], [41, 10, 0.28], [41, 0, 0.39], [41, 44, 0.46], [22, 10, 0.21], [22, 12, 0.42], [22, 9, 0.55], [22, 29, 0.47], [22, 1, 0.36], [31, 14, 0.48], [14, 13, 0.42], [21, 10, 0.37], [21, 32, 0.35], [21, 26, 0.4], [21, 1, 0.46], [21, 44, 0.48], [35, 30, 0.45], [10, 44, 0.59], [10, 32, 0.49], [10, 46, 0.38], [10, 1, 0.41], [10, 16, 0.3], [1, 7, 0.5], [42, 49, 0.69], [42, 11, 0.39], [9, 29, 0.65], [9, 11, 0.46], [13, 11, 0.48], [13, 7, 0.48], [44, 32, 0.48], [44, 46, 0.55], [49, 11, 0.61], [5, 9, 0.2], [34, 31, 0.2], [37, 36, 0.2],
]

/** Posisi inti tiap masalah (urutan = PROBLEM_ORDER). */
export const CORE_POSITIONS: { id: string; position: [number, number, number] }[] = [
  { id: 'risiko_zulu', position: [0, 4.95, -0.95] },
  { id: 'kopdes', position: [0.82, 5.17, 0.47] },
  { id: 'zulu_alpha', position: [-0.82, 4.73, 0.48] },
  { id: 'silo', position: [0.97, 4.45, -1.69] },
  { id: 'ruang_gerak', position: [1.95, 4.66, 0] },
  { id: 'akademis', position: [0.98, 4.23, 1.69] },
  { id: 'mental', position: [-0.97, 4.46, 1.69] },
  { id: 'inovasi', position: [-1.95, 4.66, 0] },
  { id: 'karier', position: [-0.97, 4.23, -1.69] },
]

/** [indeks masalah, indeks kata] untuk kata yang muncul dalam rantai alasan masalah. */
export const PROBLEM_WORD_EDGES: [number, number][] = [
  [0, 25], [0, 39], [0, 32], [0, 33], [1, 27], [1, 25], [3, 42], [3, 8], [3, 3], [3, 2], [3, 4], [4, 10], [5, 29], [5, 26], [2, 25], [2, 22], [2, 29], [6, 6], [6, 3], [7, 30], [7, 35], [8, 40], [8, 47], [8, 45], [8, 41],
]
