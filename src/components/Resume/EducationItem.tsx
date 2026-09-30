import { assetUrl } from '@/lib/utils'

interface EducationItemProps {
  school: string
  degree: string
  specialty?: string
  period?: string
  logo?: string
  badge?: string
}

export function EducationItem({ school, degree, specialty, period, logo, badge }: EducationItemProps) {
  return (
    <div className="flex items-start gap-4">
      {logo && (
        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
          <img src={assetUrl(logo)} alt={`${school} logo`} className="object-contain w-full h-full" loading="lazy" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <p className="text-sm font-semibold text-resume-text">{degree}</p>
            <span className="text-xs text-resume-text-secondary">- {school}</span>
            {badge && (
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-400/10 text-red-400">
                {badge}
              </span>
            )}
          </div>
          {period && (
            <span className="text-xs text-resume-text-secondary flex-shrink-0 whitespace-nowrap">{period}</span>
          )}
        </div>
        {specialty && (
          <p className="text-xs text-resume-primary mt-0.5">{specialty}</p>
        )}
      </div>
    </div>
  )
}
