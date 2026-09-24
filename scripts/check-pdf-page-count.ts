import fs from 'fs'
import path from 'path'
import { PDFDocument } from 'pdf-lib'

/**
 * Guards against the local/prod font-fallback drift that silently pushed the CV to 2
 * pages in prod while staying at 1 in local dev (fallback fonts have different metrics
 * than the self-hosted one — see render-resume-pdf.ts). Run after `generate:pdf` so it
 * checks what was actually produced, not a stale copy.
 */
const MAX_PAGES = 1

async function main() {
  const cvDir = path.resolve(process.cwd(), 'public', 'cv')
  const pdfPaths = fs
    .readdirSync(cvDir, { recursive: true })
    .filter((entry): entry is string => typeof entry === 'string' && entry.endsWith('.pdf'))
    .map((entry) => path.join(cvDir, entry))
    .sort()

  if (pdfPaths.length === 0) {
    console.error(`[check-pdf-page-count] no PDFs found under ${path.relative(process.cwd(), cvDir)} — run "npm run generate:pdf" first`)
    process.exit(1)
  }

  let failed = false
  for (const pdfPath of pdfPaths) {
    const bytes = fs.readFileSync(pdfPath)
    const doc = await PDFDocument.load(bytes)
    const pageCount = doc.getPageCount()
    const rel = path.relative(process.cwd(), pdfPath)

    if (pageCount > MAX_PAGES) {
      console.error(`[check-pdf-page-count] FAIL ${rel}: ${pageCount} pages (max ${MAX_PAGES})`)
      failed = true
    } else {
      console.log(`[check-pdf-page-count] OK ${rel}: ${pageCount} page`)
    }
  }

  if (failed) {
    console.error('[check-pdf-page-count] one or more CV PDFs overflow onto a 2nd page')
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('[check-pdf-page-count] failed:', err)
  process.exit(1)
})
