/**
 * KONFIGURASI TERPUSAT PRESENTASI
 * ---------------------------------
 * Rumah (ruang), warna, koordinat, target kamera, langkah presentasi, dan tema
 * berada di sini. Konten naratif ada di src/data/narrative.ts, data analisis di src/data/.
 */
import * as THREE from 'three'
import { RUANG_NAME, RUANG_SHORT } from '../data/derive'
import type { RuangKey } from '../data/types'

export type HouseVariant = 'twin' | 'school' | 'lab' | 'fort' | 'dome'

export interface HouseView {
  angleOffset: number
  radius: number
  height: number
  lookAtY: number
}

export interface HouseConfig {
  id: RuangKey
  name: string
  short: string
  /** sudut posisi rumah pada panggung (derajat) */
  angle: number
  radius: number
  accent: string
  accentSoft: string
  variant: HouseVariant
  view: HouseView
}

/** Komposisi dunia: inti masalah di tengah, lima "pulau" rumah mengelilinginya seperti planet. */
export const STAGE = {
  /** jarak pulau rumah dari pusat */
  houseRadius: 14.5,
  /** jari-jari pulau tiap rumah */
  housePlatformRadius: 3.4,
  /** ketinggian pusat inti masalah */
  coreY: 4.6,
  /** jari-jari cincin orbit dekoratif di sekitar inti */
  orbitRings: [5.6, 7.4] as [number, number],
}

/** Palet aksen ruang mengikuti situs Ruang Tumbuh P3MD. */
export const RUANG_ACCENT: Record<RuangKey, string> = {
  aman: '#4a90ea',
  bersama: '#e8673a',
  belajar: '#22b585',
  inovasi: '#e3a21a',
  masa: '#e0679a',
}

const DEFAULT_VIEW: HouseView = { angleOffset: 50, radius: 7.8, height: 9.0, lookAtY: 1.6 }

const houseDef = (id: RuangKey, angle: number, soft: string, variant: HouseVariant): HouseConfig => ({
  id,
  name: RUANG_NAME[id],
  short: RUANG_SHORT[id],
  angle,
  radius: STAGE.houseRadius,
  accent: RUANG_ACCENT[id],
  accentSoft: soft,
  variant,
  view: DEFAULT_VIEW,
})

/** Urutan rumah = urutan ruang di situs: Aman, Bersama, Belajar, Inovasi, Masa Depan. */
export const HOUSES: HouseConfig[] = [
  // Celah kosong tepat di belakang inti (270°) agar aliran dari inti tidak tertutup rumah; Masa Depan di depan (90°).
  houseDef('aman', 162, '#dbe7fb', 'fort'),
  houseDef('bersama', 234, '#fbe0d6', 'twin'),
  houseDef('belajar', 306, '#d5f2e6', 'school'),
  houseDef('inovasi', 18, '#faeccb', 'lab'),
  houseDef('masa', 90, '#f9dfea', 'dome'),
]

export const HOUSE_INDEX: Record<RuangKey, number> = Object.fromEntries(HOUSES.map((h, i) => [h.id, i])) as Record<RuangKey, number>

/* ---------- tema ---------- */

export type Theme = 'light' | 'dark'

export interface Palette {
  background: string
  stage: string
  stageRim: string
  platform: string
  wall: string
  door: string
  window: string
  edge: string
  path: string
  dim: string
  glass: string
  coreRing: string
  relation: string
}

export const PALETTES: Record<Theme, Palette> = {
  light: {
    background: '#f4f1ea',
    stage: '#e4dfd5',
    stageRim: '#d6d0c4',
    platform: '#d9d3c8',
    wall: '#f3eee4',
    door: '#5b4636',
    window: '#ffd98a',
    edge: '#8891a3',
    path: '#b9b2a6',
    dim: '#cfc9bf',
    glass: '#ffffff',
    coreRing: '#b7b0a4',
    relation: '#6b7280',
  },
  dark: {
    background: '#070b14',
    stage: '#1a2433',
    stageRim: '#141c29',
    platform: '#243247',
    wall: '#d9dee8',
    door: '#3b2f28',
    window: '#ffd98a',
    edge: '#7f93ab',
    path: '#3f5064',
    dim: '#28334a',
    glass: '#9fb6cc',
    coreRing: '#4a607a',
    relation: '#b9c8d8',
  },
}

/* ---------- langkah presentasi ---------- */

export type StepKind = 'intro' | 'flow' | 'house' | 'move' | 'load' | 'confidence' | 'relations' | 'closing'

export interface Step {
  kind: StepKind
  id: string
  /** nomor mode pada situs sumber, untuk indikator */
  code: string
  title: string
  /** hanya untuk kind 'house' */
  houseIndex?: number
}

export const STEPS: Step[] = [
  { kind: 'intro', id: 'peta', code: '02', title: 'Peta isu' },
  { kind: 'flow', id: 'aliran', code: '01', title: 'Sembilan masalah & alirannya' },
  ...HOUSES.map((h, i) => ({ kind: 'house' as const, id: h.id, code: '04', title: h.name, houseIndex: i })),
  { kind: 'move', id: 'rencana', code: '05', title: 'Rencana vs aspirasi' },
  { kind: 'load', id: 'beban', code: '06', title: 'Beban ruang' },
  { kind: 'confidence', id: 'keyakinan', code: '07', title: 'Keyakinan' },
  { kind: 'relations', id: 'terkait', code: '08', title: 'Saling terkait' },
  { kind: 'closing', id: 'kesimpulan', code: '09', title: 'Kesimpulan' },
]

export const STEP_FIRST_HOUSE = STEPS.findIndex((s) => s.kind === 'house')
export const STEP_LAST = STEPS.length - 1
export const stepAt = (i: number) => STEPS[Math.max(0, Math.min(STEP_LAST, i))]

/** Tab panel pada langkah rumah. */
export const HOUSE_TABS = [
  { id: 'ringkasan', label: 'Ringkasan' },
  { id: 'masalah', label: 'Masalah' },
  { id: 'kata', label: 'Kata' },
  { id: 'beban', label: 'Beban & keyakinan' },
] as const
export type HouseTab = (typeof HOUSE_TABS)[number]['id']

/* ---------- kamera ---------- */

export interface OverviewView {
  angle: number
  radius: number
  height: number
  lookAt: [number, number, number]
}

export const CAMERA_VIEWS: Record<Exclude<StepKind, 'house'>, OverviewView> & {
  fov: number
  durationMin: number
  durationMax: number
  durationReduced: number
} = {
  intro: { angle: 90, radius: 29, height: 23, lookAt: [0, 2.4, 0] },
  flow: { angle: 90, radius: 29.5, height: 18, lookAt: [0, 3.0, 0] },
  move: { angle: 90, radius: 30, height: 24, lookAt: [0, 1.8, 0] },
  load: { angle: 90, radius: 29, height: 17, lookAt: [0, 2.4, 0] },
  confidence: { angle: 90, radius: 12, height: 15, lookAt: [0, 3.6, 0] },
  relations: { angle: 90, radius: 11.5, height: 14.5, lookAt: [0, 3.6, 0] },
  closing: { angle: 112, radius: 29, height: 20, lookAt: [0, 2.4, 0] },
  fov: 40,
  durationMin: 900,
  durationMax: 1400,
  durationReduced: 280,
}

/* ---------- posisi bantu ---------- */

const DEG = Math.PI / 180

export function housePosition(index: number, out = new THREE.Vector3()) {
  const h = HOUSES[index]
  return out.set(Math.cos(h.angle * DEG) * h.radius, 0, Math.sin(h.angle * DEG) * h.radius)
}

/** Rotasi Y rumah sehingga pintu (local +z) menghadap pusat panggung. */
export function houseRotationY(index: number) {
  const a = HOUSES[index].angle * DEG
  return Math.atan2(-Math.cos(a), -Math.sin(a))
}

/** Posisi dunia untuk "slot" masalah ke-i dari n di tepi depan alas rumah. */
export function houseSlotWorld(index: number, i: number, n: number, y = 0.55, out = new THREE.Vector3()) {
  const localX = (i - (n - 1) / 2) * 0.78
  const localZ = 2.45
  const rot = houseRotationY(index)
  const x = localX * Math.cos(rot) + localZ * Math.sin(rot)
  const z = -localX * Math.sin(rot) + localZ * Math.cos(rot)
  return housePosition(index, out).add(new THREE.Vector3(x, y, z))
}

/** Posisi kolom beban di samping rumah (local +x). */
export function houseLoadColumnWorld(index: number, out = new THREE.Vector3()) {
  const rot = houseRotationY(index)
  const lx = 2.45
  const lz = 0.9
  const x = lx * Math.cos(rot) + lz * Math.sin(rot)
  const z = -lx * Math.sin(rot) + lz * Math.cos(rot)
  return housePosition(index, out).add(new THREE.Vector3(x, 0.25, z))
}

export const APP_TITLE = 'Peta Masalah Angkatan'
