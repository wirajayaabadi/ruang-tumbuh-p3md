/**
 * Elemen video prolog tunggal. Dibuat dan "dibuka kuncinya" di dalam gestur pengguna
 * (klik Let's Explore) agar browser mengizinkan pemutaran bersuara beberapa detik kemudian,
 * sekaligus mulai mengunduh video selama layar pemuatan.
 */
const SRC_HD = `${import.meta.env.BASE_URL}prolog-720.mp4`
const SRC_SD = `${import.meta.env.BASE_URL}prolog-480.mp4`

let el: HTMLVideoElement | null = null
let unlocked = false

export function getPrologueVideo(): HTMLVideoElement {
  if (el) return el
  const v = document.createElement('video')
  v.className = 'prologue__video'
  v.playsInline = true
  v.setAttribute('playsinline', '')
  v.preload = 'auto'
  v.src = window.innerWidth > 900 ? SRC_HD : SRC_SD
  v.muted = false
  v.volume = 1
  v.load()
  el = v
  return v
}

/** Panggil dari handler klik: memutar sesaat lalu menjeda, sehingga elemen "diizinkan" bersuara nanti. */
export function unlockPrologueVideo() {
  const v = getPrologueVideo()
  const p = v.play()
  if (!p) return
  p.then(() => {
    unlocked = true
    v.pause()
    v.currentTime = 0
  }).catch(() => {
    /* ditangani saat prolog diputar: akan mencoba lagi, lalu fallback bisu + tombol suara */
  })
}

export const isPrologueUnlocked = () => unlocked

// Hanya saat pengembangan: untuk pengujian otomatis.
if (import.meta.env.DEV) (window as unknown as { __prologueUnlocked?: () => boolean }).__prologueUnlocked = isPrologueUnlocked
