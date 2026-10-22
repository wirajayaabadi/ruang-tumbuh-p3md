import { HOUSES, stepAt } from '../config/presentation'
import { PROBLEMS, houseSlots, pct, shortName } from '../data/derive'
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
      {HOUSES.flatMap((h) =>
        houseSlots(h.id).map((slot) => (
          <div
            key={`atom-${h.id}-${slot.problem.id}-${slot.kind}`}
            ref={registerLabelElement(`atom:${h.id}:${slot.problem.id}:${slot.kind}`)}
            className={`atom-label atom-label--${slot.kind}`}
            style={{ ['--accent' as string]: HOUSES.find((x) => x.id === slot.problem.main)!.accent }}
          >
            <span className="prob-label__diamond" />
            <span>{shortName(slot.problem.id)}</span>
            <span className="atom-label__kind">{slot.kind === 'main' ? (slot.thin ? 'utama · data tipis' : 'utama') : slot.kind === 'support' ? 'pendukung' : 'rencana tim'}</span>
          </div>
        )),
      )}
      {HOUSES.map((h) => (
        <div key={`fairy-${h.id}`} ref={registerLabelElement(`fairy:${h.id}`)} className="fairy-bubble" style={{ ['--accent' as string]: h.accent }}>
          Semangat!
        </div>
      ))}
    </div>
  )
}
