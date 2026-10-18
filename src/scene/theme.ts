import { PALETTES, type Palette, type Theme } from '../config/presentation'
import { useStore } from '../store/useStore'

export const paletteOf = (t: Theme): Palette => PALETTES[t]
export const usePalette = () => useStore((s) => PALETTES[s.theme])
export const currentPalette = () => PALETTES[useStore.getState().theme]
