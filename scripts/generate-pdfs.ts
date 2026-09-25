import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'
import { resumeConfig } from '../src/data/resume-config'
import { renderResumePdfDocument } from './render-resume-pdf'
import { resumeVariants, type ResumeVariant } from '../src/data/resume-variants'
import { pdfPersonal, pdfFeaturedProject, pdfExperiences, pdfSkills, pdfHobbies, pdfLanguages, pdfEducation, pdfContact, pdfReferents } from '../src/data/resume-pdf-content'
import type { ResumeConfig } from '../src/data/types'

/** Base name of every generated PDF, also used as the PDF document title. */
const FILE_PREFIX = 'CV_VincentBOUTIN'

/**
 * Generates one downloadable PDF per language from resume-config, so referents, theme,
 * etc. shown on the site and in the PDF never drift apart. Contact, experiences,
 * education, skills, hobbies and spoken languages are layered with the PDF-only
 * versions from resume-pdf-content.ts (see pdfConfig below) — that content difference
 * must never leak back into what the live site shows.
 *
 * Renders a dedicated dark, two-column replica of the live site's card layout (see
 * render-resume-pdf.ts) — never the <noscript> SEO fallback — then prints it with
 * headless Chrome. Runs before `vite build` so the assets-detect plugin picks up the
 * freshly generated files.
 */
async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  // PDF-only content layered on top of the live resumeConfig — never imported by the
  // site or the noscript fallback, so this never affects what's deployed there.
  const pdfConfig: ResumeConfig = {
    ...resumeConfig,
    personal: { ...resumeConfig.personal, title: pdfPersonal.title, subtitle: pdfPersonal.subtitle },
    contact: pdfContact,
    referents: pdfReferents,
    featuredProject: pdfFeaturedProject,
    experiences: pdfExperiences,
    education: pdfEducation,
    skills: pdfSkills,
    hobbies: pdfHobbies,
    spokenLanguages: pdfLanguages,
  }

  try {
    for (const lang of resumeConfig.languages.available) {
      const html = renderResumePdfDocument(pdfConfig, lang)

      const outDir = path.resolve(process.cwd(), 'public', 'cv', lang)
      fs.mkdirSync(outDir, { recursive: true })
      const outPath = path.join(outDir, `${FILE_PREFIX}-${lang}.pdf`)

      await printPdf(browser, html, outPath)

      console.log(`[generate-pdfs] ${lang} -> ${path.relative(process.cwd(), outPath)}`)

      // Trial: a light/printable take on the default CV — white main column, gray
      // sidebar, meant for actually printing on paper rather than reading on screen.
      const printHtml = renderResumePdfDocument(pdfConfig, lang, 'light')
      const printPath = path.join(outDir, `${FILE_PREFIX}-${lang}-print.pdf`)
      await printPdf(browser, printHtml, printPath)
      console.log(`[generate-pdfs] ${lang}/print -> ${path.relative(process.cwd(), printPath)}`)

      for (const variant of resumeVariants) {
        const variantHtml = renderResumePdfDocument(applyVariant(pdfConfig, variant), lang)
        const variantPath = path.join(outDir, `${FILE_PREFIX}-${lang}-${variant.id}.pdf`)
        await printPdf(browser, variantHtml, variantPath)
        console.log(`[generate-pdfs] ${lang}/${variant.id} -> ${path.relative(process.cwd(), variantPath)}`)
      }
    }
  } finally {
    await browser.close()
  }
}

/**
 * No page margin: the dark two-column background has to bleed to the physical page
 * edge. All inset spacing comes from padding inside render-resume-pdf.ts instead.
 */
async function printPdf(browser: Awaited<ReturnType<typeof puppeteer.launch>>, html: string, outPath: string) {
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'load' })
  // The self-hosted faces are embedded as data URIs (no network fetch), but decoding
  // and shaping them is still async — wait for it explicitly rather than relying on
  // 'load' to happen to cover it, so the PDF never prints with a fallback font mid-swap.
  // Passed as a string (not a function) so tsc — this file has no "dom" lib — doesn't
  // need to type-check a `document` reference that only ever runs in the page context.
  await page.evaluate('document.fonts.ready')
  await page.pdf({
    path: outPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
  })
  await page.close()
}

/** Puts the listed items first (in the given order) and keeps every other item after them, in its original order. */
function reorder<T>(items: T[], keyOf: (item: T) => string, order?: string[]): T[] {
  if (!order || order.length === 0) return items
  const rank = (item: T) => {
    const i = order.indexOf(keyOf(item))
    return i === -1 ? order.length : i
  }
  return [...items].sort((a, b) => rank(a) - rank(b))
}

/** Returns a copy of the config with the variant's headline and ordering applied. */
function applyVariant(config: ResumeConfig, variant: ResumeVariant): ResumeConfig {
  return {
    ...config,
    personal: { ...config.personal, title: variant.title },
    featuredProject: config.featuredProject && {
      ...config.featuredProject,
      role: variant.featuredProjectRole ?? config.featuredProject.role,
    },
    skills: reorder(config.skills, (cat) => cat.title.en ?? '', variant.skillsOrder),
    experiences: reorder(config.experiences, (exp) => exp.id, variant.experiencesOrder),
  }
}

main().catch((err) => {
  console.error('[generate-pdfs] failed:', err)
  process.exit(1)
})
