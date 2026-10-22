/**
 * Vercel Function: POST /api/aspirasi
 * Memvalidasi aspirasi, membatasi spam, lalu menyimpan ke Supabase (tabel public.aspirasi).
 * Membutuhkan env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (secret, hanya di server).
 */
import { createHmac } from 'node:crypto'

const RUANG = new Set(['aman', 'bersama', 'belajar', 'inovasi', 'masa', 'belum'])
const LIMIT_DEVICE_PER_HOUR = 5
const LIMIT_IP_PER_HOUR = 20

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })

function supabaseConfig() {
  const rawUrl = process.env.SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  // toleran bila URL disalin lengkap dengan /rest/v1/
  const base = rawUrl.trim().replace(/\/+$/, '').replace(/\/rest\/v1$/, '')
  if (!base || !key) return null
  const headers: Record<string, string> = { apikey: key }
  // kunci lama (JWT service_role) juga perlu header Authorization; kunci baru sb_secret_ cukup apikey
  if (key.split('.').length === 3) headers.Authorization = `Bearer ${key}`
  return { rest: `${base}/rest/v1`, key, headers }
}

const hmac = (key: string, value: string) => createHmac('sha256', key).update(value).digest('hex').slice(0, 32)

async function countSince(rest: string, headers: Record<string, string>, column: string, value: string, sinceIso: string) {
  const url = `${rest}/aspirasi?select=id&${column}=eq.${encodeURIComponent(value)}&created_at=gte.${encodeURIComponent(sinceIso)}`
  const res = await fetch(url, { method: 'HEAD', headers: { ...headers, Prefer: 'count=exact' } })
  const range = res.headers.get('content-range') ?? '' // contoh: "*/3" atau "0-0/3"
  const total = Number(range.split('/')[1])
  return Number.isFinite(total) ? total : 0
}

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '')

export async function POST(request: Request): Promise<Response> {
  const cfg = supabaseConfig()
  if (!cfg) return json(500, { error: 'server_not_configured' })

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return json(400, { error: 'invalid_json' })
  }

  // jebakan bot: kolom tersembunyi harus kosong. Balas "sukses" agar bot tidak belajar.
  if (clean(body.website, 200)) return json(201, { ok: true })

  const ruang = clean(body.ruang, 20)
  const text = typeof body.text === 'string' ? body.text.trim().slice(0, 600) : ''
  const anonymous = body.anonymous === true
  const name = anonymous ? '' : clean(body.name, 80)
  const contact = anonymous ? '' : clean(body.contact, 80)
  const deviceId = clean(body.deviceId, 64)

  if (!RUANG.has(ruang)) return json(400, { error: 'invalid_ruang' })
  if (text.length < 10) return json(400, { error: 'text_too_short' })
  if (!deviceId) return json(400, { error: 'missing_device' })

  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || request.headers.get('x-real-ip') || ''
  const deviceHash = hmac(cfg.key, `device:${deviceId}`)
  const ipHash = ip ? hmac(cfg.key, `ip:${ip}`) : null

  try {
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const [byDevice, byIp] = await Promise.all([
      countSince(cfg.rest, cfg.headers, 'device_hash', deviceHash, since),
      ipHash ? countSince(cfg.rest, cfg.headers, 'ip_hash', ipHash, since) : Promise.resolve(0),
    ])
    if (byDevice >= LIMIT_DEVICE_PER_HOUR || byIp >= LIMIT_IP_PER_HOUR) return json(429, { error: 'rate_limited' })

    const res = await fetch(`${cfg.rest}/aspirasi`, {
      method: 'POST',
      headers: { ...cfg.headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({
        ruang,
        text,
        name: name || null,
        contact: contact || null,
        anonymous,
        device_hash: deviceHash,
        ip_hash: ipHash,
        user_agent: clean(request.headers.get('user-agent'), 300) || null,
      }),
    })
    if (!res.ok) {
      const detail = await res.text()
      console.error('supabase insert failed', res.status, detail.slice(0, 300))
      return json(502, { error: 'storage_failed' })
    }
    return json(201, { ok: true })
  } catch (err) {
    console.error('aspirasi error', err)
    return json(502, { error: 'storage_unreachable' })
  }
}

export function GET(): Response {
  return json(405, { error: 'method_not_allowed' })
}
