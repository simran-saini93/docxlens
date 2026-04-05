'use client'
import { useEffect } from 'react'
import { useDocStore } from '@/lib/store'

export default function Toast() {
  const { error, clearError } = useDocStore()

  useEffect(() => {
    if (!error) return
    const t = setTimeout(clearError, 6000)
    return () => clearTimeout(t)
  }, [error, clearError])

  if (!error) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 fade-up pointer-events-none">
      <div className="bg-zinc-900 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl flex items-start gap-3 shadow-2xl pointer-events-auto">
        <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p className="text-sm font-medium flex-1 leading-relaxed">{error}</p>
        <button onClick={clearError} className="text-zinc-600 hover:text-zinc-300 transition-colors flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
