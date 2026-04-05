'use client'
import DiffViewer from '@/components/DiffViewer'
import DiffSummary from '@/components/DiffSummary'
import ErrorBoundary from '@/components/ErrorBoundary'
import { useDocStore } from '@/lib/store'

export default function AppShell({ syncScroll, setSyncScroll }) {
  const { docs } = useDocStore()
  const hasDiff  = docs.length >= 2

  return (
    <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 h-9 border-b border-zinc-800/60 bg-zinc-950/80">
        <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />
            {docs.length} Document{docs.length > 1 ? 's' : ''}
          </span>
          {hasDiff && (
            <>
              <span className="flex items-center gap-1.5 hidden sm:flex">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Added
              </span>
              <span className="flex items-center gap-1.5 hidden sm:flex">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />Removed
              </span>
            </>
          )}
          {!hasDiff && (
            <span className="text-blue-400">Add one more document to start comparing</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-600 font-semibold hidden sm:block">Sync Scroll</span>
          <button
            role="switch" aria-checked={syncScroll}
            aria-label="Toggle synchronized scrolling"
            onClick={() => setSyncScroll((v) => !v)}
            className={`w-8 h-4 rounded-full transition-colors relative flex-shrink-0 ${syncScroll ? 'bg-blue-700' : 'bg-zinc-700'}`}
          >
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${syncScroll ? 'right-0.5' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      <ErrorBoundary>
        <DiffViewer syncScroll={syncScroll} />
      </ErrorBoundary>

      {hasDiff && (
        <ErrorBoundary>
          <DiffSummary />
        </ErrorBoundary>
      )}
    </main>
  )
}
