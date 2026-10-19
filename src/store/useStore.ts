import { create } from 'zustand'
import { STEPS, STEP_LAST, stepAt, type HouseTab, type Theme } from '../config/presentation'
import { computeLayout, type Layout } from '../utils/layout'

export type Phase = 'idle' | 'traveling' | 'arrived'

interface State {
  started: boolean
  /** layar pemuatan setelah 'Mulai Presentasi' */
  loading: boolean
  /** indeks ke STEPS */
  step: number
  phase: Phase
  panelVisible: boolean
  explore: boolean
  introDone: boolean
  reducedMotion: boolean
  layout: Layout
  theme: Theme
  tab: HouseTab
  /** masalah yang disorot di inti */
  selectedProblem: string | null
  travelId: number
  pulseId: number

  start: () => void
  finishLoading: () => void
  goTo: (step: number) => void
  next: () => void
  prev: () => void
  toMap: () => void
  setArrived: () => void
  setExplore: (on: boolean) => void
  setLayout: (l: Layout) => void
  setIntroDone: () => void
  setReducedMotion: (v: boolean) => void
  setTab: (tab: HouseTab) => void
  selectProblem: (id: string | null) => void
  setTheme: (t: Theme) => void
  toggleTheme: () => void
}

export const isHouseStep = (s: number) => stepAt(s).kind === 'house'
export const stepKind = (s: number) => stepAt(s).kind
/** Semua langkah punya panel materi kecuali saat eksplorasi. */
export const stepHasPanel = (s: number) => s >= 0 && s < STEPS.length

const initialLayout =
  typeof window !== 'undefined' ? computeLayout(window.innerWidth, window.innerHeight) : computeLayout(1280, 800)

function readTheme(): Theme {
  try {
    const t = localStorage.getItem('rt-theme')
    if (t === 'dark' || t === 'light') return t
  } catch {
    /* abaikan */
  }
  // default: tema gelap bernuansa alam semesta
  return 'dark'
}

function applyTheme(t: Theme) {
  document.documentElement.setAttribute('data-theme', t)
  try {
    localStorage.setItem('rt-theme', t)
  } catch {
    /* abaikan */
  }
}

const initialTheme = readTheme()
if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', initialTheme)

export const useStore = create<State>((set, get) => ({
  started: false,
  loading: false,
  step: 0,
  phase: 'idle',
  panelVisible: false,
  explore: false,
  introDone: false,
  reducedMotion: false,
  layout: initialLayout,
  theme: initialTheme,
  tab: 'ringkasan',
  selectedProblem: null,
  travelId: 0,
  pulseId: 0,

  start: () => {
    // Memulai = layar pemuatan dulu; panel pembuka tampil setelah pemuatan selesai.
    set({ started: true, loading: true, phase: 'arrived', panelVisible: false })
  },
  finishLoading: () => {
    const s = get()
    set({ loading: false, panelVisible: stepHasPanel(s.step) && !s.explore })
  },

  goTo: (step) => {
    const s = get()
    const clamped = Math.max(0, Math.min(STEP_LAST, step))
    if (clamped === s.step && s.phase !== 'idle' && !s.explore) return
    set({
      step: clamped,
      started: true,
      phase: 'traveling',
      panelVisible: false,
      explore: false,
      tab: 'ringkasan',
      selectedProblem: null,
          travelId: s.travelId + 1,
      pulseId: s.pulseId + 1,
    })
  },

  next: () => {
    const s = get()
    if (s.step < STEP_LAST) s.goTo(s.step + 1)
  },
  prev: () => {
    const s = get()
    if (s.step > 0) s.goTo(s.step - 1)
  },
  toMap: () => get().goTo(0),

  setArrived: () => {
    const s = get()
    set({ phase: 'arrived', panelVisible: stepHasPanel(s.step) && !s.explore })
  },

  setExplore: (on) => {
    const s = get()
    if (on === s.explore) return
    if (on) set({ explore: true, panelVisible: false })
    else set({ explore: false, phase: 'traveling', panelVisible: false, travelId: s.travelId + 1 })
  },

  setLayout: (layout) => set({ layout }),
  setIntroDone: () => set({ introDone: true }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setTab: (tab) => set({ tab }),
  selectProblem: (id) => set((s) => ({ selectedProblem: s.selectedProblem === id ? null : id })),
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
  toggleTheme: () => get().setTheme(get().theme === 'light' ? 'dark' : 'light'),
}))
