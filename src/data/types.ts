/** Tipe untuk data analisis Ruang Tumbuh P3MD (src/data/ruang-tumbuh-p3md.json). */

export type RuangKey = 'aman' | 'bersama' | 'belajar' | 'inovasi' | 'masa'
export type Verdict = 'didukung' | 'sebagian' | 'tidak' | 'kurang'

export interface WordNode {
  id: string
  /** frekuensi (jumlah aspirasi) */
  f: number
  /** ruang terdekat */
  r: RuangKey
  /** skor kedekatan */
  s: number
  kind: 'masalah' | 'jangkar' | null
}

export interface WordLink {
  a: string
  b: string
  w: number
}

export interface Reason {
  r: RuangKey
  kind: 'langsung' | 'jalur'
  chain: string[]
  lines: number
  people: number
}

export interface Problem {
  id: string
  label: string
  /** ruang yang direncanakan tim */
  plan: RuangKey[]
  /** ruang terdekat menurut data */
  main: RuangKey
  support: RuangKey[]
  share: Record<RuangKey, number>
  verdict: Verdict
  lines: number
  sources: number
  stab: 'kokoh' | 'cukup' | 'rapuh'
  /** peluang ruang utama tetap sama saat diacak ulang */
  p_main: number
  present: number
  var_same: number
  n_var: number
  one_person: boolean
  vs: 'sesuai' | 'sebagian' | 'berbeda'
  reasons: Reason[]
}

export interface Relation {
  a: string
  b: string
  lines: number
  people: number
  lift: number
  shared: string[]
  bridges: string[]
  nb: number
  level: 'kuat' | 'sedang' | 'lemah' | 'tidak'
}

export interface RuangLoad {
  data_main: string[]
  data_support: string[]
  claimed: string[]
  expected_members: number
}

export interface Dataset {
  meta: {
    lines: number
    messages: number
    people: number
    first: string
    last: string
    words: number
    pairs: number
    sims: number
    boot: number
    tested: number
  }
  anchors: Record<RuangKey, string[]>
  nodes: WordNode[]
  links: WordLink[]
  problems: Problem[]
  relations: { a: string; b: string; p: number; one_person: boolean }[]
  load: Record<RuangKey, RuangLoad>
  clusters: string[][]
  relall: Relation[]
  method: Record<string, unknown>
}
