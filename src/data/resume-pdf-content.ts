import { registerTechBadgeColors } from './tech-registry'
import type { ContactItem, Education, Experience, ResumeConfig, SkillCategory, SkillSubcategory } from './types'

/**
 * Canonical resume content. resume-config.ts imports most of these exports directly
 * (so the site and the PDF can't drift apart), then layers the few things that only
 * make sense on paper (a QR code, a "view interactive" CTA, etc.) at render time in
 * render-resume-pdf.ts. generate-pdfs.ts still re-applies these exports on top of
 * resumeConfig as an explicit, redundant safety net — harmless since resumeConfig
 * already matches — and resume-variants.ts's dev/ia deltas layer further on top of
 * that, PDF-only.
 */

/** Headline shown under the name. */
export const pdfPersonal = {
  title: { en: 'DevOps / Cloud Engineer Azure — AZ-104 certified', fr: 'DevOps / Cloud Engineer Azure — certifié AZ-104' },
}

/**
 * Job Finder, kept apart from "experiences" (it's a personal project, not a job) but
 * rendered as the first entry of that timeline, with its tasks split into two groups.
 */
export const pdfFeaturedProject: NonNullable<ResumeConfig['featuredProject']> = {
  title: { en: 'Job Finder', fr: 'Job Finder' },
  type: { en: 'Independent project', fr: 'Projet indépendant' },
  role: { en: 'Architect / DevOps / Cloud Engineer Junior', fr: 'Architect / DevOps / Cloud Engineer Junior' },
  period: { en: '09/2025 - Present', fr: '09/2025 – Aujourd\'hui' },
  url: 'https://jobfinder.vincentboutin.dev',
  description: {
    en: 'Job Finder automates job offer sourcing and profile matching.',
    fr: "Job Finder automatise la veille d'offres d'emploi et la mise en correspondance avec un profil.",
  },
  techs: [],
  taskGroups: [
    {
      title: { en: 'Built on Azure', fr: 'Mis en place sur Azure' },
      tasks: [
        {
          text: {
            en: 'Infrastructure as Code: idempotent PowerShell bootstrap, Azure landing zone, reusable Terraform modules',
            fr: 'Infrastructure as Code : bootstrap PowerShell idempotent, landing zone Azure, modules Terraform réutilisables',
          },
          techs: ['Azure', 'PowerShell', 'Azure CLI', 'Terraform'],
        },
        {
          text: {
            en: 'CI/CD with GitHub Actions: plan and unit tests per PR, Docker build/push and apply on merge',
            fr: 'CI/CD GitHub Actions : plan et tests unitaires par PR, build/push Docker et apply au merge',
          },
          techs: ['GitHub', 'CI/CD', 'Docker', 'Terraform'],
        },
        {
          text: {
            en: 'Data: PostgreSQL Flexible Server and Blob Storage, pgvector similarity search, schema migrations with Alembic',
            fr: 'Données : PostgreSQL Flexible Server et Blob Storage, recherche vectorielle pgvector, migrations de schéma avec Alembic',
          },
          techs: ['PostgreSQL', 'Blob Storage', 'pgvector', 'Alembic'],
        },
        {
          text: {
            en: 'Architecture: Python multi-agent pipeline (Service Bus, Container App Jobs), semantic matching via pgvector, CV/offer analysis with Foundry, FastAPI backend, Next.js 14 frontend',
            fr: 'Architecture : pipeline multi-agents Python (Service Bus, Container App Jobs), matching sémantique pgvector, analyse CV/offres avec Foundry, backend FastAPI, frontend Next.js 14',
          },
          techs: ['Python', 'Service Bus', 'Container Apps', 'PostgreSQL', 'pgvector', 'Foundry', 'FastAPI', 'Next.js'],
        },
        {
          text: {
            en: 'Azure Functions: serverless function that emails the contact-form messages and user feedback',
            fr: "Azure Functions : fonction serverless qui envoie par e-mail les messages du formulaire de contact et les retours utilisateurs",
          },
          techs: ['Azure Functions'],
        },
        {
          text: {
            en: 'Security: private VNet/DNS, Key Vault, RBAC, managed identity, user authentication with Entra External ID',
            fr: 'Sécurité : VNet/DNS privés, Key Vault, RBAC, identité managée, authentification des utilisateurs avec Entra External ID',
          },
          techs: ['Virtual Network', 'Private DNS', 'Key Vault', 'RBAC', 'Managed Identity', 'Microsoft Entra ID'],
        },
        {
          text: {
            en: 'Observability: Application Insights, Log Analytics, Grafana, Azure Monitor alerts, budget alerts, PostHog analytics',
            fr: 'Observabilité : App Insights, Log Analytics, Grafana, alertes Azure Monitor, alertes budget, analytics PostHog',
          },
          techs: ['Application Insights', 'Log Analytics', 'Grafana', 'Azure Monitor', 'Cost Alerts', 'PostHog'],
        },
      ],
    },
    {
      title: { en: 'AI-assisted development workflow', fr: 'Workflow de développement assisté par IA' },
      paragraph: true,
      tasks: [
        {
          text: {
            en: 'Set up AI agents working in parallel on the codebase, with subagents for review, documentation and project exploration, control hooks, and skills embedding the Azure and Terraform, Python, SQL, front-end and Git conventions.',
            fr: "Mise en place d'agents IA travaillant en parallèle sur le code, avec des subagents pour la revue, la documentation et l'exploration du projet, des hooks de contrôle, et des skills qui intègrent les conventions Azure et Terraform, Python, SQL, front-end et Git.",
          },
        },
      ],
    },
  ],
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
          'Rebuilt navigation (Input System), with profiles replicating 6 CAD software (Catia, SolidWorks, Revit...)',
          'Profiled Save/Load performance with Superluminal, cutting load times by 50-70%',
          'Built the front-end of a Netcode-based multiplayer feature (session, lobby, chat)',
          'Technical exchanges with CEA and regular check-ins with cross-functional teams (progress, blockers, direction), using Agile methods (Scrum/Kanban)',
        ],
        fr: [
          "Refactorisation de l'architecture de l'application selon le modèle MVC",
          "Refonte de la navigation (Input System), avec des profils reproduisant 6 logiciels de CAO (Catia, SolidWorks, Revit...)",
          "Profilage des performances Save/Load via Superluminal, temps de chargement réduits de 50 à 70%",
          "Développement du front-end d'une fonctionnalité multijoueur Netcode (session, lobby, chat)",
          'Échanges techniques avec le CEA et suivi régulier avec des équipes pluridisciplinaires (avancement, blocages, orientations), en méthode Agile (Scrum/Kanban)',
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
          'Created a 250+ item test checklist to be validated across 4 VR headsets before each release',
          'Prototyped a Behavior Tree (Unity UI Builder) to simplify VR training creation',
          'Built a tool to play 360° training videos at up to 5x speed, moving QA out of the headset',
          'Delivered custom features and VR experiences on client request (Wimbledon, Andra)',
        ],
        fr: [
          "Création d'un cahier de recette de plus de 250 items, à valider sur 4 casques VR avant chaque mise en production",
          "Prototypage d'un Behavior Tree (Unity UI Builder) pour simplifier la création de formations VR",
          "Outil de lecture des vidéos de formation à 360° jusqu'à 5x la vitesse normale, QA déplacée hors casque",
          "Livraison de fonctionnalités et d'expériences VR sur mesure, à la demande des clients (Wimbledon, Andra)",
        ],
      },
    },
  },
]

const azureSubcategories: SkillSubcategory[] = [
  {
    title: { en: 'Governance', fr: 'Gouvernance' },
    colors: { dark: '#B79CFF', light: '#4B30B0' },
    items: [{ name: 'Microsoft Entra ID' },
      { name: 'RBAC' },
      { name: 'Managed Identity' },
      { name: 'Azure Policy' },
      { name: 'Tags' },
      { name: 'Resource Locks' },],
  },
  {
    title: { en: 'FinOps', fr: 'FinOps' },
    colors: { dark: '#4ADE80', light: '#0B5F2C' },
    items: [{ name: 'Cost Management' }, { name: 'Budgets' }, { name: 'Cost Alerts' }, { name: 'Azure Advisor' }],
  },
  {
    title: { en: 'Automation', fr: 'Automatisation' },
    colors: { dark: '#F5A55A', light: '#8A3E00' },
    items: [{ name: 'Bicep' }, { name: 'ARM Templates' }, { name: 'Azure CLI' }, { name: 'PowerShell' }],
  },
  {
    title: { en: 'Compute & containers', fr: 'Calcul & conteneurs' },
    colors: { dark: '#3DD6C6', light: '#075A53' },
    items: [
      { name: 'Virtual Machines' },
      { name: 'App Service' },
      { name: 'Azure Functions' },
      { name: 'Container Apps' },
      { name: 'ACI' },
      { name: 'ACR' },
      { name: 'AKS' },
    ],
  },
  {
    title: { en: 'Networking & security', fr: 'Réseau & sécurité' },
    colors: { dark: '#FF8A9A', light: '#9A1A33' },
    items: [
      { name: 'Virtual Network' },
      { name: 'NSG' },
      { name: 'Private Endpoints' },
      { name: 'Private DNS' },
      { name: 'Azure Firewall' },
      { name: 'Load Balancer' },
      { name: 'Application Gateway' },
      { name: 'Key Vault' },
    ],
  },
  {
    title: { en: 'Data & messaging', fr: 'Données & messagerie' },
    colors: { dark: '#F2D35B', light: '#664C00' },
    items: [{ name: 'Storage Accounts' }, { name: 'Blob Storage' }, { name: 'PostgreSQL' }, { name: 'Service Bus' }],
  },
  {
    title: { en: 'Observability', fr: 'Observabilité' },
    colors: { dark: '#E58AD9', light: '#82246F' },
    items: [{ name: 'Azure Monitor' }, { name: 'Application Insights' }, { name: 'Log Analytics' }, { name: 'Grafana' }],
  },
  {
    title: { en: 'Reliability', fr: 'Fiabilité' },
    colors: { dark: '#A8B5C8', light: '#3E4C63' },
    items: [{ name: 'Azure Backup' }, { name: 'Site Recovery' }],
  },
  {
    title: { en: 'AI', fr: 'IA' },
    colors: { dark: '#A3E635', light: '#365314' },
    items: [{ name: 'Foundry' }],
  },
]

/**
 * Sidebar colors are the source of truth: every tech listed in an Azure sub-category
 * keeps that row's color wherever else it appears as a badge (e.g. the Job Finder task
 * lines).
 */
registerTechBadgeColors(
  Object.fromEntries(azureSubcategories.flatMap((sub) => sub.items.map((item) => [item.name as string, sub.colors] as const))),
)

/**
 * Same techs as the live site's skills, regrouped into a more DevOps-legible split:
 * Cloud is narrowed to Azure, a dedicated DevOps category picks up Terraform/Docker/
 * CI-CD, and Workflow keeps only Git and Agile Methods.
 */
export const pdfSkills: SkillCategory[] = [
  {
    title: { en: 'Azure', fr: 'Azure' },
    type: 'badges',
    // The header badge first, then every sub-category's badges (flat list for the <noscript> fallback)
    items: [{ name: 'Azure' }, ...azureSubcategories.flatMap((sub) => sub.items)],
    subcategories: azureSubcategories,
  },
  {
    title: { en: 'DevOps', fr: 'DevOps' },
    type: 'badges',
    items: [{ name: 'Terraform' }, { name: 'Docker' }, { name: 'CI/CD' }],
    frame: { colors: { dark: '#F58A3C', light: '#AE4A00' }, icon: 'infinity' },
  },
  {
    title: { en: 'Code', fr: 'Code' },
    type: 'badges',
    items: [{ name: 'C#' }, { name: 'C++' }, { name: 'Python' }],
    frame: { colors: { dark: '#C27BC0', light: '#68217A' }, icon: 'code' },
  },
  {
    title: { en: 'Backend', fr: 'Backend' },
    type: 'badges',
    items: [{ name: 'FastAPI' }, { name: 'pgvector' }, { name: 'Alembic' }],
    frame: { colors: { dark: '#1FBFAE', light: '#04766B' }, icon: 'server' },
  },
  {
    title: { en: 'AI', fr: 'IA' },
    type: 'badges',
    items: [{ name: 'OpenAI' }, { name: 'Claude' }, { name: 'LLM' }, { name: 'Agents' }],
    frame: { colors: { dark: '#38BDF8', light: '#075985' }, icon: 'bot' },
  },
  {
    title: { en: 'Observability', fr: 'Observabilité' },
    type: 'badges',
    items: [{ name: 'PostHog' }],
    frame: { colors: { dark: '#FFD43B', light: '#8A6D00' }, icon: 'activity' },
  },
  {
    title: { en: 'Workflow', fr: 'Workflow' },
    type: 'badges',
    items: [{ name: 'Git' }, { name: { en: 'Agile Methods', fr: 'Méthodes Agiles' } }],
    frame: { colors: { dark: '#F472B6', light: '#9D174D' }, icon: 'git-branch' },
  },
]

/** PDF-only "Langues" sidebar section — no equivalent on the live site. */
export const pdfLanguages: NonNullable<ResumeConfig['spokenLanguages']> = [
  { name: { en: 'French', fr: 'Français' }, level: { en: 'Native', fr: 'Natif' } },
  { name: { en: 'English', fr: 'Anglais' }, level: { en: 'TOEFL B2', fr: 'TOEFL B2' } },
]

const azureCertTitles = (lang: 'en' | 'fr') =>
  azureSubcategories.filter((sub) => sub.title.en !== 'AI').map((sub) => sub.title[lang])

/** Same education list as the live site, but Master Game Programming's specialty gets an added "Agile Methods" line. */
export const pdfEducation: Education[] = [
  {
    school: { en: 'Microsoft', fr: 'Microsoft' },
    degree: { en: 'AZ-104 Certification', fr: 'Certification AZ-104' },
    // "Azure" + the sidebar block's row titles (the AI row isn't part of AZ-104), so the two stay in sync
    specialty: {
      en: ['Azure', ...azureCertTitles('en')].join(', '),
      fr: ['Azure', ...azureCertTitles('fr')].join(', '),
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
    details: {
      en: 'Lead programmer on the graduation project: team coordination and integration of everyone’s work',
      fr: 'Lead programmer du projet de fin d’études : coordination des équipes et intégration des travaux de chacun',
    },
    period: '2024',
    badge: { en: 'Jury Honors', fr: 'Félicitations du Jury' },
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
