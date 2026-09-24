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
    id: 'cloud',
    title: {
      fr: 'Ingénieur Cloud / DevOps (Azure)',
      en: 'Cloud / DevOps Engineer (Azure)',
    },
    skillsOrder: ['Cloud', 'DevOps', 'Observability', 'Workflow', 'Code', 'Backend', 'AI'],
  },
  {
    id: 'ia',
    title: {
      fr: "Concepteur d'applications IA / Cloud Azure",
      en: 'AI Application Engineer / Azure Cloud',
    },
    skillsOrder: ['AI', 'Backend', 'Code', 'Cloud', 'DevOps', 'Observability', 'Workflow'],
  },
]
