'use client'
import { useDocStore } from '@/lib/store'

export default function ProcessingOverlay() {
  const { processing } = useDocStore()
  if (!processing) return null

  const isOcr = processing.status?.toLowerCase().includes('ocr')

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl fade-up">
        {/* Animated icon */}
        <div className="w-16 h-16 mx-auto mb-5 relative">
          <div className="w-16 h-16 rounded-full border-2 border-zinc-800" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-t-blue-700 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            {isOcr ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <path d="M8 21h8M12 17v4"/>
                <path d="M7 7h.01M11 7h.01M15 7h.01M7 11h10"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            )}
          </div>
        </div>

        <p className="text-sm font-bold text-white mb-1 truncate px-2" title={processing.filename}>
          {processing.filename}
        </p>
        <p className="text-xs text-zinc-400 mb-4">{processing.status}</p>

        {isOcr && (
          <div className="bg-blue-700/10 border border-blue-700/20 rounded-xl px-4 py-3 text-left">
            <p className="text-[11px] text-blue-400 font-semibold mb-1">🔍 OCR in progress</p>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              This PDF contains scanned images. Tesseract OCR is extracting text from each page — this may take a moment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
