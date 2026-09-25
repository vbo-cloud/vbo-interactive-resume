import type { ContactItem, Education, Experience, Hobby, Referent, ResumeConfig, SkillCategory } from './types'

/**
 * PDF-only content overrides, applied on top of resumeConfig in generate-pdfs.ts
 * (never imported by the interactive site or the <noscript> SEO fallback). Structure
 * mirrors the live site closely, but with a repositioned flagship project — those
 * edits stay scoped to this file instead of touching what the live site shows.
 */

/** Headline + pitch shown under the name. No numbers/skills beyond what's elsewhere in this file. */
export const pdfPersonal = {
  title: { en: 'DevOps / Cloud Engineer Azure — AZ-104 certified', fr: 'DevOps / Cloud Engineer Azure — certifié AZ-104' },
  subtitle: {
    en: 'Cloud / DevOps Engineer, AZ-104 certified, coming from a C# development background. I designed and single-handedly operate a production Azure platform, from Terraform infrastructure to monitoring. Strong interest in AI. Looking for a Cloud / DevOps role in Lyon.',
    fr: "Ingénieur Cloud / DevOps certifié AZ-104, issu du développement C#. J'ai conçu et j'exploite seul une plateforme Azure en production, de l'infrastructure Terraform jusqu'au monitoring. Forte appétence pour l'IA. À la recherche d'un poste Cloud / DevOps à Lyon.",
  },
}

/**
 * Job Finder, pulled out of "experiences" into its own section — the flagship
 * project shouldn't be buried under a job title it never had.
 */
export const pdfFeaturedProject: NonNullable<ResumeConfig['featuredProject']> = {
  title: { en: 'Job Finder', fr: 'Job Finder' },
  type: { en: 'Independent project', fr: 'Projet indépendant' },
  role: { en: 'DevOps / Cloud Engineer', fr: 'DevOps / Cloud Engineer' },
  period: { en: '09/2025 - Present', fr: '09/2025 – Aujourd\'hui' },
  url: 'https://jobfinder.vincentboutin.dev',
  description: {
    en: 'Job Finder automates job offer sourcing and profile matching.',
    fr: "Job Finder automatise la veille d'offres d'emploi et la mise en correspondance avec un profil.",
  },
  techs: [
    'Azure',
    'Terraform',
    'Python',
    'FastAPI',
    'PostgreSQL',
    'pgvector',
    'OpenAI',
    'Claude',
    'Service Bus',
    'CI/CD',
    'GitHub',
    'Docker',
    'Application Insights',
    'Log Analytics',
    'Grafana',
    'PostHog',
  ],
  bullets: {
    en: [
      'Set up an AI-assisted development workflow: parallelized agents, hooks/skills enforcing conventions, and subagents for code review, documentation and code exploration',
      'Infrastructure as Code: Azure landing zone, reusable Terraform modules',
      'CI/CD with GitHub Actions: plan and tests per PR, Docker build/push and apply on merge',
      'Architecture: Python multi-agent pipeline (Service Bus, Container App Jobs), semantic matching via pgvector, CV/offer analysis with Azure OpenAI, FastAPI backend, Next.js 14 frontend',
      'Security: private VNet/DNS, Key Vault, least-privilege RBAC, managed identity',
      'Observability: Application Insights, Log Analytics, Grafana, Azure Monitor alerts, budget alerts, PostHog analytics',
    ],
    fr: [
      "Mise en place d'un workflow de développement assisté par agents IA, parallélisation d'agents, hooks / skills pour le respect des conventions, subagents pour la revue de code, la documentation et l'exploration du code.",
      'Infrastructure as Code : landing zone Azure, modules Terraform réutilisables',
      'CI/CD GitHub Actions : plan et tests par PR, build/push Docker et apply au merge',
      'Architecture : pipeline multi-agents Python (Service Bus, Container App Jobs), matching sémantique pgvector, analyse CV/offres avec Azure OpenAI, backend FastAPI, frontend Next.js 14',
      'Sécurité : VNet/DNS privés, Key Vault, RBAC moindre privilège, identité managée',
      'Observabilité : App Insights, Log Analytics, Grafana, alertes Azure Monitor, alertes budget, analytics PostHog',
    ],
  },
}

/**
 * Same experiences as the live site, minus "job-finder" (now the featured project
 * above) and "iim-student-projects" (folded into the Master Game Programming
 * education line), with de-duplicated task bullets — the full versions run long
 * enough to push the PDF several pages past what's reasonable to print.
 */
export const pdfExperiences: Experience[] = [
  {
    id: 'akanea',
    company: { en: 'Akanea', fr: 'Akanea' },
    role: { en: 'Software Engineer (C# / .NET)', fr: 'Software Engineer (C# / .NET)' },
    type: { en: 'Permanent', fr: 'CDI' },
    period: { en: '09/2025 - 05/2025', fr: '09/2025 - 05/2025' },
    description: {
      en: 'Contributed to the development of transport management software for large accounts.',
      fr: 'Contribution au développement d\'un logiciel de gestion de transport dédié aux grands comptes.',
    },
    techs: ['C#', 'Oracle Database', 'Azure DevOps'],
    details: {
      tasks: {
        en: [
          'Developed new features and fixed bugs',
          'Contributed to an internal framework and a hybrid client/web application',
          'Contributed to architecture improvements and Gitflow on Azure DevOps',
        ],
        fr: [
          'Développement de nouvelles fonctionnalités et correction de bugs',
          "Contribution à un framework interne et à une application hybride client/web",
          "Contribution à l'amélioration de l'architecture et au Gitflow sur Azure DevOps",
        ],
      },
    },
  },
  {
    id: 'ls-group',
    company: { en: 'LS Group', fr: 'LS Group' },
    role: { en: 'Software Engineer (C# / Unity)', fr: 'Software Engineer (C# / Unity)' },
    type: { en: 'Work-study program', fr: 'Alternance' },
    period: { en: '09/2024 - 09/2022', fr: '09/2024 - 09/2022' },
    description: {
      en: 'Developed an industrial VR/AR (XR Twin) visualization application in collaboration with CEA.',
      fr: "Développement d'une application de visualisation industrielle VR/AR (XR Twin) en collaboration avec le CEA.",
    },
    techs: ['Unity', 'C#', 'Netcode', 'GitLab', 'CI/CD', 'Agile Methods'],
    details: {
      tasks: {
        en: [
          'Refactored the application architecture following the MVC pattern',
          'Rebuilt navigation (Input System), with profiles replicating 6 CAD software (Unity, Catia, SolidWorks, Inventor, Revit, SketchUp)',
          'Profiled Save/Load performance with Superluminal, fixed ~15 issues, cutting load times by 50-70%',
          'Built the front-end of a Netcode-based multiplayer feature (session, lobby, chat)',
          'Worked with GitFlow and CI/CD in Agile (Scrum/Kanban) teams',
        ],
        fr: [
          "Refactorisation de l'architecture de l'application selon le modèle MVC",
          "Refonte de la navigation (Input System), avec des profils reproduisant 6 logiciels de CAO (Unity, Catia, SolidWorks, Inventor, Revit, SketchUp)",
          "Profilage des performances Save/Load via Superluminal, correction d'une quinzaine de bugs, temps de chargement réduits de 50 à 70%",
          "Développement du front-end d'une fonctionnalité multijoueur Netcode (session, lobby, chat)",
          "Travail en GitFlow/CI/CD au sein d'équipes Agile (Scrum/Kanban)",
        ],
      },
    },
  },
  {
    id: 'reality-academy',
    company: { en: 'Reality Academy', fr: 'Reality Academy' },
    role: { en: 'QA Tester / Tool Programmer (C#)', fr: 'QA Tester / Tool Programmer (C#)' },
    type: { en: 'Internship', fr: 'Stage' },
    period: { en: '08/2022 - 02/2022', fr: '08/2022 - 02/2022' },
    description: {
      en: 'Designed tools and contributed to QA for a SaaS platform and a VR/e-learning training catalog.',
      fr: "Conception d'outil et contribution à la QA pour une plateforme SaaS et un catalogue de formation VR et e-learning.",
    },
    techs: ['Unity', 'C#', 'AR', 'GitHub'],
    details: {
      tasks: {
        en: [
          'Built a 250+ item test checklist validated across 4 VR headsets before each release',
          'Prototyped a Behavior Tree (Unity UI Builder) to simplify VR training creation',
          'Built a tool to play 360° training videos at up to 5x speed, moving QA out of the headset',
          'Delivered custom features and VR experiences on client request (Wimbledon, Andra)',
        ],
        fr: [
          "Cahier de recette de plus de 250 items, validé sur 4 casques VR avant chaque mise en production",
          "Prototypage d'un Behavior Tree (Unity UI Builder) pour simplifier la création de formations VR",
          "Outil de lecture des vidéos de formation à 360° jusqu'à 5x la vitesse normale, QA déplacée hors casque",
          "Livraison de fonctionnalités et d'expériences VR sur mesure, à la demande des clients (Wimbledon, Andra)",
        ],
      },
    },
  },
]

/**
 * Same techs as the live site's skills, regrouped into a more DevOps-legible split:
 * Cloud is narrowed to Azure, a dedicated DevOps category picks up Terraform/Docker/
 * CI-CD, and Workflow keeps only Git and Agile Methods.
 */
export const pdfSkills: SkillCategory[] = [
  { title: { en: 'Cloud', fr: 'Cloud' }, type: 'badges', items: [{ name: 'Azure' }] },
  {
    title: { en: 'DevOps', fr: 'DevOps' },
    type: 'badges',
    items: [{ name: 'Terraform' }, { name: 'Docker' }, { name: 'CI/CD' }],
  },
  {
    title: { en: 'Code', fr: 'Code' },
    type: 'badges',
    items: [{ name: 'C#' }, { name: 'C++' }, { name: 'Python' }],
  },
  {
    title: { en: 'Backend', fr: 'Backend' },
    type: 'badges',
    items: [{ name: 'FastAPI' }, { name: 'PostgreSQL' }, { name: 'pgvector' }, { name: 'Service Bus' }],
  },
  {
    title: { en: 'AI', fr: 'IA' },
    type: 'badges',
    items: [{ name: 'OpenAI' }, { name: 'Claude' }, { name: 'Azure Foundry' }, { name: 'LLM' }],
  },
  {
    title: { en: 'Observability', fr: 'Observabilité' },
    type: 'badges',
    items: [
      { name: 'Application Insights' },
      { name: 'Log Analytics' },
      { name: 'Grafana' },
      { name: 'PostHog' },
    ],
  },
  {
    title: { en: 'Workflow', fr: 'Workflow' },
    type: 'badges',
    items: [{ name: 'Git' }, { name: { en: 'Agile Methods', fr: 'Méthodes Agiles' } }],
  },
]

/** Same hobbies as the live site, plus a PDF-only "Video games" entry. */
export const pdfHobbies: Hobby[] = [
  {
    title: { en: 'Sports', fr: 'Sport' },
    details: [
      { en: 'Strength Training', fr: 'Musculation' },
      { en: 'Climbing (Bouldering)', fr: 'Escalade (Bloc)' },
    ],
  },
  {
    title: { en: 'Music', fr: 'Musique' },
    details: [
      { en: 'Mixing', fr: 'Mix' },
      { en: 'Event Organization', fr: "Organisation d'événements" },
    ],
  },
  {
    title: { en: 'Video games', fr: 'Jeux vidéo' },
    details: [
      { en: 'Automation', fr: 'Automatisation' },
      { en: 'Indie games', fr: 'Indépendants' },
      { en: 'Competitive', fr: 'Compétitifs' },
    ],
  },
]

/** PDF-only "Langues" sidebar section — no equivalent on the live site. */
export const pdfLanguages: NonNullable<ResumeConfig['spokenLanguages']> = [
  { name: { en: 'French', fr: 'Français' }, level: { en: 'Native', fr: 'Natif' } },
  { name: { en: 'English', fr: 'Anglais' }, level: { en: 'TOEFL B2', fr: 'TOEFL B2' } },
]

/** Same education list as the live site, but Master Game Programming's specialty gets an added "Agile Methods" line. */
export const pdfEducation: Education[] = [
  {
    school: { en: 'Microsoft', fr: 'Microsoft' },
    degree: { en: 'AZ-104 Certification', fr: 'Certification AZ-104' },
    specialty: {
      en: 'Azure, Virtual Machines, Networking, Storage, Identity (Azure AD), RBAC, Monitoring, Security, Backup & Recovery, Governance, Azure CLI / PowerShell, ARM templates, Bicep',
      fr: 'Azure, Machines Virtuelles, Réseau, Stockage, Identité (Azure AD), RBAC, Supervision, Sécurité, Sauvegarde & Restauration, Gouvernance, Azure CLI / PowerShell, ARM templates, Bicep',
    },
    period: '2026',
  },
  {
    school: { en: 'IIM, Courbevoie', fr: 'IIM, Courbevoie' },
    degree: { en: "Master's Degree in Game Programming", fr: 'Master Game Programming' },
    specialty: {
      en: 'Unity, Unreal, C#, C++, OOP, 2D Mathematics, Algorithms, Integration, AI, Networking, Agile Methods',
      fr: 'Unity, Unreal, C#, C++, POO, Mathématiques 2D, Algorithmique, Intégration, IA, Réseau, Méthodes Agiles',
    },
    period: '2024',
    badge: { en: 'Jury Honors', fr: 'Félicitations du Jury' },
  },
  {
    school: { en: 'UPEC, Créteil', fr: 'UPEC, Créteil' },
    degree: { en: "Bachelor's Degree in Sports Science (STAPS)", fr: 'Licence STAPS' },
    specialty: {
      en: 'Pedagogy, Group Coaching, Adaptability to Different Audiences, Active Listening, Motivation & Engagement',
      fr: 'Pédagogie, Coaching de groupe, Adaptabilité à différents publics, Écoute active, Motivation & Engagement',
    },
    period: '2016',
  },
]

/** Same contact list as the live site, but Portfolio leads and spells out its URL. */
export const pdfContact: ContactItem[] = [
  { type: 'website', label: 'Portfolio : https://vincentboutin.dev', href: 'https://vincentboutin.dev' },
  { type: 'linkedin', label: 'Vincent BOUTIN', href: 'https://linkedin.com/in/vincent-boutin/' },
  { type: 'email', label: 'contact@vincentboutin.dev' },
  { type: 'phone', label: '+33 6 46 77 05 54' },
  { type: 'location', label: 'Lyon' },
]

/** Same referents as the live site, but Cédric's title gets a "CTO -" prefix. */
export const pdfReferents: Referent[] = [
  {
    name: 'Samy-Adrien FOUDIL - EDF',
    href: 'https://www.linkedin.com/in/sfoudil/',
    title: {
      en: 'MLOps AWS | Fullstack Python Developer',
      fr: 'MLOps AWS | Développeur Python Fullstack',
    },
  },
  {
    name: 'Cédric BEMATOL - LS GROUP',
    href: 'https://www.linkedin.com/in/cedric-bematol/',
    title: {
      en: 'CTO - Senior Software Engineer',
      fr: 'CTO - Senior Software Engineer',
    },
  },
]
