import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

export default function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white dark:bg-[#121212] border border-transparent dark:border-[#27272a] shadow-xl mb-16 sm:mb-0 transition-colors"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
      >
        <div className="flex items-center justify-between border-b border-[#e5e7eb] dark:border-[#27272a] px-6 py-4 transition-colors">
          <h2
            className="text-[18px] font-semibold text-[#111111] dark:text-white transition-colors"
            style={{ letterSpacing: '-0.3px' }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b7280] dark:text-[#a1a1aa] transition-colors hover:bg-[#f5f5f5] dark:hover:bg-[#27272a] hover:text-[#111111] dark:hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
