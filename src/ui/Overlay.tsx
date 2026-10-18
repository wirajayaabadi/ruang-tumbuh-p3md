import { HOUSES, stepAt } from '../config/presentation'
import { PROBLEMS, pct, ruangLoad, shortName } from '../data/derive'
import { registerLabelElement } from '../scene/Labels'
import { useStore } from '../store/useStore'

/** Label DOM di atas canvas: rumah, token masalah, dan kolom beban. Posisi diatur LabelProjector per frame. */
export function LabelsOverlay() {
  const step = useStore((s) => s.step)
  const explore = useStore((s) => s.explore)
  const selected = useStore((s) => s.selectedProblem)
  const kind = explore ? 'intro' : stepAt(step).kind
  const activeHouse = kind === 'house' ? stepAt(step).houseIndex : -1
  void kind

  return (
    <div className="labels" aria-hidden>
      {HOUSES.map((h, i) => (
        <div
          key={h.id}
          ref={registerLabelElement(`house:${h.id}`)}
          className={`house-label${activeHouse === i ? ' is-active' : ''}`}
          style={{ ['--accent' as string]: h.accent }}
        >
          <span className="house-label__dot" />
          {h.name}
        </div>
      ))}
      {PROBLEMS.map((p) => (
        <div
          key={p.id}
          ref={registerLabelElement(`prob:${p.id}`)}
          className={`prob-label${selected === p.id ? ' is-active' : ''}${p.verdict === 'kurang' ? ' is-thin' : ''}`}
          style={{ ['--accent' as string]: HOUSES.find((h) => h.id === p.main)!.accent }}
        >
          <span className="prob-label__diamond" />
          <span>{shortName(p.id)}</span>
          <span className="prob-label__sub">{pct(p.p_main)}{p.verdict === 'kurang' ? ' · ?' : ''}</span>
        </div>
      ))}
      {HOUSES.map((h) => (
        <div key={`fairy-${h.id}`} ref={registerLabelElement(`fairy:${h.id}`)} className="fairy-bubble" style={{ ['--accent' as string]: h.accent }}>
          Semangat!
        </div>
      ))}
      {HOUSES.map((h) => {
        const l = ruangLoad(h.id)
        const delta = l.delta > 0 ? `+${l.delta}` : l.delta < 0 ? `−${-l.delta}` : '±0'
        return (
          <div key={`load-${h.id}`} ref={registerLabelElement(`load:${h.id}`)} className={`load-label${l.delta > 0 ? ' is-up' : l.delta < 0 ? ' is-down' : ''}`} style={{ ['--accent' as string]: h.accent }}>
            <span className="load-label__name"><i className="house-label__dot" />{h.short}</span>
            <b>{delta}</b>
            <span>rencana {l.plan} → data {l.data}</span>
          </div>
        )
      })}
    </div>
  )
}
