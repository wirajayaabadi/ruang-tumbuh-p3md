/**
 * Musik latar ambien ruang angkasa, disintesis prosedural dengan Web Audio (tanpa aset).
 * Lapisan: dengung bass, pad akor yang silih berganti lambat (osilator detune + filter LFO),
 * reverb konvolusi dari impuls derau, dan denting bintang pentatonik acak.
 */

const CHORDS: number[][] = [
  // D minor 9 → Bb maj7 → F maj9 → C add9  (frekuensi dalam Hz, oktaf rendah-menengah)
  [146.83, 174.61, 220.0, 261.63, 329.63],
  [116.54, 174.61, 220.0, 261.63, 349.23],
  [174.61, 220.0, 261.63, 329.63, 392.0],
  [130.81, 196.0, 261.63, 293.66, 392.0],
]
const SPARKLE = [587.33, 698.46, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98]
const CHORD_SEC = 14
const XFADE_SEC = 5

class SpaceAmbience {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private reverb: ConvolverNode | null = null
  private chordTimer = 0
  private sparkleTimer = 0
  private chordIdx = 0
  private running = false
  private muted = false
  private volume = 0.22
  private pads: Array<{ stop: (t: number) => void }> = []

  get isRunning() {
    return this.running
  }

  /** Harus dipanggil dari gestur pengguna (klik). */
  start() {
    if (this.running) {
      void this.ctx?.resume()
      return
    }
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    this.ctx = ctx
    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    this.master = master

    // reverb: impuls derau meluruh 5 detik
    const seconds = 5
    const len = Math.floor(ctx.sampleRate * seconds)
    const impulse = ctx.createBuffer(2, len, ctx.sampleRate)
    for (let c = 0; c < 2; c++) {
      const d = impulse.getChannelData(c)
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6)
    }
    const reverb = ctx.createConvolver()
    reverb.buffer = impulse
    const wet = ctx.createGain()
    wet.gain.value = 0.55
    reverb.connect(wet)
    wet.connect(master)
    this.reverb = reverb

    this.running = true
    this.startDrone()
    this.chordIdx = 0
    this.playChord(this.chordIdx)
    this.scheduleNextChord()
    this.scheduleSparkle()
    this.setMuted(this.muted) // ramp master ke volume
    void ctx.resume()
  }

  stop() {
    if (!this.running || !this.ctx) return
    const t = this.ctx.currentTime
    this.master?.gain.cancelScheduledValues(t)
    this.master?.gain.linearRampToValueAtTime(0, t + 1.2)
    window.clearTimeout(this.chordTimer)
    window.clearTimeout(this.sparkleTimer)
    this.pads.forEach((p) => p.stop(t + 1.5))
    this.pads = []
    const ctx = this.ctx
    window.setTimeout(() => void ctx.close(), 1800)
    this.ctx = null
    this.running = false
  }

  setMuted(m: boolean) {
    this.muted = m
    if (!this.ctx || !this.master) return
    const t = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(t)
    this.master.gain.setValueAtTime(this.master.gain.value, t)
    this.master.gain.linearRampToValueAtTime(m ? 0 : this.volume, t + (m ? 0.8 : 2.5))
    if (!m) void this.ctx.resume()
  }

  private out(node: AudioNode, dry = 0.6) {
    const g = this.ctx!.createGain()
    g.gain.value = dry
    node.connect(g)
    g.connect(this.master!)
    node.connect(this.reverb!)
  }

  private startDrone() {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 36.71 // D1
    const osc2 = ctx.createOscillator()
    osc2.type = 'triangle'
    osc2.frequency.value = 73.42
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 160
    const g = ctx.createGain()
    g.gain.value = 0
    g.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 6)
    osc.connect(lp)
    osc2.connect(lp)
    lp.connect(g)
    this.out(g, 0.8)
    osc.start()
    osc2.start()
    this.pads.push({
      stop: (t) => {
        g.gain.linearRampToValueAtTime(0, t)
        osc.stop(t + 0.1)
        osc2.stop(t + 0.1)
      },
    })
  }

  private playChord(idx: number) {
    const ctx = this.ctx!
    const now = ctx.currentTime
    const notes = CHORDS[idx % CHORDS.length]
    const chordGain = ctx.createGain()
    chordGain.gain.setValueAtTime(0, now)
    chordGain.gain.linearRampToValueAtTime(0.1, now + XFADE_SEC)
    chordGain.gain.setValueAtTime(0.1, now + CHORD_SEC)
    chordGain.gain.linearRampToValueAtTime(0, now + CHORD_SEC + XFADE_SEC)
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 700
    lp.Q.value = 0.7
    // LFO lambat pada cutoff → pad "bernapas"
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.07 + Math.random() * 0.05
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 320
    lfo.connect(lfoGain)
    lfoGain.connect(lp.frequency)
    lfo.start()
    lp.connect(chordGain)
    this.out(chordGain, 0.5)

    const oscs: OscillatorNode[] = []
    notes.forEach((f, i) => {
      for (const det of [-6, 5]) {
        const o = ctx.createOscillator()
        o.type = i === 0 ? 'triangle' : 'sawtooth'
        o.frequency.value = f
        o.detune.value = det + (Math.random() - 0.5) * 4
        const g = ctx.createGain()
        g.gain.value = i === 0 ? 0.5 : 0.22
        o.connect(g)
        g.connect(lp)
        o.start()
        oscs.push(o)
      }
    })
    const stopAt = now + CHORD_SEC + XFADE_SEC + 0.5
    oscs.forEach((o) => o.stop(stopAt))
    lfo.stop(stopAt)
    this.pads.push({
      stop: (t) => {
        chordGain.gain.cancelScheduledValues(t)
        chordGain.gain.linearRampToValueAtTime(0, t)
      },
    })
    // bersihkan referensi pad lama
    if (this.pads.length > 6) this.pads.splice(1, this.pads.length - 6)
  }

  private scheduleNextChord() {
    this.chordTimer = window.setTimeout(() => {
      if (!this.running) return
      this.chordIdx = (this.chordIdx + 1) % CHORDS.length
      this.playChord(this.chordIdx)
      this.scheduleNextChord()
    }, CHORD_SEC * 1000)
  }

  private scheduleSparkle() {
    this.sparkleTimer = window.setTimeout(() => {
      if (!this.running || !this.ctx) return
      const ctx = this.ctx
      const now = ctx.currentTime
      const f = SPARKLE[Math.floor(Math.random() * SPARKLE.length)]
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = f
      const g = ctx.createGain()
      g.gain.setValueAtTime(0, now)
      g.gain.linearRampToValueAtTime(0.06, now + 0.03)
      g.gain.exponentialRampToValueAtTime(0.0008, now + 2.4)
      const pan = ctx.createStereoPanner()
      pan.pan.value = Math.random() * 1.6 - 0.8
      o.connect(g)
      g.connect(pan)
      this.out(pan, 0.35)
      o.start(now)
      o.stop(now + 2.6)
      this.scheduleSparkle()
    }, 1800 + Math.random() * 4200)
  }
}

export const spaceAmbience = new SpaceAmbience()
