'use client'
import { useState, useEffect } from 'react'
import { useDocStore } from '@/lib/store'
import Header from '@/components/Header'
import AppShell from '@/components/AppShell'
import MarketingPage from '@/components/MarketingPage'
import Toast from '@/components/Toast'
import ProcessingOverlay from '@/components/ProcessingOverlay'
import ErrorBoundary from '@/components/ErrorBoundary'

const CDN_SCRIPTS = [
  { id: 'mammoth-cdn', src: 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js' },
  { id: 'pdfjs-cdn',  src: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js' },
]
const PDF_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

export default function Home() {
  const { docs } = useDocStore()
  const [libsReady, setLibsReady] = useState(false)
  const [syncScroll, setSyncScroll] = useState(true)
  const hasDocs = docs.length >= 1

  useEffect(() => {
    let loaded = 0
    function onLoad() {
      loaded++
      if (loaded === CDN_SCRIPTS.length) {
        if (typeof window !== 'undefined' && window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER
        }
        setLibsReady(true)
      }
    }
    CDN_SCRIPTS.forEach(({ id, src }) => {
      if (document.getElementById(id)) { onLoad(); return }
      const s = Object.assign(document.createElement('script'), { id, src, async: true })
      s.onload = onLoad; s.onerror = onLoad
      document.head.appendChild(s)
    })
  }, [])

  return (
    <>
      <ProcessingOverlay />
      <Toast />
      {hasDocs ? (
        <div className="flex flex-col h-screen bg-black overflow-hidden">
          <Header libsReady={libsReady} syncScroll={syncScroll} setSyncScroll={setSyncScroll} />
          <ErrorBoundary>
            <AppShell syncScroll={syncScroll} setSyncScroll={setSyncScroll} />
          </ErrorBoundary>
          <footer className="flex-shrink-0 h-8 border-t border-zinc-900 bg-zinc-950 flex items-center justify-between px-6">
            <div className="flex items-center gap-5 text-[9px] font-bold text-zinc-700 uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${libsReady ? 'bg-blue-700 pulse-dot' : 'bg-zinc-700'}`} />
                {libsReady ? 'Engine Ready' : 'Loading…'}
              </span>
              <span className="hidden sm:block">Max 5 Docs · 20MB</span>
              <span className="hidden sm:block">100% Private</span>
            </div>
            <span className="text-[9px] text-zinc-800 font-bold tracking-widest uppercase">MultiDiff v1.0</span>
          </footer>
        </div>
      ) : (
        <MarketingPage libsReady={libsReady} />
      )}
    </>
  )
}
