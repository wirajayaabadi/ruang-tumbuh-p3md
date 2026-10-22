import { useStore } from '../store/useStore'
import { AspirasiForm } from './AspirasiForm'

/** Jendela ajakan menulis aspirasi yang tampil tepat setelah video prolog. */
export function AspirasiModal() {
  const open = useStore((s) => s.aspirasiPrompt)
  const close = useStore((s) => s.closeAspirasiPrompt)
  if (!open) return null
  return (
    <div className="asp-modal" role="dialog" aria-modal="true" aria-labelledby="aspirasi-modal-title">
      <div className="asp-modal__card">
        <button type="button" className="asp-modal__close" onClick={close} aria-label="Tutup dan jelajahi peta">
          ×
        </button>
        <AspirasiForm variant="modal" onContinue={close} />
      </div>
    </div>
  )
}
