'use client'
// All extraction is 100% client-side. Never runs on server.

import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from './constants'

const PDF_CDN    = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
const PDF_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

export function detectType(filename) {
  const n = filename.toLowerCase()
  if (n.endsWith('.json'))                                               return 'json'
  if (['.xlsx','.xls','.csv'].some((e) => n.endsWith(e)))              return 'excel'
  if (n.endsWith('.pdf'))                                                return 'pdf'
  if (n.endsWith('.docx') || n.endsWith('.doc'))                        return 'docx'
  if (['.js','.jsx','.ts','.tsx','.py','.rb','.go','.java',
       '.c','.cpp','.cs','.php','.sh'].some((e) => n.endsWith(e)))     return 'code'
  return 'text'
}

export async function extractText(file, onProgress) {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)}MB. ` +
      `Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`
    )
  }

  const ext = file.name.split('.').pop().toLowerCase()

  // Plain text / code
  if (['txt','md','js','jsx','ts','tsx','py','rb','go','java',
       'c','cpp','cs','php','sh'].includes(ext)) {
    return file.text()
  }

  // JSON
  if (ext === 'json') {
    const raw = await file.text()
    try   { return JSON.stringify(JSON.parse(raw), null, 2) }
    catch { return raw }
  }

  // Word (mammoth)
  if (ext === 'docx' || ext === 'doc') {
    const arrayBuffer = await file.arrayBuffer()
    try {
      const mod     = await import('mammoth')
      const mammoth = mod.default ?? mod
      const result  = await mammoth.convertToHtml({ arrayBuffer })
      const text    = htmlToPlainText(result.value)
      if (!text.trim()) throw new Error('Document appears empty or image-only.')
      return text
    } catch (e) {
      throw new Error(`Failed to read Word document: ${e.message}`)
    }
  }

  // Excel / CSV (ExcelJS)
  if (['xlsx','xls','csv'].includes(ext)) {
    const arrayBuffer = await file.arrayBuffer()
    try {
      if (ext === 'csv') {
        return `=== Sheet: Sheet1 ===\n${new TextDecoder().decode(arrayBuffer).trim()}`
      }
      const ExcelJS  = (await import('exceljs')).default
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(arrayBuffer)
      if (!workbook.worksheets.length) throw new Error('Spreadsheet has no sheets.')
      const lines = []
      workbook.eachSheet((sheet) => {
        lines.push(`=== Sheet: ${sheet.name} ===`)
        sheet.eachRow((row) => {
          const cells = []
          row.eachCell({ includeEmpty: true }, (cell) => {
            const v = cell.value
            if (v === null || v === undefined)             { cells.push(''); return }
            if (typeof v === 'object' && v.result != null) { cells.push(String(v.result)); return }
            if (typeof v === 'object' && v.text != null)   { cells.push(v.text); return }
            cells.push(String(v))
          })
          lines.push(cells.join(','))
        })
      })
      return lines.join('\n').trim()
    } catch (e) {
      throw new Error(`Failed to read spreadsheet: ${e.message}`)
    }
  }

  // PDF (CDN pdfjs + Tesseract OCR fallback)
  if (ext === 'pdf') {
    const arrayBuffer = await file.arrayBuffer()
    try {
      const pdfjsLib = await loadPdfJs()
      const pdf      = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
      const pages    = []

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const tc   = await page.getTextContent()
        const text = pdfItemsToLines(tc.items)
        if (text.trim()) pages.push(text)
      }

      const fullText = pages.join('\n\n--- Page Break ---\n\n').trim()

      if (!fullText) {
        onProgress?.('scanned_pdf_detected')
        return await ocrPdf(pdf, onProgress)
      }

      return fullText
    } catch (e) {
      if (e.message?.includes('OCR')) throw e
      throw new Error(`Failed to read PDF: ${e.message}`)
    }
  }

  throw new Error(`Unsupported file type: .${ext}`)
}

/**
 * Group pdfjs text items into lines using tolerance-based Y clustering.
 * PDFs often have items on the same visual line with slightly different Y values
 * due to font baseline differences — Math.round() alone is not sufficient.
 */
function pdfItemsToLines(items) {
  if (!items.length) return ''

  // Collect all items with their positions
  const positioned = []
  for (const item of items) {
    if (!('str' in item) || !item.str) continue
    positioned.push({
      x:   item.transform[4],
      y:   item.transform[5],
      str: item.str,
      h:   item.height || 10,
    })
  }

  if (!positioned.length) return ''

  // Sort top-to-bottom first (descending Y — PDF coord system is bottom-up)
  positioned.sort((a, b) => b.y - a.y)

  // Cluster items into lines using a tolerance of ~30% of the item height
  // Items within tolerance of the current line's Y are on the same line
  const lines = []
  let currentLine = [positioned[0]]
  let currentY    = positioned[0].y

  for (let i = 1; i < positioned.length; i++) {
    const item      = positioned[i]
    const tolerance = Math.max(4, (currentLine[0].h || 10) * 0.5)

    if (Math.abs(item.y - currentY) <= tolerance) {
      // Same line
      currentLine.push(item)
    } else {
      // New line — save current, start fresh
      lines.push(currentLine)
      currentLine = [item]
      currentY    = item.y
    }
  }
  lines.push(currentLine)

  // Within each line sort left-to-right, join with space
  return lines
    .map((lineItems) => {
      lineItems.sort((a, b) => a.x - b.x)
      return lineItems.map((i) => i.str).join(' ').trimEnd()
    })
    .filter((line) => line.trim()) // remove blank-only lines
    .join('\n')
}

/**
 * Convert mammoth HTML to plain text preserving document structure.
 */
function htmlToPlainText(html) {
  return html
    .replace(/<\/p>/gi,        '\n')
    .replace(/<br\s*\/?>/gi,   '\n')
    .replace(/<\/h[1-6]>/gi,   '\n')
    .replace(/<\/li>/gi,       '\n')
    .replace(/<li[^>]*>/gi,    '  • ')
    .replace(/<\/tr>/gi,       '\n')
    .replace(/<\/td>/gi,       '\t')
    .replace(/<\/th>/gi,       '\t')
    .replace(/<h[1-6][^>]*>/gi,'')
    .replace(/<[^>]+>/g,       '')
    .replace(/&amp;/g,         '&')
    .replace(/&lt;/g,          '<')
    .replace(/&gt;/g,          '>')
    .replace(/&nbsp;/g,        ' ')
    .replace(/&quot;/g,        '"')
    .replace(/&#39;/g,         "'")
    .replace(/\n{3,}/g,        '\n\n')
    .trim()
}

/**
 * Load pdfjs from CDN — avoids webpack/ESM bundling issues.
 */
function loadPdfJs() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined')
      return reject(new Error('PDF extraction requires a browser environment.'))

    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER
      return resolve(window.pdfjsLib)
    }

    const script   = document.createElement('script')
    script.src     = PDF_CDN
    script.onload  = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER
      resolve(window.pdfjsLib)
    }
    script.onerror = () => reject(new Error('Failed to load PDF engine. Check your internet connection.'))
    document.head.appendChild(script)
  })
}

/**
 * Render each PDF page to canvas and run Tesseract OCR.
 */
async function ocrPdf(pdf, onProgress) {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('eng', 1, { logger: () => {} })

  const results = []
  const total   = pdf.numPages

  for (let i = 1; i <= total; i++) {
    onProgress?.(`ocr_page_${i}_of_${total}`)

    const page     = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 2.0 })
    const canvas   = document.createElement('canvas')
    canvas.width   = viewport.width
    canvas.height  = viewport.height
    const ctx      = canvas.getContext('2d')

    await page.render({ canvasContext: ctx, viewport }).promise

    const { data: { text } } = await worker.recognize(canvas)
    if (text.trim()) results.push(`[Page ${i}]\n${text.trim()}`)

    canvas.width = 0; canvas.height = 0
  }

  await worker.terminate()

  const finalText = results.join('\n\n').trim()
  if (!finalText) throw new Error('OCR could not extract any text from this PDF.')
  return finalText
}
