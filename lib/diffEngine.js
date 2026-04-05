import * as Diff from 'diff'

/**
 * Normalise a line for comparison only — NOT for display.
 * - trim whitespace
 * - collapse multiple spaces to one
 * - lowercase
 */
function normLine(line) {
  return line.trim().replace(/\s+/g, ' ').toLowerCase()
}

/**
 * Strip blank lines, return { originals, normed }
 * originals — original text (for display)
 * normed    — normalised text (for matching)
 */
function prepareLines(content) {
  const raw = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const originals = []
  const normed    = []
  for (const line of raw) {
    if (line.trim() === '') continue   // ← blank lines stripped here
    originals.push(line)
    normed.push(normLine(line))
  }
  return { originals, normed }
}

/**
 * Simple word-overlap similarity 0–1.
 * Used to decide if two lines are "same line with edits" vs totally different.
 */
function similarity(a, b) {
  if (!a || !b) return 0
  const wa = new Set(normLine(a).split(' ').filter(Boolean))
  const wb = new Set(normLine(b).split(' ').filter(Boolean))
  let overlap = 0
  for (const w of wa) { if (wb.has(w)) overlap++ }
  return overlap / Math.max(wa.size, wb.size)
}

/**
 * Main diff function.
 *
 * Steps:
 * 1. Strip blank lines from both sides (fixes OCR blank-line offset)
 * 2. Diff on normalised text (fixes case/spacing noise in matching)
 * 3. Map results back to original display text
 * 4. Pair adjacent removed+added lines that are >50% similar
 *    → gives word-level diff data (refText on the added line)
 *
 * Returns array of:
 *   { type: 'same'|'added'|'removed', text: string, refText?: string }
 *   refText is set on 'added' lines that are paired with a 'removed' line
 *   so the UI can show word-level bold highlights
 */
export function diffAgainstRef(refContent, tgtContent) {
  if (typeof refContent !== 'string' || typeof tgtContent !== 'string') return []

  const ref = prepareLines(refContent)
  const tgt = prepareLines(tgtContent)

  // Diff on normed arrays so case/spacing don't create false differences
  const changes = Diff.diffArrays(ref.normed, tgt.normed)

  const raw = []
  let ri = 0  // index into ref.originals
  let ti = 0  // index into tgt.originals

  for (const part of changes) {
    const n = part.count
    if (!part.added && !part.removed) {
      for (let i = 0; i < n; i++) {
        raw.push({ type: 'same', text: tgt.originals[ti] })
        ri++; ti++
      }
    } else if (part.removed) {
      for (let i = 0; i < n; i++) {
        raw.push({ type: 'removed', text: ref.originals[ri] })
        ri++
      }
    } else if (part.added) {
      for (let i = 0; i < n; i++) {
        raw.push({ type: 'added', text: tgt.originals[ti] })
        ti++
      }
    }
  }

  // Pair removed+added neighbours with >50% word overlap
  // The added line gets refText = the removed line's text
  // UI uses refText to render word-level diff (shows only changed words bold)
  return pairLines(raw)
}

function pairLines(lines) {
  const out = []
  let i = 0
  while (i < lines.length) {
    const cur  = lines[i]
    const next = lines[i + 1]
    if (cur.type === 'removed' && next?.type === 'added') {
      const sim = similarity(cur.text, next.text)
      if (sim > 0.5) {
        // Keep removed line as-is, attach refText to added line for word diff
        out.push(cur)
        out.push({ ...next, refText: cur.text })
        i += 2
        continue
      }
    }
    out.push(cur)
    i++
  }
  return out
}

/**
 * Word-level diff between refLine and tgtLine.
 * Returns parts: { value, added?, removed? }
 *
 * Rule: if a changed token is purely punctuation/quotes (no letters or digits),
 * expand it to include the full adjacent word so the whole word gets highlighted.
 * e.g. 'lorem ipsum' vs lorem ipsum → highlights 'lorem (not just the quote)
 */
export function getWordDiffParts(refLine, tgtLine) {
  if (!refLine && !tgtLine) return [{ value: '' }]

  const rawParts = Diff.diffWordsWithSpace(refLine ?? '', tgtLine ?? '')
  const out = []

  for (let i = 0; i < rawParts.length; i++) {
    const cur = rawParts[i]
    const isChanged   = cur.added || cur.removed
    const isPunctOnly = isChanged && /^[^a-zA-Z0-9]+$/.test(cur.value)

    if (isPunctOnly) {
      // Look BACK — absorb previous plain word into this change
      if (out.length > 0) {
        const prev = out[out.length - 1]
        if (!prev.added && !prev.removed && /\w/.test(prev.value)) {
          out[out.length - 1] = { value: prev.value + cur.value, added: cur.added, removed: cur.removed }
          continue
        }
      }
      // Look FORWARD — absorb next plain word into this change
      const next = rawParts[i + 1]
      if (next && !next.added && !next.removed && /\w/.test(next.value)) {
        out.push({ value: cur.value + next.value, added: cur.added, removed: cur.removed })
        i++ // skip next since we consumed it
        continue
      }
    }

    out.push(cur)
  }

  return out
}

export function countDiffs(refContent, tgtContent) {
  return diffAgainstRef(refContent, tgtContent).filter((l) => l.type !== 'same').length
}

export function buildSummary(docs, referenceId) {
  const refDoc = docs.find((d) => d.id === referenceId)
  if (!refDoc) return []
  const summary = []
  for (const doc of docs) {
    if (doc.id === referenceId) continue
    const lines = diffAgainstRef(
      refDoc.type === 'json' ? normalizeJson(refDoc.content) : refDoc.content,
      doc.type   === 'json' ? normalizeJson(doc.content)    : doc.content,
    )
    lines.forEach((line, idx) => {
      if (line.type !== 'same') {
        summary.push({ docName: doc.name, docId: doc.id, lineNumber: idx + 1, type: line.type, text: line.text })
      }
    })
  }
  return summary
}

export function normalizeJson(content) {
  if (typeof content !== 'string') return ''
  try { return JSON.stringify(JSON.parse(content), null, 2) } catch { return content }
}

export function exportSummary(docs, referenceId) {
  const summary = buildSummary(docs, referenceId)
  if (!summary.length) return false
  const refName = docs.find((d) => d.id === referenceId)?.name ?? 'reference'
  const added   = summary.filter((s) => s.type === 'added').length
  const removed = summary.filter((s) => s.type === 'removed').length
  const lines = [
    'DocxLens Export',
    `Generated: ${new Date().toLocaleString()}`,
    `Reference: ${refName}`,
    `${added} lines not in ref  |  ${removed} lines missing from doc`,
    '',
    '─'.repeat(60),
    '',
  ]
  let lastDoc = null
  for (const s of summary) {
    if (s.docName !== lastDoc) {
      if (lastDoc) lines.push('')
      lines.push(`▸ ${s.docName}`)
      lastDoc = s.docName
    }
    const label = s.type === 'added' ? 'NOT IN REF' : 'MISSING'
    lines.push(`  [${label}] Line ${s.lineNumber}: ${s.text || '(empty line)'}`)
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href: url, download: `docxlens-${Date.now()}.txt` })
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return true
}
