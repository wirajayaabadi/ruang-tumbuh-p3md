// Membangun koordinat jaringan pusat dari data analisis (deterministik), lalu menulis src/config/network.ts.
// Jalankan: node scripts/gen-network.mjs
import { readFileSync, writeFileSync } from 'node:fs'
const P = JSON.parse(readFileSync(new URL('../src/data/ruang-tumbuh-p3md.json', import.meta.url), 'utf8'))

const RUANG = ['aman', 'bersama', 'belajar', 'inovasi', 'masa']
const ANGLE = { aman: 162, bersama: 234, belajar: 306, inovasi: 18, masa: 90 } // harus sama dengan HOUSES di presentation.ts
const TOP_N = 10
const CORE_Y = 4.6
let seed = 20261018
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296 }
const DEG = Math.PI / 180

// kata teratas per ruang
const words = []
for (const r of RUANG) {
  const top = P.nodes.filter(n => n.r === r).sort((a, b) => b.f - a.f).slice(0, TOP_N)
  const base = ANGLE[r] * DEG
  top.forEach((n, i) => {
    let tries = 0, p
    while (tries++ < 400) {
      const ang = base + (rnd() * 2 - 1) * 30 * DEG
      const rad = 3.3 + rnd() * 1.4
      const y = 2.7 + rnd() * 3.6
      p = [Math.cos(ang) * rad, y, Math.sin(ang) * rad]
      if (words.every(w => Math.hypot(w.p[0] - p[0], w.p[1] - p[1], w.p[2] - p[2]) > 0.75)) break
    }
    // ukuran mengikuti frekuensi (log), 0.11..0.24
    const size = 0.11 + 0.13 * Math.min(1, Math.log(1 + n.f) / Math.log(22))
    words.push({ id: n.id, p, size, r, f: n.f, kind: n.kind, rank: i })
  })
}
const wi = new Map(words.map((w, i) => [w.id, i]))

// relasi kata yang kedua ujungnya tampil
const edges = []
for (const l of P.links) {
  if (wi.has(l.a) && wi.has(l.b)) edges.push([wi.get(l.a), wi.get(l.b), Number(l.w.toFixed(2))])
}
// pastikan setiap kata punya minimal satu relasi di dalam ruangnya (ke kata paling dekat), supaya tidak ada node terisolasi
const deg = new Array(words.length).fill(0)
edges.forEach(([a, b]) => { deg[a]++; deg[b]++ })
words.forEach((w, i) => {
  if (deg[i] > 0) return
  let best = -1, bd = Infinity
  words.forEach((v, j) => { if (j !== i && v.r === w.r) { const d = Math.hypot(v.p[0] - w.p[0], v.p[1] - w.p[1], v.p[2] - w.p[2]); if (d < bd) { bd = d; best = j } } })
  if (best >= 0) { edges.push([i, best, 0.2]); deg[i]++; deg[best]++ }
})

// posisi inti: 9 masalah dalam dua cincin (3 dalam, 6 luar), dengan variasi tinggi kecil
const ORDER = P.clusters.flat()
const core = ORDER.map((id, k) => {
  const inner = k < 3
  const R = inner ? 1.25 : 2.35
  const ang = inner ? -Math.PI / 2 + k * 2 * Math.PI / 3 : -Math.PI / 2 + Math.PI / 6 + (k - 3) * 2 * Math.PI / 6
  const y = CORE_Y + (inner ? 0.35 : -0.15) + Math.sin(k * 2.1) * 0.25
  return { id, p: [Math.cos(ang) * R, y, Math.sin(ang) * R] }
})

// relasi masalah → kata (dari rantai alasan) bila katanya tampil
const problemWordEdges = []
for (const pr of P.problems) {
  const set = new Set()
  for (const rs of pr.reasons) for (const w of rs.chain) if (wi.has(w)) set.add(wi.get(w))
  for (const j of set) problemWordEdges.push([ORDER.indexOf(pr.id), j])
}

const f = v => Number(v.toFixed(2))
let out = `// DIHASILKAN oleh scripts/gen-network.mjs dari src/data/ruang-tumbuh-p3md.json. Jangan ubah manual.\n`
out += `import type { RuangKey } from '../data/types'\n\n`
out += `export interface WordNodeLayout {\n  id: string\n  position: [number, number, number]\n  size: number\n  r: RuangKey\n  f: number\n  /** kata yang mewakili sebuah masalah ('masalah') atau kata solusi ('jangkar') */\n  kind: 'masalah' | 'jangkar' | null\n}\n\n`
out += `export const WORD_NODES: WordNodeLayout[] = [\n` + words.map(w => `  { id: ${JSON.stringify(w.id)}, position: [${w.p.map(f).join(', ')}], size: ${f(w.size)}, r: '${w.r}', f: ${w.f}, kind: ${w.kind ? `'${w.kind}'` : 'null'} },`).join('\n') + `\n]\n\n`
out += `/** [indeks a, indeks b, bobot] */\nexport const WORD_EDGES: [number, number, number][] = [\n  ` + edges.map(e => `[${e.join(', ')}]`).join(', ') + `,\n]\n\n`
out += `/** Posisi inti tiap masalah (urutan = PROBLEM_ORDER). */\nexport const CORE_POSITIONS: { id: string; position: [number, number, number] }[] = [\n` + core.map(c => `  { id: '${c.id}', position: [${c.p.map(f).join(', ')}] },`).join('\n') + `\n]\n\n`
out += `/** [indeks masalah, indeks kata] untuk kata yang muncul dalam rantai alasan masalah. */\nexport const PROBLEM_WORD_EDGES: [number, number][] = [\n  ` + problemWordEdges.map(e => `[${e.join(', ')}]`).join(', ') + `,\n]\n`
writeFileSync(new URL('../src/config/network.ts', import.meta.url), out)
console.log(`words=${words.length} edges=${edges.length} core=${core.length} problemWordEdges=${problemWordEdges.length}`)
