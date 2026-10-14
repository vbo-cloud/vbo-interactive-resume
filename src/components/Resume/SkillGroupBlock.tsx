import { useTranslation } from '@/lib/i18n'
import { getTechBadgeColor } from '@/data/tech-registry'
import { SECTION_ICONS } from '@/data/section-icons'
import type { SkillItem, SkillSubcategory } from '@/data/types'
import { BlockFrame } from './BlockFrame'
import { TechBadge } from './TechBadge'

interface SkillGroupBlockProps {
  /** Header badge — also gives the block its tint. */
  header: string
  subcategories: SkillSubcategory[]
  className?: string
}

const itemName = (item: SkillItem, resolve: (ls: Record<string, string>) => string) =>
  typeof item.name === 'string' ? item.name : resolve(item.name)

/** One framed block (e.g. "Azure") holding a titled row of badges per sub-category, each row in its own color. */
export function SkillGroupBlock({ header, subcategories, className }: SkillGroupBlockProps) {
  const { resolve } = useTranslation()

  return (
    <BlockFrame
      colors={{ light: getTechBadgeColor(header, 'light'), dark: getTechBadgeColor(header, 'dark') }}
      header={<TechBadge tech={header} showIcon />}
      className={className}
    >
      {subcategories.map((sub) => (
        <div key={resolve(sub.title)}>
          <p
            className="flex items-center gap-1 text-[0.7rem] font-semibold mb-1 text-[var(--sub-light)] dark:text-[var(--sub-dark)]"
            style={{ '--sub-light': sub.colors.light, '--sub-dark': sub.colors.dark } as React.CSSProperties}
          >
            {sub.icon && (
              <svg
                viewBox="0 0 24 24"
                width="11"
                height="11"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
                dangerouslySetInnerHTML={{ __html: SECTION_ICONS[sub.icon] }}
              />
            )}
            {resolve(sub.title)}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sub.items.map((item) => {
              const name = itemName(item, resolve)
              return <TechBadge key={name} tech={name} colors={sub.colors} />
            })}
          </div>
        </div>
      ))}
    </BlockFrame>
  )
}
