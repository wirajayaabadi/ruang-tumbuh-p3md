import { HOUSES, HOUSE_INDEX, HOUSE_TABS, RUANG_ACCENT, STEPS, stepAt, type HouseTab, type Step } from '../config/presentation'
import {
  DATA,
  MOVE_SUMMARY,
  PROBLEMS,
  PROBLEMS_BY_STABILITY,
  PROBLEM_ORDER,
  RELATION_LEVEL_COUNT,
  RELATIONS_SORTED,
  RUANG_KEYS,
  RUANG_SHORT,
  VERDICT_COUNT,
  VERDICT_LABEL,
  WORD_COUNT,
  houseSlots,
  pct,
  relationBetween,
  ruangLoad,
  shortName,
  topWords,
} from '../data/derive'
import { BRAND, NEXT_STEPS, RUANG_NARRATIVE, STEP_TEXT, TAKEAWAYS } from '../data/narrative'
import type { Problem, RuangKey } from '../data/types'
import { useStore } from '../store/useStore'
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

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="stat">
      <b className="stat__value">{value}</b>
      <span className="stat__label">{label}</span>
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

function ProblemChips({ ids = PROBLEM_ORDER }: { ids?: string[] }) {
  const selected = useStore((s) => s.selectedProblem)
  const selectProblem = useStore((s) => s.selectProblem)
  return (
    <div className="chips" role="list" aria-label="Daftar masalah">
      {ids.map((id) => {
        const p = PROBLEMS.find((q) => q.id === id)!
        return (
          <button
            key={id}
            type="button"
            role="listitem"
            className={`pchip${selected === id ? ' is-active' : ''}`}
            style={{ ['--accent' as string]: RUANG_ACCENT[p.main] }}
            onClick={() => selectProblem(id)}
            aria-pressed={selected === id}
          >
            <span className="pchip__diamond" />
            {shortName(id)}
          </button>
        )
      })}
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
  const m = DATA.meta
  return (
    <>
      <p className="panel__eyebrow">{BRAND.eyebrow}</p>
      <h2 className="panel__title panel__title--lg">{BRAND.title}</h2>
      <p className="panel__message">{BRAND.subtitle}</p>
      <div className="stats">
        <Stat value={m.lines} label="aspirasi" />
        <Stat value={m.people} label="agent" />
        <Stat value={m.words} label="isu" />
        <Stat value={PROBLEMS.length} label="masalah" />
        <Stat value={RUANG_KEYS.length} label="ruang" />
      </div>
      <h3 className="section__title">{STEP_TEXT.intro.heading}</h3>
      {STEP_TEXT.intro.body.map((t) => (
        <p key={t} className="panel__text">{t}</p>
      ))}
      <div className="bars">
        {RUANG_KEYS.map((r) => (
          <Bar key={r} value={WORD_COUNT[r] / 63} color={RUANG_ACCENT[r]} label={RUANG_SHORT[r]} right={String(WORD_COUNT[r])} />
        ))}
      </div>
      <p className="muted small">{DATA.nodes.length} isu dalam jaringan; {topWords('belajar', 1)[0] ? '50 kata teratas ditampilkan di panggung.' : ''}</p>
    </>
  )
}

function FlowContent() {
  const selected = useStore((s) => s.selectedProblem)
  const p = selected ? PROBLEMS.find((q) => q.id === selected) : null
  return (
    <>
      <Head eyebrow={STEP_TEXT.flow.eyebrow} title={STEP_TEXT.flow.heading} icon="flow" accent="#5b6475" />
      {STEP_TEXT.flow.body.map((t) => (
        <p key={t} className="panel__text">{t}</p>
      ))}
      <ProblemChips />
      {p ? <ProblemDetail p={p} /> : <p className="muted small">Pilih masalah di atas, atau klik berlian di inti.</p>}
    </>
  )
}

function HouseContent({ step }: { step: Step }) {
  const house = HOUSES[step.houseIndex!]
  const r = house.id
  const tab = useStore((s) => s.tab)
  const setTab = useStore((s) => s.setTab)
  const nar = RUANG_NARRATIVE[r]
  const load = ruangLoad(r)
  const slots = houseSlots(r)
  const words = topWords(r, 10)
  const num = step.houseIndex! + 1

  return (
    <>
      <Head eyebrow={`Ruang ${num} dari ${HOUSES.length}`} title={house.name} icon={r} accent={house.accent} />
      <div className="tabs" role="tablist" aria-label="Bagian materi">
        {HOUSE_TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={`tab${tab === t.id ? ' is-active' : ''}`} style={{ ['--accent' as string]: house.accent }} onClick={() => setTab(t.id as HouseTab)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'ringkasan' && (
        <>
          <p className="panel__def">{nar.definition}</p>
          <p className="panel__message">{nar.message}</p>
          <ul className="panel__points">
            {nar.points.slice(0, 3).map((t) => (
              <li key={t}><span className="panel__bullet" style={{ background: house.accent }} />{t}</li>
            ))}
          </ul>
        </>
      )}

      {tab === 'masalah' && (
        <>
          <p className="panel__text">Masalah yang bersandar pada ruang ini menurut aspirasi (utama, pendukung) dan menurut rencana tim.</p>
          <ul className="slots">
            {slots.map((s) => (
              <li key={`${s.problem.id}-${s.kind}`} className={`slot slot--${s.kind}${s.thin ? ' is-thin' : ''}`}>
                <span className="slot__diamond" style={{ ['--accent' as string]: house.accent }} />
                <div>
                  <b>{shortName(s.problem.id)}</b>
                  <span className="slot__meta">
                    {s.kind === 'main' ? `ruang utama · ${pct(s.problem.share[r])}` : s.kind === 'support' ? `ruang pendukung · ${pct(s.problem.share[r])}` : `hanya rencana tim · data: ${RUANG_SHORT[s.problem.main]}`}
                    {' · '}<span className={`verdict verdict--${s.problem.verdict}`}>{VERDICT_LABEL[s.problem.verdict]}</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <p className="muted small">◆ berisi = mengalir ke sini menurut aspirasi · ◇ kosong = hanya direncanakan tim.</p>
        </>
      )}

      {tab === 'kata' && (
        <>
          <h3 className="section__title">Kata solusi</h3>
          <div className="kws">
            {DATA.anchors[r].map((w) => (
              <span key={w} className="kw kw--accent" style={{ ['--accent' as string]: house.accent }}>{w}</span>
            ))}
          </div>
          <h3 className="section__title">Isu teratas ({WORD_COUNT[r]} isu dekat ruang ini)</h3>
          <div className="bars">
            {words.map((w) => (
              <Bar key={w.id} value={w.f / words[0].f} color={house.accent} label={w.id} right={`${w.f}`} />
            ))}
          </div>
        </>
      )}

      {tab === 'beban' && (
        <>
          <div className="stats stats--3">
            <Stat value={load.plan} label="rencana tim" />
            <Stat value={load.data} label="menurut aspirasi" />
            <Stat value={load.delta > 0 ? `+${load.delta}` : load.delta < 0 ? `−${-load.delta}` : '±0'} label="selisih" />
          </div>
          <p className="panel__text">
            {load.data} masalah utama{load.thin ? ` (+${load.thin} berdata tipis)` : ''}, {load.support} pendukung, {load.planOnly} hanya rencana.
          </p>
          <h3 className="section__title">Keyakinan masalah terkait</h3>
          <div className="bars">
            {slots.filter((s) => s.kind !== 'plan').map((s) => (
              <Bar key={s.problem.id} value={s.problem.p_main} color={house.accent} label={shortName(s.problem.id)} right={`${pct(s.problem.p_main)} · ${s.problem.var_same}/${s.problem.n_var}`} />
            ))}
          </div>
          <p className="muted small">Persen = seberapa sering ruang terdekat tetap sama saat aspirasi diacak ulang; n/6 = definisi kata solusi yang sepakat.</p>
        </>
      )}
    </>
  )
}

function MoveContent() {
  const replay = useStore((s) => s.replayMove)
  return (
    <>
      <Head eyebrow={STEP_TEXT.move.eyebrow} title={STEP_TEXT.move.heading} icon="move" accent="#5b6475" />
      {STEP_TEXT.move.body.map((t) => (
        <p key={t} className="panel__text">{t}</p>
      ))}
      <div className="stats stats--3">
        <Stat value={MOVE_SUMMARY.sesuai} label="sesuai rencana" />
        <Stat value={MOVE_SUMMARY.pindah} label="pindah ruang" />
        <Stat value={MOVE_SUMMARY.kurang} label="data belum cukup" />
      </div>
      <button type="button" className="btn" onClick={replay}>Putar ulang perpindahan</button>
      <ul className="moves">
        {PROBLEMS.map((p) => {
          const moved = !p.plan.includes(p.main)
          return (
            <li key={p.id} className="move">
              <b>{shortName(p.id)}</b>
              <span>
                {p.plan.map((r) => RUANG_SHORT[r]).join('/')} → <span style={{ color: RUANG_ACCENT[p.main] }}>{RUANG_SHORT[p.main]}</span>
                {p.verdict === 'kurang' ? <span className="tag tag--thin">?</span> : moved ? <span className="tag tag--move">⇄</span> : null}
              </span>
            </li>
          )
        })}
      </ul>
      <p className="muted small">⇄ = pindah ruang · ? = data belum cukup</p>
    </>
  )
}

function LoadContent() {
  return (
    <>
      <Head eyebrow={STEP_TEXT.load.eyebrow} title={STEP_TEXT.load.heading} icon="load" accent="#5b6475" />
      {STEP_TEXT.load.body.map((t) => (
        <p key={t} className="panel__text">{t}</p>
      ))}
      <table className="table">
        <thead>
          <tr><th>Ruang</th><th>Rencana → data</th><th title="utama">◆</th><th title="pendukung">◈</th><th title="data kurang">?</th><th title="hanya rencana">○</th></tr>
        </thead>
        <tbody>
          {RUANG_KEYS.map((r) => {
            const l = ruangLoad(r)
            return (
              <tr key={r}>
                <td><span className="dot" style={{ background: RUANG_ACCENT[r] }} />{RUANG_SHORT[r]}</td>
                <td className={l.delta > 0 ? 'up' : l.delta < 0 ? 'down' : ''}>{l.plan} → {l.data} ({l.delta > 0 ? `+${l.delta}` : l.delta < 0 ? `−${-l.delta}` : '±0'})</td>
                <td>{l.data}</td><td>{l.support}</td><td>{l.thin}</td><td>{l.planOnly}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="muted small">◆ utama · ◈ pendukung · ? data belum cukup · ○ hanya rencana</p>
    </>
  )
}

function ConfidenceContent() {
  return (
    <>
      <Head eyebrow={STEP_TEXT.confidence.eyebrow} title={STEP_TEXT.confidence.heading} icon="confidence" accent="#5b6475" />
      {STEP_TEXT.confidence.body.map((t) => (
        <p key={t} className="panel__text">{t}</p>
      ))}
      <ProblemChips ids={PROBLEMS_BY_STABILITY.map((p) => p.id)} />
      <div className="bars">
        {PROBLEMS_BY_STABILITY.map((p) => (
          <Bar key={p.id} value={p.p_main} color={RUANG_ACCENT[p.main]} label={shortName(p.id)} right={`${pct(p.p_main)} · ${p.var_same}/${p.n_var}${p.one_person ? ' · 1 agent' : ''}`} />
        ))}
      </div>
      <p className="muted small">Cincin luar = ruang tetap sama; cincin dalam = definisi kata solusi yang sepakat. "1 agent" = hasil berubah bila aspirasi satu agent dikeluarkan.</p>
    </>
  )
}

function RelationsContent() {
  const selected = useStore((s) => s.selectedProblem)
  const selectProblem = useStore((s) => s.selectProblem)
  const strong = RELATIONS_SORTED.filter((r) => r.level === 'kuat')
  const medium = RELATIONS_SORTED.filter((r) => r.level === 'sedang')
  return (
    <>
      <Head eyebrow={STEP_TEXT.relations.eyebrow} title={STEP_TEXT.relations.heading} icon="relations" accent="#5b6475" />
      {STEP_TEXT.relations.body.map((t) => (
        <p key={t} className="panel__text">{t}</p>
      ))}
      <div className="stats stats--4">
        <Stat value={RELATION_LEVEL_COUNT.kuat} label="kuat" />
        <Stat value={RELATION_LEVEL_COUNT.sedang} label="sedang" />
        <Stat value={RELATION_LEVEL_COUNT.lemah} label="lemah" />
        <Stat value={RELATION_LEVEL_COUNT.tidak} label="tidak" />
      </div>
      <ProblemChips />
      {[['Kuat', strong], ['Sedang', medium]].map(([label, list]) => (
        <section key={label as string}>
          <h3 className="section__title">{label as string}</h3>
          <ul className="pairs">
            {(list as typeof strong).map((r) => (
              <li key={`${r.a}-${r.b}`} className={selected && (r.a === selected || r.b === selected) ? 'is-active' : ''}>
                <button type="button" className="pair" onClick={() => selectProblem(r.a === selected ? r.b : r.a)}>
                  <b>{shortName(r.a)} – {shortName(r.b)}</b>
                  <span>{r.lines ? `${r.lines} aspirasi dari ${r.people} agent` : 'lewat kata jembatan'}{r.shared.length ? ` · kata bersama: ${r.shared.join(', ')}` : ''} · lift {r.lift}×</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <Matrix />
    </>
  )
}

function Matrix() {
  const selected = useStore((s) => s.selectedProblem)
  const ids = PROBLEM_ORDER
  return (
    <div className="matrix" aria-label="Matriks hubungan">
      <div className="matrix__row matrix__row--head">
        <span />
        {ids.map((id) => (
          <span key={id} className="matrix__col" title={shortName(id)}>{shortName(id).split(/[ /]/)[0].slice(0, 5)}</span>
        ))}
      </div>
      {ids.map((a) => (
        <div key={a} className={`matrix__row${selected === a ? ' is-active' : ''}`}>
          <span className="matrix__label">{shortName(a)}</span>
          {ids.map((b) => {
            const rel = a === b ? null : relationBetween(a, b)
            const lvl = rel?.level ?? 'tidak'
            return <span key={b} className={`cell cell--${a === b ? 'self' : lvl}`} title={rel ? `${shortName(a)} – ${shortName(b)}: ${lvl}` : ''} />
          })}
        </div>
      ))}
      <p className="muted small">Makin terang = makin erat. Kosong = tidak pernah dibahas bersama.</p>
    </div>
  )
}

/** Sorotan takeaway yang sudah dinormalisasi (referensi stabil untuk perbandingan). */
const TAKEAWAY_HL = TAKEAWAYS.map((t) => ({ problems: t.highlight.problems ?? [], ruang: t.highlight.ruang ?? [] }))

function ClosingContent() {
  const highlight = useStore((s) => s.highlight)
  const setHighlight = useStore((s) => s.setHighlight)
  const active = highlight ? TAKEAWAY_HL.indexOf(highlight) : -1
  return (
    <>
      <Head eyebrow={STEP_TEXT.closing.eyebrow} title={STEP_TEXT.closing.heading} icon="closing" accent="#5b6475" />
      <div className="stats stats--3">
        <Stat value={MOVE_SUMMARY.sesuai} label="sesuai rencana" />
        <Stat value={MOVE_SUMMARY.pindah} label="pindah ruang" />
        <Stat value={MOVE_SUMMARY.kurang} label="data kurang" />
      </div>
      <ol className="takeaways">
        {TAKEAWAYS.map((t, i) => (
          <li key={t.title} className={`takeaway${active === i ? ' is-active' : ''}`}>
            <button type="button" className="takeaway__btn" onClick={() => setHighlight(active === i ? null : TAKEAWAY_HL[i])} aria-pressed={active === i}>
              <span className="takeaway__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="takeaway__title">{t.title}</span>
            </button>
            {active === i && (
              <div className="takeaway__body">
                <p>{t.body}</p>
                <p className="muted small">{t.evidence}</p>
                <p className="takeaway__action">→ {t.action}</p>
              </div>
            )}
          </li>
        ))}
      </ol>
      <h3 className="section__title">Langkah berikutnya</h3>
      <ol className="plain plain--num">
        {NEXT_STEPS.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ol>
      <p className="muted small">Validasi: {VERDICT_COUNT.didukung} didukung, {VERDICT_COUNT.sebagian} sebagian, {VERDICT_COUNT.tidak} tidak didukung, {VERDICT_COUNT.kurang} data kurang. Klik takeaway untuk menyorot rumah atau masalahnya.</p>
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
    case 'house':
      return <HouseContent step={step} />
    case 'move':
      return <MoveContent />
    case 'load':
      return <LoadContent />
    case 'confidence':
      return <ConfidenceContent />
    case 'relations':
      return <RelationsContent />
    case 'closing':
    default:
      return <ClosingContent />
  }
}

export function stepAccent(stepIndex: number) {
  const step = stepAt(stepIndex)
  return step.kind === 'house' ? HOUSES[step.houseIndex!].accent : '#5b6475'
}

export const STEP_COUNT = STEPS.length
export const houseIndexOf = (r: RuangKey) => HOUSE_INDEX[r]
