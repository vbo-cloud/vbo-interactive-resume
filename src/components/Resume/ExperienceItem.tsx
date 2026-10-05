import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { TechBadge } from './TechBadge'
import { ExperienceDetailsContent } from './ExperienceDetails'

interface ExperienceItemProps {
  year: string
  company: string
  type?: string
  role: string
  url?: string
  description: string
  techs: string[]
  details?: {
    tasks?: string[]
    training?: string[]
  }
  subItem?: { title: string; description: string }
  labels: {
    mainTasks: string
    training?: string
  }
  isHighlighted?: boolean
  /** Flagship project: slightly larger text, same as the PDF */
  featured?: boolean
}

export function ExperienceItem({
  year,
  company,
  type,
  role,
  url,
  description,
  techs,
  details,
  subItem,
  labels,
  isHighlighted = false,
  featured = false,
}: ExperienceItemProps) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={isHighlighted ? { scale: 1.02 } : {}}
      transition={{ duration: 0.2 }}
    >
      <div className="w-full text-left group relative">
        <div
          className={cn(
            'py-1 rounded-lg px-3 -mx-3 transition-all duration-300',
            isHighlighted
              ? 'border-2 border-resume-primary/30 bg-resume-primary/5 group-hover:border-resume-primary/50 group-hover:shadow-md'
              : 'group-hover:bg-resume-primary/5'
          )}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <h3 className={cn('font-semibold text-resume-text uppercase', featured ? 'text-[0.92rem]' : 'text-[0.86rem]')}>{role}</h3>
                <span className={cn('text-resume-text-secondary', featured ? 'text-[0.92rem]' : 'text-[0.86rem]')}>- {company}</span>
                {type && (
                  <span className="text-xs px-2 py-0.5 bg-resume-primary/10 text-resume-primary rounded">
                    {type}
                  </span>
                )}
              </div>
              <span className="text-xs text-resume-text-secondary flex-shrink-0 whitespace-nowrap">{year}</span>
            </div>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs text-resume-link hover:underline mt-0.5 break-all"
              >
                {url}
              </a>
            )}
            <p className={cn('text-resume-text mt-1', featured ? 'text-[0.82rem]' : 'text-[0.8rem]')}>{description}</p>

            {details && (
              <div className="mt-2">
                <ExperienceDetailsContent tasks={details.tasks} training={details.training} labels={labels} featured={featured} />
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 mt-2">
              {techs.map((tech) => (
                <TechBadge key={tech} tech={tech} />
              ))}
            </div>

            {subItem && (
              <div className="mt-3 pl-3 border-l-2 border-resume-primary/20">
                <p className="text-xs font-medium text-resume-text">{subItem.title}</p>
                <p className="text-xs text-resume-text-secondary">{subItem.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
