import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { getPrologueVideo } from './prologueVideo'

/**
 * Prolog video bergaya game: layar penuh bersuara dengan bilah sinematik,
 * bar progres, tombol suara, dan tombol Skip besar. Enter/Space/Esc juga melewati.
 */
export function Prologue() {
  const prologue = useStore((s) => s.prologue)
  if (!prologue) return null
  return <PrologueInner />
}

function PrologueInner() {
  const finishPrologue = useStore((s) => s.finishPrologue)
  const host = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [muted, setMuted] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const leavingRef = useRef(false)

  const end = () => {
    if (leavingRef.current) return
    leavingRef.current = true
    setLeaving(true)
    window.setTimeout(finishPrologue, 650)
  }

  useEffect(() => {
    const v = getPrologueVideo()
    const h = host.current
    if (!h) return
    h.appendChild(v)
    const onTime = () => { if (v.duration) setProgress(v.currentTime / v.duration) }
    const onVol = () => setMuted(v.muted)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('ended', end)
    v.addEventListener('error', end)
    v.addEventListener('volumechange', onVol)
    v.currentTime = 0
    v.muted = false
    v.volume = 1
    let active = true
    const p = v.play()
    if (p) {
      p.catch((err: unknown) => {
        if (!active) return // efek sudah dibersihkan (mis. StrictMode): abaikan AbortError dari pause()
        const name = (err as { name?: string })?.name
        if (name !== 'NotAllowedError') return
        // browser menolak autoplay bersuara: putar bisu agar gambar tetap jalan, minta satu ketukan untuk suara
        v.muted = true
        setMuted(true)
        setBlocked(true)
        void v.play().catch(() => undefined)
      })
    }
    return () => {
      active = false
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('ended', end)
      v.removeEventListener('error', end)
      v.removeEventListener('volumechange', onVol)
      v.pause()
      if (v.parentNode === h) h.removeChild(v)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        end()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleSound = () => {
    const v = getPrologueVideo()
    v.muted = !v.muted
    v.volume = 1
    setMuted(v.muted)
    setBlocked(false)
    if (v.paused) void v.play().catch(() => undefined)
  }

  return (
    <div className={`prologue${leaving ? ' is-leaving' : ''}`} role="dialog" aria-label="Prolog">
      <div ref={host} className="prologue__host" />
      <div className="prologue__bar prologue__bar--top" aria-hidden />
      <div className="prologue__bar prologue__bar--bottom" aria-hidden />
      <div className="prologue__vignette" aria-hidden />

      <div className="prologue__progress" aria-hidden>
        <i style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>

      <button type="button" className={`prologue__sound${muted ? ' is-muted' : ''}`} onClick={toggleSound} aria-pressed={!muted} title={muted ? 'Nyalakan suara' : 'Bisukan'}>
        {muted ? '🔇 Suara mati' : '🔊 Suara'}
      </button>

      {blocked && (
        <button type="button" className="prologue__tap" onClick={toggleSound}>
          🔊 Nyalakan suara
        </button>
      )}

      <button type="button" className="prologue__skip" onClick={end} autoFocus>
        Lewati <span aria-hidden>▶▶</span>
        <small>Enter / Esc</small>
      </button>
    </div>
  )
}
