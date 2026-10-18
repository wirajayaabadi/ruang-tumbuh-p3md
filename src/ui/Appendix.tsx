import { useEffect } from 'react'
import { HOW_WE_COUNT, LIMITATIONS, METHOD_INTRO, METHOD_NOTE, METHOD_STAGES } from '../data/narrative'
import { useStore } from '../store/useStore'

/** Lampiran Metodologi (mode 03 situs) sebagai modal, di luar alur Next/Previous. */
export function Appendix() {
  const open = useStore((s) => s.appendixOpen)
  const setAppendix = useStore((s) => s.setAppendix)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setAppendix(false)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, setAppendix])

  if (!open) return null
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="appendix-title" onClick={() => setAppendix(false)}>
      <div className="modal__card" onClick={(e) => e.stopPropagation()}>
        <header className="modal__head">
          <div>
            <p className="panel__eyebrow">03 · Metodologi (lampiran)</p>
            <h2 id="appendix-title" className="panel__title">Problem Network Analysis</h2>
          </div>
          <button type="button" className="btn btn--ghost" onClick={() => setAppendix(false)} autoFocus>
            Tutup
          </button>
        </header>
        <div className="modal__body">
          <p className="panel__message">{METHOD_INTRO}</p>
          <ol className="stages">
            {METHOD_STAGES.map((s) => (
              <li key={s.code} className="stage">
                <span className="stage__code">{s.code}</span>
                <div>
                  <h3 className="stage__title">{s.title}</h3>
                  <p className="stage__body">{s.body}</p>
                  <details className="stage__refs">
                    <summary>Referensi ({s.refs.length})</summary>
                    <ul>
                      {s.refs.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </details>
                </div>
              </li>
            ))}
          </ol>
          <p className="muted small">{METHOD_NOTE}</p>
          <div className="two-col">
            <section>
              <h3 className="section__title">Cara kami menghitung</h3>
              <ul className="plain">
                {HOW_WE_COUNT.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="section__title">Batasan</h3>
              <ul className="plain">
                {LIMITATIONS.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
