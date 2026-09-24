import { getTechBadgeColor } from '@/data/tech-registry'

interface TechBadgeProps {
  tech: string
  /** Override color. If not provided, resolved from tech-registry. Same hex used in both themes. */
  color?: string
}

/** Same style recipe for every badge: solid text, 14% tint background, 45% tint border. */
export function TechBadge({ tech, color: colorOverride }: TechBadgeProps) {
  const light = colorOverride ?? getTechBadgeColor(tech, 'light')
  const dark = colorOverride ?? getTechBadgeColor(tech, 'dark')

  return (
    <>
      {/* Light mode */}
      <span
        className="px-2 py-1 rounded text-xs font-medium border dark:hidden"
        style={{
          backgroundColor: `${light}24`,
          color: light,
          borderColor: `${light}73`,
        }}
      >
        {tech}
      </span>
      {/* Dark mode */}
      <span
        className="px-2 py-1 rounded text-xs font-medium border hidden dark:inline"
        style={{
          backgroundColor: `${dark}24`,
          color: dark,
          borderColor: `${dark}73`,
        }}
      >
        {tech}
      </span>
    </>
  )
}
