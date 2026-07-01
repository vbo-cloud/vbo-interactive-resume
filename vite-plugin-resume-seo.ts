import type { Plugin } from 'vite'
import type { ResumeConfig } from './src/data/types'
import fs from 'fs'
import path from 'path'
import { renderResumeHtml, escapeHtml } from './scripts/render-resume-html'

/**
 * Vite plugin that injects SEO data directly into the HTML at build time.
 *
 * Since this is a CSR SPA, bots that don't execute JavaScript see an empty page.
 * This plugin reads `resume-config` at build time and injects:
 * - JSON-LD structured data (schema.org Person)
 * - Proper <title> and <meta description>
 * - A rich <noscript> fallback with the full CV content in semantic HTML
 *
 * This ensures crawlers and ATS systems can read the resume data without JS.
 */
export function resumeSeoPlugin(): Plugin {
  let config: ResumeConfig | null = null
  let base = '/'

  return {
    name: 'resume-seo',
    configResolved(resolvedConfig) {
      base = resolvedConfig.base
    },
    async buildStart() {
      // Dynamically import the resume config (works because Vite resolves TS)
      try {
        const mod = await import('./src/data/resume-config')
        config = mod.resumeConfig
      } catch (e) {
        console.warn('[resume-seo] Could not load resume-config, skipping SEO injection:', e)
      }
    },
    transformIndexHtml(html) {
      if (!config) return html

      const defaultLang = config.languages.default
      const resolve = (ls: Record<string, string>) =>
        ls[defaultLang] ?? Object.values(ls)[0] ?? ''

      // 1. Build JSON-LD
      const jsonLd = buildJsonLd(config, resolve)

      // 2. Build noscript HTML with full CV content
      const pdfPath = resolvePdfPath(config, defaultLang)
      const noscriptContent = renderResumeHtml(config, defaultLang, base, pdfPath)

      // 3. Replace title
      html = html.replace(
        /<title>[^<]*<\/title>/,
        `<title>${escapeHtml(config.seo.title)}</title>`,
      )

      // 4. Replace meta description
      html = html.replace(
        /<meta name="description" content="[^"]*"\s*\/?>/,
        `<meta name="description" content="${escapeHtml(config.seo.description)}" />`,
      )

      // 5. Inject JSON-LD before </head>
      html = html.replace(
        '</head>',
        `  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n  </head>`,
      )

      // 6. Replace the existing <noscript> with the enriched version
      html = html.replace(
        /<noscript>[\s\S]*?<\/noscript>/,
        `<noscript>\n${noscriptContent}\n    </noscript>`,
      )

      return html
    },
  }
}

function buildJsonLd(
  config: ResumeConfig,
  resolve: (ls: Record<string, string>) => string,
) {
  const { personal, contact } = config
  const sameAs: string[] = []
  let email: string | undefined
  let url: string | undefined

  for (const c of contact) {
    if (c.type === 'github' && c.href) sameAs.push(c.href)
    if (c.type === 'linkedin' && c.href) sameAs.push(c.href)
    if (c.type === 'website' && c.href) url = c.href
    if (c.type === 'email') email = c.label
  }

  const techs = [...new Set(config.experiences.flatMap((exp) => exp.techs))]

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: personal.name,
    jobTitle: resolve(personal.title),
    ...(url && { url }),
    ...(email && { email }),
    ...(personal.location && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: personal.location,
      },
    }),
    ...(sameAs.length > 0 && { sameAs }),
    ...(techs.length > 0 && { knowsAbout: techs }),
  }
}

/** Resolves the PDF path for a language: explicit config override, or first PDF auto-detected in public/cv/<lang>/. */
function resolvePdfPath(config: ResumeConfig, lang: string): string | null {
  if (config.pdf) {
    return typeof config.pdf.path === 'string'
      ? config.pdf.path
      : (config.pdf.path[lang] ?? Object.values(config.pdf.path)[0] ?? null)
  }

  const cvLangDir = path.resolve(process.cwd(), 'public', 'cv', lang)
  if (fs.existsSync(cvLangDir)) {
    const pdfFile = fs.readdirSync(cvLangDir).find((f) => f.toLowerCase().endsWith('.pdf'))
    if (pdfFile) return `/cv/${lang}/${pdfFile}`
  }
  return null
}
