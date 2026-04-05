# DocxLens

Free, private, browser-based tool to compare up to 5 documents simultaneously.

## Stack
Next.js 15 · React 19 · Tailwind CSS 3 · Zustand · diff · mammoth · ExcelJS · pdfjs-dist v5 · Tesseract.js

## Supported formats
PDF (incl. scanned/OCR) · DOCX · DOC · XLSX · XLS · CSV · JSON · TXT · MD · JS/TS/JSX/TSX · Python · Go · Java · PHP · Ruby · C/C++ · C# · Shell

## Run locally
```bash
npm install && npm run dev
# http://localhost:3000
```

## Deploy
```bash
vercel   # or: npm run build && npm start
```

## Security
- 0 npm vulnerabilities (xlsx replaced with ExcelJS, pdfjs upgraded to v5)
- Files processed entirely in-browser — never sent to any server
- Security headers: X-Frame-Options, XSS-Protection, Content-Type, Referrer-Policy

## Key decisions
| Package | Why |
|---------|-----|
| ExcelJS | Replaced SheetJS (xlsx) which has unfixed CVEs |
| pdfjs-dist v5 | v3 had arbitrary JS execution vuln |
| tesseract.js | OCR fallback for scanned/image PDFs |
| use-debounce | Prevents rename input from hammering Zustand |
