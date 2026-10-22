import { useEffect, useState } from 'react'
import { HOUSES, RUANG_ACCENT } from '../config/presentation'
import { flushPending, loadLocal, submitAspirasi, type Aspirasi } from '../data/aspirasi'
import { RUANG_SHORT } from '../data/derive'
import { STEP_TEXT } from '../data/narrative'
import type { RuangKey } from '../data/types'
import { useStore } from '../store/useStore'
import { Icon } from './Icons'

const MAX_LEN = 600

interface Props {
  /** 'step' = panel langkah Aspirasimu; 'modal' = jendela ajakan setelah prolog */
  variant?: 'step' | 'modal'
  /** dipanggil saat pengunjung memilih lanjut menjelajah peta (varian modal) */
  onContinue?: () => void
}

/** Formulir aspirasi pengunjung (langkah "Aspirasimu" dan jendela ajakan setelah prolog). */
export function AspirasiForm({ variant = 'step', onContinue }: Props) {
  const notify = useStore((s) => s.notifyAspirasi)
  const [ruang, setRuang] = useState<RuangKey | 'belum'>('belum')
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [anon, setAnon] = useState(false)
  const [contact, setContact] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [website, setWebsite] = useState('')
  const [done, setDone] = useState<Aspirasi | null>(null)
  const [mine, setMine] = useState<Aspirasi[]>(() => loadLocal())

  const canSend = text.trim().length >= 10 && !busy

  // saat formulir dibuka: kirim ulang aspirasi tertunda, lalu perbarui daftar
  useEffect(() => {
    let alive = true
    void flushPending().then((n) => {
      if (alive && n > 0) setMine(loadLocal())
    })
    return () => {
      alive = false
    }
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSend) return
    setBusy(true)
    setError('')
    const result = await submitAspirasi({ ruang, text: text.trim(), name: name.trim(), contact: contact.trim(), anonymous: anon, website })
    setBusy(false)
    if (!result.ok && result.reason === 'rate_limited') {
      setError('Kamu sudah mengirim beberapa aspirasi dalam satu jam terakhir. Coba lagi nanti, ya.')
      return
    }
    if (!result.ok && result.reason === 'invalid') {
      setError('Aspirasi belum bisa diterima. Pastikan ruang dipilih dan teks minimal 10 karakter.')
      return
    }
    if (result.record) {
      setDone(result.record)
      setMine(loadLocal())
      notify()
    }
  }

  const reset = () => {
    setDone(null)
    setText('')
  }

  const ruangList: Array<{ key: RuangKey | 'belum'; label: string; accent: string }> = [
    ...HOUSES.map((h) => ({ key: h.id, label: h.short, accent: h.accent })),
    { key: 'belum', label: 'Belum yakin', accent: '#8a93a6' },
  ]

  return (
    <>
      <div className="panel__head">
        <span className="panel__icon" style={{ color: '#ffd978', background: 'rgba(255, 217, 120, 0.14)' }}>
          <Icon name="network" size={28} />
        </span>
        <div>
          <p className="panel__eyebrow" style={{ color: '#ffd978' }}>{variant === 'modal' ? 'Sebelum menjelajah' : STEP_TEXT.aspirasi.eyebrow}</p>
          <h2 className="panel__title" id={variant === 'modal' ? 'aspirasi-modal-title' : undefined}>{STEP_TEXT.aspirasi.heading}</h2>
        </div>
      </div>
      {STEP_TEXT.aspirasi.body.map((t) => (
        <p key={t} className="panel__text">{t}</p>
      ))}

      {done ? (
        <div className="asp-done" role="status">
          <p className="asp-done__title">Terima kasih! ✨</p>
          <p className="asp-done__text">
            Aspirasimu kini menjadi satu bintang baru di langit peta ini
            {done.status === 'sent'
              ? ' dan sudah diterima tim Ruang Tumbuh.'
              : ', namun belum terkirim ke tim karena koneksi bermasalah. Salinannya tersimpan di perangkat ini dan akan dikirim ulang otomatis.'}
          </p>
          <div className="asp-done__actions">
            {onContinue && (
              <button type="button" className="btn btn--primary asp-submit" onClick={onContinue}>
                Jelajahi Peta 5 Ruang ›
              </button>
            )}
            <button type="button" className={onContinue ? 'btn btn--ghost' : 'btn btn--primary'} onClick={reset}>Kirim aspirasi lain</button>
          </div>
        </div>
      ) : (
        <form className="asp-form" onSubmit={onSubmit}>
          <label className="asp-label">Untuk ruang mana?</label>
          <div className="chips" role="radiogroup" aria-label="Ruang tujuan">
            {ruangList.map((r) => (
              <button key={r.key} type="button" role="radio" aria-checked={ruang === r.key} className={`pchip${ruang === r.key ? ' is-active' : ''}`} style={{ ['--accent' as string]: r.accent }} onClick={() => setRuang(r.key)}>
                <span className="pchip__diamond" />
                {r.label}
              </button>
            ))}
          </div>

          <label className="asp-label" htmlFor="asp-text">Aspirasimu</label>
          <textarea
            id="asp-text"
            className="asp-textarea"
            value={text}
            maxLength={MAX_LEN}
            rows={5}
            placeholder="Apa yang kamu rasakan, butuhkan, atau usulkan untuk angkatan kita?"
            onChange={(e) => setText(e.target.value)}
            required
          />
          <div className="asp-meta">
            <span className={text.trim().length < 10 ? 'muted' : ''}>{text.trim().length < 10 ? 'Minimal 10 karakter' : ' '}</span>
            <span className="muted">{text.length}/{MAX_LEN}</span>
          </div>

          <label className="asp-check">
            <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
            Kirim secara anonim
          </label>
          {!anon && (
            <div className="asp-grid">
              <label className="asp-field">
                <span className="asp-label">Nama (opsional)</span>
                <input className="asp-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama / kelas" maxLength={80} />
              </label>
              <label className="asp-field">
                <span className="asp-label">Kontak (opsional)</span>
                <input className="asp-input" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="WhatsApp / email" maxLength={80} />
              </label>
            </div>
          )}

          {/* jebakan bot: tidak terlihat oleh manusia */}
          <input className="asp-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(e) => setWebsite(e.target.value)} name="website" />
          {error && <p className="asp-error" role="alert">{error}</p>}
          <button type="submit" className="btn btn--primary btn--lg asp-submit" disabled={!canSend}>
            {busy ? 'Mengirim…' : 'Kirim Aspirasi ✦'}
          </button>
          {onContinue && (
            <button type="button" className="asp-skip" onClick={onContinue}>
              Lewati, jelajahi peta dulu ›
            </button>
          )}
          <p className="muted small">Aspirasi diteruskan ke tim Ruang Tumbuh. Salinannya disimpan di perangkat ini agar kamu bisa melihatnya kembali.</p>
        </form>
      )}

      {variant === 'step' && mine.length > 0 && (
        <>
          <h3 className="section__title">Aspirasi yang kamu kirim</h3>
          <ul className="asp-list">
            {[...mine].reverse().slice(0, 5).map((a) => (
              <li key={a.id} className="asp-item" style={{ ['--accent' as string]: a.ruang === 'belum' ? '#8a93a6' : RUANG_ACCENT[a.ruang] }}>
                <span className="pchip__diamond" />
                <div>
                  <span className="asp-item__ruang">
                    {a.ruang === 'belum' ? 'Belum yakin' : RUANG_SHORT[a.ruang]}
                    <span className={`asp-item__status asp-item__status--${a.status}`}>{a.status === 'sent' ? ' · terkirim' : a.status === 'local' ? ' · menunggu dikirim' : ' · ditolak'}</span>
                  </span>
                  <p>{a.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
