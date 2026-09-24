import fs from 'fs'
import path from 'path'
import type { ResumeConfig } from '../src/data/types'
import { presets } from '../src/data/presets'
import { getTechBadgeColor } from '../src/data/tech-registry'
import { escapeHtml } from './render-resume-html'

/**
 * Dedicated PDF renderer — a from-scratch replica of the site's dark, two-column
 * card layout (Sidebar.tsx / MainContent.tsx), NOT a fork of render-resume-html.ts.
 * That file also feeds the <noscript> SEO fallback (vite-plugin-resume-seo.ts); keeping
 * this generator separate means nothing here can ever change what the live site or its
 * fallback render, even by accident.
 */

/** Sidebar width as a % of the page. Narrower than the site's 38% (md:w-[38%]). */
const SIDEBAR_WIDTH_PCT = 29

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

function iconSlot(name: string | null, color: string): string {
  const svg = name ? INLINE_ICONS[name] : undefined
  return `<span style="display: inline-block; width: 14px; height: 14px; margin-right: 0.5rem; vertical-align: -2px; color: ${color}; flex-shrink: 0;">${svg ?? ''}</span>`
}

function getImageDataUri(fileName: string): string | null {
  try {
    const imgPath = path.resolve(process.cwd(), 'public', 'images', fileName)
    const buffer = fs.readFileSync(imgPath)
    const ext = path.extname(fileName).slice(1).toLowerCase()
    const mime = ext === 'jpg' ? 'jpeg' : ext
    return `data:image/${mime};base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
}

/**
 * Self-hosted, embedded as base64 so headless Chrome never depends on a network
 * fetch or a relative path resolving against the printed HTML's base URL. Not
 * wrapped in try/catch: a missing font file here would silently reintroduce the
 * layout-shifting-fallback-font bug (prod PDF running longer than 1 page) that
 * this is fixing, so a missing file should fail the build loudly instead.
 */
function getFontDataUri(fileName: string): string {
  const fontPath = path.resolve(process.cwd(), 'public', 'fonts', fileName)
  const buffer = fs.readFileSync(fontPath)
  return `data:font/ttf;base64,${buffer.toString('base64')}`
}

// Selawik is Microsoft's own open substitute for Segoe UI (the font system-ui was
// resolving to locally on Windows) — chosen over a generic webfont so self-hosting it
// doesn't shift the line-wrapping the layout was tuned against. No 500 weight ships,
// so it's mapped onto the regular face; no italic face ships either, so italic text
// (see font-style: italic below) falls back to the browser's synthetic-oblique of the
// regular face rather than a different, wider font.
const FONT_REGULAR_DATA_URI = getFontDataUri('selawik-regular.ttf')
const FONT_SEMIBOLD_DATA_URI = getFontDataUri('selawik-semibold.ttf')
const FONT_BOLD_DATA_URI = getFontDataUri('selawik-bold.ttf')

/**
 * The web timeline lists experiences top (most recent) to bottom (oldest), so each
 * period reads "recent - older". Flip it to "older - recent" for the flat PDF document.
 */
function reverseDateRange(period: string): string {
  const parts = period.split(' - ')
  return parts.length === 2 ? `${parts[1]} - ${parts[0]}` : period
}

function resolveDarkThemeColors(config: ResumeConfig) {
  const preset = presets[config.theme?.preset ?? 'minimal']
  const merged = { ...preset, ...config.theme?.colors }
  return {
    bg: merged.bgDark,
    bgCard: merged.bgCardDark,
    text: merged.textDark,
    textSecondary: merged.textSecondaryDark,
    primary: merged.primaryDark,
    primaryLight: merged.primaryLightDark,
    sidebarFrom: merged.sidebarDark,
    sidebarTo: merged.sidebarDarkEnd,
  }
}

/** A couple of tech labels need a French display label without touching the color lookup. */
const TECH_LABEL_FR: Record<string, string> = {
  'Agile Methods': 'Méthodes Agiles',
}

/**
 * Same recipe as TechBadge.tsx, resolved through the same central palette
 * (tech-registry.ts): full-opacity text, 14% tint background, 45% tint border.
 * The PDF is always dark, so this always reads the 'dark' half of the palette.
 */
function renderBadge(tech: string, lang: string): string {
  const color = getTechBadgeColor(tech, 'dark')
  const label = lang === 'fr' ? (TECH_LABEL_FR[tech] ?? tech) : tech
  return `<span style="display: inline-block; padding: 0.22rem 0.5rem; border-radius: 4px; font-size: 0.72rem; font-weight: 500; line-height: 1.2; background: ${color}24; color: ${color}; border: 1px solid ${color}73;">${escapeHtml(label)}</span>`
}

function renderBadges(techs: string[], lang: string, gap = '0.35rem', marginTop = '0.4rem'): string {
  if (techs.length === 0) return ''
  return `<div style="display: flex; flex-wrap: wrap; gap: ${gap}; margin-top: ${marginTop};">${techs.map((t) => renderBadge(t, lang)).join('')}</div>`
}

/** Mirrors SidebarSection.tsx: small tracking-widest heading, underlined. */
function sidebarSectionTitle(label: string, colors: ReturnType<typeof resolveDarkThemeColors>): string {
  return `<h3 style="font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em; color: ${colors.text}; margin: 0 0 0.6rem 0; padding-bottom: 0.3rem; border-bottom: 1px solid ${colors.primary}33;">${escapeHtml(label)}</h3>`
}

/** Mirrors MainContent.tsx's section headings ("EXPERIENCE", "EDUCATION", ...). */
function mainSectionTitle(label: string, colors: ReturnType<typeof resolveDarkThemeColors>): string {
  return `<h2 style="font-size: 0.78rem; font-weight: 700; letter-spacing: 0.1em; color: ${colors.text}; margin: 0 0 0.9rem 0; padding-bottom: 0.4rem; border-bottom: 1px solid ${colors.primary}33;">${escapeHtml(label)}</h2>`
}

export function renderResumePdfDocument(config: ResumeConfig, lang: string): string {
  const resolve = (ls: Record<string, string>) => ls[lang] ?? Object.values(ls)[0] ?? ''
  const colors = resolveDarkThemeColors(config)
  const { personal, contact, skills, experiences, education, values, hobbies, referents, spokenLanguages } = config

  const s: string[] = []

  // ----- Sidebar (Sidebar.tsx: photo, contact, referents, skills, values, hobbies) -----
  const sidebar: string[] = []

  const photoDataUri = getImageDataUri(personal.photo?.split('/').pop() ?? 'photo.jpg')
  sidebar.push(`<div style="display: flex; justify-content: center; margin-bottom: 1.1rem;">`)
  if (photoDataUri) {
    sidebar.push(
      `<div style="width: 96px; height: 96px; border-radius: 50%; overflow: hidden; border: 3px solid ${colors.bg}66; box-shadow: 0 6px 16px rgba(0,0,0,0.4);"><img src="${photoDataUri}" alt="${escapeHtml(personal.name)}" style="width: 100%; height: 100%; object-fit: cover;" /></div>`,
    )
  } else {
    sidebar.push(
      `<div style="width: 96px; height: 96px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight}); border: 3px solid ${colors.bg}66; box-shadow: 0 6px 16px rgba(0,0,0,0.4); font-size: 2.2rem;">${personal.photoBackEmoji ?? '👨‍💻'}</div>`,
    )
  }
  sidebar.push(`</div>`)

  if (personal.subtitle) {
    sidebar.push(`<p style="margin: 0 0 1.2rem 0; font-size: 0.76rem; font-style: italic; line-height: 1.5; text-align: justify; color: ${colors.textSecondary};">${escapeHtml(resolve(personal.subtitle))}</p>`)
  }

  if (contact.length > 0) {
    sidebar.push(`<section style="margin-bottom: 1.2rem;">`)
    sidebar.push(sidebarSectionTitle(resolve(config.labels.sections.contact), colors))
    sidebar.push(`<ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.55rem;">`)
    for (const c of contact) {
      const slot = iconSlot(c.type in INLINE_ICONS ? c.type : null, colors.primary)
      const inner = c.href
        ? `<a href="${escapeHtml(c.href)}" style="color: ${colors.text}; text-decoration: none;">${escapeHtml(c.label)}</a>`
        : `<span style="color: ${colors.text};">${escapeHtml(c.label)}</span>`
      sidebar.push(`<li style="display: flex; align-items: center; font-size: 0.8rem;">${slot}${inner}</li>`)
    }
    sidebar.push(`</ul>`)
    sidebar.push(`</section>`)
  }

  if (referents?.length && config.labels.sections.referent) {
    sidebar.push(`<section style="margin-bottom: 1.2rem;">`)
    sidebar.push(sidebarSectionTitle(resolve(config.labels.sections.referent), colors))
    sidebar.push(`<div style="display: flex; flex-direction: column; gap: 0.6rem;">`)
    for (const referent of referents) {
      const slot = iconSlot(referent.href ? 'linkedin' : null, colors.primary)
      const nameHtml = referent.href
        ? `<a href="${escapeHtml(referent.href)}" style="color: ${colors.text}; font-weight: 600; text-decoration: none;">${escapeHtml(referent.name)}</a>`
        : `<span style="font-weight: 600; color: ${colors.text};">${escapeHtml(referent.name)}</span>`
      sidebar.push(`<div>`)
      sidebar.push(`<p style="margin: 0; font-size: 0.82rem; display: flex; align-items: center;">${slot}${nameHtml}</p>`)
      sidebar.push(`<p style="margin: 0; font-size: 0.75rem; color: ${colors.textSecondary};">${escapeHtml(resolve(referent.title))}</p>`)
      sidebar.push(`</div>`)
    }
    sidebar.push(`</div>`)
    sidebar.push(`</section>`)
  }

  if (skills.length > 0) {
    sidebar.push(`<section style="margin-bottom: 1.2rem;">`)
    sidebar.push(sidebarSectionTitle(resolve(config.labels.sections.skills), colors))
    sidebar.push(`<div style="display: flex; flex-direction: column; gap: 0.8rem;">`)
    for (const cat of skills) {
      sidebar.push(`<div>`)
      sidebar.push(`<p style="margin: 0 0 0.3rem 0; font-size: 0.75rem; font-weight: 500; color: ${colors.text};">${escapeHtml(resolve(cat.title))}</p>`)
      if (cat.type === 'badges') {
        const items = cat.items.map((item) => (typeof item.name === 'string' ? item.name : resolve(item.name)))
        sidebar.push(renderBadges(items, lang, '0.3rem'))
      } else {
        const items = cat.items.map((item) => {
          const name = typeof item.name === 'string' ? item.name : resolve(item.name)
          return cat.type === 'languages' && item.level ? `${name} (${resolve(item.level)})` : name
        })
        sidebar.push(`<p style="margin: 0; font-size: 0.75rem; color: ${colors.textSecondary};">${escapeHtml(items.join(', '))}</p>`)
      }
      sidebar.push(`</div>`)
    }
    sidebar.push(`</div>`)
    sidebar.push(`</section>`)
  }

  if (values && values.length > 0 && config.labels.sections.values) {
    sidebar.push(`<section style="margin-bottom: 1.2rem;">`)
    sidebar.push(sidebarSectionTitle(resolve(config.labels.sections.values), colors))
    sidebar.push(`<div style="display: flex; flex-direction: column; gap: 0.2rem;">`)
    for (const v of values) {
      sidebar.push(`<p style="margin: 0; font-size: 0.8rem; color: ${colors.textSecondary};">${escapeHtml(resolve(v))}</p>`)
    }
    sidebar.push(`</div>`)
    sidebar.push(`</section>`)
  }

  if (spokenLanguages && spokenLanguages.length > 0) {
    sidebar.push(`<section style="margin-bottom: 1.2rem;">`)
    sidebar.push(sidebarSectionTitle(lang === 'fr' ? 'LANGUES' : 'LANGUAGES', colors))
    sidebar.push(`<div style="display: flex; flex-direction: column; gap: 0.2rem;">`)
    for (const item of spokenLanguages) {
      sidebar.push(`<p style="margin: 0; font-size: 0.8rem;"><span style="font-weight: 500; color: ${colors.text};">${escapeHtml(resolve(item.name))}</span><span style="color: ${colors.textSecondary};"> : ${escapeHtml(resolve(item.level))}</span></p>`)
    }
    sidebar.push(`</div>`)
    sidebar.push(`</section>`)
  }

  if (hobbies && hobbies.length > 0 && config.labels.sections.hobbies) {
    sidebar.push(`<section>`)
    sidebar.push(sidebarSectionTitle(resolve(config.labels.sections.hobbies), colors))
    sidebar.push(`<div style="display: flex; flex-direction: column; gap: 0.5rem;">`)
    for (const hobby of hobbies) {
      const details = (hobby.details ?? []).map((d) => resolve(d)).join(' - ')
      sidebar.push(`<div>`)
      sidebar.push(`<p style="margin: 0; font-size: 0.78rem; font-weight: 500; color: ${colors.text};">${escapeHtml(resolve(hobby.title))}</p>`)
      if (details) {
        sidebar.push(`<p style="margin: 0; font-size: 0.7rem; color: ${colors.textSecondary};">${escapeHtml(details)}</p>`)
      }
      sidebar.push(`</div>`)
    }
    sidebar.push(`</div>`)
    sidebar.push(`</section>`)
  }

  // ----- Main column (MainContent.tsx: header, featured project, experiences, education) -----
  const main: string[] = []

  main.push(`<div style="text-align: center; margin-bottom: 1.6rem;">`)
  main.push(`<h1 style="margin: 0; font-size: 1.55rem; font-weight: 700; letter-spacing: 0.1em; color: ${colors.text};">${escapeHtml(personal.name.toUpperCase())}</h1>`)
  main.push(`<p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; letter-spacing: 0.08em; color: ${colors.textSecondary};">${escapeHtml(resolve(personal.title).toUpperCase())}</p>`)
  if (personal.tagline) {
    main.push(`<p style="margin: 0.3rem 0 0 0; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.06em; color: ${colors.textSecondary}b3;">${escapeHtml(resolve(personal.tagline))}</p>`)
  }
  main.push(`</div>`)

  if (config.featuredProject) {
    const fp = config.featuredProject
    main.push(`<div style="margin-bottom: 1.6rem;">`)
    main.push(mainSectionTitle(lang === 'fr' ? 'PROJET PHARE' : 'FLAGSHIP PROJECT', colors))
    main.push(`<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 0.6rem;">`)
    main.push(`<div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; min-width: 0;">`)
    if (fp.role) {
      main.push(`<h3 style="margin: 0; font-size: 0.92rem; font-weight: 600; color: ${colors.text}; text-transform: uppercase;">${escapeHtml(resolve(fp.role))}</h3>`)
      main.push(`<span style="font-size: 0.92rem; color: ${colors.textSecondary};">- ${escapeHtml(resolve(fp.title))}</span>`)
    } else {
      main.push(`<h3 style="margin: 0; font-size: 0.92rem; font-weight: 600; color: ${colors.text};">${escapeHtml(resolve(fp.title))}</h3>`)
    }
    if (fp.type) {
      main.push(`<span style="font-size: 0.68rem; font-weight: 600; padding: 0.1rem 0.45rem; border-radius: 4px; background: ${colors.primary}1a; color: ${colors.primary};">${escapeHtml(resolve(fp.type))}</span>`)
    }
    main.push(`</div>`)
    main.push(`<span style="flex-shrink: 0; white-space: nowrap; font-size: 0.75rem; font-weight: 400; color: ${colors.textSecondary}cc;">${escapeHtml(resolve(fp.period))}</span>`)
    main.push(`</div>`)
    if (fp.url) {
      main.push(`<a href="${escapeHtml(fp.url)}" style="display: inline-block; margin-top: 0.2rem; font-size: 0.75rem; color: ${colors.primaryLight}; text-decoration: none;">${escapeHtml(fp.url)}</a>`)
    }
    if (fp.description) {
      main.push(`<p style="margin: 0.5rem 0 0 0; font-size: 0.82rem; color: ${colors.text};">${escapeHtml(resolve(fp.description))}</p>`)
    }
    const bullets = fp.bullets[lang] ?? Object.values(fp.bullets)[0] ?? []
    if (bullets.length > 0) {
      main.push(`<ul style="margin: 0.5rem 0 0 0; padding: 0; list-style: none;">`)
      for (const bullet of bullets) {
        main.push(`<li style="display: flex; align-items: baseline; gap: 0.4rem; font-size: 0.8rem; color: ${colors.textSecondary}; margin-bottom: 0.25rem;"><span style="color: ${colors.primary};">&bull;</span><span>${escapeHtml(bullet)}</span></li>`)
      }
      main.push(`</ul>`)
    }
    // Badges last — same order as the experiences below (description, tasks, badges).
    if (fp.techs && fp.techs.length > 0) {
      main.push(renderBadges(fp.techs, lang, '0.35rem', '0.55rem'))
    }
    main.push(`</div>`)
  }

  if (experiences.length > 0) {
    main.push(`<div style="margin-bottom: 1.6rem;">`)
    main.push(mainSectionTitle(resolve(config.labels.sections.experience), colors))
    main.push(`<div style="display: flex; flex-direction: column; gap: 0.6rem;">`)
    experiences.forEach((exp, expIndex) => {
      const periodText = reverseDateRange(resolve(exp.period))
      if (expIndex > 0) {
        // Slightly narrower and more subtle than the section heading's border —
        // colored with the sidebar's own background instead of the primary accent.
        main.push(`<div style="height: 1px; width: 94%; margin: 0 auto 0.2rem auto; background: ${colors.sidebarFrom};"></div>`)
      }
      main.push(`<div>`)
      // Row 1: role (title) - company, then the type badge, date pinned to the right
      // edge on the same line, single line (no wrapping date column like the site's w-20).
      main.push(`<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 0.6rem;">`)
      main.push(`<div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; min-width: 0;">`)
      main.push(`<h3 style="margin: 0; font-size: 0.86rem; font-weight: 600; color: ${colors.text}; text-transform: uppercase;">${escapeHtml(resolve(exp.role))}</h3>`)
      main.push(`<span style="font-size: 0.86rem; color: ${colors.textSecondary};">- ${escapeHtml(resolve(exp.company))}</span>`)
      if (exp.type) {
        main.push(`<span style="font-size: 0.68rem; font-weight: 600; padding: 0.1rem 0.45rem; border-radius: 4px; background: ${colors.primary}1a; color: ${colors.primary};">${escapeHtml(resolve(exp.type))}</span>`)
      }
      main.push(`</div>`)
      main.push(`<span style="flex-shrink: 0; white-space: nowrap; font-size: 0.75rem; font-weight: 400; color: ${colors.textSecondary}cc;">${escapeHtml(periodText)}</span>`)
      main.push(`</div>`) // end row 1
      if (exp.url) {
        main.push(`<a href="${escapeHtml(exp.url)}" style="display: inline-block; margin-top: 0.15rem; font-size: 0.75rem; color: ${colors.primaryLight}; text-decoration: none; word-break: break-all;">${escapeHtml(exp.url)}</a>`)
      }

      // Row 2: description + tasks + badges — full width, spanning under the date
      // column too (the requested divergence from the site's indented layout).
      main.push(`<p style="margin: 0.55rem 0 0 0; font-size: 0.8rem; color: ${colors.text};">${escapeHtml(resolve(exp.description))}</p>`)
      if (exp.details?.tasks) {
        const tasks = exp.details.tasks[lang] ?? Object.values(exp.details.tasks)[0]
        if (tasks && tasks.length > 0) {
          main.push(`<div style="margin-top: 0.55rem;">`)
          main.push(`<ul style="margin: 0; padding: 0; list-style: none;">`)
          for (const task of tasks) {
            main.push(`<li style="display: flex; align-items: baseline; gap: 0.4rem; font-size: 0.78rem; color: ${colors.textSecondary}; margin-bottom: 0.2rem;"><span style="color: ${colors.primary};">&bull;</span><span>${escapeHtml(task)}</span></li>`)
          }
          main.push(`</ul>`)
          main.push(`</div>`)
        }
      }
      if (exp.techs.length > 0) {
        main.push(renderBadges(exp.techs, lang, '0.35rem', '0.55rem'))
      }
      if (exp.subItem) {
        main.push(`<div style="margin-top: 0.5rem; padding-left: 0.6rem; border-left: 2px solid ${colors.primary}33;">`)
        main.push(`<p style="margin: 0; font-size: 0.78rem; font-weight: 500; color: ${colors.text};">${escapeHtml(resolve(exp.subItem.title))}</p>`)
        main.push(`<p style="margin: 0; font-size: 0.75rem; color: ${colors.textSecondary};">${escapeHtml(resolve(exp.subItem.description))}</p>`)
        main.push(`</div>`)
      }
      if (exp.portfolioNote) {
        const before = lang === 'fr' ? 'Détail complet sur mon ' : 'Full detail on my '
        main.push(`<p style="margin: 0.4rem 0 0 0; font-size: 0.72rem; font-style: italic; color: ${colors.textSecondary};">${escapeHtml(before)}<a href="https://vincentboutin.dev" style="color: ${colors.primaryLight}; text-decoration: none;">portfolio</a>.</p>`)
      }
      main.push(`</div>`)
    })
    main.push(`</div>`)
    main.push(`</div>`)
  }

  if (education.length > 0) {
    main.push(`<div>`)
    main.push(mainSectionTitle(resolve(config.labels.sections.education), colors))
    main.push(`<div style="display: flex; flex-direction: column; gap: 0.8rem;">`)
    for (const edu of education) {
      main.push(`<div>`)
      // Same row layout as experiences: degree (title) - school, badge, date on the
      // right edge, single line.
      main.push(`<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 0.6rem;">`)
      main.push(`<div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; min-width: 0;">`)
      main.push(`<h3 style="margin: 0; font-size: 0.86rem; font-weight: 600; color: ${colors.text};">${escapeHtml(resolve(edu.degree))}</h3>`)
      main.push(`<span style="font-size: 0.86rem; color: ${colors.textSecondary};">- ${escapeHtml(resolve(edu.school))}</span>`)
      if (edu.badge) {
        main.push(`<span style="font-size: 0.68rem; font-weight: 500; padding: 0.08rem 0.4rem; border-radius: 4px; background: rgba(248, 113, 113, 0.1); color: #f87171;">${escapeHtml(resolve(edu.badge))}</span>`)
      }
      main.push(`</div>`)
      if (edu.period) {
        main.push(`<span style="flex-shrink: 0; white-space: nowrap; font-size: 0.75rem; font-weight: 400; color: ${colors.textSecondary}cc;">${escapeHtml(edu.period)}</span>`)
      }
      main.push(`</div>`)
      if (edu.specialty) {
        main.push(`<p style="margin: 0.15rem 0 0 0; font-size: 0.78rem; color: ${colors.primary};">${escapeHtml(resolve(edu.specialty))}</p>`)
      }
      main.push(`</div>`)
    }
    main.push(`</div>`)
    main.push(`</div>`)
  }

  s.push(`<div style="float: left; width: ${SIDEBAR_WIDTH_PCT}%; box-sizing: border-box; padding: 2rem 1.4rem 0.8rem 1.8rem;">${sidebar.join('\n')}</div>`)
  s.push(`<div style="float: left; width: ${100 - SIDEBAR_WIDTH_PCT}%; box-sizing: border-box; padding: 2rem 2rem 2rem 1.6rem;">${main.join('\n')}</div>`)
  s.push(`<div style="clear: both;"></div>`)

  const bodyFragment = s.join('\n')

  // The page canvas background (painted on every printed page, regardless of where
  // floated columns break) is a flat left/right split — the sidebar tint doesn't need
  // to survive a real page break, since a continuation page with an empty colored
  // gutter reads the same way most two-column resume templates print.
  const pageBg = `linear-gradient(to right, ${colors.sidebarFrom} 0 ${SIDEBAR_WIDTH_PCT}%, ${colors.bgCard} ${SIDEBAR_WIDTH_PCT}% 100%)`

  return `<!DOCTYPE html>
<html lang="${lang}" style="font-size: 12.5px;">
  <head>
    <meta charset="utf-8" />
    <title>CV_VincentBOUTIN</title>
    <style>
      /* Self-hosted (see FONT_*_DATA_URI above): identical metrics locally and in the
         prod build container, so line-wrapping — and therefore page count — can't
         drift between the two depending on which system UI font happens to be installed. */
      @font-face {
        font-family: 'Selawik';
        src: url(${FONT_REGULAR_DATA_URI}) format('truetype');
        font-weight: 400 500;
        font-style: normal;
        font-display: block;
      }
      @font-face {
        font-family: 'Selawik';
        src: url(${FONT_SEMIBOLD_DATA_URI}) format('truetype');
        font-weight: 600;
        font-style: normal;
        font-display: block;
      }
      @font-face {
        font-family: 'Selawik';
        src: url(${FONT_BOLD_DATA_URI}) format('truetype');
        font-weight: 700;
        font-style: normal;
        font-display: block;
      }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body { font-family: 'Selawik', system-ui, -apple-system, sans-serif; }
      a { text-decoration: none; }
    </style>
  </head>
  <body style="margin: 0; background: ${pageBg}; line-height: 1.5;">
${bodyFragment}
  </body>
</html>`
}
