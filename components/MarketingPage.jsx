'use client'
import { useRef } from 'react'
import FileDropZone, { useFileHandler } from '@/components/FileDropZone'
import { useDocStore } from '@/lib/store'

// ── Shared nav ────────────────────────────────────────────────────────────────
function Nav({ onCtaClick }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-6 border-b border-zinc-900/80 bg-black/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-700 rounded-xl flex items-center justify-center blue-glow-sm flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
          </svg>
        </div>
        <span className="font-brand font-bold text-[16px] tracking-tight bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
          DocxLens
        </span>
      </div>
      <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
        <a href="#features"    className="hover:text-white transition-colors">Features</a>
        <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
        <a href="#use-cases"   className="hover:text-white transition-colors">Use cases</a>
        <a href="#faq"         className="hover:text-white transition-colors">FAQ</a>
      </div>
      <button onClick={onCtaClick}
        className="bg-blue-700 hover:bg-blue-600 text-white text-sm font-bold px-5 py-2 rounded-xl transition-all blue-glow-sm">
        Compare Now — Free
      </button>
    </nav>
  )
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ uploadRef, libsReady }) {
  const { processFiles } = useFileHandler()
  const { processing }   = useDocStore()
  const isProcessing     = !!processing

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(29,78,216,0.15) 0%, transparent 65%)' }} />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(29,78,216,0.06) 0%, transparent 70%)' }} />

      <div className="relative z-10 flex flex-col items-center max-w-4xl w-full text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-700/10 border border-blue-700/25 text-blue-400 text-[11px] font-bold tracking-[1.5px] uppercase px-4 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 pulse-dot" />
          Free · No signup · 100% Private
        </div>

        {/* H1 — primary SEO target */}
        <h1 className="text-center font-black text-5xl sm:text-6xl lg:text-[72px] leading-[1.02] tracking-[-3px] text-white mb-6">
          Compare documents<br />
          <span className="text-blue-400">without the risk.</span>
        </h1>
 
        <p className="text-center text-zinc-400 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-4">
          Most document comparison tools upload your files to their servers.
          DocxLens runs <strong className="text-white">100% in your browser</strong> — your contracts,
          legal files, and sensitive documents stay completely private.
        </p>

        {/* Trust signals inline */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10 text-xs text-zinc-500">
          {['✓ PDF with OCR for scanned docs', '✓ Word & Excel', '✓ JSON & Code', '✓ Up to 5 docs at once', '✓ Sync scroll'].map((t) => (
            <span key={t} className="flex items-center gap-1">{t}</span>
          ))}
        </div>

        {/* Drop zone */}
        <FileDropZone className="w-full max-w-2xl border-2 border-dashed border-zinc-800 rounded-3xl p-10 flex flex-col items-center gap-4 cursor-pointer mb-4 relative overflow-hidden">
          {({ dragOver }) => (
            <>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(29,78,216,0.06) 0%, transparent 60%)' }} />
              <div className={`w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center blue-glow transition-transform duration-200 ${dragOver ? 'scale-110' : ''}`}>
                {isProcessing ? (
                  <svg className="animate-spin w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                ) : (
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                )}
              </div>
              <div className="text-center relative z-10">
                <p className="text-xl font-bold text-white">
                  {dragOver ? 'Drop to compare' : 'Drop your files here'}
                </p>
                <p className="text-sm text-zinc-500 mt-1">or click to browse · PDF, DOCX, XLSX, CSV, JSON, TXT, code</p>
              </div>
              <div className="text-xs text-zinc-700 relative z-10">Max 5 documents · 20MB each · 100% processed in your browser</div>
            </>
          )}
        </FileDropZone>

        <p className="text-xs text-zinc-700 mt-2">
          No account. No upload to servers. Works offline once loaded.
        </p>

        {/* Engine loading bar */}
        <div className="w-full max-w-2xl mt-6">
          <div className="w-full h-px bg-zinc-900 rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r from-blue-700 to-blue-500 rounded-full transition-all duration-1000 ${libsReady ? 'w-full' : 'w-2/5 shimmer'}`} />
          </div>
          <p className="text-center text-[10px] text-zinc-700 font-medium mt-1.5">
            {libsReady ? '✓ All processors ready — drag your files above' : 'Loading PDF · DOCX · XLSX processors…'}
          </p>
        </div>
      </div>
    </section>
  )
}

// ── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>,
    icon2: <polyline points="14 2 14 8 20 8"/>,
    title: 'PDF Comparison',
    desc:  'Compare PDF files including scanned documents. Tesseract OCR automatically extracts text from image-based PDFs.',
    badge: 'OCR included',
  },
  {
    icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    title: 'Word Documents',
    desc:  'Full text extraction from .docx and .doc files. Compare contract versions, reports, policies and more.',
    badge: 'DOCX · DOC',
  },
  {
    icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>,
    title: 'Excel & CSV',
    desc:  'Compare spreadsheets sheet by sheet. Cell values, formulas results, and all data columns are compared.',
    badge: 'XLSX · XLS · CSV',
  },
  {
    icon: <><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>,
    title: 'Code & JSON',
    desc:  'Syntax-aware line diff with word-level highlights. Supports JS, TS, Python, Go, Java, PHP and more.',
    badge: '20+ languages',
  },
  {
    icon: <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M2 10h20"/></>,
    title: 'Side-by-Side View',
    desc:  'All documents displayed as synchronized columns with scroll lock. Differences visible at a glance.',
    badge: 'Sync scroll',
  },
  {
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    title: '100% Private',
    desc:  'Every file is processed in your browser using WebAssembly. Zero data sent to any server. Works offline.',
    badge: 'Client-side only',
  },
]

function Features() {
  return (
    <section id="features" className="py-24 px-6 border-t border-zinc-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-700/10 border border-blue-700/20 text-blue-400 text-[10px] font-bold tracking-[1.5px] uppercase px-3 py-1 rounded-full mb-4">
            Everything you need
          </div>
          <h2 className="font-heading font-black text-4xl sm:text-5xl tracking-tight text-white mb-4">
            Powerful document comparison
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            All major document formats supported. No plugins, no extensions, no signup.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="group bg-zinc-950 border border-zinc-800/60 rounded-2xl p-6 hover:border-blue-700/40 transition-all hover:bg-zinc-900/40">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-blue-700/10 rounded-xl flex items-center justify-center group-hover:bg-blue-700/20 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8">
                    {f.icon}{f.icon2}
                  </svg>
                </div>
                <span className="text-[9px] font-bold text-blue-400 bg-blue-700/10 px-2 py-1 rounded-md tracking-wide">
                  {f.badge}
                </span>
              </div>
              <h3 className="font-bold text-white text-base mb-2">{f.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── How it works ──────────────────────────────────────────────────────────────
const STEPS = [
  { n: '01', title: 'Upload your documents', desc: 'Drag and drop up to 5 files, or click to browse. PDF, Word, Excel, CSV, JSON, and code files all supported.' },
  { n: '02', title: 'Pick your reference',   desc: 'Select which document is the baseline. Every other document will be compared against it.' },
  { n: '03', title: 'See every difference',  desc: 'Added lines highlighted in blue, removed lines in red, word-level changes marked inline across all columns.' },
  { n: '04', title: 'Export the summary',    desc: 'Download a plain-text diff summary with line numbers and change types for record-keeping or sharing.' },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 border-t border-zinc-900">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-700/10 border border-blue-700/20 text-blue-400 text-[10px] font-bold tracking-[1.5px] uppercase px-3 py-1 rounded-full mb-4">
            Simple workflow
          </div>
          <h2 className="font-heading font-black text-4xl sm:text-5xl tracking-tight text-white mb-4">
            Compare in 4 steps
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-zinc-800 to-transparent z-0" />
              )}
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-700/10 border border-blue-700/20 rounded-2xl flex items-center justify-center mb-4">
                  <span className="font-brand font-bold text-blue-500 text-sm">{s.n}</span>
                </div>
                <h3 className="font-bold text-white text-base mb-2">{s.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Use cases ─────────────────────────────────────────────────────────────────
const USE_CASES = [
  {
    audience: 'Lawyers & Paralegals',
    icon:     '⚖️',
    items:    ['Compare contract versions before signing', 'Track clause changes across redlines', 'Review NDA or SLA amendments', 'Compare court filings side by side'],
  },
  {
    audience: 'Finance & Accounting',
    icon:     '📊',
    items:    ['Compare Excel reports across periods', 'Audit spreadsheet changes by version', 'Reconcile CSV exports from different systems', 'Compare budget vs actuals'],
  },
  {
    audience: 'Developers',
    icon:     '💻',
    items:    ['Diff JSON config files across environments', 'Compare API response payloads', 'Review code changes in plain text', 'Audit infrastructure config changes'],
  },
  {
    audience: 'HR & Operations',
    icon:     '📋',
    items:    ['Compare policy documents across regions', 'Track employee handbook changes', 'Review job description revisions', 'Audit compliance document versions'],
  },
]

function UseCases() {
  return (
    <section id="use-cases" className="py-24 px-6 border-t border-zinc-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-700/10 border border-blue-700/20 text-blue-400 text-[10px] font-bold tracking-[1.5px] uppercase px-3 py-1 rounded-full mb-4">
            Who uses DocxLens
          </div>
          <h2 className="font-heading font-black text-4xl sm:text-5xl tracking-tight text-white mb-4">
            Built for real workflows
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Whether you compare contracts, spreadsheets, or config files — DocxLens handles it.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {USE_CASES.map((uc) => (
            <div key={uc.audience} className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-6 hover:border-blue-700/30 transition-all">
              <div className="text-3xl mb-3">{uc.icon}</div>
              <h3 className="font-bold text-white text-base mb-4">{uc.audience}</h3>
              <ul className="space-y-2">
                {uc.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-zinc-500">
                    <span className="text-blue-600 mt-0.5 flex-shrink-0">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
function StatsBar() {
  return (
    <section className="py-16 px-6 border-t border-zinc-900">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { stat: '5',     label: 'Documents at once'    },
            { stat: '20MB',  label: 'Per file limit'       },
            { stat: '10+',   label: 'File formats'         },
            { stat: '0',     label: 'Data sent to servers' },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-heading font-black text-5xl text-white mb-1">{s.stat}</div>
              <div className="text-sm text-zinc-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'Is DocxLens really free?',                   a: 'Yes, completely free with no hidden limits. No account required.' },
  { q: 'Are my documents private?',                   a: 'Absolutely. All processing happens in your browser using WebAssembly. Your files are never uploaded to any server.' },
  { q: 'Can I compare scanned PDFs?',                 a: 'Yes. DocxLens uses Tesseract OCR to automatically extract text from image-based or scanned PDFs when no text layer is detected.' },
  { q: 'What is the maximum file size?',              a: 'Each file can be up to 20MB. You can compare up to 5 documents at a time.' },
  { q: 'Does it work offline?',                       a: 'Once the page has loaded and processors initialized, yes — PDF, Word and Excel extraction will work without an internet connection.' },
  { q: 'How does the diff work?',                     a: 'DocxLens uses the Myers diff algorithm (the same used by Git) for line-level differences, and word-level diff for inline changes within lines.' },
  { q: 'Can I compare more than 2 documents?',        a: 'Yes — up to 5 documents simultaneously. You choose which document is the reference baseline.' },
  { q: 'What file formats are supported?',            a: 'PDF, DOCX, DOC, XLSX, XLS, CSV, JSON, TXT, MD, and 15+ code file types including JS, TS, Python, Go, Java, PHP and more.' },
]

function FAQ() {
  return (
    <section id="faq" className="py-24 px-6 border-t border-zinc-900">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-700/10 border border-blue-700/20 text-blue-400 text-[10px] font-bold tracking-[1.5px] uppercase px-3 py-1 rounded-full mb-4">
            FAQ
          </div>
          <h2 className="font-heading font-black text-4xl sm:text-5xl tracking-tight text-white mb-4">
            Common questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq) => (
            <div key={faq.q} className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
              <h3 className="font-semibold text-white text-sm mb-2">{faq.q}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Bottom CTA ─────────────────────────────────────────────────────────────────
function BottomCTA({ onCtaClick }) {
  return (
    <section className="py-24 px-6 border-t border-zinc-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(29,78,216,0.1) 0%, transparent 65%)' }} />
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <h2 className="font-heading font-black text-4xl sm:text-5xl tracking-tight text-white mb-4">
          Start comparing<br />
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">right now.</span>
        </h2>
        <p className="text-zinc-400 text-lg mb-8 max-w-md mx-auto">
          No account. No upload. 100% private. Works in your browser.
        </p>
        <button onClick={onCtaClick}
          className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-bold text-base px-8 py-4 rounded-2xl transition-all blue-glow">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Upload Documents — It's Free
        </button>
        <p className="text-xs text-zinc-700 mt-4">PDF · DOCX · XLSX · CSV · JSON · Code · and more</p>
      </div>
    </section>
  )
}

// ── Site footer ───────────────────────────────────────────────────────────────
function SiteFooter() {
  return (
    <footer className="border-t border-zinc-900 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>
          </div>
          <span className="font-brand font-bold text-sm text-zinc-400">DocxLens</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-zinc-600">
          <a href="#features"     className="hover:text-zinc-400 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-zinc-400 transition-colors">How it works</a>
          <a href="#faq"          className="hover:text-zinc-400 transition-colors">FAQ</a>
        </div>
        <div className="text-xs text-zinc-700">
          © {new Date().getFullYear()} DocxLens · 100% free · No tracking
        </div>
      </div>
    </footer>
  )
}

// ── Root marketing page ───────────────────────────────────────────────────────
export default function MarketingPage({ libsReady }) {
  const heroRef = useRef(null)

  function scrollToHero() {
    heroRef.current?.scrollIntoView({ behavior: 'smooth' })
    // Small delay then trigger file input if possible
    setTimeout(() => {
      const input = heroRef.current?.querySelector('input[type="file"]')
      input?.click()
    }, 600)
  }

  return (
    <div className="bg-black text-zinc-100 overflow-x-hidden">
      <Nav onCtaClick={scrollToHero} />

      <div ref={heroRef}>
        <Hero libsReady={libsReady} />
      </div>

      <StatsBar />
      <Features />
      <HowItWorks />
      <UseCases />
      <FAQ />
      <BottomCTA onCtaClick={scrollToHero} />
      <SiteFooter />
    </div>
  )
}
