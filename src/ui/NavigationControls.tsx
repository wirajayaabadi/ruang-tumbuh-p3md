import { useEffect, useRef, useState } from 'react'
import { HOUSES, STEPS, STEP_FIRST_HOUSE, STEP_LAST, stepAt } from '../config/presentation'
import { BRAND, WELCOME } from '../data/narrative'
import { useStore } from '../store/useStore'
import { Icon } from './Icons'

export function stepLabel(step: number, short = false) {
  const s = stepAt(step)
  const pos = `${step + 1} / ${STEPS.length}`
  if (short) return pos
  return `${pos} — ${s.title}`
}

function useFullscreen() {
  const [isFs, setIsFs] = useState(() => !!document.fullscreenElement)
  useEffect(() => {
    const onChange = () => setIsFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])
  const supported = typeof document.documentElement.requestFullscreen === 'function'
  const toggle = () => {
    if (!supported) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen().catch(() => undefined)
  }
  return { isFs, toggle, supported }
}

interface Props {
  /** true pada tampilan HTML cadangan (tanpa WebGL): tombol eksplorasi disembunyikan */
  fallback?: boolean
}

/** Kontrol HTML yang selalu berada di layar: Prev/Next/Peta/Fullscreen/tema/Metodologi, indikator, daftar rumah. */
export function NavigationControls({ fallback = false }: Props) {
  const started = useStore((s) => s.started)
  const loading = useStore((s) => s.loading)
  const prologue = useStore((s) => s.prologue)
  const aspirasiPrompt = useStore((s) => s.aspirasiPrompt)
  const step = useStore((s) => s.step)
  const explore = useStore((s) => s.explore)
  const theme = useStore((s) => s.theme)
  const next = useStore((s) => s.next)
  const prev = useStore((s) => s.prev)
  const toMap = useStore((s) => s.toMap)
  const goTo = useStore((s) => s.goTo)
  const setExplore = useStore((s) => s.setExplore)
  const toggleTheme = useStore((s) => s.toggleTheme)
  const musicOn = useStore((s) => s.musicOn)
  const toggleMusic = useStore((s) => s.toggleMusic)
  const start = useStore((s) => s.start)
  const { isFs, toggle, supported } = useFullscreen()
  const hidden = !started || loading || prologue || aspirasiPrompt
  const current = stepAt(step)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('.chip.is-active')
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [step])

  return (
    <>
      <header className={`topbar${hidden ? ' is-hidden' : ''}`} aria-hidden={hidden}>
        <div className="topbar__brand">
          <span className="topbar__logo" aria-hidden />
          <span className="topbar__title">{BRAND.title}</span>
        </div>
        <div className="topbar__indicator" aria-live="polite">
          <span className="label-long">{explore ? 'Mode eksplorasi' : stepLabel(step)}</span>
          <span className="label-short">{explore ? 'Eksplorasi' : stepLabel(step, true)}</span>
        </div>
        <div className="topbar__actions">
          <button type="button" className="btn btn--ghost" onClick={toMap} disabled={step === 0 && !explore} title="Kembali ke peta (Home)">
            Peta
          </button>
          {!fallback && (
            <button type="button" className={`btn btn--ghost${explore ? ' is-on' : ''}`} onClick={() => setExplore(!explore)} aria-pressed={explore} title="Orbit kamera secara manual">
              <span className="label-long">{explore ? 'Lanjutkan Presentasi' : 'Eksplorasi'}</span>
              <span className="label-short">{explore ? 'Lanjutkan' : 'Orbit'}</span>
            </button>
          )}
          <button type="button" className="btn btn--ghost btn--icon" onClick={toggleMusic} title={musicOn ? 'Matikan musik' : 'Nyalakan musik'} aria-label="Musik latar" aria-pressed={musicOn}>
            <Icon name={musicOn ? 'sound' : 'mute'} size={16} />
          </button>
          <button type="button" className="btn btn--ghost btn--icon" onClick={toggleTheme} title={theme === 'light' ? 'Tema gelap' : 'Tema terang'} aria-label="Ganti tema">
            <Icon name={theme === 'light' ? 'moon' : 'sun'} size={16} />
          </button>
          {supported && (
            <button type="button" className="btn btn--ghost" onClick={toggle} title="Layar penuh">
              <span className="label-long">{isFs ? 'Keluar Fullscreen' : 'Fullscreen'}</span>
              <span className="label-short" aria-label="Layar penuh">{isFs ? '⤡' : '⤢'}</span>
            </button>
          )}
        </div>
      </header>

      <nav className={`bottombar${hidden ? ' is-hidden' : ''}`} aria-label="Navigasi presentasi" aria-hidden={hidden}>
        <button type="button" className="btn" onClick={prev} disabled={step === 0} title="Sebelumnya (←)">
          ‹ Previous
        </button>
        <div className="house-list" role="list" aria-label="Langkah presentasi" ref={listRef}>
          {STEPS.map((s, i) => {
            const isHouse = s.kind === 'house'
            const accent = isHouse ? HOUSES[s.houseIndex!].accent : '#5b6475'
            return (
              <button
                key={s.id}
                type="button"
                role="listitem"
                className={`chip${step === i ? ' is-active' : ''}${isHouse ? ' chip--house' : ''}`}
                style={{ ['--accent' as string]: accent }}
                onClick={() => goTo(i)}
                aria-current={step === i ? 'step' : undefined}
                title={s.title}
              >
                {isHouse ? <span className="chip__dot" /> : <span className="chip__code">{s.code}</span>}
                <span className="chip__name">{isHouse ? HOUSES[s.houseIndex!].short : s.title}</span>
                {isHouse && <span className="chip__num">{s.houseIndex! + 1}</span>}
              </button>
            )
          })}
        </div>
        <button type="button" className="btn btn--primary" onClick={next} disabled={step === STEP_LAST} title="Berikutnya (→)">
          Next ›
        </button>
      </nav>

      {!started && fallback && (
        <div className="welcome" role="dialog" aria-labelledby="welcome-title">
          <div className="welcome__card">
            <figure className="welcome__person">
              <img src={`${import.meta.env.BASE_URL}${WELCOME.person.photo}`} alt={WELCOME.person.name} width={120} height={120} />
              <figcaption>{WELCOME.person.name}</figcaption>
            </figure>
            <p className="welcome__eyebrow">{WELCOME.eyebrow}</p>
            <h1 id="welcome-title" className="welcome__title welcome__title--vuca">{WELCOME.title}</h1>
            <p className="welcome__text">{WELCOME.caption}</p>
            <button type="button" className="btn btn--primary btn--lg" onClick={start} autoFocus>
              {WELCOME.cta}
            </button>
            <p className="welcome__hint">
              Gunakan tombol → / ← untuk berpindah, ↑ / ↓ untuk tab di tiap rumah, atau klik rumah pada peta.
            </p>
          </div>
        </div>
      )}

      {started && current.kind === 'house' && !explore && step === STEP_FIRST_HOUSE && (
        <p className="hint" aria-hidden>
          <kbd>↑</kbd>/<kbd>↓</kbd> untuk berpindah tab.
        </p>
      )}

      {explore && (
        <p className="hint hint--explore" aria-live="polite">
          <span className="label-long">
            Seret: menoleh · Klik kanan seret: geser · Gulir: maju/mundur · <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>/panah: bergerak · <kbd>Q</kbd>/<kbd>E</kbd>: turun/naik · <kbd>Shift</kbd>: cepat · <kbd>Esc</kbd>: kembali
          </span>
          <span className="label-short">1 jari menoleh · 2 jari geser/cubit</span>
        </p>
      )}
    </>
  )
}
