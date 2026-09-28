import { useId } from 'react'
import { cn } from '@/lib/utils'

interface SidebarSectionProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function SidebarSection({ title, children, className }: SidebarSectionProps) {
  const titleId = useId()

  return (
    <section className={cn('mb-[1.2rem]', className)} aria-labelledby={titleId}>
      <h3
        id={titleId}
        className="text-[0.68rem] font-bold tracking-widest text-resume-text mb-[0.6rem] pb-[0.3rem] border-b border-resume-primary/20"
      >
        {title}
      </h3>
      {children}
    </section>
  )
}
