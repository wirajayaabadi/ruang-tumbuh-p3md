/**
 * Pengiriman aspirasi pengunjung.
 * - Selalu disimpan di perangkat pengunjung (localStorage) agar ia bisa melihat kirimannya sendiri.
 * - Bila VITE_ASPIRASI_WEBHOOK diisi (mis. URL Web App Google Apps Script → Spreadsheet),
 *   data juga dikirim ke sana sebagai JSON (POST text/plain agar tidak memicu preflight CORS).
 */
import type { RuangKey } from './types'

export interface Aspirasi {
  id: string
  ruang: RuangKey | 'belum'
  text: string
  name: string
  contact: string
  createdAt: string
  /** 'sent' bila webhook menerima, 'local' bila hanya tersimpan di perangkat */
  status: 'sent' | 'local'
}

const KEY = 'rt-aspirasi'
const WEBHOOK = (import.meta.env.VITE_ASPIRASI_WEBHOOK as string | undefined)?.trim() ?? ''

export const hasRemote = () => WEBHOOK.length > 0

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

export async function submitAspirasi(input: Omit<Aspirasi, 'id' | 'createdAt' | 'status'>): Promise<Aspirasi> {
  const record: Aspirasi = {
    ...input,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    status: 'local',
  }
  if (WEBHOOK) {
    try {
      const res = await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ ...record, source: 'peta-5-ruang-tumbuh', ua: navigator.userAgent }),
        redirect: 'follow',
      })
      if (res.ok || res.type === 'opaque') record.status = 'sent'
    } catch {
      /* tetap tersimpan lokal */
    }
  }
  saveLocal([...loadLocal(), record])
  return record
}
