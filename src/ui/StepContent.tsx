import { HOUSES, HOUSE_INDEX, HOUSE_TABS, RUANG_ACCENT, STEPS, STEP_FIRST_HOUSE, stepAt, type HouseTab, type Step } from '../config/presentation'
import {
  PROBLEMS,
  RELATIONS_SORTED,
  RUANG_KEYS,
  RUANG_SHORT,
  VERDICT_LABEL,
  pct,
  shortName,
} from '../data/derive'
import { BRAND, STEP_TEXT } from '../data/narrative'
import { RUANG_CONTENT, type RuangPoint } from '../data/ruang'
import type { Problem, RuangKey } from '../data/types'
import { useStore } from '../store/useStore'
import { AspirasiForm } from './AspirasiForm'
import { Icon, type IconName } from './Icons'

/* ---------- potongan kecil ---------- */

function Head({ eyebrow, title, icon, accent }: { eyebrow: string; title: string; icon: IconName; accent: string }) {
  return (
    <div className="panel__head">
      <span className="panel__icon" style={{ color: accent, background: `${accent}1f` }}>
        <Icon name={icon} size={28} />
      </span>
      <div>
        <p className="panel__eyebrow" style={{ color: accent }}>{eyebrow}</p>
        <h2 className="panel__title">{title}</h2>
      </div>
    </div>
  )
}

function Bar({ value, color, label, right }: { value: number; color: string; label: string; right: string }) {
  return (
    <div className="bar">
      <span className="bar__label">{label}</span>
      <span className="bar__track"><i style={{ width: `${Math.max(2, value * 100)}%`, background: color }} /></span>
      <span className="bar__value">{right}</span>
    </div>
  )
}

function ProblemDetail({ p }: { p: Problem }) {
  const reason = p.reasons[0]
  return (
    <div className="detail">
      <h3 className="detail__title">{shortName(p.id)}</h3>
      <p className="detail__line">
        Paling dekat dengan <b style={{ color: RUANG_ACCENT[p.main] }}>{RUANG_SHORT[p.main]}</b> ({pct(p.share[p.main])}).
        {p.support.length > 0 && <> Ruang pendukung: {p.support.map((r) => RUANG_SHORT[r]).join(', ')}.</>}
      </p>
      {reason && (
        <p className="detail__line muted">
          Kata <span className="kw">{reason.chain[0]}</span> sering dibahas bersama{' '}
          {reason.chain.slice(1).map((w) => (
            <span key={w} className="kw">{w}</span>
          ))}{' '}
          dalam {reason.lines} aspirasi dari {reason.people} agent.
        </p>
      )}
      <p className="detail__line">
        Rencana tim: {p.plan.map((r) => RUANG_SHORT[r]).join(' / ')} · <span className={`verdict verdict--${p.verdict}`}>{VERDICT_LABEL[p.verdict]}</span> · {pct(p.p_main)} stabil
      </p>
      <div className="bars">
        {RUANG_KEYS.map((r) => (
          <Bar key={r} value={p.share[r]} color={RUANG_ACCENT[r]} label={RUANG_SHORT[r]} right={pct(p.share[r])} />
        ))}
      </div>
    </div>
  )
}

/* ---------- konten per langkah ---------- */

function IntroContent() {
  const goTo = useStore((st) => st.goTo)
  return (
    <>
      <p className="panel__eyebrow">{BRAND.eyebrow}</p>
      <h2 className="panel__title panel__title--lg">{BRAND.title}</h2>
      <p className="panel__motto">{BRAND.motto}</p>
      <p className="panel__message">{BRAND.subtitle}</p>
      <h3 className="section__title">{STEP_TEXT.intro.heading}</h3>
      {STEP_TEXT.intro.body.map((t) => (
        <p key={t} className="panel__text">{t}</p>
      ))}
      <ol className="ruang-cards">
        {HOUSES.map((h, i) => (
          <li key={h.id}>
            <button type="button" className="ruang-card" style={{ ['--accent' as string]: h.accent }} onClick={() => goTo(STEP_FIRST_HOUSE + i)}>
              <span className="ruang-card__icon"><Icon name={h.id} size={22} /></span>
              <span className="ruang-card__body">
                <b>{h.name}</b>
                <span>{RUANG_CONTENT[h.id].tagline}</span>
              </span>
              <span className="ruang-card__num">{i + 1}</span>
            </button>
          </li>
        ))}
      </ol>
    </>
  )
}

function RelationList({ id }: { id: string }) {
  const rels = RELATIONS_SORTED.filter((r) => (r.a === id || r.b === id) && r.level !== 'tidak')
  if (!rels.length) return <p className="muted small">Hampir selalu dibahas sendiri, tanpa terkait masalah lain.</p>
  return (
    <ul className="pairs">
      {rels.map((r) => {
        const other = r.a === id ? r.b : r.a
        return (
          <li key={other}>
            <span className="pair pair--static">
              <b>{shortName(other)} <span className={`lvl lvl--${r.level}`}>{r.level}</span></b>
              <span>{r.lines ? `${r.lines} aspirasi dari ${r.people} agent` : 'lewat kata jembatan'}{r.shared.length ? ` · kata bersama: ${r.shared.join(', ')}` : ''} · lift {r.lift}×</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function FlowContent() {
  const selected = useStore((s) => s.selectedProblem)
  const selectProblem = useStore((s) => s.selectProblem)
  const p = selected ? PROBLEMS.find((q) => q.id === selected) : null
  return (
    <>
      <Head eyebrow={STEP_TEXT.flow.eyebrow} title={STEP_TEXT.flow.heading} icon="flow" accent="#5b6475" />
      {STEP_TEXT.flow.body.map((t) => (
        <p key={t} className="panel__text">{t}</p>
      ))}
      {p ? (
        <>
          <button type="button" className="btn btn--ghost" onClick={() => selectProblem(null)} style={{ marginBottom: 10 }}>
            ‹ Semua masalah
          </button>
          <ProblemDetail p={p} />
          <h3 className="section__title">Keterkaitan dengan masalah lain</h3>
          <RelationList id={p.id} />
        </>
      ) : (
        <>
          <h3 className="section__title">Sembilan masalah, satu inti</h3>
          <ol className="ruang-cards">
            {PROBLEMS.map((q, i) => (
              <li key={q.id}>
                <button type="button" className="ruang-card" style={{ ['--accent' as string]: RUANG_ACCENT[q.main] }} onClick={() => selectProblem(q.id)}>
                  <span className="ruang-card__icon"><span className="pchip__diamond" style={{ width: 14, height: 14 }} /></span>
                  <span className="ruang-card__body">
                    <b>{shortName(q.id)}</b>
                    <span>Mengalir ke {RUANG_SHORT[q.main]}{q.support.length ? ` · didukung ${q.support.map((r) => RUANG_SHORT[r]).join(', ')}` : ''}</span>
                  </span>
                  <span className="ruang-card__num">{i + 1}</span>
                </button>
              </li>
            ))}
          </ol>
          <p className="muted small">Pilih masalah, atau klik berlian di inti, untuk melihat aliran dan keterkaitannya.</p>
        </>
      )}
    </>
  )
}

/** Daftar poin masalah/solusi (judul saja; detail tetap tersimpan di src/data/ruang.ts sebagai pegangan). */
function PointList({ points, accent, kind }: { points: RuangPoint[]; accent: string; kind: 'masalah' | 'solusi' }) {
  return (
    <ol className={`points points--${kind}`}>
      {points.map((p, i) => (
        <li key={p.title} className="point">
          <div className="point__row" style={{ ['--accent' as string]: accent }}>
            <span className="point__num">{i + 1}</span>
            <span className="point__title">{p.title}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}

function HouseContent({ step }: { step: Step }) {
  const house = HOUSES[step.houseIndex!]
  const r = house.id
  const tab = useStore((s) => s.tab)
  const setTab = useStore((s) => s.setTab)
  const c = RUANG_CONTENT[r]
  const num = step.houseIndex! + 1

  return (
    <>
      <Head eyebrow={`Ruang ${num} dari ${HOUSES.length}`} title={house.name} icon={r} accent={house.accent} />
      <p className="panel__def">{c.tagline}</p>
      <div className="tabs" role="tablist" aria-label="Bagian materi">
        {HOUSE_TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={`tab${tab === t.id ? ' is-active' : ''}`} style={{ ['--accent' as string]: house.accent }} onClick={() => setTab(t.id as HouseTab)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'ringkasan' && (
        <>
          <h3 className="section__title">Ringkasan</h3>
          {c.ringkasan.map((t) => (
            <p key={t} className="panel__text">{t}</p>
          ))}
          <h3 className="section__title">Hasil yang ingin dirasakan</h3>
          <blockquote className="quote" style={{ ['--accent' as string]: house.accent }}>“{c.hasil}”</blockquote>
          <h3 className="section__title">{c.jembatanTitle}</h3>
          <p className="panel__text">{c.jembatan}</p>
        </>
      )}

      {tab === 'masalah' && (
        <>
          <p className="muted small" style={{ marginTop: 0 }}>Masalah yang dijawab ruang ini.</p>
          <PointList points={c.masalah} accent={house.accent} kind="masalah" />
        </>
      )}

      {tab === 'solusi' && (
        <>
          <p className="muted small" style={{ marginTop: 0 }}>Langkah yang dijalankan di ruang ini.</p>
          <PointList points={c.solusi} accent={house.accent} kind="solusi" />
        </>
      )}
    </>
  )
}

/** Isi panel untuk sebuah langkah (dipakai panel 3D dan tampilan cadangan). */
export function StepContent({ stepIndex }: { stepIndex: number }) {
  const step = stepAt(stepIndex)
  switch (step.kind) {
    case 'intro':
      return <IntroContent />
    case 'flow':
      return <FlowContent />
    case 'aspirasi':
      return <AspirasiForm />
    case 'house':
    default:
      return <HouseContent step={step} />
  }
}

export function stepAccent(stepIndex: number) {
  const step = stepAt(stepIndex)
  return step.kind === 'house' ? HOUSES[step.houseIndex!].accent : '#5b6475'
}

export const STEP_COUNT = STEPS.length
export const houseIndexOf = (r: RuangKey) => HOUSE_INDEX[r]
