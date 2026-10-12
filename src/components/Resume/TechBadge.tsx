import { getTechBadgeColor, getTechIcon } from '@/data/tech-registry'

interface TechBadgeProps {
  tech: string
  /** Override color. If not provided, resolved from tech-registry. Same hex used in both themes. */
  color?: string
  /** Per-theme override (wins over `color`) — used by the Azure block's sub-category rows. */
  colors?: { dark: string; light: string }
  /** Show the tech's brand glyph (when one exists) before the label. Off by default — only the skills sidebar turns it on, mirroring the PDF export. */
  showIcon?: boolean
}

/** Same style recipe for every badge: solid text, 14% tint background, 45% tint border. */
export function TechBadge({ tech, color: colorOverride, colors, showIcon = false }: TechBadgeProps) {
  const light = colors?.light ?? colorOverride ?? getTechBadgeColor(tech, 'light')
  const dark = colors?.dark ?? colorOverride ?? getTechBadgeColor(tech, 'dark')
  const icon = showIcon ? getTechIcon(tech) : null

  return (
    <>
      {/* Light mode */}
      <span
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border dark:hidden"
        style={{
          backgroundColor: `${light}24`,
          color: light,
          borderColor: `${light}73`,
        }}
      >
        {icon && (
          <svg viewBox={icon.viewBox} fill="currentColor" width="10" height="10" className="shrink-0">
            <path d={icon.d} />
          </svg>
        )}
        {tech}
      </span>
      {/* Dark mode */}
      <span
        className="hidden dark:inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border"
        style={{
          backgroundColor: `${dark}24`,
          color: dark,
          borderColor: `${dark}73`,
        }}
      >
        {icon && (
          <svg viewBox={icon.viewBox} fill="currentColor" width="10" height="10" className="shrink-0">
            <path d={icon.d} />
          </svg>
        )}
        {tech}
      </span>
    </>
  )
}
