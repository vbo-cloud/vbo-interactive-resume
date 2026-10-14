// ===== LOCALIZATION =====

export type LocalizedString = Record<string, string>

export type LocalizedStringArray = Record<string, string[]>

// ===== CONTACT =====

export type ContactType = 'email' | 'phone' | 'location' | 'github' | 'linkedin' | 'website'

export interface ContactItem {
  type: ContactType
  label: string
  href?: string
}

// ===== SKILLS =====

import type { SectionIconName } from './section-icons'

export interface SkillCategory {
  title: LocalizedString
  type: 'badges' | 'text' | 'languages'
  items: SkillItem[]
  /**
   * PDF only: splits `items` into visual clusters of this many items each (must sum
   * to items.length), separated by a round bullet — mirrors the task separator used
   * in experience paragraphs. Omit to render the category as one flat badge row.
   */
  groupSizes?: number[]
  /**
   * Renders the category as one framed block (tinted with the color of its first item,
   * which is also shown as the block's header) holding one titled row of badges per
   * sub-category. `items` stays the flat list of everything, header first, so the
   * <noscript> fallback keeps working.
   */
  subcategories?: SkillSubcategory[]
  /**
   * Frames the category in a block with its title and an icon on the top edge, like the
   * Azure block, so every category carries the same visual weight. `colors` tints the
   * frame and the header icon.
   */
  frame?: { colors: { dark: string; light: string }; icon: SectionIconName }
}

export interface SkillSubcategory {
  title: LocalizedString
  /** Icon shown before the row title */
  icon?: SectionIconName
  /** Badge color per theme for this row, checked for contrast on the block's tint */
  colors: { dark: string; light: string }
  items: SkillItem[]
}

export interface SkillItem {
  name: string | LocalizedString
  color?: string
  level?: LocalizedString
  details?: string
}

// ===== EXPERIENCES =====

import type { TechName } from './tech-registry'

export interface Experience {
  id: string
  company: LocalizedString
  role: LocalizedString
  /** Public URL for the work itself, shown right under the role */
  url?: string
  type?: LocalizedString
  period: LocalizedString
  description: LocalizedString
  techs: (TechName | (string & {}))[]
  isHighlighted?: boolean
  subItem?: {
    title: LocalizedString
    description: LocalizedString
  }
  details?: {
    tasks?: LocalizedStringArray
    training?: LocalizedStringArray
  }
  /** PDF only: adds an italic "Full detail on my portfolio" line at the end of the entry, portfolio linked. */
  portfolioNote?: boolean
}

/** A titled group of task lines; each line can carry the badges of the techs it involved. */
export interface FeaturedTaskGroup {
  /** Optional heading above the group; omit it when the group's own lines already say what it is. */
  title?: LocalizedString
  tasks: { text: LocalizedString; techs?: string[] }[]
  /** Renders the tasks as one running paragraph (labels in bold, separated by " · ") instead of a bullet list, to save space. */
  paragraph?: boolean
}

// ===== PROJECTS =====

export interface Project {
  id: string
  title: LocalizedString
  description: LocalizedString
  techs: (TechName | (string & {}))[]
  url?: string
  github?: string
}

// ===== EDUCATION =====

export interface Education {
  school: LocalizedString
  degree: LocalizedString
  specialty?: LocalizedString
  /** Extra line under the specialty (e.g. a role held during the degree) */
  details?: LocalizedString
  period?: string
  logo?: string
  badge?: LocalizedString
}

// ===== HOBBIES =====

export interface Hobby {
  title: LocalizedString
  details?: LocalizedString[]
}

// ===== REFERENT =====

export interface Referent {
  name: string
  href?: string
  title: LocalizedString
}

// ===== THEME =====

export interface ThemeColors {
  bg: string
  bgCard: string
  text: string
  textSecondary: string
  bgDark: string
  bgCardDark: string
  textDark: string
  textSecondaryDark: string
  primary: string
  primaryLight: string
  primaryDark: string
  primaryLightDark: string
  sidebarLight: string
  sidebarLightEnd: string
  sidebarDark: string
  sidebarDarkEnd: string
}

export type PresetName = 'minimal' | 'warm' | 'ocean' | 'forest' | 'slate' | 'lilac'

// ===== LABELS =====

export interface ResumeLabels {
  sections: {
    contact: LocalizedString
    skills: LocalizedString
    experience: LocalizedString
    education: LocalizedString
    projects?: LocalizedString
    values?: LocalizedString
    hobbies?: LocalizedString
    referent?: LocalizedString
    languages?: LocalizedString
    featuredProject?: LocalizedString
  }
  experience: {
    mainTasks: LocalizedString
    training?: LocalizedString
  }
  actions: {
    switchTheme: LocalizedString
    downloadPdf?: LocalizedString
    /** CTA button label used on the PDF's hero banner linking back to the interactive site */
    viewInteractive?: LocalizedString
  }
}

// ===== MAIN CONFIG =====

export interface ResumeConfig {
  personal: {
    name: string
    photo?: string
    photoBackEmoji?: string
    title: LocalizedString
    /** Short accent line shown under the title (e.g. area of focus) */
    tagline?: LocalizedString
    /** Smaller, italicized line shown under the tagline (e.g. career journey) */
    subtitle?: LocalizedString
    location?: string
  }
  seo: {
    title: string
    description: string
  }
  languages: {
    default: string
    available: string[]
    labels: Record<string, string>
  }
  contact: ContactItem[]
  skills: SkillCategory[]
  experiences: Experience[]
  education: Education[]
  projects?: Project[]
  values?: LocalizedString[]
  hobbies?: Hobby[]
  referents?: Referent[]
  /** Spoken languages, rendered as their own "Langues" sidebar section on both the site and the PDF. */
  spokenLanguages?: { name: LocalizedString; level: LocalizedString }[]
  pdf?: {
    label?: LocalizedString
    /** Single path for all languages, or one path per language (hides button if no PDF for current language) */
    path: string | LocalizedString
  }
  /**
   * A standout project (Job Finder) rendered as the first entry of the experiences
   * timeline, on both the site and the PDF, with its tasks split into titled groups.
   */
  featuredProject?: {
    title: LocalizedString
    /** Shown as a status badge next to the title, mirroring Experience.type (e.g. "Independent project"). */
    type?: LocalizedString
    /** Shown next to the type badge, mirroring Experience.role (e.g. "DevOps and Cloud Engineer"). */
    role?: LocalizedString
    period: LocalizedString
    url?: string
    description?: LocalizedString
    techs?: (TechName | (string & {}))[]
    taskGroups: FeaturedTaskGroup[]
  }
  theme?: {
    preset?: PresetName
    colors?: Partial<ThemeColors>
    defaultMode?: 'light' | 'dark' | 'system'
  }
  labels: ResumeLabels
}
