import { SECTION_ICONS, type SectionIconName } from '@/data/section-icons'

interface SectionTagProps {
  label: string
  icon: SectionIconName
  colors: { dark: string; light: string }
}

/** Header of a framed block: colored icon + title, same chip shape as the tech badges. */
export function SectionTag({ label, icon, colors }: SectionTagProps) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border text-[var(--tag-light)] dark:text-[var(--tag-dark)] bg-[color-mix(in_srgb,var(--tag-light)_14%,transparent)] border-[color-mix(in_srgb,var(--tag-light)_45%,transparent)] dark:bg-[color-mix(in_srgb,var(--tag-dark)_14%,transparent)] dark:border-[color-mix(in_srgb,var(--tag-dark)_45%,transparent)]"
      style={{ '--tag-light': colors.light, '--tag-dark': colors.dark } as React.CSSProperties}
    >
      <svg
        viewBox="0 0 24 24"
        width="11"
        height="11"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 stroke-[var(--tag-light)] dark:stroke-[var(--tag-dark)]"
        dangerouslySetInnerHTML={{ __html: SECTION_ICONS[icon] }}
      />
      {label}
    </span>
  )
}
