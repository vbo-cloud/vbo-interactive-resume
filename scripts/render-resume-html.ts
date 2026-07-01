import type { ResumeConfig } from '../src/data/types'
import { presets } from '../src/data/presets'
import { getTechColor } from '../src/data/tech-registry'

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

function renderTechBadges(techs: string[]): string {
  if (techs.length === 0) return ''
  const badges = techs
    .map((tech) => {
      const color = getTechColor(tech)
      return `<span style="display: inline-block; margin: 0 0.35rem 0.35rem 0; padding: 0.15rem 0.55rem; border-radius: 4px; font-size: 0.8rem; font-weight: 500; background: ${color}1a; color: ${color};">${escapeHtml(tech)}</span>`
    })
    .join('')
  return `<div style="margin: 0.35rem 0;">${badges}</div>`
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
  const sectionTitle = (label: string) =>
    `<h2 style="font-size: 1.1rem; text-transform: uppercase; color: ${colors.text}; border-bottom: 2px solid ${colors.primary}40; padding-bottom: 0.25rem; margin-bottom: 0.5rem;">${escapeHtml(label)}</h2>`

  const { personal, contact, skills, experiences, education, projects, values, hobbies } = config
  const lines: string[] = []

  const indent = '      '
  lines.push(`${indent}<div style="max-width: 800px; margin: 2rem auto; padding: 2rem; font-family: system-ui, -apple-system, sans-serif; color: ${colors.text}; line-height: 1.6;">`)

  // Header
  lines.push(`${indent}  <header style="margin-bottom: 2rem; border-bottom: 2px solid ${colors.primary}; padding-bottom: 1rem;">`)
  lines.push(`${indent}    <h1 style="margin: 0 0 0.25rem 0; font-size: 1.75rem; color: ${colors.text};">${escapeHtml(personal.name)}</h1>`)
  lines.push(`${indent}    <p style="margin: 0 0 0.25rem 0; font-size: 1.1rem; color: ${colors.primary}; font-weight: 600;">${escapeHtml(resolve(personal.title))}</p>`)
  if (personal.tagline) {
    lines.push(`${indent}    <p style="margin: 0 0 0.25rem 0; color: ${colors.primary};">${escapeHtml(resolve(personal.tagline))}</p>`)
  }
  if (personal.subtitle) {
    lines.push(`${indent}    <p style="margin: 0 0 0.25rem 0; color: ${colors.textSecondary}; font-style: italic;">${escapeHtml(resolve(personal.subtitle))}</p>`)
  }
  if (personal.location) {
    lines.push(`${indent}    <p style="margin: 0; color: ${colors.textSecondary};">${escapeHtml(personal.location)}</p>`)
  }
  if (siteUrl) {
    lines.push(`${indent}    <p style="margin: 0.5rem 0 0 0;"><a href="${escapeHtml(siteUrl)}" style="color: ${colors.primary}; font-weight: 600; text-decoration: none;">🔗 ${escapeHtml(siteUrl.replace(/^https?:\/\//, ''))}</a></p>`)
  }
  lines.push(`${indent}  </header>`)

  // Contact
  if (contact.length > 0) {
    lines.push(`${indent}  <section style="margin-bottom: 1.5rem;">`)
    lines.push(`${indent}    ${sectionTitle(resolve(config.labels.sections.contact))}`)
    lines.push(`${indent}    <ul style="list-style: none; padding: 0; margin: 0;">`)
    for (const c of contact) {
      if (c.href) {
        lines.push(`${indent}      <li style="margin-bottom: 0.25rem;"><a href="${escapeHtml(c.href)}" style="color: ${colors.primary};">${escapeHtml(c.label)}</a></li>`)
      } else {
        lines.push(`${indent}      <li style="margin-bottom: 0.25rem;">${escapeHtml(c.label)}</li>`)
      }
    }
    lines.push(`${indent}    </ul>`)
    lines.push(`${indent}  </section>`)
  }

  // Skills
  if (skills.length > 0) {
    lines.push(`${indent}  <section style="margin-bottom: 1.5rem;">`)
    lines.push(`${indent}    ${sectionTitle(resolve(config.labels.sections.skills))}`)
    for (const cat of skills) {
      lines.push(`${indent}    <p style="margin: 0.5rem 0 0.25rem 0; font-weight: 600;">${escapeHtml(resolve(cat.title))}</p>`)
      if (cat.type === 'badges') {
        const names = cat.items.map((item) => (typeof item.name === 'string' ? item.name : resolve(item.name)))
        lines.push(`${indent}    ${renderTechBadges(names)}`)
      } else {
        const skillNames = cat.items.map((item) => {
          const name = typeof item.name === 'string' ? item.name : resolve(item.name)
          if (cat.type === 'languages' && item.level) {
            return `${name} (${resolve(item.level)})`
          }
          return name
        })
        lines.push(`${indent}    <p style="margin: 0; color: ${colors.textSecondary};">${escapeHtml(skillNames.join(' · '))}</p>`)
      }
    }
    lines.push(`${indent}  </section>`)
  }

  // Experiences
  if (experiences.length > 0) {
    lines.push(`${indent}  <section style="margin-bottom: 1.5rem;">`)
    lines.push(`${indent}    ${sectionTitle(resolve(config.labels.sections.experience))}`)
    for (const exp of experiences) {
      lines.push(`${indent}    <article style="margin-bottom: 1.25rem;">`)
      lines.push(`${indent}      <h3 style="margin: 0 0 0.15rem 0; font-size: 1rem; color: ${colors.text};">${escapeHtml(resolve(exp.role))} — ${escapeHtml(resolve(exp.company))}</h3>`)
      const meta = [resolve(exp.period)]
      if (exp.type) meta.push(resolve(exp.type))
      lines.push(`${indent}      <p style="margin: 0 0 0.25rem 0; color: ${colors.primary}; font-size: 0.9rem; font-weight: 500;">${escapeHtml(meta.join(' · '))}</p>`)
      lines.push(`${indent}      <p style="margin: 0 0 0.25rem 0;">${escapeHtml(resolve(exp.description))}</p>`)
      lines.push(`${indent}      ${renderTechBadges(exp.techs)}`)
      if (exp.details?.tasks) {
        const tasks = exp.details.tasks[lang] ?? Object.values(exp.details.tasks)[0]
        if (tasks && tasks.length > 0) {
          lines.push(`${indent}      <ul style="margin: 0.5rem 0 0 1rem; padding: 0;">`)
          for (const task of tasks) {
            lines.push(`${indent}        <li style="margin-bottom: 0.15rem; font-size: 0.9rem;">${escapeHtml(task)}</li>`)
          }
          lines.push(`${indent}      </ul>`)
        }
      }
      lines.push(`${indent}    </article>`)
    }
    lines.push(`${indent}  </section>`)
  }

  // Education
  if (education.length > 0) {
    lines.push(`${indent}  <section style="margin-bottom: 1.5rem;">`)
    lines.push(`${indent}    ${sectionTitle(resolve(config.labels.sections.education))}`)
    for (const edu of education) {
      lines.push(`${indent}    <div style="margin-bottom: 0.75rem;">`)
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
    lines.push(`${indent}  <section style="margin-bottom: 1.5rem;">`)
    lines.push(`${indent}    ${sectionTitle(resolve(config.labels.sections.projects))}`)
    for (const proj of projects) {
      lines.push(`${indent}    <div style="margin-bottom: 0.75rem;">`)
      const titleHtml = proj.url
        ? `<a href="${escapeHtml(proj.url)}" style="color: ${colors.primary};">${escapeHtml(resolve(proj.title))}</a>`
        : escapeHtml(resolve(proj.title))
      lines.push(`${indent}      <p style="margin: 0; font-weight: 600; color: ${colors.text};">${titleHtml}</p>`)
      lines.push(`${indent}      <p style="margin: 0; color: ${colors.textSecondary};">${escapeHtml(resolve(proj.description))}</p>`)
      lines.push(`${indent}      ${renderTechBadges(proj.techs)}`)
      lines.push(`${indent}    </div>`)
    }
    lines.push(`${indent}  </section>`)
  }

  // Values
  if (values && values.length > 0 && config.labels.sections.values) {
    lines.push(`${indent}  <section style="margin-bottom: 1.5rem;">`)
    lines.push(`${indent}    ${sectionTitle(resolve(config.labels.sections.values))}`)
    lines.push(`${indent}    <p style="margin: 0; color: ${colors.textSecondary};">${escapeHtml(values.map((v) => resolve(v)).join(' · '))}</p>`)
    lines.push(`${indent}  </section>`)
  }

  // Hobbies
  if (hobbies && hobbies.length > 0 && config.labels.sections.hobbies) {
    lines.push(`${indent}  <section style="margin-bottom: 1.5rem;">`)
    lines.push(`${indent}    ${sectionTitle(resolve(config.labels.sections.hobbies))}`)
    const hobbyNames = hobbies.map((h) => resolve(h.title))
    lines.push(`${indent}    <p style="margin: 0; color: ${colors.textSecondary};">${escapeHtml(hobbyNames.join(' · '))}</p>`)
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
