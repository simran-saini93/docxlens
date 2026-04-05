'use client'
import { useState, useRef, useCallback, useMemo, memo, useEffect } from 'react'
import { useDocStore } from '@/lib/store'
import { diffAgainstRef, getWordDiffParts, normalizeJson } from '@/lib/diffEngine'
import { FILE_TYPE_MAP } from '@/lib/constants'
import FileDropZone, { useFileHandler } from '@/components/FileDropZone'
import { useDebouncedCallback } from 'use-debounce'
import { track } from '@/lib/analytics'

// ── Copy button with tick feedback ────────────────────────────────────────────
function CopyButton({ text, type }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback((e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
      track('copy_block_clicked', { type })
    })
  }, [text, type])

  const isGreen = type === 'added'
  const base    = isGreen
    ? 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400'
    : 'border-red-500/40 text-red-400 hover:bg-red-500/20 hover:border-red-400'

  return (
    <button
      onClick={handleCopy}
      title="Copy block"
      className={`
        flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-mono font-bold
        bg-zinc-900/80 backdrop-blur-sm transition-all duration-150 select-none
        opacity-0 group-hover/block:opacity-100
        ${base}
      `}
    >
      {copied ? (
        <>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          copied
        </>
      ) : (
        <>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          copy
        </>
      )}
    </button>
  )
}

// ── Word-level inline diff — bold highlights changed words ───────────────────
const WordDiff = memo(function WordDiff({ refText, tgtText }) {
  const parts = useMemo(
    () => getWordDiffParts(refText, tgtText),
    [refText, tgtText]
  )
  // We are rendering the TARGET line only.
  // - 'added' parts = words in target, not in ref → show bold+bright (changed)
  // - 'removed' parts = words in ref, not in target → SKIP (not in target)
  // - unchanged parts → show normally
  return (
    <>
      {parts.map((p, i) => {
        if (p.removed) return null  // don't show ref-only words in target column
        if (p.added) {
          // Changed word — bold, brighter, underlined so it stands out clearly
          return (
            <strong key={i} style={{ fontWeight: 700, textDecoration: 'underline', textDecorationColor: 'rgba(52,211,153,0.6)', textUnderlineOffset: '2px' }}
              className="text-emerald-100">
              {p.value}
            </strong>
          )
        }
        return <span key={i} className="text-emerald-200">{p.value}</span>
      })}
    </>
  )
})

// ── Single line inside a block ────────────────────────────────────────────────
const TgtLine = memo(function TgtLine({ text, type, lineNum, refText }) {
  const baseColor = type === 'added'   ? 'text-emerald-200'
                  : type === 'removed' ? 'text-red-300'
                  : 'text-zinc-300'

  // If this added line has a paired refText, show word-level diff
  const showWordDiff = type === 'added' && refText

  return (
    <div className="flex items-start min-h-[22px]">
      <span className="w-10 text-right pr-3 text-zinc-600 text-[10px] flex-shrink-0 select-none pt-0.5 font-mono">
        {lineNum ?? ''}
      </span>
      <span className={`px-2 py-0.5 whitespace-pre-wrap break-words flex-1 min-w-0 font-mono text-[12px] leading-[1.65] ${type === 'removed' ? 'opacity-60' : ''}`}>
        {showWordDiff
          ? <WordDiff refText={refText} tgtText={text} baseColor={baseColor} />
          : <span className={baseColor}>{text || '\u00a0'}</span>
        }
      </span>
    </div>
  )
})

// ── Plain ref line ────────────────────────────────────────────────────────────
const RefLine = memo(function RefLine({ text, lineNum }) {
  return (
    <div className="flex items-start min-h-[22px]">
      <span className="w-10 text-right pr-3 text-zinc-600 text-[10px] flex-shrink-0 select-none pt-0.5 font-mono">
        {lineNum}
      </span>
      <span className="px-2 py-0.5 whitespace-pre-wrap break-words text-zinc-300 flex-1 min-w-0 font-mono text-[12px] leading-[1.65]">
        {text || '\u00a0'}
      </span>
    </div>
  )
})

// ── Diff block (consecutive lines of same type) ───────────────────────────────
function DiffBlock({ lines, type, startLineNum }) {
  const blockText = useMemo(
    () => lines.map((l) => l.text).filter(Boolean).join('\n'),
    [lines]
  )

  const bg = type === 'added'
    ? 'bg-emerald-500/10 border-l-2 border-emerald-500/60'
    : 'bg-red-500/10 border-l-2 border-red-500/60'

  let lineCounter = startLineNum
  const lineNums = lines.map((l) => l.type === 'removed' ? null : lineCounter++)

  return (
    <div className={`relative group/block ${bg}`}>
      <div className="absolute top-1 right-1 z-10">
        <CopyButton text={blockText} type={type} />
      </div>
      {lines.map((line, i) => (
        <TgtLine
          key={i}
          text={line.text}
          type={line.type}
          lineNum={lineNums[i]}
          refText={line.refText}
        />
      ))}
    </div>
  )
}

// ── Column header ─────────────────────────────────────────────────────────────
const ColHeader = memo(function ColHeader({ doc, isRef, addedCount, removedCount, onRemove, onRename }) {
  const [localName, setLocalName] = useState(doc.name)
  const debouncedRename = useDebouncedCallback((id, name) => onRename(id, name), 300)
  const typeInfo = FILE_TYPE_MAP[doc.type] ?? FILE_TYPE_MAP.text

  return (
    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-zinc-800/60 bg-zinc-900/30 flex-shrink-0">
      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 font-mono ${typeInfo.color}`}>
        {typeInfo.label}
      </span>
      <input
        value={localName}
        onChange={(e) => { setLocalName(e.target.value); debouncedRename(doc.id, e.target.value) }}
        className="flex-1 bg-transparent text-xs font-medium text-zinc-300 outline-none truncate min-w-0 hover:text-white transition-colors"
        title={doc.name}
        maxLength={100}
      />
      {isRef && (
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-blue-700 text-white tracking-wide flex-shrink-0">REF</span>
      )}
      {!isRef && addedCount === 0 && removedCount === 0 && (
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex-shrink-0">✓ identical</span>
      )}
      {!isRef && addedCount > 0 && (
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex-shrink-0 tabular-nums">
          +{addedCount}
        </span>
      )}
      {!isRef && removedCount > 0 && (
        <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded flex-shrink-0 tabular-nums">
          -{removedCount}
        </span>
      )}
      <button
        onClick={() => onRemove(doc.id)}
        className="text-zinc-700 hover:text-red-400 transition-colors flex-shrink-0 ml-0.5 p-0.5 rounded"
        aria-label={`Remove ${doc.name}`}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  )
})

// ── REF column — always plain ─────────────────────────────────────────────────
const RefColumn = memo(function RefColumn({ doc, scrollRef, onScroll, onRemove, onRename }) {
  const lines = useMemo(() =>
    (doc.type === 'json' ? normalizeJson(doc.content) : doc.content)
      .replace(/\r\n/g, '\n').replace(/\r/g, '\n')
      .split('\n'),
    [doc.content, doc.type]
  )

  return (
    <div className="flex flex-col min-w-[300px] flex-1 border-r border-zinc-800/60 min-h-0 overflow-hidden">
      <ColHeader doc={doc} isRef={true} addedCount={0} removedCount={0} onRemove={onRemove} onRename={onRename} />
      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-auto no-scrollbar">
        {lines.map((text, i) => (
          <RefLine key={i} text={text} lineNum={i + 1} />
        ))}
      </div>
    </div>
  )
})

/**
 * Group flat diffLines array into blocks of consecutive same-type lines.
 * Each block: { type, lines: [...], startLineNum }
 * 'same' lines are NOT grouped into blocks — rendered individually, no block wrapper.
 */
function groupIntoBlocks(diffLines) {
  const segments = []
  let i = 0
  let lineNum = 1  // tracks sequential line numbers for non-removed lines

  while (i < diffLines.length) {
    const current = diffLines[i]

    if (current.type === 'same') {
      segments.push({ type: 'same', line: current, lineNum: lineNum++ })
      i++
      continue
    }

    // Start a new diff block — collect consecutive lines of same type
    const blockType  = current.type
    const blockLines = []
    const blockStart = lineNum

    while (i < diffLines.length && diffLines[i].type === blockType) {
      blockLines.push(diffLines[i])
      if (blockType !== 'removed') lineNum++
      i++
    }

    segments.push({ type: 'block', blockType, lines: blockLines, startLineNum: blockStart })
  }

  return segments
}

// ── Target column — grouped blocks with copy buttons ─────────────────────────
const TgtColumn = memo(function TgtColumn({ doc, refContent, scrollRef, onScroll, onRemove, onRename }) {
  const tgtContent = useMemo(() =>
    doc.type === 'json' ? normalizeJson(doc.content) : doc.content,
    [doc.content, doc.type]
  )

  const diffLines = useMemo(() =>
    diffAgainstRef(refContent, tgtContent),
    [refContent, tgtContent]
  )

  const addedCount   = useMemo(() => diffLines.filter((l) => l.type === 'added').length,   [diffLines])
  const removedCount = useMemo(() => diffLines.filter((l) => l.type === 'removed').length, [diffLines])

  // Track diff completed — fires when a real diff is computed
  useEffect(() => {
    if (diffLines.length > 0 && (addedCount + removedCount) > 0) {
      track('diff_completed', { added: addedCount, removed: removedCount })
    }
  }, [diffLines, addedCount, removedCount])

  // Group into renderable segments
  const segments = useMemo(() => groupIntoBlocks(diffLines), [diffLines])

  return (
    <div className="flex flex-col min-w-[300px] flex-1 border-r border-zinc-800/60 last:border-r-0 min-h-0 overflow-hidden">
      <ColHeader
        doc={doc} isRef={false}
        addedCount={addedCount} removedCount={removedCount}
        onRemove={onRemove} onRename={onRename}
      />
      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-auto no-scrollbar">
        {segments.map((seg, i) =>
          seg.type === 'same'
            ? <TgtLine key={i} text={seg.line.text} type="same" lineNum={seg.lineNum} />
            : <DiffBlock key={i} lines={seg.lines} type={seg.blockType} startLineNum={seg.startLineNum} />
        )}
        {segments.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-zinc-600">Empty document</div>
        )}
      </div>
    </div>
  )
})

// ── Add document slot ─────────────────────────────────────────────────────────
function AddDocColumn({ slotsLeft }) {
  const { processing } = useFileHandler()
  return (
    <FileDropZone className="flex flex-col items-center justify-center w-44 flex-shrink-0 border-l border-dashed border-zinc-800 cursor-pointer group hover:border-blue-700/40 transition-all">
      {({ dragOver }) => (
        processing
          ? <svg className="animate-spin w-6 h-6 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          : <>
              <div className={`w-10 h-10 rounded-xl bg-zinc-900 border flex items-center justify-center mb-2 transition-all ${dragOver ? 'border-blue-700/60 bg-blue-700/10' : 'border-zinc-800 group-hover:border-blue-700/40'}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" className={`transition-colors ${dragOver ? 'stroke-blue-400' : 'stroke-zinc-600 group-hover:stroke-blue-500'}`}>
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              <span className="text-xs font-semibold text-zinc-600 group-hover:text-blue-400 transition-colors text-center">
                {dragOver ? 'Drop here' : 'Add Document'}
              </span>
              <span className="text-[10px] text-zinc-700 mt-0.5">{slotsLeft} slot{slotsLeft !== 1 ? 's' : ''} left</span>
            </>
      )}
    </FileDropZone>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function DiffViewer({ syncScroll }) {
  const { docs, referenceId, removeDoc, updateDocName } = useDocStore()
  const scrollRefs = useRef({})
  const syncing    = useRef(false)

  const refDoc     = useMemo(() => docs.find((d) => d.id === referenceId), [docs, referenceId])
  const tgtDocs    = useMemo(() => docs.filter((d) => d.id !== referenceId), [docs, referenceId])
  const refContent = useMemo(() => {
    if (!refDoc) return ''
    return refDoc.type === 'json' ? normalizeJson(refDoc.content) : refDoc.content
  }, [refDoc])

  const handleScroll = useCallback((sourceId) => {
    if (!syncScroll || syncing.current) return
    syncing.current = true
    const src = scrollRefs.current[sourceId]
    if (src) {
      Object.entries(scrollRefs.current).forEach(([id, el]) => {
        if (id !== sourceId && el) el.scrollTop = src.scrollTop
      })
    }
    requestAnimationFrame(() => { syncing.current = false })
  }, [syncScroll])

  if (!refDoc) return null

  return (
    <div className="flex flex-1 min-h-0 overflow-x-auto overflow-y-hidden bg-black">
      <RefColumn
        doc={refDoc}
        scrollRef={(el) => { scrollRefs.current[refDoc.id] = el }}
        onScroll={() => handleScroll(refDoc.id)}
        onRemove={removeDoc}
        onRename={updateDocName}
      />
      {tgtDocs.map((doc) => (
        <TgtColumn
          key={doc.id}
          doc={doc}
          refContent={refContent}
          scrollRef={(el) => { scrollRefs.current[doc.id] = el }}
          onScroll={() => handleScroll(doc.id)}
          onRemove={removeDoc}
          onRename={updateDocName}
        />
      ))}
      {docs.length < 5 && <AddDocColumn slotsLeft={5 - docs.length} />}
    </div>
  )
}
