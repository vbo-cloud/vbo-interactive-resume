import fs from 'fs'
import path from 'path'
import type { ResumeConfig } from '../src/data/types'
import { presets } from '../src/data/presets'
import { getTechColor, getTechTier } from '../src/data/tech-registry'

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function resolveThemeColors(config: ResumeConfig) {
  const preset = presets[config.theme?.preset ?? 'minimal']
  return { ...preset, ...config.theme?.colors }
}

/** Inlines public/images/FullImage.png as a data URI so the PDF is self-contained (no network fetch at print time). */
/**
 * Inline SVG twins of the sidebar icons in src/components/icons/index.tsx. Kept as raw
 * markup rather than imported, since those are JSX components this script cannot render.
 * Attributes are kebab-case here: this is real SVG, not JSX.
 */
const INLINE_ICONS: Record<string, string> = {
  linkedin:
    '<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>',
  email:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>',
  phone:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>',
  website:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>',
  location:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>',
}

/**
 * Renders an icon slot. The slot is emitted even when no icon matches, so every line in
 * a list starts its text at the same x whether or not it carries one.
 */
function iconSlot(name: string | null, color: string): string {
  const svg = name ? INLINE_ICONS[name] : undefined
  return `<span style="display: inline-block; width: 14px; height: 14px; margin-right: 0.5rem; vertical-align: -2px; color: ${color};">${svg ?? ''}</span>`
}

/**
 * The PDF is printed from `page.setContent()` with no base URL, so relative image
 * paths never resolve — every image has to be inlined as a data URI.
 */
function getImageDataUri(fileName: string): string | null {
  try {
    const imgPath = path.resolve(process.cwd(), 'public', 'images', fileName)
    const buffer = fs.readFileSync(imgPath)
    return `data:image/png;base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
}

/**
 * The web timeline lists experiences top (most recent) to bottom (oldest), so each
 * period reads "recent - older" (e.g. "Present - 09/2025") to match that flow. The PDF
 * is a flat, linear document without that visual cue, so the same string reads
 * backwards there — flip it to "older - recent" for PDF-only rendering.
 */
function reverseDateRange(period: string): string {
  const parts = period.split(' - ')
  return parts.length === 2 ? `${parts[1]} - ${parts[0]}` : period
}

/**
 * Relative luminance (WCAG 2.0), mirrors src/components/Resume/TechBadge.tsx.
 * Duplicated locally: this script runs under `tsx` without the `@/` alias, and only
 * needs the light-mode branch (the PDF/noscript body is always rendered on white).
 */
function getLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

function mixColors(a: string, b: string, t: number): string {
  const channel = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
  const mixed = [0, 1, 2].map((i) => Math.round(channel(a, i) + (channel(b, i) - channel(a, i)) * t))
  return `#${mixed.map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

function darkenColor(hex: string, amount: number): string {
  const channel = (i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
  const darkened = [0, 1, 2].map((i) => Math.round(channel(i) * (1 - amount)))
  return `#${darkened.map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

/** Mirrors TechBadge.tsx's `ensureLightModeReadable` — same 0.14 target, same reasoning. */
function ensureLightModeReadable(hex: string): string {
  let color = hex
  let luminance = getLuminance(color)
  let step = 0
  while (luminance > 0.14 && step < 10) {
    color = darkenColor(color, 0.2)
    luminance = getLuminance(color)
    step++
  }
  return color
}

const WORKFLOW_DARK_GRAY = '#374151' // TechBadge.tsx's light-theme `workflow` badge — dark gray, not black

/**
 * A couple of tech labels aren't language-resolved at the source (techs are plain
 * strings, not LocalizedString) — this covers the ones that need a French display
 * label without touching their color/tier lookup, which stays keyed on the English name.
 */
const TECH_LABEL_FR: Record<string, string> = {
  'Agile Methods': 'Méthodes Agiles',
}

/** Renders one tech as a colored badge <span>. Shared by renderTechBadges' single-row and grouped forms. */
function renderOneBadge(tech: string, badgePadding: string, badgeMargin: string, badgeFontSize: string, lang = 'en'): string {
  const tier = getTechTier(tech)
  const color = getTechColor(tech)
  const label = lang === 'fr' ? (TECH_LABEL_FR[tech] ?? tech) : tech
  let background: string
  let fg: string
  let border: string

  if (tier === 'workflow') {
    background = WORKFLOW_DARK_GRAY
    fg = '#e5e7eb'
    border = 'rgba(255, 255, 255, 0.3)'
  } else if (tier === 'support') {
    fg = ensureLightModeReadable(mixColors(color, '#64748b', 0.7))
    background = `${fg}1f`
    border = 'transparent'
  } else if (tier === 'muted') {
    fg = '#4b5563' // darkened from the spec's #6b7280 to clear WCAG AA (4.5:1)
    background = 'rgba(0, 0, 0, 0.045)'
    border = 'transparent'
  } else {
    fg = ensureLightModeReadable(color)
    background = `${color}20`
    border = `${color}59`
  }

  return `<span style="display: inline-block; line-height: 1.25; margin: ${badgeMargin}; padding: ${badgePadding}; border-radius: 4px; font-size: ${badgeFontSize}; font-weight: 500; background: ${background}; color: ${fg}; border: 1px solid ${border};">${escapeHtml(label)}</span>`
}

/** Light-mode-only counterpart to TechBadge.tsx's `resolveTierStyle` (the PDF/noscript body has no dark mode). */
function renderTechBadges(techs: string[], isPdf = false, compact = true, lang = 'en'): string {
  if (techs.length === 0) return ''
  const badgePadding = isPdf ? (compact ? '0.04rem 0.4rem' : '0.15rem 0.55rem') : '0.15rem 0.55rem'
  const badgeMargin = isPdf ? (compact ? '0 0.2rem 0.15rem 0' : '0 0.35rem 0.35rem 0') : '0 0.35rem 0.35rem 0'
  const badgeFontSize = '0.8rem'
  const wrapMargin = isPdf ? (compact ? '0.12rem 0' : '0.2rem 0') : '0.35rem 0'
  const badges = techs.map((tech) => renderOneBadge(tech, badgePadding, badgeMargin, badgeFontSize, lang)).join('')
  return `<div style="margin: ${wrapMargin};">${badges}</div>`
}

/**
 * Same badge styling as renderTechBadges, but split into clusters separated by the
 * same round-bullet marker used between tasks in the experience paragraphs — for the
 * PDF-only skills rows that group related techs within one category.
 */
function renderGroupedTechBadges(groups: string[][], primaryColor: string, lang = 'en'): string {
  const badgePadding = '0.15rem 0.55rem'
  const badgeMargin = '0 0.35rem 0.35rem 0'
  const badgeFontSize = '0.8rem'
  const separator = ` <span style="color: ${primaryColor}; font-weight: 700;">&bull;</span> `
  const groupsHtml = groups
    .filter((g) => g.length > 0)
    .map((group) => group.map((tech) => renderOneBadge(tech, badgePadding, badgeMargin, badgeFontSize, lang)).join(''))
    .join(separator)
  return `<div style="margin: 0.2rem 0;">${groupsHtml}</div>`
}

/**
 * Renders the full resume as a flat, semantic HTML fragment for a given language —
 * a single reading column (deliberately no sidebar/multi-column layout, which can
 * scramble text order for ATS parsers), lightly themed with the site's colors.
 * Used both as the <noscript> SEO/ATS fallback and as the source for PDF generation
 * (scripts/generate-pdfs.ts).
 */
export function renderResumeHtml(
  config: ResumeConfig,
  lang: string,
  base: string,
  pdfPath: string | null = null,
  siteUrl: string | null = null,
): string {
  const resolve = (ls: Record<string, string>) => ls[lang] ?? Object.values(ls)[0] ?? ''
  const colors = resolveThemeColors(config)
  // siteUrl is only ever passed when generating the downloadable PDF, never for the <noscript> fallback.
  const isPdf = Boolean(siteUrl)
  const sectionGap = isPdf ? '1.4rem' : '1.5rem'
  const articleGap = isPdf ? '1.15rem' : '1.25rem'
  const sectionTitle = (label: string) =>
    `<h2 style="font-size: ${isPdf ? '0.95rem' : '1.1rem'}; text-transform: uppercase; color: ${colors.text}; border-bottom: 2px solid ${colors.primary}40; padding-bottom: ${isPdf ? '0.15rem' : '0.25rem'}; margin-bottom: ${isPdf ? '0.3rem' : '0.5rem'};">${escapeHtml(label)}</h2>`

  const { personal, contact, skills, experiences, education, projects, values, hobbies, referents } = config
  const lines: string[] = []

  const indent = '      '
  const containerMargin = isPdf ? '0 auto' : '2rem auto'
  const containerPadding = isPdf ? '0.3rem' : '2rem'
  const lineHeight = isPdf ? 1.55 : 1.6
  lines.push(`${indent}<div style="max-width: 800px; margin: ${containerMargin}; padding: ${containerPadding}; font-family: system-ui, -apple-system, sans-serif; color: ${colors.text}; line-height: ${lineHeight};">`)

  // Header — on the PDF, no more screenshot/CTA banner: just a small QR code pinned
  // to the corner (siteUrl is only ever passed when generating the PDF, never for
  // the <noscript> fallback), and the pitch (accroche) right under the title.
  const qrCodeDataUri = isPdf ? getImageDataUri('qr-code.png') : null
  const headerBorder = isPdf ? '' : `border-bottom: 2px solid ${colors.primary}; `
  const headerPaddingRight = isPdf && qrCodeDataUri ? 'padding-right: 4.5rem; ' : ''
  lines.push(`${indent}  <header style="position: relative; margin-bottom: ${isPdf ? '0.6rem' : '2rem'}; ${headerBorder}${headerPaddingRight}padding-bottom: ${isPdf ? '0' : '1rem'};">`)
  lines.push(`${indent}    <h1 style="margin: 0 0 0.15rem 0; font-size: ${isPdf ? '1.3rem' : '1.75rem'}; color: ${colors.text};">${escapeHtml(personal.name)}</h1>`)
  lines.push(`${indent}    <p style="margin: 0 0 0.15rem 0; font-size: ${isPdf ? '1rem' : '1.1rem'}; color: ${colors.primary}; font-weight: 600;">${escapeHtml(resolve(personal.title))}</p>`)
  if (personal.tagline) {
    lines.push(`${indent}    <p style="margin: 0 0 0.25rem 0; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.03em; color: ${colors.textSecondary}b3;">${escapeHtml(resolve(personal.tagline))}</p>`)
  }
  if (personal.subtitle) {
    // Normal style, black text — not italic/grey like the on-site subtitle, per an
    // explicit PDF styling request (the accroche should read as primary content).
    const subtitleStyle = isPdf
      ? `margin: 0.35rem 0 0.25rem 0; font-size: 0.95rem; color: ${colors.text};`
      : `margin: 1rem 0 0.25rem 0; color: ${colors.textSecondary}; font-style: italic;`
    lines.push(`${indent}    <p style="${subtitleStyle}">${escapeHtml(resolve(personal.subtitle))}</p>`)
  }
  if (personal.location && !isPdf) {
    // On the PDF, the location already appears in the Contact section below — no
    // need to repeat it right under the headline.
    lines.push(`${indent}    <p style="margin: 0; color: ${colors.textSecondary};">${escapeHtml(personal.location)}</p>`)
  }
  if (qrCodeDataUri) {
    lines.push(`${indent}    <img src="${qrCodeDataUri}" alt="${escapeHtml(siteUrl ?? '')}" style="position: absolute; top: 0; right: 0; width: 60px; height: 60px;" />`)
  }
  lines.push(`${indent}  </header>`)

  // Contact + Referents — side by side on the PDF (two narrow columns instead of two
  // full-width stacked sections) to reclaim vertical space; stacked as usual on the
  // <noscript> fallback, which has no such space pressure.
  const contactBlock = contact.length > 0 || (isPdf && siteUrl)
    ? [
        sectionTitle(resolve(config.labels.sections.contact)),
        `<ul style="list-style: none; padding: 0; margin: 0;">`,
        ...contact.map((c) => {
          const slot = iconSlot(c.type in INLINE_ICONS ? c.type : null, colors.primary)
          const linkedinBold = isPdf && c.type === 'linkedin' ? ' font-weight: 600;' : ''
          const inner = c.href
            ? `<a href="${escapeHtml(c.href)}" style="color: ${colors.primary};${linkedinBold}">${escapeHtml(c.label)}</a>`
            : escapeHtml(c.label)
          return `<li style="margin-bottom: ${isPdf ? '0.12rem' : '0.25rem'};">${slot}${inner}</li>`
        }),
        // Replaces the old screenshot/button hero banner: a plain contact-list line
        // linking back to the interactive site.
        ...(isPdf && siteUrl
          ? [`<li style="margin-bottom: 0.12rem;">🔗 <a href="${escapeHtml(siteUrl)}" style="color: ${colors.primary};">${lang === 'fr' ? 'CV interactif' : 'Interactive resume'}</a></li>`]
          : []),
        `</ul>`,
      ].join(`\n${indent}    `)
    : null

  const referentsBlock = referents?.length && config.labels.sections.referent
    ? [
        sectionTitle(resolve(config.labels.sections.referent)),
        ...referents.map((referent, index) => {
          const referentName = referent.href
            ? `<a href="${escapeHtml(referent.href)}" style="color: ${colors.text}; font-weight: 600; text-decoration: ${isPdf ? 'underline' : 'none'};">${escapeHtml(referent.name)}</a>`
            : `<span style="font-weight: 600;">${escapeHtml(referent.name)}</span>`
          // Space each entry apart from the previous one, so the second name never
          // butts against the first one's title (both <p> tags have margin: 0).
          const spacing = index > 0 ? ' margin-top: 0.5rem;' : ''
          // Icon on the name line only, title left flush underneath, mirroring the sidebar.
          const slot = iconSlot(referent.href ? 'linkedin' : null, colors.primary)
          return `<p style="margin: 0;${spacing}">${slot}${referentName}</p>\n${indent}    <p style="margin: 0; color: ${colors.textSecondary};">${escapeHtml(resolve(referent.title))}</p>`
        }),
      ].join(`\n${indent}    `)
    : null

  if (contactBlock || referentsBlock) {
    if (isPdf && contactBlock && referentsBlock) {
      lines.push(`${indent}  <section style="margin-bottom: ${sectionGap}; display: flex; gap: 2rem;">`)
      lines.push(`${indent}    <div style="flex: 1;">`)
      lines.push(`${indent}    ${contactBlock}`)
      lines.push(`${indent}    </div>`)
      lines.push(`${indent}    <div style="flex: 1;">`)
      lines.push(`${indent}    ${referentsBlock}`)
      lines.push(`${indent}    </div>`)
      lines.push(`${indent}  </section>`)
    } else {
      if (contactBlock) {
        lines.push(`${indent}  <section style="margin-bottom: ${sectionGap};">`)
        lines.push(`${indent}    ${contactBlock}`)
        lines.push(`${indent}  </section>`)
      }
      if (referentsBlock) {
        lines.push(`${indent}  <section style="margin-bottom: ${sectionGap};">`)
        lines.push(`${indent}    ${referentsBlock}`)
        lines.push(`${indent}  </section>`)
      }
    }
  }

  // Skills
  if (skills.length > 0) {
    lines.push(`${indent}  <section style="margin-bottom: ${sectionGap};">`)
    lines.push(`${indent}    ${sectionTitle(resolve(config.labels.sections.skills))}`)
    if (isPdf) {
      // One row per category: name aligned with its badges on the same line — no
      // card background, no columns, just a simple aligned list.
      lines.push(`${indent}    <div style="display: flex; flex-direction: column; gap: 0.35rem;">`)
      for (const cat of skills) {
        const items = cat.type === 'badges'
          ? cat.items.map((item) => (typeof item.name === 'string' ? item.name : resolve(item.name)))
          : cat.items.map((item) => {
              const name = typeof item.name === 'string' ? item.name : resolve(item.name)
              return cat.type === 'languages' && item.level ? `${name} (${resolve(item.level)})` : name
            })
        let body: string
        if (cat.type === 'badges' && cat.groupSizes && cat.groupSizes.reduce((a, b) => a + b, 0) === items.length) {
          const groups: string[][] = []
          let offset = 0
          for (const size of cat.groupSizes) {
            groups.push(items.slice(offset, offset + size))
            offset += size
          }
          body = renderGroupedTechBadges(groups, colors.primary, lang)
        } else if (cat.type === 'badges') {
          body = renderTechBadges(items, isPdf, false, lang)
        } else {
          body = `<span style="color: ${colors.textSecondary};">${escapeHtml(items.join(' · '))}</span>`
        }
        lines.push(`${indent}      <div style="display: flex; align-items: baseline; gap: 0.5rem;">`)
        lines.push(`${indent}        <span style="display: inline-block; width: 8rem; flex-shrink: 0; font-weight: 600;">${escapeHtml(resolve(cat.title))}</span>`)
        lines.push(`${indent}        <div style="flex: 1;">${body}</div>`)
        lines.push(`${indent}      </div>`)
      }
      lines.push(`${indent}    </div>`)
    } else {
      for (const cat of skills) {
        const items = cat.type === 'badges'
          ? cat.items.map((item) => (typeof item.name === 'string' ? item.name : resolve(item.name)))
          : cat.items.map((item) => {
              const name = typeof item.name === 'string' ? item.name : resolve(item.name)
              return cat.type === 'languages' && item.level ? `${name} (${resolve(item.level)})` : name
            })
        lines.push(`${indent}    <p style="margin: 0.5rem 0 0.25rem 0; font-weight: 600;">${escapeHtml(resolve(cat.title))}</p>`)
        if (cat.type === 'badges') {
          lines.push(`${indent}    ${renderTechBadges(items, isPdf)}`)
        } else {
          lines.push(`${indent}    <p style="margin: 0; color: ${colors.textSecondary};">${escapeHtml(items.join(' · '))}</p>`)
        }
      }
    }
    lines.push(`${indent}  </section>`)
  }

  // Featured project — pulled out of "experiences" so it isn't buried under a job
  // title. Real bullets (<ul><li>), like the Experiences section below.
  if (isPdf && config.featuredProject) {
    const fp = config.featuredProject
    lines.push(`${indent}  <section style="margin-bottom: ${sectionGap};">`)
    lines.push(`${indent}    ${sectionTitle(lang === 'fr' ? 'PROJET PHARE' : 'FLAGSHIP PROJECT')}`)
    lines.push(`${indent}    <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 0.5rem;">`)
    lines.push(`${indent}      <h3 style="margin: 0 0 0.15rem 0; font-size: 1.02rem; color: ${colors.text};">${escapeHtml(resolve(fp.title))}</h3>`)
    lines.push(`${indent}      <span style="flex-shrink: 0; white-space: nowrap; font-size: 0.85rem; color: ${colors.primary}; font-weight: 500;">${escapeHtml(resolve(fp.period))}</span>`)
    lines.push(`${indent}    </div>`)
    if (fp.techs && fp.techs.length > 0) {
      lines.push(`${indent}    ${renderTechBadges(fp.techs, isPdf, true, lang)}`)
    }
    if (fp.url) {
      lines.push(`${indent}    <p style="margin: 0.15rem 0; font-size: 0.85rem;"><a href="${escapeHtml(fp.url)}" style="color: ${colors.primary}; text-decoration: underline;">${escapeHtml(fp.url)}</a></p>`)
    }
    if (fp.description) {
      lines.push(`${indent}    <p style="margin: 0 0 0.15rem 0; font-size: 0.95rem;">${escapeHtml(resolve(fp.description))}</p>`)
    }
    const bullets = fp.bullets[lang] ?? Object.values(fp.bullets)[0] ?? []
    if (bullets.length > 0) {
      lines.push(`${indent}    <ul style="margin: 0.3rem 0 0 1rem; padding: 0;">`)
      for (const bullet of bullets) {
        lines.push(`${indent}      <li style="margin-bottom: 0.15rem; font-size: 0.95rem; color: ${colors.text};">${escapeHtml(bullet)}</li>`)
      }
      lines.push(`${indent}    </ul>`)
    }
    lines.push(`${indent}  </section>`)
  }

  // Experiences
  if (experiences.length > 0) {
    lines.push(`${indent}  <section style="margin-bottom: ${sectionGap};">`)
    lines.push(`${indent}    ${sectionTitle(resolve(config.labels.sections.experience))}`)
    for (const exp of experiences) {
      lines.push(`${indent}    <article style="margin-bottom: ${articleGap};">`)
      const periodText = resolve(exp.period)
      if (isPdf) {
        // Title + status grouped together on the left (status right next to the
        // title), date pinned to the far right edge on the same line.
        lines.push(`${indent}      <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 0.5rem;">`)
        lines.push(`${indent}        <span style="display: flex; align-items: baseline; gap: 0.5rem;">`)
        lines.push(`${indent}          <h3 style="margin: 0 0 0.15rem 0; font-size: 1.02rem; color: ${colors.text};">${escapeHtml(resolve(exp.role))} - ${escapeHtml(resolve(exp.company))}</h3>`)
        if (exp.type) {
          // Soft red badge — a status pill, not an alert, so kept low-contrast.
          lines.push(`${indent}          <span style="flex-shrink: 0; white-space: nowrap; display: inline-block; padding: 0.08rem 0.5rem; border-radius: 4px; background: #fee2e2; border: 1px solid #fecaca; font-size: 0.78rem; color: #b91c1c; font-weight: 600;">${escapeHtml(resolve(exp.type))}</span>`)
        }
        lines.push(`${indent}        </span>`)
        lines.push(`${indent}        <span style="flex-shrink: 0; white-space: nowrap; font-size: 0.85rem; color: ${colors.primary}; font-weight: 500;">${escapeHtml(reverseDateRange(periodText))}</span>`)
        lines.push(`${indent}      </div>`)
      } else {
        lines.push(`${indent}      <h3 style="margin: 0 0 0.15rem 0; font-size: 1rem; color: ${colors.text};">${escapeHtml(resolve(exp.role))} - ${escapeHtml(resolve(exp.company))}</h3>`)
      }
      const techBadges = renderTechBadges(exp.techs, isPdf, true, lang)
      if (isPdf) {
        // Badges sit right under the title, ahead of dates/description — the tech
        // stack is the first thing to scan for this role.
        lines.push(`${indent}      ${techBadges}`)
      }
      if (exp.url) {
        lines.push(`${indent}      <p style="margin: 0 0 0.15rem 0; font-size: ${isPdf ? '0.85rem' : '0.9rem'};"><a href="${escapeHtml(exp.url)}" style="color: ${colors.primary}; text-decoration: ${isPdf ? 'underline' : 'none'};">${escapeHtml(exp.url)}</a></p>`)
      }
      if (!isPdf) {
        // Date + status already sit next to the title on the PDF, so this line is web-only.
        const meta = exp.type ? [periodText, resolve(exp.type)] : [periodText]
        lines.push(`${indent}      <p style="margin: 0 0 0.25rem 0; color: ${colors.primary}; font-size: 0.9rem; font-weight: 500;">${escapeHtml(meta.join(' · '))}</p>`)
      }
      lines.push(`${indent}      <p style="margin: 0 0 ${isPdf ? '0.15rem' : '0.25rem'} 0; font-size: ${isPdf ? '0.95rem' : '1rem'};">${escapeHtml(resolve(exp.description))}</p>`)
      if (!isPdf) {
        lines.push(`${indent}      ${techBadges}`)
      }
      if (exp.details?.tasks) {
        const tasks = exp.details.tasks[lang] ?? Object.values(exp.details.tasks)[0]
        if (tasks && tasks.length > 0) {
          const taskFontSize = isPdf ? '0.9rem' : '0.9rem'
          lines.push(`${indent}      <ul style="margin: ${isPdf ? '0.25rem' : '0.5rem'} 0 0 1rem; padding: 0;">`)
          for (const task of tasks) {
            lines.push(`${indent}        <li style="margin-bottom: 0.15rem; font-size: ${taskFontSize}; color: ${colors.text};">${escapeHtml(task)}</li>`)
          }
          lines.push(`${indent}      </ul>`)
        }
      }
      if (isPdf && exp.portfolioNote) {
        const before = lang === 'fr' ? 'Détail complet sur mon ' : 'Full detail on my '
        const linkText = lang === 'fr' ? 'portfolio' : 'portfolio'
        lines.push(`${indent}      <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; font-style: italic; color: ${colors.textSecondary};">${escapeHtml(before)}<a href="https://vincentboutin.dev" style="color: #2563eb; text-decoration: underline;">${escapeHtml(linkText)}</a>.</p>`)
      }
      lines.push(`${indent}    </article>`)
    }
    lines.push(`${indent}  </section>`)
  }

  // Education
  if (education.length > 0) {
    lines.push(`${indent}  <section style="margin-bottom: ${sectionGap};">`)
    lines.push(`${indent}    ${sectionTitle(resolve(config.labels.sections.education))}`)
    for (const edu of education) {
      lines.push(`${indent}    <div style="margin-bottom: ${isPdf ? "0.4rem" : "0.75rem"};">`)
      const degreeLine = edu.badge
        ? `${escapeHtml(resolve(edu.degree))} <span style="color: #b91c1c; font-size: 0.8rem; font-weight: 500;">(${escapeHtml(resolve(edu.badge))})</span>`
        : escapeHtml(resolve(edu.degree))
      lines.push(`${indent}      <p style="margin: 0; font-weight: 600; color: ${colors.text};">${degreeLine}</p>`)
      if (edu.specialty) {
        lines.push(`${indent}      <p style="margin: 0; color: ${colors.textSecondary};">${escapeHtml(resolve(edu.specialty))}</p>`)
      }
      const eduMeta = [resolve(edu.school)]
      if (edu.period) eduMeta.push(edu.period)
      lines.push(`${indent}      <p style="margin: 0; color: ${colors.primary}; font-size: 0.9rem;">${escapeHtml(eduMeta.join(' · '))}</p>`)
      lines.push(`${indent}    </div>`)
    }
    lines.push(`${indent}  </section>`)
  }

  // Projects
  if (projects && projects.length > 0 && config.labels.sections.projects) {
    lines.push(`${indent}  <section style="margin-bottom: ${sectionGap};">`)
    lines.push(`${indent}    ${sectionTitle(resolve(config.labels.sections.projects))}`)
    for (const proj of projects) {
      lines.push(`${indent}    <div style="margin-bottom: ${isPdf ? "0.4rem" : "0.75rem"};">`)
      const titleHtml = proj.url
        ? `<a href="${escapeHtml(proj.url)}" style="color: ${colors.primary};">${escapeHtml(resolve(proj.title))}</a>`
        : escapeHtml(resolve(proj.title))
      lines.push(`${indent}      <p style="margin: 0; font-weight: 600; color: ${colors.text};">${titleHtml}</p>`)
      lines.push(`${indent}      <p style="margin: 0; color: ${colors.textSecondary};">${escapeHtml(resolve(proj.description))}</p>`)
      lines.push(`${indent}      ${renderTechBadges(proj.techs, isPdf)}`)
      lines.push(`${indent}    </div>`)
    }
    lines.push(`${indent}  </section>`)
  }

  // Values
  if (values && values.length > 0 && config.labels.sections.values) {
    lines.push(`${indent}  <section style="margin-bottom: ${sectionGap};">`)
    lines.push(`${indent}    ${sectionTitle(resolve(config.labels.sections.values))}`)
    lines.push(`${indent}    <p style="margin: 0; color: ${colors.textSecondary};">${escapeHtml(values.map((v) => resolve(v)).join(' · '))}</p>`)
    lines.push(`${indent}  </section>`)
  }

  // Hobbies
  if (hobbies && hobbies.length > 0 && config.labels.sections.hobbies) {
    lines.push(`${indent}  <section style="margin-bottom: ${sectionGap};">`)
    lines.push(`${indent}    ${sectionTitle(resolve(config.labels.sections.hobbies))}`)
    if (isPdf) {
      // Single line for the whole section: "Sport : Musculation, Escalade (Bloc) · Musique : Mix, ...".
      // A colon rather than wrapping parens, since a detail can already carry its own (e.g. "Escalade (Bloc)").
      const oneLine = hobbies
        .map((hobby) => {
          const details = hobby.details?.map((d) => resolve(d)).join(', ')
          return details ? `${resolve(hobby.title)} : ${details}` : resolve(hobby.title)
        })
        .join(' · ')
      lines.push(`${indent}    <p style="margin: 0; color: ${colors.textSecondary};">${escapeHtml(oneLine)}</p>`)
    } else {
      for (const hobby of hobbies) {
        const details = hobby.details?.map((d) => resolve(d)).join(' / ')
        const titleHtml = `<span style="color: ${colors.text}; font-weight: 600;">${escapeHtml(resolve(hobby.title))}</span>`
        const line = details ? `${titleHtml} : ${escapeHtml(details)}` : titleHtml
        lines.push(`${indent}    <p style="margin: 0 0 0.15rem 0; color: ${colors.textSecondary};">${line}</p>`)
      }
    }
    lines.push(`${indent}  </section>`)
  }

  // PDF download link — resolved by the caller (config override or folder auto-detect); omitted entirely when rendering the PDF itself
  if (pdfPath) {
    const pdfHref = pdfPath.startsWith('/') ? `${base.replace(/\/$/, '')}${pdfPath}` : pdfPath
    lines.push(`${indent}  <p style="margin-top: 2rem; text-align: center;"><a href="${escapeHtml(pdfHref)}" style="color: ${colors.primary}; font-weight: 500;">📄 Download PDF</a></p>`)
  }

  lines.push(`${indent}</div>`)

  return lines.join('\n')
}
