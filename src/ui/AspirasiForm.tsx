import { useState } from 'react'
import { HOUSES, RUANG_ACCENT } from '../config/presentation'
import { hasRemote, loadLocal, submitAspirasi, type Aspirasi } from '../data/aspirasi'
import { RUANG_SHORT } from '../data/derive'
import { STEP_TEXT } from '../data/narrative'
import type { RuangKey } from '../data/types'
import { useStore } from '../store/useStore'
import { Icon } from './Icons'

const MAX_LEN = 600

/** Formulir aspirasi pengunjung (langkah "Aspirasimu"). */
export function AspirasiForm() {
  const notify = useStore((s) => s.notifyAspirasi)
  const [ruang, setRuang] = useState<RuangKey | 'belum'>('belum')
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [anon, setAnon] = useState(false)
  const [contact, setContact] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<Aspirasi | null>(null)
  const [mine, setMine] = useState<Aspirasi[]>(() => loadLocal())

  const canSend = text.trim().length >= 10 && !busy

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSend) return
    setBusy(true)
    const rec = await submitAspirasi({ ruang, text: text.trim(), name: anon ? '' : name.trim(), contact: anon ? '' : contact.trim() })
    setBusy(false)
    setDone(rec)
    setMine(loadLocal())
    notify()
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
          <p className="panel__eyebrow" style={{ color: '#ffd978' }}>{STEP_TEXT.aspirasi.eyebrow}</p>
          <h2 className="panel__title">{STEP_TEXT.aspirasi.heading}</h2>
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
            {done.status === 'sent' ? ' dan sudah diterima tim.' : hasRemote() ? ', namun belum terkirim ke tim (tersimpan di perangkat ini).' : ' dan tersimpan di perangkat ini.'}
          </p>
          <button type="button" className="btn btn--primary" onClick={reset}>Kirim aspirasi lain</button>
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

          <button type="submit" className="btn btn--primary btn--lg asp-submit" disabled={!canSend}>
            {busy ? 'Mengirim…' : 'Kirim Aspirasi ✦'}
          </button>
          <p className="muted small">
            {hasRemote() ? 'Aspirasi diteruskan ke tim Ruang Tumbuh dan ' : 'Aspirasi '}tersimpan di perangkat ini agar kamu bisa melihatnya kembali.
          </p>
        </form>
      )}

      {mine.length > 0 && (
        <>
          <h3 className="section__title">Aspirasi yang kamu kirim</h3>
          <ul className="asp-list">
            {[...mine].reverse().slice(0, 5).map((a) => (
              <li key={a.id} className="asp-item" style={{ ['--accent' as string]: a.ruang === 'belum' ? '#8a93a6' : RUANG_ACCENT[a.ruang] }}>
                <span className="pchip__diamond" />
                <div>
                  <span className="asp-item__ruang">{a.ruang === 'belum' ? 'Belum yakin' : RUANG_SHORT[a.ruang]}</span>
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
