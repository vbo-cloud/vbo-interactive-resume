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
      <div>
        <p className="text-base font-semibold text-resume-text">{school}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm text-resume-text-secondary">{degree}</p>
          {badge && (
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-400/10 text-red-400">
              {badge}
            </span>
          )}
        </div>
        {specialty && (
          <p className="text-sm text-resume-primary">{specialty}</p>
        )}
        {period && (
          <p className="text-xs text-resume-text-secondary mt-0.5">{period}</p>
        )}
      </div>
    </div>
  )
}
