'use client'
import { useDocStore } from '@/lib/store'
import { exportSummary } from '@/lib/diffEngine'

export default function Header({ libsReady }) {
  const { docs, referenceId, setReference, clearAll } = useDocStore()
  const hasDocs = docs.length >= 2

  function handleExport() {
    const ok = exportSummary(docs, referenceId)
    if (!ok) alert('No differences found to export.')
  }

  return (
    <header className="h-16 flex-shrink-0 border-b border-zinc-800/80 bg-zinc-950 flex items-center justify-between px-6 z-30">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center blue-glow flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
          </svg>
        </div>
        <div>
          <div className="font-brand font-bold text-[17px] tracking-tight bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent leading-tight">
            DocxLens
          </div>
          <div className="text-[9px] text-zinc-600 font-bold tracking-[2px] uppercase leading-none">
            Analyzer &amp; Comparison Engine
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!libsReady && (
          <div className="flex items-center gap-2 text-zinc-500 text-xs animate-pulse">
            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <span className="font-medium hidden sm:block">Loading engine…</span>
          </div>
        )}

        {hasDocs && (
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider hidden sm:block">Ref</span>
            <select
              value={referenceId ?? ''}
              onChange={(e) => setReference(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 font-medium outline-none cursor-pointer max-w-[140px] truncate"
              aria-label="Select reference document"
            >
              {docs.map((d) => (
                <option key={d.id} value={d.id} className="bg-zinc-900 truncate">{d.name}</option>
              ))}
            </select>
          </div>
        )}

        {hasDocs && (
          <button
            onClick={handleExport}
            aria-label="Export diff summary"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 hover:border-blue-700 hover:text-blue-400 transition-all px-3 py-1.5 rounded-xl"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span className="hidden sm:block">Export</span>
          </button>
        )}

        {docs.length > 0 && (
          <button
            onClick={() => { if (confirm('Clear all documents?')) clearAll() }}
            className="text-xs text-zinc-600 hover:text-red-400 transition-colors font-medium px-1"
            aria-label="Clear all documents"
          >
            Clear all
          </button>
        )}
      </div>
    </header>
  )
}
