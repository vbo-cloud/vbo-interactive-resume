import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'
import { resumeConfig } from '../src/data/resume-config'
import { renderResumeHtml } from './render-resume-html'

const SITE_URL = 'https://cv.vincentboutin.dev'

/**
 * Generates one downloadable PDF per language from resume-config, so the CV
 * shown on the site and the PDF a recruiter downloads never drift apart.
 *
 * Renders the same flat, fully-expanded HTML used as the <noscript> SEO
 * fallback (see vite-plugin-resume-seo.ts) — no collapsed sections, no dark
 * mode — then prints it with headless Chrome. Runs before `vite build` so
 * the assets-detect plugin picks up the freshly generated files.
 */
async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    for (const lang of resumeConfig.languages.available) {
      const html = wrapHtmlDocument(renderResumeHtml(resumeConfig, lang, '/', null, SITE_URL))

      const outDir = path.resolve(process.cwd(), 'public', 'cv', lang)
      fs.mkdirSync(outDir, { recursive: true })
      const outPath = path.join(outDir, `resume-${lang}.pdf`)

      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'load' })
      await page.pdf({
        path: outPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
      })
      await page.close()

      console.log(`[generate-pdfs] ${lang} -> ${path.relative(process.cwd(), outPath)}`)
    }
  } finally {
    await browser.close()
  }
}

function wrapHtmlDocument(bodyFragment: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
  </head>
  <body style="margin: 0; background: #ffffff;">
${bodyFragment}
  </body>
</html>`
}

main().catch((err) => {
  console.error('[generate-pdfs] failed:', err)
  process.exit(1)
})
