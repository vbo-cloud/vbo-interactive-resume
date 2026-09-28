import type { ResumeConfig } from './types'
import {
  pdfPersonal,
  pdfContact,
  pdfReferents,
  pdfSkills,
  pdfFeaturedProject,
  pdfExperiences,
  pdfEducation,
  pdfHobbies,
  pdfLanguages,
} from './resume-pdf-content'

/**
 * Content fields below are imported directly from resume-pdf-content.ts instead of
 * duplicated as literal text, so the site and the PDF can never drift apart again —
 * edit the content once, in resume-pdf-content.ts, and both pick it up. The PDF-only
 * variants (resume-variants.ts: dev/ia) still layer their own deltas on top in
 * generate-pdfs.ts and are unaffected by this file.
 */
export const resumeConfig: ResumeConfig = {
  // ===== PERSONAL INFO =====
  personal: {
    name: 'Vincent Boutin',
    // Pinned explicitly: public/images/ also holds FullImage.png (PDF hero preview) and
    // Thumbnail.png, which would otherwise confuse the auto-detection in vite-plugin-assets-detect.ts
    photo: '/images/photo.jpg',
    photoBackEmoji: '☁️',
    title: pdfPersonal.title,
    subtitle: pdfPersonal.subtitle,
    location: 'Lyon',
  },

  // ===== SEO (used in <head> meta tags) =====
  seo: {
    title: 'Vincent Boutin - DevOps / Cloud Engineer (Azure)',
    description:
      'DevOps / Cloud Engineer (Azure). AZ-104. Job Finder, plateforme multi-agents sur Azure en production.',
  },

  // ===== LANGUAGES =====
  languages: {
    default: 'fr',
    available: ['fr', 'en'],
    labels: {
      en: 'EN',
      fr: 'FR',
    },
  },

  // ===== CONTACT =====
  contact: pdfContact,

  // ===== REFERENTS =====
  referents: pdfReferents,

  // ===== SKILLS =====
  skills: pdfSkills,

  // ===== FLAGSHIP PROJECT =====
  // Everything from the PDF except `period`: the site stores periods "recent - older"
  // (see the Experience period fields below) and reverses them for display, while the
  // PDF's period is pre-ordered "older - recent" — copying it verbatim here would
  // double-flip Job Finder's date once rendered.
  featuredProject: {
    ...pdfFeaturedProject,
    period: { en: 'Present - 09/2025', fr: 'Présent - 09/2025' },
  },

  // ===== PROFESSIONAL EXPERIENCES =====
  experiences: pdfExperiences,

  // ===== EDUCATION =====
  education: pdfEducation,

  // ===== HOBBIES =====
  hobbies: pdfHobbies,

  // ===== LANGUAGES (spoken) =====
  spokenLanguages: pdfLanguages,

  // ===== PDF =====
  // Pinned explicitly: public/cv/<lang>/ also holds the PDF-only variants
  // (CV_VincentBOUTIN-<lang>-dev/cloud/ia.pdf, see resume-variants.ts), which the
  // auto-detection would otherwise pick up instead of the main CV.
  pdf: {
    path: { fr: '/cv/fr/CV_VincentBOUTIN-fr.pdf', en: '/cv/en/CV_VincentBOUTIN-en.pdf' },
  },

  // ===== THEME =====
  theme: {
    preset: 'minimal', // 'minimal' | 'warm' | 'ocean' | 'forest' | 'slate' | 'lilac'
    defaultMode: 'dark',
  },

  // ===== UI LABELS =====
  labels: {
    sections: {
      contact: { en: 'CONTACT', fr: 'CONTACT' },
      skills: { en: 'SKILLS', fr: 'COMPÉTENCES' },
      experience: { en: 'PROFESSIONAL EXPERIENCE', fr: 'EXPÉRIENCES PROFESSIONNELLES' },
      education: { en: 'EDUCATION', fr: 'FORMATION' },
      values: { en: 'VALUES', fr: 'VALEURS' },
      hobbies: { en: 'HOBBIES', fr: 'LOISIRS' },
      referent: { en: 'REFERENTS', fr: 'RÉFÉRENTS' },
      languages: { en: 'LANGUAGES', fr: 'LANGUES' },
      featuredProject: { en: 'FLAGSHIP PROJECT', fr: 'PROJET PHARE' },
    },
    experience: {
      mainTasks: { en: 'Main tasks:', fr: 'Tâches principales :' },
      training: { en: 'Training:', fr: 'Formations :' },
    },
    actions: {
      switchTheme: { en: 'Toggle dark mode', fr: 'Changer le thème' },
      downloadPdf: { en: 'Download PDF', fr: 'Télécharger le PDF' },
      viewInteractive: { en: 'View the interactive resume', fr: 'Voir le CV interactif' },
    },
  },
}
