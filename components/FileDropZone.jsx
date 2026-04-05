'use client'
import { useRef, useState, useCallback } from 'react'
import { useDocStore } from '@/lib/store'
import { extractText, detectType } from '@/lib/extractText'
import { ACCEPT_STRING, MAX_DOCS, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '@/lib/constants'
import { track } from '@/lib/analytics'

// ── Validation ────────────────────────────────────────────────────────────────

const SUPPORTED_EXTENSIONS = [
  'pdf','docx','doc','xlsx','xls','csv','json',
  'txt','md','js','jsx','ts','tsx','py','rb','go',
  'java','c','cpp','cs','php','sh',
]

/**
 * Validate a file before processing.
 * Returns { ok: true } or { ok: false, message: string }
 */
function validateFile(file, existingDocs) {
  const name = file.name
  const ext  = name.split('.').pop().toLowerCase()
  const size  = file.size

  // 1. Empty file
  if (size === 0) {
    return { ok: false, message: `"${name}" is empty. Please upload a file with content.` }
  }

  // 2. File too large
  if (size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      message: `"${name}" is ${(size / 1024 / 1024).toFixed(1)}MB — maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`,
    }
  }

  // 3. Unsupported file type
  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    return {
      ok: false,
      message: `".${ext}" files are not supported. Supported types: PDF, Word, Excel, CSV, JSON, and code files.`,
    }
  }

  // 4. Duplicate — same name AND same size already in docs
  const isDuplicate = existingDocs.some(
    (doc) => doc.name === name && doc.size === size
  )
  if (isDuplicate) {
    return {
      ok: false,
      message: `"${name}" is already added. Remove it first if you want to replace it.`,
    }
  }

  // 5. Same name different size — warn but allow
  const sameNameDiff = existingDocs.some(
    (doc) => doc.name === name && doc.size !== size
  )
  if (sameNameDiff) {
    // Not a hard block — just return ok with a warning flag
    return { ok: true, warning: `"${name}" has the same name as an existing document but appears to be a different version.` }
  }

  return { ok: true }
}

// ── Progress parser ───────────────────────────────────────────────────────────
function parseProgress(status) {
  if (!status) return null
  if (status === 'scanned_pdf_detected') return 'Scanned PDF detected — starting OCR…'
  const m = status.match(/^ocr_page_(\d+)_of_(\d+)$/)
  if (m) return `Running OCR: page ${m[1]} of ${m[2]}…`
  return 'Processing…'
}

// ── File handler hook ─────────────────────────────────────────────────────────
export function useFileHandler() {
  const { docs, addDoc, setError, setProcessing, canAddMore } = useDocStore()

  const processFiles = useCallback(async (fileList) => {
    const files = Array.from(fileList)
    if (!files.length) return

    if (!canAddMore()) {
      setError(`Maximum ${MAX_DOCS} documents allowed.`)
      return
    }

    const available = MAX_DOCS - docs.length
    const toProcess = files.slice(0, available)

    if (files.length > available) {
      setError(`Only ${available} slot${available !== 1 ? 's' : ''} left. Processing first ${available}.`)
    }

    for (const file of toProcess) {
      // Run validation before any processing
      const validation = validateFile(file, docs)

      if (!validation.ok) {
        setError(validation.message)
        continue  // skip this file, try next one
      }

      // Show warning toast but still process
      if (validation.warning) {
        setError(validation.warning)
      }

      try {
        setProcessing({ filename: file.name, status: 'Extracting…' })

        const content = await extractText(file, (progressStatus) => {
          setProcessing({ filename: file.name, status: parseProgress(progressStatus) })
        })

        // Post-extraction validation
        if (!content || content.trim().length === 0) {
          setError(`"${file.name}" appears to be empty or contains no readable text. If this is a scanned document, ensure it's clear and not too faint.`)
          continue
        }

        addDoc({
          name:    file.name,
          content,
          type:    detectType(file.name),
          size:    file.size,
        })
        track('file_uploaded', { type: detectType(file.name), size_kb: Math.round(file.size / 1024) })

      } catch (err) {
        setError(err.message)
      } finally {
        setProcessing(null)
      }
    }
  }, [docs, addDoc, setError, setProcessing, canAddMore])

  return { processFiles, processing: useDocStore((s) => s.processing) }
}

// ── Drop zone component ───────────────────────────────────────────────────────
export default function FileDropZone({ children, className = '' }) {
  const { processFiles } = useFileHandler()
  const [dragOver, setDragOver] = useState(false)
  const inputRef    = useRef(null)
  const dragCounter = useRef(0)

  const onDragEnter = (e) => { e.preventDefault(); dragCounter.current++; setDragOver(true) }
  const onDragLeave = (e) => { e.preventDefault(); dragCounter.current--; if (dragCounter.current === 0) setDragOver(false) }
  const onDragOver  = (e) => e.preventDefault()
  const onDrop      = (e) => {
    e.preventDefault(); dragCounter.current = 0; setDragOver(false)
    if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files)
  }

  return (
    <div
      className={`drop-zone ${dragOver ? 'drag-over' : ''} ${className}`}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Upload documents"
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT_STRING}
        className="hidden"
        onChange={(e) => { if (e.target.files?.length) processFiles(e.target.files); e.target.value = '' }}
        aria-hidden="true"
      />
      {typeof children === 'function' ? children({ dragOver }) : children}
    </div>
  )
}
