/**
 * Central registry of known technologies with their brand colors.
 * Use the tech name in your config and the color is resolved automatically.
 *
 * To add a custom technology, add it here with its brand color.
 */
const TECH_REGISTRY = {
  // ===== Frontend Frameworks =====
  'React': { color: '#61DAFB' },
  'Angular': { color: '#DD0031' },
  'Vue': { color: '#4FC08D' },
  'Vue.js': { color: '#4FC08D' },
  'Svelte': { color: '#FF3E00' },
  'Next.js': { color: '#000000' },
  'Nuxt': { color: '#00DC82' },
  'Nuxt.js': { color: '#00DC82' },
  'Astro': { color: '#FF5D01' },
  'Solid': { color: '#2C4F7C' },
  'SolidJS': { color: '#2C4F7C' },
  'Qwik': { color: '#18B6F6' },
  'Gatsby': { color: '#663399' },
  'Remix': { color: '#000000' },
  'Ember': { color: '#E04E39' },
  'Preact': { color: '#673AB8' },
  'Alpine.js': { color: '#8BC0D0' },
  'htmx': { color: '#3366CC' },

  // ===== Languages =====
  'TypeScript': { color: '#3178C6' },
  'JavaScript': { color: '#F7DF1E' },
  'Python': { color: '#FFD43B' },
  'Java': { color: '#007396' },
  'Go': { color: '#00ADD8' },
  'Golang': { color: '#00ADD8' },
  'Rust': { color: '#DEA584' },
  'Ruby': { color: '#CC342D' },
  'PHP': { color: '#777BB4' },
  'C': { color: '#A8B9CC' },
  'C++': { color: '#341B6E' },
  'C#': { color: '#512BD4' },
  'Swift': { color: '#F05138' },
  'Kotlin': { color: '#7F52FF' },
  'Dart': { color: '#0175C2' },
  'Elixir': { color: '#4B275F' },
  'Scala': { color: '#DC322F' },
  'Haskell': { color: '#5D4F85' },
  'Lua': { color: '#2C2D72' },
  'R': { color: '#276DC3' },
  'Perl': { color: '#39457E' },
  'Clojure': { color: '#5881D8' },
  'Zig': { color: '#F7A41D' },
  'OCaml': { color: '#EC6813' },

  // ===== Backend Frameworks =====
  'Node.js': { color: '#339933' },
  'NodeJS': { color: '#339933' },
  'Express': { color: '#000000' },
  'Express.js': { color: '#000000' },
  'NestJS': { color: '#E0234E' },
  'Fastify': { color: '#000000' },
  'Django': { color: '#092E20' },
  'Flask': { color: '#000000' },
  'FastAPI': { color: '#009688' },
  'Spring': { color: '#6DB33F' },
  'Spring Boot': { color: '#6DB33F' },
  'Rails': { color: '#CC0000' },
  'Ruby on Rails': { color: '#CC0000' },
  'Laravel': { color: '#FF2D20' },
  'Symfony': { color: '#000000' },
  'ASP.NET': { color: '#512BD4' },
  '.NET': { color: '#512BD4' },
  'Deno': { color: '#000000' },
  'Bun': { color: '#FBF0DF' },

  // ===== Mobile =====
  'React Native': { color: '#61DAFB' },
  'Flutter': { color: '#02569B' },
  'Ionic': { color: '#3880FF' },
  'SwiftUI': { color: '#F05138' },
  'Expo': { color: '#000020' },

  // ===== Databases =====
  'PostgreSQL': { color: '#4169E1' },
  'pgvector': { color: '#2F6F9F' },
  'MongoDB': { color: '#47A248' },
  'MySQL': { color: '#4479A1' },
  'Redis': { color: '#DC382D' },
  'SQLite': { color: '#003B57' },
  'Elasticsearch': { color: '#005571' },
  'Firebase': { color: '#FFCA28' },
  'Supabase': { color: '#3FCF8E' },
  'DynamoDB': { color: '#4053D6' },
  'MariaDB': { color: '#003545' },
  'Neo4j': { color: '#4581C3' },
  'Cassandra': { color: '#1287B1' },
  'CouchDB': { color: '#E42528' },
  'PlanetScale': { color: '#000000' },
  'Neon': { color: '#00E599' },

  // ===== DevOps & Cloud =====
  'Docker': { color: '#2496ED' },
  'Kubernetes': { color: '#326CE5' },
  'AWS': { color: '#FF9900' },
  'GCP': { color: '#4285F4' },
  'Google Cloud': { color: '#4285F4' },
  'Azure': { color: '#0078D4' },
  'Azure Monitor': { color: '#0078D4' },
  'Terraform': { color: '#7B42BC' },
  'Bicep': { color: '#0078D4' },
  'GitHub Actions': { color: '#6D071A' },
  'GitLab CI': { color: '#FC6D26' },
  'Azure DevOps': { color: '#374151' },
  'Jenkins': { color: '#D24939' },
  'Vercel': { color: '#000000' },
  'Netlify': { color: '#00C7B7' },
  'Cloudflare': { color: '#F38020' },
  'Heroku': { color: '#430098' },
  'DigitalOcean': { color: '#0080FF' },
  'Nginx': { color: '#009639' },
  'Linux': { color: '#FCC624' },

  // ===== Observability =====
  'PostHog': { color: '#F54E00' },
  'Grafana': { color: '#F46800' },
  'Application Insights': { color: '#8661C5' },
  'Log Analytics': { color: '#0078D4' },

  // ===== CSS & UI =====
  'Tailwind CSS': { color: '#06B6D4' },
  'Tailwind': { color: '#06B6D4' },
  'SASS': { color: '#CC6699' },
  'SCSS': { color: '#CC6699' },
  'CSS': { color: '#1572B6' },
  'HTML': { color: '#E34F26' },
  'Styled Components': { color: '#DB7093' },
  'Material UI': { color: '#007FFF' },
  'MUI': { color: '#007FFF' },
  'Chakra UI': { color: '#319795' },
  'Ant Design': { color: '#0170FE' },
  'Bootstrap': { color: '#7952B3' },
  'Radix': { color: '#111111' },
  'shadcn/ui': { color: '#000000' },
  'Framer Motion': { color: '#0055FF' },

  // ===== Tools & Others =====
  'Git': { color: '#374151' },
  'CI/CD': { color: '#374151' },
  'Service Bus': { color: '#CA8A04' },
  'Claude': { color: '#DA7756' },
  'Agile Methods': { color: '#16A34A' },
  'GitHub': { color: '#374151' },
  'GitLab': { color: '#374151' },
  'GraphQL': { color: '#E10098' },
  'REST': { color: '#009688' },
  'Prisma': { color: '#2D3748' },
  'tRPC': { color: '#2596BE' },
  'Vite': { color: '#646CFF' },
  'Webpack': { color: '#8DD6F9' },
  'Rollup': { color: '#EC4A3F' },
  'esbuild': { color: '#FFCF00' },
  'Turbopack': { color: '#000000' },
  'Storybook': { color: '#FF4785' },
  'Figma': { color: '#F24E1E' },
  'Stripe': { color: '#635BFF' },

  // ===== Testing =====
  'Jest': { color: '#C21325' },
  'Vitest': { color: '#6E9F18' },
  'Cypress': { color: '#69D3A7' },
  'Playwright': { color: '#2EAD33' },
  'Testing Library': { color: '#E33332' },
  'Mocha': { color: '#8D6748' },
  'Selenium': { color: '#43B02A' },

  // ===== AI & Data =====
  'TensorFlow': { color: '#FF6F00' },
  'PyTorch': { color: '#EE4C2C' },
  'OpenAI': { color: '#412991' },
  'Azure OpenAI': { color: '#412991' },
  'LangChain': { color: '#1C3C3C' },
  'Pandas': { color: '#150458' },
  'NumPy': { color: '#013243' },

  // ===== CMS & Others =====
  'WordPress': { color: '#21759B' },
  'Strapi': { color: '#4945FF' },
  'Sanity': { color: '#F03E2F' },
  'Contentful': { color: '#2478CC' },

  // ===== Messaging & Realtime =====
  'RabbitMQ': { color: '#FF6600' },
  'Kafka': { color: '#231F20' },
  'Socket.io': { color: '#010101' },
  'WebSocket': { color: '#010101' },

  // ===== Legacy / Enterprise =====
  'J2EE': { color: '#007396' },
  'JSP': { color: '#007396' },
  'JSF': { color: '#007396' },
  'jQuery': { color: '#0769AD' },
} as const satisfies Record<string, { color: string }>

export type TechName = keyof typeof TECH_REGISTRY

/**
 * Resolves the color for a given tech name.
 * Priority: registry → fallback gray.
 */
export function getTechColor(name: string): string {
  const registered = TECH_REGISTRY[name as TechName]
  if (registered) return registered.color

  return '#6b7280'
}

/**
 * Badge tier — kept only for the <noscript> SEO fallback (render-resume-html.ts),
 * which still derives its own light-mode-only badge colors from a tech's tier. The
 * live site (TechBadge.tsx) and the PDF (render-resume-pdf.ts) no longer use this —
 * they resolve through the explicit per-theme palette below instead.
 */
export type TechTier = 'brand' | 'workflow' | 'support' | 'muted'

const BRAND_TECHS = new Set([
  'Azure',
  'Terraform',
  'C#',
  'Service Bus',
  'OpenAI',
  'Azure OpenAI',
  'Claude',
  'pgvector',
  'Docker',
  'Agile Methods',
  'Méthodes Agiles',
])

const WORKFLOW_TECHS = new Set(['Git', 'CI/CD', 'GitHub', 'GitLab', 'Azure DevOps'])

const SUPPORT_TECHS = new Set([
  'FastAPI',
  'PostgreSQL',
  'Python',
  'PostHog',
  'Grafana',
  'Application Insights',
  'Log Analytics',
  'Azure Monitor',
])

export function getTechTier(name: string): TechTier {
  if (BRAND_TECHS.has(name)) return 'brand'
  if (WORKFLOW_TECHS.has(name)) return 'workflow'
  if (SUPPORT_TECHS.has(name)) return 'support'
  return 'muted'
}

/**
 * The actual badge palette for this CV — one official color per tool, per theme
 * (not derived algorithmically from a single hex like TECH_REGISTRY above, which
 * exists only for the broader TechName autocomplete surface). This is the single
 * source of truth every badge resolves through, on both the site (TechBadge.tsx)
 * and the PDF (render-resume-pdf.ts): same tech, same color, everywhere.
 *
 * One color per ecosystem rather than per literal tool name — every Azure service
 * shares the Azure blue, PostgreSQL and pgvector share the same blue, etc. Both hex
 * values are checked to clear 4.5:1 contrast against their own badge background
 * (14% tint of the color over the card background) — a handful needed darkening or
 * lightening to pass; see getTechBadgeColor's callers for which ones.
 */
export interface TechThemeColors {
  dark: string
  light: string
}

const TECH_BADGE_COLORS: Record<string, TechThemeColors> = {
  // Azure family — every Azure-branded service shares the same blue.
  'Azure': { dark: '#3A9BE8', light: '#006ABB' },
  'Service Bus': { dark: '#3A9BE8', light: '#006ABB' },
  'Application Insights': { dark: '#3A9BE8', light: '#006ABB' },
  'Log Analytics': { dark: '#3A9BE8', light: '#006ABB' },
  'Azure DevOps': { dark: '#3A9BE8', light: '#006ABB' },
  'Terraform': { dark: '#A77EDB', light: '#7B42BC' },
  'Docker': { dark: '#2496ED', light: '#1C5FE4' },
  'Git': { dark: '#E6EDF3', light: '#24292F' },
  'GitLab': { dark: '#E6EDF3', light: '#24292F' },
  'GitHub': { dark: '#E6EDF3', light: '#24292F' },
  'CI/CD': { dark: '#E6EDF3', light: '#24292F' },
  'C#': { dark: '#C27BC0', light: '#68217A' },
  'C++': { dark: '#659AD2', light: '#00599C' },
  'Python': { dark: '#FFD43B', light: '#336D9D' },
  'FastAPI': { dark: '#1FBFAE', light: '#04766B' },
  'PostgreSQL': { dark: '#7AA6DA', light: '#336791' },
  'pgvector': { dark: '#7AA6DA', light: '#336791' },
  'Oracle Database': { dark: '#E36A5A', light: '#B74030' },
  'OpenAI': { dark: '#9B8CFF', light: '#6D55CD' },
  'Claude': { dark: '#D97757', light: '#A45133' },
  'Grafana': { dark: '#F58A3C', light: '#AE4A00' },
  'PostHog': { dark: '#6684FF', light: '#1D4AFF' },
  'Next.js': { dark: '#E6EDF3', light: '#111111' },
  // Slightly grayed relative to the rest of the palette — less central to the
  // targeted career path now, so these recede rather than compete for attention.
  'Unity': { dark: '#9AA0A6', light: '#5F6368' },
  'Unreal': { dark: '#D0D4DB', light: '#333333' },
  'Netcode': { dark: '#9AA0A6', light: '#5F6368' },
  'AR': { dark: '#9AA0A6', light: '#5F6368' },
  'Agile Methods': { dark: '#4ADE80', light: '#107937' },
  // fr label for the same skill — badge text isn't language-resolved everywhere
  // it's read from, so classify both to keep the color lookup correct.
  'Méthodes Agiles': { dark: '#4ADE80', light: '#107937' },
}

/** Any tech not explicitly listed above — visible and factual, never salient. */
const NEUTRAL_TECH_BADGE_COLOR: TechThemeColors = { dark: '#D0D4DB', light: '#333333' }

/** Resolves a tech's badge color for the given theme. Unlisted techs fall back to neutral. */
export function getTechBadgeColor(name: string, mode: 'dark' | 'light'): string {
  const entry = TECH_BADGE_COLORS[name] ?? NEUTRAL_TECH_BADGE_COLOR
  return mode === 'dark' ? entry.dark : entry.light
}
