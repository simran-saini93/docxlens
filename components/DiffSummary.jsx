'use client'
import { useMemo } from 'react'
import { useDocStore } from '@/lib/store'
import { buildSummary, exportSummary } from '@/lib/diffEngine'
import { track } from '@/lib/analytics'

export default function DiffSummary() {
  const { docs, referenceId } = useDocStore()

  const summary = useMemo(() => {
    if (docs.length < 2) return []
    return buildSummary(docs, referenceId)
  }, [docs, referenceId])

  const grouped = useMemo(() => {
    const g = {}
    for (const item of summary) {
      if (!g[item.docId]) g[item.docId] = { name: item.docName, items: [] }
      g[item.docId].items.push(item)
    }
    return g
  }, [summary])

  const totalAdded   = useMemo(() => summary.filter((s) => s.type === 'added').length,   [summary])
  const totalRemoved = useMemo(() => summary.filter((s) => s.type === 'removed').length, [summary])

  if (!summary.length) return null

  function handleExport() {
    const ok = exportSummary(docs, referenceId)
    if (!ok) alert('No differences found to export.')
    else track('export_clicked', { added: totalAdded, removed: totalRemoved, docs: Object.keys(grouped).length })
  }

  return (
    <div className="flex-shrink-0 border-t border-zinc-800/80 bg-zinc-950" style={{ height: '156px' }}>
      {/* Header row */}
      <div className="flex items-center justify-between px-5 border-b border-zinc-800/60 h-9">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Diff Summary</span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block flex-shrink-0" />
            {totalAdded} added
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block flex-shrink-0" />
            {totalRemoved} removed
          </span>
          <span className="text-[10px] text-zinc-600 hidden sm:block">
            {summary.length} total · {Object.keys(grouped).length} doc{Object.keys(grouped).length > 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={handleExport}
          aria-label="Export diff summary as text file"
          className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 hover:text-blue-400 border border-zinc-800 hover:border-blue-700/50 px-2.5 py-1 rounded-lg transition-all"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export .txt
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex gap-10 px-5 py-3 overflow-x-auto overflow-y-auto thin-scroll" style={{ height: '115px' }}>
        {Object.entries(grouped).map(([docId, { name, items }]) => (
          <div key={docId} className="flex-shrink-0 min-w-[200px]">
            <div className="text-[10px] font-bold text-blue-500 mb-2 truncate max-w-[240px]" title={name}>
              {name}
              <span className="text-zinc-600 font-normal ml-1">— {items.length} diff{items.length > 1 ? 's' : ''}</span>
            </div>
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 font-mono text-[10px] py-[2px]">
                <span className="text-zinc-700 w-8 text-right flex-shrink-0 tabular-nums">L{item.lineNumber}</span>
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded flex-shrink-0 ${
                  item.type === 'added' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {item.type === 'added' ? 'ADD' : 'DEL'}
                </span>
                <span className="text-zinc-600 truncate max-w-[180px]" title={item.text}>
                  {item.text || '(empty line)'}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
