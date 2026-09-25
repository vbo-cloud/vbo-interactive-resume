import type { LocalizedString } from './types'

/**
 * PDF-only variants of the resume. The interactive site and the default
 * CV_VincentBOUTIN-<lang>.pdf stay untouched; each variant below produces an extra
 * public/cv/<lang>/CV_VincentBOUTIN-<lang>-<id>.pdf with a different headline and
 * skill order, so the first thing a recruiter reads matches the job family.
 * Every variant keeps the same content otherwise.
 */
export interface ResumeVariant {
  id: string
  /** Replaces personal.title (the headline under the name) */
  title: LocalizedString
  /**
   * Replaces featuredProject.role (the Job Finder role badge) — kept equivalent to
   * `title` so the flagship project reads as the same role the CV is targeting.
   * Left unset to keep the default "DevOps / Cloud Engineer": the dev variant's own
   * title ("C# / .NET Developer") isn't what Job Finder was actually built as, so
   * it keeps the DevOps/Cloud framing instead of following its own title.
   */
  featuredProjectRole?: LocalizedString
  /** Skill categories to show first, matched on their English title. Others keep their order after these. */
  skillsOrder?: string[]
  /** Experience ids to show first. Others keep their order after these. Leave empty to keep chronology. */
  experiencesOrder?: string[]
}

export const resumeVariants: ResumeVariant[] = [
  {
    id: 'dev',
    title: {
      fr: 'Développeur C# / .NET',
      en: 'C# / .NET Developer',
    },
    skillsOrder: ['Code', 'Backend', 'AI', 'DevOps', 'Cloud', 'Observability', 'Workflow'],
  },
  {
    id: 'ia',
    title: {
      fr: "Concepteur d'applications IA / Cloud Azure",
      en: 'AI Application Engineer / Azure Cloud',
    },
    featuredProjectRole: {
      fr: 'Développeur IA / Cloud Azure',
      en: 'AI Developer / Cloud Azure',
    },
    skillsOrder: ['AI', 'Backend', 'Code', 'Cloud', 'DevOps', 'Observability', 'Workflow'],
  },
]
