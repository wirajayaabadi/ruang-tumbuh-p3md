import raw from './ruang-tumbuh-p3md.json'
import type { Dataset, Problem, Relation, RuangKey, WordNode } from './types'

export const DATA = raw as unknown as Dataset

export const RUANG_KEYS: RuangKey[] = ['aman', 'bersama', 'belajar', 'inovasi', 'masa']

export const RUANG_NAME: Record<RuangKey, string> = {
  aman: 'Ruang Aman',
  bersama: 'Ruang Bersama',
  belajar: 'Ruang Belajar',
  inovasi: 'Ruang Inovasi',
  masa: 'Ruang Masa Depan',
}

export const RUANG_SHORT: Record<RuangKey, string> = {
  aman: 'Aman',
  bersama: 'Bersama',
  belajar: 'Belajar',
  inovasi: 'Inovasi',
  masa: 'Masa Depan',
}

/** Nama pendek masalah, mengikuti situs sumber. */
export const PROBLEM_SHORT: Record<string, string> = {
  risiko_zulu: 'Risiko Zulu',
  kopdes: 'KDKMP / Kopdes',
  zulu_alpha: 'Zulu → Alpha',
  silo: 'Silo / sirkel',
  ruang_gerak: 'Ruang gerak',
  akademis: 'Isu akademis',
  mental: 'Kondisi mental',
  inovasi: 'Wadah inovasi',
  karier: 'Rencana karier',
}

export const VERDICT_LABEL: Record<Problem['verdict'], string> = {
  didukung: 'didukung',
  sebagian: 'didukung sebagian',
  tidak: 'tidak didukung',
  kurang: 'data belum cukup',
}

/** Urutan masalah seperti di situs (klaster Zulu dulu). */
export const PROBLEM_ORDER: string[] = DATA.clusters.flat()
export const PROBLEMS: Problem[] = PROBLEM_ORDER.map((id) => DATA.problems.find((p) => p.id === id)!)
export const PROBLEM_BY_ID: Record<string, Problem> = Object.fromEntries(DATA.problems.map((p) => [p.id, p]))

export const shortName = (id: string) => PROBLEM_SHORT[id] ?? PROBLEM_BY_ID[id]?.label ?? id

/** Kata-kata teratas (berdasarkan frekuensi) untuk sebuah ruang. */
export function topWords(r: RuangKey, n = 10): WordNode[] {
  return DATA.nodes.filter((w) => w.r === r).sort((a, b) => b.f - a.f).slice(0, n)
}

export const WORD_COUNT: Record<RuangKey, number> = Object.fromEntries(
  RUANG_KEYS.map((r) => [r, DATA.nodes.filter((w) => w.r === r).length]),
) as Record<RuangKey, number>

export type SlotKind = 'main' | 'support' | 'plan'

export interface HouseSlot {
  problem: Problem
  kind: SlotKind
  /** utama tetapi datanya belum cukup */
  thin: boolean
}

/** Masalah yang "bersandar" pada sebuah ruang: utama, pendukung, lalu hanya-rencana. */
export function houseSlots(r: RuangKey): HouseSlot[] {
  const main = PROBLEMS.filter((p) => p.main === r).map((p) => ({ problem: p, kind: 'main' as const, thin: p.verdict === 'kurang' }))
  const support = PROBLEMS.filter((p) => p.support.includes(r)).map((p) => ({ problem: p, kind: 'support' as const, thin: false }))
  const plan = PROBLEMS.filter((p) => p.plan.includes(r) && p.main !== r && !p.support.includes(r)).map((p) => ({
    problem: p,
    kind: 'plan' as const,
    thin: false,
  }))
  return [...main, ...support, ...plan]
}

/** Beban ruang: jumlah masalah menurut rencana tim vs menurut data (utama, tidak termasuk data kurang). */
export function ruangLoad(r: RuangKey) {
  const plan = PROBLEMS.filter((p) => p.plan.includes(r)).length
  const data = PROBLEMS.filter((p) => p.main === r && p.verdict !== 'kurang').length
  const thin = PROBLEMS.filter((p) => p.main === r && p.verdict === 'kurang').length
  const support = PROBLEMS.filter((p) => p.support.includes(r)).length
  const planOnly = PROBLEMS.filter((p) => p.plan.includes(r) && p.main !== r && !p.support.includes(r)).length
  return { plan, data, thin, support, planOnly, delta: data - plan }
}

export const RELATIONS_SORTED: Relation[] = [...DATA.relall].sort((a, b) => b.lift - a.lift)
export const RELATION_LEVEL_COUNT = {
  kuat: DATA.relall.filter((x) => x.level === 'kuat').length,
  sedang: DATA.relall.filter((x) => x.level === 'sedang').length,
  lemah: DATA.relall.filter((x) => x.level === 'lemah').length,
  tidak: DATA.relall.filter((x) => x.level === 'tidak').length,
}

export function relationBetween(a: string, b: string): Relation | undefined {
  return DATA.relall.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a))
}

/** Ringkasan rencana vs aspirasi: sesuai, pindah, data kurang. */
export const MOVE_SUMMARY = {
  sesuai: PROBLEMS.filter((p) => p.verdict !== 'kurang' && p.plan.includes(p.main)).length,
  pindah: PROBLEMS.filter((p) => p.verdict !== 'kurang' && !p.plan.includes(p.main)).length,
  kurang: PROBLEMS.filter((p) => p.verdict === 'kurang').length,
}

export const VERDICT_COUNT = {
  didukung: PROBLEMS.filter((p) => p.verdict === 'didukung').length,
  sebagian: PROBLEMS.filter((p) => p.verdict === 'sebagian').length,
  tidak: PROBLEMS.filter((p) => p.verdict === 'tidak').length,
  kurang: PROBLEMS.filter((p) => p.verdict === 'kurang').length,
}

/** Masalah diurutkan dari yang paling mantap (p_main) untuk langkah Keyakinan. */
export const PROBLEMS_BY_STABILITY: Problem[] = [...PROBLEMS].sort((a, b) => b.p_main - a.p_main || b.var_same - a.var_same)

export const pct = (v: number) => `${Math.round(v * 100)}%`
