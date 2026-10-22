/**
 * Pengiriman aspirasi pengunjung ke /api/aspirasi (Vercel Function → Supabase).
 * Salinan juga disimpan di perangkat pengunjung agar ia bisa melihat kirimannya sendiri
 * dan bintang aspirasinya tetap tampil.
 */
import type { RuangKey } from './types'

export interface Aspirasi {
  id: string
  ruang: RuangKey | 'belum'
  text: string
  name: string
  contact: string
  createdAt: string
  anonymous?: boolean
  /** 'sent' tersimpan di database · 'local' menunggu dikirim ulang · 'invalid' ditolak server (tidak dikirim ulang) */
  status: 'sent' | 'local' | 'invalid'
}

export type SubmitResult =
  | { ok: true; record: Aspirasi }
  | { ok: false; reason: 'rate_limited' | 'invalid' | 'offline'; record?: Aspirasi }

const KEY = 'rt-aspirasi'
const DEVICE_KEY = 'rt-device'
const ENDPOINT = '/api/aspirasi'

export function loadLocal(): Aspirasi[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Aspirasi[]) : []
  } catch {
    return []
  }
}

function saveLocal(list: Aspirasi[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(-50)))
  } catch {
    /* abaikan */
  }
}

/** ID acak per perangkat (hanya untuk pembatasan spam; di server disimpan sebagai hash). */
function deviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY)
    if (!id) {
      id = crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem(DEVICE_KEY, id)
    }
    return id
  } catch {
    return `nostorage-${Math.random().toString(36).slice(2)}`
  }
}

type Payload = {
  ruang: RuangKey | 'belum'
  text: string
  name: string
  contact: string
  anonymous: boolean
  /** jebakan bot (harus kosong) */
  website?: string
}

/** Kirim ke server. Mengembalikan kode HTTP, atau 0 bila jaringan gagal. */
async function postAspirasi(payload: Payload): Promise<number> {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, deviceId: deviceId() }),
    })
    return res.status
  } catch {
    return 0
  }
}

export async function submitAspirasi(input: Payload): Promise<SubmitResult> {
  const record: Aspirasi = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    ruang: input.ruang,
    text: input.text,
    name: input.anonymous ? '' : input.name,
    contact: input.anonymous ? '' : input.contact,
    anonymous: input.anonymous,
    createdAt: new Date().toISOString(),
    status: 'local',
  }
  const status = await postAspirasi(input)
  if (status === 429) return { ok: false, reason: 'rate_limited' }
  if (status === 400) return { ok: false, reason: 'invalid' }
  if (status < 200 || status >= 300) {
    // simpan sebagai antrean; akan dikirim ulang otomatis (lihat flushPending)
    saveLocal([...loadLocal(), record])
    return { ok: false, reason: 'offline', record }
  }
  record.status = 'sent'
  saveLocal([...loadLocal(), record])
  void flushPending()
  return { ok: true, record }
}

let flushing = false

/**
 * Kirim ulang aspirasi yang sebelumnya hanya tersimpan di perangkat (status 'local'),
 * misalnya karena server/jaringan sempat gagal. Dipanggil saat aplikasi dibuka dan saat online kembali.
 * Mengembalikan jumlah yang berhasil terkirim.
 */
export async function flushPending(): Promise<number> {
  if (flushing) return 0
  flushing = true
  let sent = 0
  try {
    const list = loadLocal()
    for (const a of list) {
      if (a.status !== 'local') continue
      const anonymous = a.anonymous ?? !(a.name || a.contact)
      const status = await postAspirasi({ ruang: a.ruang, text: a.text, name: a.name, contact: a.contact, anonymous })
      if (status >= 200 && status < 300) {
        a.status = 'sent'
        sent++
      } else if (status === 400) {
        a.status = 'invalid'
      } else {
        break // 429 / server / jaringan: coba lagi nanti
      }
    }
    if (sent > 0 || list.some((a) => a.status === 'invalid')) saveLocal(list)
  } finally {
    flushing = false
  }
  return sent
}
