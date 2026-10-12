interface BlockFrameProps {
  /** Tint color per theme: 10% fill, 35% border. */
  colors: { dark: string; light: string }
  /** Sits on the top edge, like a fieldset legend; gets an opaque backing so the border doesn't show through. */
  header: React.ReactNode
  children: React.ReactNode
  /** Extra classes on the frame (e.g. a larger top margin for the first block under a section heading). */
  className?: string
}

/** The framed block shared by every skill category (Azure and the lower ones). */
export function BlockFrame({ colors, header, children, className = '' }: BlockFrameProps) {
  return (
    <div
      className={`relative mt-3 rounded-lg border px-2.5 pb-2.5 pt-5 space-y-3 bg-[color-mix(in_srgb,var(--blk-light)_10%,transparent)] border-[color-mix(in_srgb,var(--blk-light)_35%,transparent)] dark:bg-[color-mix(in_srgb,var(--blk-dark)_10%,transparent)] dark:border-[color-mix(in_srgb,var(--blk-dark)_35%,transparent)] ${className}`}
      style={{ '--blk-light': colors.light, '--blk-dark': colors.dark } as React.CSSProperties}
    >
      <div className="absolute -top-3 left-2.5 rounded bg-resume-sidebar-from">{header}</div>
      {children}
    </div>
  )
}
