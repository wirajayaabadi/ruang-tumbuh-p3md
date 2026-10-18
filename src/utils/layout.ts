/** Konstanta ukuran UI (px). Harus konsisten dengan nilai CSS di index.css. */
export const UI = {
  topBar: 64,
  bottomBar: 84,
  panelMaxWidth: 440,
  panelWidthFraction: 0.4,
  panelMargin: 20,
  sheetMaxHeight: 340,
  sheetHeightFraction: 0.42,
}

/** Fraksi viewport yang tertutup elemen UI, dipakai untuk menggeser framing kamera. */
export interface Layout {
  top: number
  bottomBar: number
  panelRight: number
  panelBottom: number
  panelSide: 'right' | 'bottom'
  isSmall: boolean
}

export function computeLayout(w: number, h: number): Layout {
  const aspect = w / h
  const isSmall = w < 820 || aspect < 1.05
  if (isSmall) {
    const sheet = Math.min(UI.sheetMaxHeight, h * UI.sheetHeightFraction)
    return {
      top: UI.topBar / h,
      bottomBar: UI.bottomBar / h,
      panelRight: 0,
      panelBottom: sheet / h,
      panelSide: 'bottom',
      isSmall,
    }
  }
  const panelWidth = Math.min(UI.panelMaxWidth, w * UI.panelWidthFraction)
  return {
    top: UI.topBar / h,
    bottomBar: UI.bottomBar / h,
    panelRight: (panelWidth + UI.panelMargin * 2) / w,
    panelBottom: 0,
    panelSide: 'right',
    isSmall,
  }
}
