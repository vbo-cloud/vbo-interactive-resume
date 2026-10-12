import { useTranslation } from '@/lib/i18n'
import { getTechBadgeColor } from '@/data/tech-registry'
import type { SkillItem, SkillSubcategory } from '@/data/types'
import { BlockFrame } from './BlockFrame'
import { TechBadge } from './TechBadge'

interface SkillGroupBlockProps {
  /** Header badge — also gives the block its tint. */
  header: string
  subcategories: SkillSubcategory[]
}

const itemName = (item: SkillItem, resolve: (ls: Record<string, string>) => string) =>
  typeof item.name === 'string' ? item.name : resolve(item.name)

/** One framed block (e.g. "Azure") holding a titled row of badges per sub-category, each row in its own color. */
export function SkillGroupBlock({ header, subcategories }: SkillGroupBlockProps) {
  const { resolve } = useTranslation()

  return (
    <BlockFrame
      colors={{ light: getTechBadgeColor(header, 'light'), dark: getTechBadgeColor(header, 'dark') }}
      header={<TechBadge tech={header} showIcon />}
    >
      {subcategories.map((sub) => (
        <div key={resolve(sub.title)}>
          <p
            className="text-[0.7rem] font-semibold mb-1 text-[var(--sub-light)] dark:text-[var(--sub-dark)]"
            style={{ '--sub-light': sub.colors.light, '--sub-dark': sub.colors.dark } as React.CSSProperties}
          >
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
