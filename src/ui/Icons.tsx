import type { RuangKey } from '../data/types'

export type IconName = RuangKey | 'network' | 'flow' | 'move' | 'load' | 'confidence' | 'relations' | 'closing' | 'sun' | 'moon' | 'book' | 'sound' | 'mute'

interface Props {
  name: IconName
  color?: string
  size?: number
}

/** Ikon SVG sederhana (inline, tanpa aset eksternal). */
export function Icon({ name, color = 'currentColor', size = 40 }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  switch (name) {
    case 'bersama':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.2" />
          <circle cx="17" cy="9.5" r="2.4" />
          <path d="M3.5 19c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" />
          <path d="M15.5 18.5c.3-2.4 1.8-3.8 4-3.8 1 0 1.9.3 2.5.8" />
        </svg>
      )
    case 'belajar':
    case 'book':
      return (
        <svg {...common}>
          <path d="M4 5.5A2 2 0 0 1 6 4h5.5v15H6a2 2 0 0 0-2 2z" />
          <path d="M20 5.5A2 2 0 0 0 18 4h-5.5v15H18a2 2 0 0 1 2 2z" />
          <path d="M6.5 8h3M6.5 11h3M14.5 8h3M14.5 11h3" />
        </svg>
      )
    case 'inovasi':
      return (
        <svg {...common}>
          <path d="M9 18h6M10 21h4" />
          <path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z" />
          <path d="M12 7.5v3.5" />
        </svg>
      )
    case 'aman':
      return (
        <svg {...common}>
          <path d="M12 3l7 3v5.5c0 4.5-3 7.8-7 9.5-4-1.7-7-5-7-9.5V6z" />
          <path d="M9 12l2 2 4-4.5" />
        </svg>
      )
    case 'masa':
      return (
        <svg {...common}>
          <path d="M14.5 3.5c3.2.2 5.8 2.8 6 6-2.6 2.3-5.4 4.6-8.5 6.5l-4-4c1.9-3.1 4.2-5.9 6.5-8.5z" />
          <circle cx="15" cy="9" r="1.4" />
          <path d="M8 12l-3.5 1 2 2M12 16l-1 3.5 2-2M5 19c1-1.3 2-2 3-2" />
        </svg>
      )
    case 'flow':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2.5" />
          <path d="M12 9.5V4M14.2 13.5l4.5 3.5M9.8 13.5l-4.5 3.5" />
          <circle cx="12" cy="3.5" r="1.3" /><circle cx="19.5" cy="17.5" r="1.3" /><circle cx="4.5" cy="17.5" r="1.3" />
        </svg>
      )
    case 'move':
      return (
        <svg {...common}>
          <circle cx="6" cy="12" r="2.2" /><circle cx="18" cy="12" r="2.2" />
          <path d="M8.5 12h7M13 9.5l2.5 2.5-2.5 2.5" />
        </svg>
      )
    case 'load':
      return (
        <svg {...common}>
          <rect x="4" y="13" width="4" height="7" /><rect x="10" y="7" width="4" height="13" /><rect x="16" y="10" width="4" height="10" />
        </svg>
      )
    case 'confidence':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" strokeOpacity="0.3" />
          <path d="M12 4a8 8 0 0 1 8 8" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      )
    case 'relations':
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" />
          <path d="M8 6h8M6 8v8M18 8v8M7.5 7.5l9 9" />
        </svg>
      )
    case 'closing':
      return (
        <svg {...common}>
          <path d="M5 12l4 4L19 6" />
        </svg>
      )
    case 'sun':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )
    case 'moon':
      return (
        <svg {...common}>
          <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
        </svg>
      )
    case 'sound':
      return (
        <svg {...common}>
          <path d="M4 10v4h3l4 3.5v-11L7 10z" />
          <path d="M15 9.5a3.5 3.5 0 0 1 0 5M17.5 7a7 7 0 0 1 0 10" />
        </svg>
      )
    case 'mute':
      return (
        <svg {...common}>
          <path d="M4 10v4h3l4 3.5v-11L7 10z" />
          <path d="M15.5 9.5l5 5M20.5 9.5l-5 5" />
        </svg>
      )
    case 'network':
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2.2" />
          <circle cx="5" cy="6" r="1.8" /><circle cx="19" cy="6" r="1.8" /><circle cx="5" cy="18" r="1.8" /><circle cx="19" cy="18" r="1.8" />
          <path d="M6.4 7.2l4 3.3M17.6 7.2l-4 3.3M6.4 16.8l4-3.3M17.6 16.8l-4-3.3" />
        </svg>
      )
  }
}
