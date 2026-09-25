import fs from 'fs'
import path from 'path'
import type { ResumeConfig } from '../src/data/types'
import { presets } from '../src/data/presets'
import { getTechBadgeColor } from '../src/data/tech-registry'
import { escapeHtml } from './render-resume-html'

/**
 * Dedicated PDF renderer — a from-scratch replica of the site's dark, two-column
 * card layout (Sidebar.tsx / MainContent.tsx), NOT a fork of render-resume-html.ts.
 * That file also feeds the <noscript> SEO fallback (vite-plugin-resume-seo.ts); keeping
 * this generator separate means nothing here can ever change what the live site or its
 * fallback render, even by accident.
 */

/** Sidebar width as a % of the page. Narrower than the site's 38% (md:w-[38%]). */
const SIDEBAR_WIDTH_PCT = 29

const INLINE_ICONS: Record<string, string> = {
  linkedin:
    '<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>',
  email:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>',
  phone:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>',
  website:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>',
  location:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>',
}

function iconSlot(name: string | null, color: string): string {
  const svg = name ? INLINE_ICONS[name] : undefined
  return `<span style="display: inline-block; width: 14px; height: 14px; margin-right: 0.5rem; vertical-align: -2px; color: ${color}; flex-shrink: 0;">${svg ?? ''}</span>`
}

function getImageDataUri(fileName: string): string | null {
  try {
    const imgPath = path.resolve(process.cwd(), 'public', 'images', fileName)
    const buffer = fs.readFileSync(imgPath)
    const ext = path.extname(fileName).slice(1).toLowerCase()
    const mime = ext === 'jpg' ? 'jpeg' : ext
    return `data:image/${mime};base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
}

/**
 * Self-hosted, embedded as base64 so headless Chrome never depends on a network
 * fetch or a relative path resolving against the printed HTML's base URL. Not
 * wrapped in try/catch: a missing font file here would silently reintroduce the
 * layout-shifting-fallback-font bug (prod PDF running longer than 1 page) that
 * this is fixing, so a missing file should fail the build loudly instead.
 */
function getFontDataUri(fileName: string): string {
  const fontPath = path.resolve(process.cwd(), 'public', 'fonts', fileName)
  const buffer = fs.readFileSync(fontPath)
  return `data:font/ttf;base64,${buffer.toString('base64')}`
}

// Selawik is Microsoft's own open substitute for Segoe UI (the font system-ui was
// resolving to locally on Windows) — chosen over a generic webfont so self-hosting it
// doesn't shift the line-wrapping the layout was tuned against. No 500 weight ships,
// so it's mapped onto the regular face; no italic face ships either, so italic text
// (see font-style: italic below) falls back to the browser's synthetic-oblique of the
// regular face rather than a different, wider font.
const FONT_REGULAR_DATA_URI = getFontDataUri('selawik-regular.ttf')
const FONT_SEMIBOLD_DATA_URI = getFontDataUri('selawik-semibold.ttf')
const FONT_BOLD_DATA_URI = getFontDataUri('selawik-bold.ttf')

/**
 * The web timeline lists experiences top (most recent) to bottom (oldest), so each
 * period reads "recent - older". Flip it to "older - recent" for the flat PDF document.
 */
function reverseDateRange(period: string): string {
  const parts = period.split(' - ')
  return parts.length === 2 ? `${parts[1]} - ${parts[0]}` : period
}

/**
 * The PDF defaults to light — white main column against the sidebar's light gray,
 * meant for printing. 'dark' reads the same preset's dark half instead, kept for
 * anyone who wants the site's default dark look back.
 */
function resolveThemeColors(config: ResumeConfig, mode: 'dark' | 'light') {
  const preset = presets[config.theme?.preset ?? 'minimal']
  const merged = { ...preset, ...config.theme?.colors }
  if (mode === 'light') {
    return {
      bg: merged.bg,
      bgCard: merged.bgCard,
      text: merged.text,
      textSecondary: merged.textSecondary,
      primary: merged.primary,
      primaryLight: merged.primaryLight,
      sidebarFrom: merged.sidebarLight,
      sidebarTo: merged.sidebarLightEnd,
    }
  }
  return {
    bg: merged.bgDark,
    bgCard: merged.bgCardDark,
    text: merged.textDark,
    textSecondary: merged.textSecondaryDark,
    primary: merged.primaryDark,
    primaryLight: merged.primaryLightDark,
    sidebarFrom: merged.sidebarDark,
    sidebarTo: merged.sidebarDarkEnd,
  }
}

/** A couple of tech labels need a French display label without touching the color lookup. */
const TECH_LABEL_FR: Record<string, string> = {
  'Agile Methods': 'Méthodes Agiles',
}

/**
 * Brand glyphs (single-path, viewBox 0 0 24 24) from Simple Icons (simpleicons.org,
 * CC0), inlined so nothing here depends on a network fetch. Only covers techs with an
 * actual brand mark — generic/conceptual entries (CI/CD, LLM, Agile Methods, Azure's
 * own sub-services, pgvector, C#, which Simple Icons doesn't carry a logo for) are
 * deliberately left out and render as plain text badges, same as before.
 */
const TECH_ICON_PATHS: Record<string, string> = {
  Azure:
    'M22.379 23.343a1.62 1.62 0 0 0 1.536-2.14v.002L17.35 1.76A1.62 1.62 0 0 0 15.816.657H8.184A1.62 1.62 0 0 0 6.65 1.76L.086 21.204a1.62 1.62 0 0 0 1.536 2.139h4.741a1.62 1.62 0 0 0 1.535-1.103l.977-2.892 4.947 3.675c.28.208.618.32.966.32m-3.084-12.531 3.624 10.739a.54.54 0 0 1-.51.713v-.001h-.03a.54.54 0 0 1-.322-.106l-9.287-6.9h4.853m6.313 7.006c.116-.326.13-.694.007-1.058L9.79 1.76a1.722 1.722 0 0 0-.007-.02h6.034a.54.54 0 0 1 .512.366l6.562 19.445a.54.54 0 0 1-.338.684',
  Terraform:
    'M1.44 0v7.575l6.561 3.79V3.787zm21.12 4.227l-6.561 3.791v7.574l6.56-3.787zM8.72 4.23v7.575l6.561 3.787V8.018zm0 8.405v7.575L15.28 24v-7.578z',
  Docker:
    'M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z',
  Python:
    'M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z',
  'C++':
    'M22.394 6c-.167-.29-.398-.543-.652-.69L12.926.22c-.509-.294-1.34-.294-1.848 0L2.26 5.31c-.508.293-.923 1.013-.923 1.6v10.18c0 .294.104.62.271.91.167.29.398.543.652.69l8.816 5.09c.508.293 1.34.293 1.848 0l8.816-5.09c.254-.147.485-.4.652-.69.167-.29.27-.616.27-.91V6.91c.003-.294-.1-.62-.268-.91zM12 19.11c-3.92 0-7.109-3.19-7.109-7.11 0-3.92 3.19-7.11 7.11-7.11a7.133 7.133 0 016.156 3.553l-3.076 1.78a3.567 3.567 0 00-3.08-1.78A3.56 3.56 0 008.444 12 3.56 3.56 0 0012 15.555a3.57 3.57 0 003.08-1.778l3.078 1.78A7.135 7.135 0 0112 19.11zm7.11-6.715h-.79v.79h-.79v-.79h-.79v-.79h.79v-.79h.79v.79h.79zm2.962 0h-.79v.79h-.79v-.79h-.79v-.79h.79v-.79h.79v.79h.79z',
  FastAPI:
    'M12 .0387C5.3729.0384.0003 5.3931 0 11.9988c-.001 6.6066 5.372 11.9628 12 11.9625 6.628.0003 12.001-5.3559 12-11.9625-.0003-6.6057-5.3729-11.9604-12-11.96m-.829 5.4153h7.55l-7.5805 5.3284h5.1828L5.279 18.5436q2.9466-6.5444 5.892-13.0896',
  PostgreSQL:
    'M23.5594 14.7228a.5269.5269 0 0 0-.0563-.1191c-.139-.2632-.4768-.3418-1.0074-.2321-1.6533.3411-2.2935.1312-2.5256-.0191 1.342-2.0482 2.445-4.522 3.0411-6.8297.2714-1.0507.7982-3.5237.1222-4.7316a1.5641 1.5641 0 0 0-.1509-.235C21.6931.9086 19.8007.0248 17.5099.0005c-1.4947-.0158-2.7705.3461-3.1161.4794a9.449 9.449 0 0 0-.5159-.0816 8.044 8.044 0 0 0-1.3114-.1278c-1.1822-.0184-2.2038.2642-3.0498.8406-.8573-.3211-4.7888-1.645-7.2219.0788C.9359 2.1526.3086 3.8733.4302 6.3043c.0409.818.5069 3.334 1.2423 5.7436.4598 1.5065.9387 2.7019 1.4334 3.582.553.9942 1.1259 1.5933 1.7143 1.7895.4474.1491 1.1327.1441 1.8581-.7279.8012-.9635 1.5903-1.8258 1.9446-2.2069.4351.2355.9064.3625 1.39.3772a.0569.0569 0 0 0 .0004.0041 11.0312 11.0312 0 0 0-.2472.3054c-.3389.4302-.4094.5197-1.5002.7443-.3102.064-1.1344.2339-1.1464.8115-.0025.1224.0329.2309.0919.3268.2269.4231.9216.6097 1.015.6331 1.3345.3335 2.5044.092 3.3714-.6787-.017 2.231.0775 4.4174.3454 5.0874.2212.5529.7618 1.9045 2.4692 1.9043.2505 0 .5263-.0291.8296-.0941 1.7819-.3821 2.5557-1.1696 2.855-2.9059.1503-.8707.4016-2.8753.5388-4.1012.0169-.0703.0357-.1207.057-.1362.0007-.0005.0697-.0471.4272.0307a.3673.3673 0 0 0 .0443.0068l.2539.0223.0149.001c.8468.0384 1.9114-.1426 2.5312-.4308.6438-.2988 1.8057-1.0323 1.5951-1.6698zM2.371 11.8765c-.7435-2.4358-1.1779-4.8851-1.2123-5.5719-.1086-2.1714.4171-3.6829 1.5623-4.4927 1.8367-1.2986 4.8398-.5408 6.108-.13-.0032.0032-.0066.0061-.0098.0094-2.0238 2.044-1.9758 5.536-1.9708 5.7495-.0002.0823.0066.1989.0162.3593.0348.5873.0996 1.6804-.0735 2.9184-.1609 1.1504.1937 2.2764.9728 3.0892.0806.0841.1648.1631.2518.2374-.3468.3714-1.1004 1.1926-1.9025 2.1576-.5677.6825-.9597.5517-1.0886.5087-.3919-.1307-.813-.5871-1.2381-1.3223-.4796-.839-.9635-2.0317-1.4155-3.5126zm6.0072 5.0871c-.1711-.0428-.3271-.1132-.4322-.1772.0889-.0394.2374-.0902.4833-.1409 1.2833-.2641 1.4815-.4506 1.9143-1.0002.0992-.126.2116-.2687.3673-.4426a.3549.3549 0 0 0 .0737-.1298c.1708-.1513.2724-.1099.4369-.0417.156.0646.3078.26.3695.4752.0291.1016.0619.2945-.0452.4444-.9043 1.2658-2.2216 1.2494-3.1676 1.0128zm2.094-3.988-.0525.141c-.133.3566-.2567.6881-.3334 1.003-.6674-.0021-1.3168-.2872-1.8105-.8024-.6279-.6551-.9131-1.5664-.7825-2.5004.1828-1.3079.1153-2.4468.079-3.0586-.005-.0857-.0095-.1607-.0122-.2199.2957-.2621 1.6659-.9962 2.6429-.7724.4459.1022.7176.4057.8305.928.5846 2.7038.0774 3.8307-.3302 4.7363-.084.1866-.1633.3629-.2311.5454zm7.3637 4.5725c-.0169.1768-.0358.376-.0618.5959l-.146.4383a.3547.3547 0 0 0-.0182.1077c-.0059.4747-.054.6489-.115.8693-.0634.2292-.1353.4891-.1794 1.0575-.11 1.4143-.8782 2.2267-2.4172 2.5565-1.5155.3251-1.7843-.4968-2.0212-1.2217a6.5824 6.5824 0 0 0-.0769-.2266c-.2154-.5858-.1911-1.4119-.1574-2.5551.0165-.5612-.0249-1.9013-.3302-2.6462.0044-.2932.0106-.5909.019-.8918a.3529.3529 0 0 0-.0153-.1126 1.4927 1.4927 0 0 0-.0439-.208c-.1226-.4283-.4213-.7866-.7797-.9351-.1424-.059-.4038-.1672-.7178-.0869.067-.276.1831-.5875.309-.9249l.0529-.142c.0595-.16.134-.3257.213-.5012.4265-.9476 1.0106-2.2453.3766-5.1772-.2374-1.0981-1.0304-1.6343-2.2324-1.5098-.7207.0746-1.3799.3654-1.7088.5321a5.6716 5.6716 0 0 0-.1958.1041c.0918-1.1064.4386-3.1741 1.7357-4.4823a4.0306 4.0306 0 0 1 .3033-.276.3532.3532 0 0 0 .1447-.0644c.7524-.5706 1.6945-.8506 2.802-.8325.4091.0067.8017.0339 1.1742.081 1.939.3544 3.2439 1.4468 4.0359 2.3827.8143.9623 1.2552 1.9315 1.4312 2.4543-1.3232-.1346-2.2234.1268-2.6797.779-.9926 1.4189.543 4.1729 1.2811 5.4964.1353.2426.2522.4522.2889.5413.2403.5825.5515.9713.7787 1.2552.0696.087.1372.1714.1885.245-.4008.1155-1.1208.3825-1.0552 1.717-.0123.1563-.0423.4469-.0834.8148-.0461.2077-.0702.4603-.0994.7662zm.8905-1.6211c-.0405-.8316.2691-.9185.5967-1.0105a2.8566 2.8566 0 0 0 .135-.0406 1.202 1.202 0 0 0 .1342.103c.5703.3765 1.5823.4213 3.0068.1344-.2016.1769-.5189.3994-.9533.6011-.4098.1903-1.0957.333-1.7473.3636-.7197.0336-1.0859-.0807-1.1721-.151zm.5695-9.2712c-.0059.3508-.0542.6692-.1054 1.0017-.055.3576-.112.7274-.1264 1.1762-.0142.4368.0404.8909.0932 1.3301.1066.887.216 1.8003-.2075 2.7014a3.5272 3.5272 0 0 1-.1876-.3856c-.0527-.1276-.1669-.3326-.3251-.6162-.6156-1.1041-2.0574-3.6896-1.3193-4.7446.3795-.5427 1.3408-.5661 2.1781-.463zm.2284 7.0137a12.3762 12.3762 0 0 0-.0853-.1074l-.0355-.0444c.7262-1.1995.5842-2.3862.4578-3.4385-.0519-.4318-.1009-.8396-.0885-1.2226.0129-.4061.0666-.7543.1185-1.0911.0639-.415.1288-.8443.1109-1.3505.0134-.0531.0188-.1158.0118-.1902-.0457-.4855-.5999-1.938-1.7294-3.253-.6076-.7073-1.4896-1.4972-2.6889-2.0395.5251-.1066 1.2328-.2035 2.0244-.1859 2.0515.0456 3.6746.8135 4.8242 2.2824a.908.908 0 0 1 .0667.1002c.7231 1.3556-.2762 6.2751-2.9867 10.5405zm-8.8166-6.1162c-.025.1794-.3089.4225-.6211.4225a.5821.5821 0 0 1-.0809-.0056c-.1873-.026-.3765-.144-.5059-.3156-.0458-.0605-.1203-.178-.1055-.2844.0055-.0401.0261-.0985.0925-.1488.1182-.0894.3518-.1226.6096-.0867.3163.0441.6426.1938.6113.4186zm7.9305-.4114c.0111.0792-.049.201-.1531.3102-.0683.0717-.212.1961-.4079.2232a.5456.5456 0 0 1-.075.0052c-.2935 0-.5414-.2344-.5607-.3717-.024-.1765.2641-.3106.5611-.352.297-.0414.6111.0088.6356.1851',
  OpenAI:
    'M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z',
  Claude:
    'm4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z',
  Grafana:
    'M23.02 10.59a8.578 8.578 0 0 0-.862-3.034 8.911 8.911 0 0 0-1.789-2.445c.337-1.342-.413-2.505-.413-2.505-1.292-.08-2.113.4-2.416.62-.052-.02-.102-.044-.154-.064-.22-.089-.446-.172-.677-.247-.231-.073-.47-.14-.711-.197a9.867 9.867 0 0 0-.875-.161C14.557.753 12.94 0 12.94 0c-1.804 1.145-2.147 2.744-2.147 2.744l-.018.093c-.098.029-.2.057-.298.088-.138.042-.275.094-.413.143-.138.055-.275.107-.41.166a8.869 8.869 0 0 0-1.557.87l-.063-.029c-2.497-.955-4.716.195-4.716.195-.203 2.658.996 4.33 1.235 4.636a11.608 11.608 0 0 0-.607 2.635C1.636 12.677.953 15.014.953 15.014c1.926 2.214 4.171 2.351 4.171 2.351.003-.002.006-.002.006-.005.285.509.615.994.986 1.446.156.19.32.371.488.548-.704 2.009.099 3.68.099 3.68 2.144.08 3.553-.937 3.849-1.173a9.784 9.784 0 0 0 3.164.501h.08l.055-.003.107-.002.103-.005.003.002c1.01 1.44 2.788 1.646 2.788 1.646 1.264-1.332 1.337-2.653 1.337-2.94v-.058c0-.02-.003-.039-.003-.06.265-.187.52-.387.758-.6a7.875 7.875 0 0 0 1.415-1.7c1.43.083 2.437-.885 2.437-.885-.236-1.49-1.085-2.216-1.264-2.354l-.018-.013-.016-.013a.217.217 0 0 1-.031-.02c.008-.092.016-.18.02-.27.011-.162.016-.323.016-.48v-.253l-.005-.098-.008-.135a1.891 1.891 0 0 0-.01-.13c-.003-.042-.008-.083-.013-.125l-.016-.124-.018-.122a6.215 6.215 0 0 0-2.032-3.73 6.015 6.015 0 0 0-3.222-1.46 6.292 6.292 0 0 0-.85-.048l-.107.002h-.063l-.044.003-.104.008a4.777 4.777 0 0 0-3.335 1.695c-.332.4-.592.84-.768 1.297a4.594 4.594 0 0 0-.312 1.817l.003.091c.005.055.007.11.013.164a3.615 3.615 0 0 0 .698 1.82 3.53 3.53 0 0 0 1.827 1.282c.33.098.66.14.971.137.039 0 .078 0 .114-.002l.063-.003c.02 0 .041-.003.062-.003.034-.002.065-.007.099-.01.007 0 .018-.003.028-.003l.031-.005.06-.008a1.18 1.18 0 0 0 .112-.02c.036-.008.072-.013.109-.024a2.634 2.634 0 0 0 .914-.415c.028-.02.056-.041.085-.065a.248.248 0 0 0 .039-.35.244.244 0 0 0-.309-.06l-.078.042c-.09.044-.184.083-.283.116a2.476 2.476 0 0 1-.475.096c-.028.003-.054.006-.083.006l-.083.002c-.026 0-.054 0-.08-.002l-.102-.006h-.012l-.024.006c-.016-.003-.031-.003-.044-.006-.031-.002-.06-.007-.091-.01a2.59 2.59 0 0 1-.724-.213 2.557 2.557 0 0 1-.667-.438 2.52 2.52 0 0 1-.805-1.475 2.306 2.306 0 0 1-.029-.444l.006-.122v-.023l.002-.031c.003-.021.003-.04.005-.06a3.163 3.163 0 0 1 1.352-2.29 3.12 3.12 0 0 1 .937-.43 2.946 2.946 0 0 1 .776-.101h.06l.07.002.045.003h.026l.07.005a4.041 4.041 0 0 1 1.635.49 3.94 3.94 0 0 1 1.602 1.662 3.77 3.77 0 0 1 .397 1.414l.005.076.003.075c.002.026.002.05.002.075 0 .024.003.052 0 .07v.065l-.002.073-.008.174a6.195 6.195 0 0 1-.08.639 5.1 5.1 0 0 1-.267.927 5.31 5.31 0 0 1-.624 1.13 5.052 5.052 0 0 1-3.237 2.014 4.82 4.82 0 0 1-.649.066l-.039.003h-.287a6.607 6.607 0 0 1-1.716-.265 6.776 6.776 0 0 1-3.4-2.274 6.75 6.75 0 0 1-.746-1.15 6.616 6.616 0 0 1-.714-2.596l-.005-.083-.002-.02v-.056l-.003-.073v-.096l-.003-.104v-.07l.003-.163c.008-.22.026-.45.054-.678a8.707 8.707 0 0 1 .28-1.355c.128-.444.286-.872.473-1.277a7.04 7.04 0 0 1 1.456-2.1 5.925 5.925 0 0 1 .953-.763c.169-.111.343-.213.524-.306.089-.05.182-.091.273-.135.047-.02.093-.042.138-.062a7.177 7.177 0 0 1 .714-.267l.145-.045c.049-.015.098-.026.148-.041.098-.029.197-.052.296-.076.049-.013.1-.02.15-.033l.15-.032.151-.028.076-.013.075-.01.153-.024c.057-.01.114-.013.171-.023l.169-.021c.036-.003.073-.008.106-.01l.073-.008.036-.003.042-.002c.057-.003.114-.008.171-.01l.086-.006h.023l.037-.003.145-.007a7.999 7.999 0 0 1 1.708.125 7.917 7.917 0 0 1 2.048.68 8.253 8.253 0 0 1 1.672 1.09l.09.077.089.078c.06.052.114.107.171.159.057.052.112.106.166.16.052.055.107.107.159.164a8.671 8.671 0 0 1 1.41 1.978c.012.026.028.052.04.078l.04.078.075.156c.023.051.05.1.07.153l.065.15a8.848 8.848 0 0 1 .45 1.34.19.19 0 0 0 .201.142.186.186 0 0 0 .172-.184c.01-.246.002-.532-.024-.856z',
  PostHog:
    'M9.854 14.5 5 9.647.854 5.5A.5.5 0 0 0 0 5.854V8.44a.5.5 0 0 0 .146.353L5 13.647l.147.146L9.854 18.5l.146.147v-.049c.065.03.134.049.207.049h2.586a.5.5 0 0 0 .353-.854L9.854 14.5zm0-5-4-4a.487.487 0 0 0-.409-.144.515.515 0 0 0-.356.21.493.493 0 0 0-.089.288V8.44a.5.5 0 0 0 .147.353l9 9a.5.5 0 0 0 .853-.354v-2.585a.5.5 0 0 0-.146-.354l-5-5zm1-4a.5.5 0 0 0-.854.354V8.44a.5.5 0 0 0 .147.353l4 4a.5.5 0 0 0 .853-.354V9.854a.5.5 0 0 0-.146-.354l-4-4zm12.647 11.515a3.863 3.863 0 0 1-2.232-1.1l-4.708-4.707a.5.5 0 0 0-.854.354v6.585a.5.5 0 0 0 .5.5H23.5a.5.5 0 0 0 .5-.5v-.6c0-.276-.225-.497-.499-.532zm-5.394.032a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6zM.854 15.5a.5.5 0 0 0-.854.354v2.293a.5.5 0 0 0 .5.5h2.293c.222 0 .39-.135.462-.309a.493.493 0 0 0-.109-.545L.854 15.501zM5 14.647.854 10.5a.5.5 0 0 0-.854.353v2.586a.5.5 0 0 0 .146.353L4.854 18.5l.146.147h2.793a.5.5 0 0 0 .353-.854L5 14.647z',
  Git: 'M13.09 23.549a1.54 1.54 0 0 1-2.18 0L.451 13.089a1.54 1.54 0 0 1 0-2.179l7.191-7.19 2.733 2.733a1.85 1.85 0 0 0 .964 2.326v6.66a1.849 1.849 0 1 0 1.54 0V8.957l2.508 2.508a1.85 1.85 0 1 0 1.09-1.09l-2.634-2.634a1.85 1.85 0 0 0-2.378-2.377L8.73 2.63 10.91.451a1.54 1.54 0 0 1 2.179 0l10.459 10.46a1.54 1.54 0 0 1 0 2.179z',
}

function techIcon(tech: string): string {
  const d = TECH_ICON_PATHS[tech]
  if (!d) return ''
  return `<svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10" style="flex-shrink: 0;"><path d="${d}" /></svg>`
}

/**
 * Same recipe as TechBadge.tsx, resolved through the same central palette
 * (tech-registry.ts): full-opacity text, 14% tint background, 45% tint border.
 * `mode` picks which half of that palette to read (see resolveThemeColors).
 * `withIcon` is only turned on for the skills sidebar (see below) — experience/project
 * tech badges stay text-only, unchanged.
 */
function renderBadge(tech: string, lang: string, mode: 'dark' | 'light', withIcon = false): string {
  const color = getTechBadgeColor(tech, mode)
  const label = lang === 'fr' ? (TECH_LABEL_FR[tech] ?? tech) : tech
  const icon = withIcon ? techIcon(tech) : ''
  const display = icon ? 'inline-flex; align-items: center; gap: 0.3rem' : 'inline-block'
  return `<span style="display: ${display}; padding: 0.22rem 0.5rem; border-radius: 4px; font-size: 0.72rem; font-weight: 500; line-height: 1.2; background: ${color}24; color: ${color}; border: 1px solid ${color}73;">${icon}${escapeHtml(label)}</span>`
}

function renderBadges(
  techs: string[],
  lang: string,
  mode: 'dark' | 'light',
  gap = '0.35rem',
  marginTop = '0.4rem',
  withIcon = false,
): string {
  if (techs.length === 0) return ''
  return `<div style="display: flex; flex-wrap: wrap; gap: ${gap}; margin-top: ${marginTop};">${techs.map((t) => renderBadge(t, lang, mode, withIcon)).join('')}</div>`
}

/** Mirrors SidebarSection.tsx: small tracking-widest heading, underlined. */
function sidebarSectionTitle(label: string, colors: ReturnType<typeof resolveThemeColors>): string {
  return `<h3 style="font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em; color: ${colors.text}; margin: 0 0 0.6rem 0; padding-bottom: 0.3rem; border-bottom: 1px solid ${colors.primary}33;">${escapeHtml(label)}</h3>`
}

/** Mirrors MainContent.tsx's section headings ("EXPERIENCE", "EDUCATION", ...). */
function mainSectionTitle(label: string, colors: ReturnType<typeof resolveThemeColors>): string {
  return `<h2 style="font-size: 0.78rem; font-weight: 700; letter-spacing: 0.1em; color: ${colors.text}; margin: 0 0 0.9rem 0; padding-bottom: 0.4rem; border-bottom: 1px solid ${colors.primary}33;">${escapeHtml(label)}</h2>`
}

export function renderResumePdfDocument(config: ResumeConfig, lang: string, mode: 'dark' | 'light' = 'light'): string {
  const resolve = (ls: Record<string, string>) => ls[lang] ?? Object.values(ls)[0] ?? ''
  const colors = resolveThemeColors(config, mode)
  const { personal, contact, skills, experiences, education, values, hobbies, referents, spokenLanguages } = config

  const s: string[] = []

  // ----- Sidebar (Sidebar.tsx: photo, contact, referents, skills, values, hobbies) -----
  const sidebar: string[] = []

  const photoDataUri = getImageDataUri(personal.photo?.split('/').pop() ?? 'photo.jpg')
  sidebar.push(`<div style="display: flex; justify-content: center; margin-bottom: 1.1rem;">`)
  if (photoDataUri) {
    sidebar.push(
      `<div style="width: 96px; height: 96px; border-radius: 50%; overflow: hidden; border: 3px solid ${colors.bg}66; box-shadow: 0 6px 16px rgba(0,0,0,0.4);"><img src="${photoDataUri}" alt="${escapeHtml(personal.name)}" style="width: 100%; height: 100%; object-fit: cover;" /></div>`,
    )
  } else {
    sidebar.push(
      `<div style="width: 96px; height: 96px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight}); border: 3px solid ${colors.bg}66; box-shadow: 0 6px 16px rgba(0,0,0,0.4); font-size: 2.2rem;">${personal.photoBackEmoji ?? '👨‍💻'}</div>`,
    )
  }
  sidebar.push(`</div>`)

  if (personal.subtitle) {
    sidebar.push(`<p style="margin: 0 0 1.2rem 0; font-size: 0.76rem; font-style: italic; line-height: 1.5; text-align: justify; color: ${colors.textSecondary};">${escapeHtml(resolve(personal.subtitle))}</p>`)
  }

  if (contact.length > 0) {
    sidebar.push(`<section style="margin-bottom: 1.2rem;">`)
    sidebar.push(sidebarSectionTitle(resolve(config.labels.sections.contact), colors))
    sidebar.push(`<ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.55rem;">`)
    for (const c of contact) {
      const slot = iconSlot(c.type in INLINE_ICONS ? c.type : null, colors.primary)
      const inner = c.href
        ? `<a href="${escapeHtml(c.href)}" style="color: ${colors.text}; text-decoration: none;">${escapeHtml(c.label)}</a>`
        : `<span style="color: ${colors.text};">${escapeHtml(c.label)}</span>`
      sidebar.push(`<li style="display: flex; align-items: center; font-size: 0.8rem;">${slot}${inner}</li>`)
    }
    sidebar.push(`</ul>`)
    sidebar.push(`</section>`)
  }

  if (referents?.length && config.labels.sections.referent) {
    sidebar.push(`<section style="margin-bottom: 1.2rem;">`)
    sidebar.push(sidebarSectionTitle(resolve(config.labels.sections.referent), colors))
    sidebar.push(`<div style="display: flex; flex-direction: column; gap: 0.6rem;">`)
    for (const referent of referents) {
      const slot = iconSlot(referent.href ? 'linkedin' : null, colors.primary)
      const nameHtml = referent.href
        ? `<a href="${escapeHtml(referent.href)}" style="color: ${colors.text}; font-weight: 600; text-decoration: none;">${escapeHtml(referent.name)}</a>`
        : `<span style="font-weight: 600; color: ${colors.text};">${escapeHtml(referent.name)}</span>`
      sidebar.push(`<div>`)
      sidebar.push(`<p style="margin: 0; font-size: 0.82rem; display: flex; align-items: center;">${slot}${nameHtml}</p>`)
      sidebar.push(`<p style="margin: 0; font-size: 0.75rem; color: ${colors.textSecondary};">${escapeHtml(resolve(referent.title))}</p>`)
      sidebar.push(`</div>`)
    }
    sidebar.push(`</div>`)
    sidebar.push(`</section>`)
  }

  if (skills.length > 0) {
    sidebar.push(`<section style="margin-bottom: 1.2rem;">`)
    sidebar.push(sidebarSectionTitle(resolve(config.labels.sections.skills), colors))
    sidebar.push(`<div style="display: flex; flex-direction: column; gap: 0.6rem;">`)
    for (const cat of skills) {
      sidebar.push(`<div>`)
      sidebar.push(`<p style="margin: 0 0 0.3rem 0; font-size: 0.75rem; font-weight: 500; color: ${colors.text};">${escapeHtml(resolve(cat.title))}</p>`)
      if (cat.type === 'badges') {
        const items = cat.items.map((item) => (typeof item.name === 'string' ? item.name : resolve(item.name)))
        sidebar.push(renderBadges(items, lang, mode, '0.3rem', '0.4rem', true))
      } else {
        const items = cat.items.map((item) => {
          const name = typeof item.name === 'string' ? item.name : resolve(item.name)
          return cat.type === 'languages' && item.level ? `${name} (${resolve(item.level)})` : name
        })
        sidebar.push(`<p style="margin: 0; font-size: 0.75rem; color: ${colors.textSecondary};">${escapeHtml(items.join(', '))}</p>`)
      }
      sidebar.push(`</div>`)
    }
    sidebar.push(`</div>`)
    sidebar.push(`</section>`)
  }

  if (values && values.length > 0 && config.labels.sections.values) {
    sidebar.push(`<section style="margin-bottom: 1.2rem;">`)
    sidebar.push(sidebarSectionTitle(resolve(config.labels.sections.values), colors))
    sidebar.push(`<div style="display: flex; flex-direction: column; gap: 0.2rem;">`)
    for (const v of values) {
      sidebar.push(`<p style="margin: 0; font-size: 0.8rem; color: ${colors.textSecondary};">${escapeHtml(resolve(v))}</p>`)
    }
    sidebar.push(`</div>`)
    sidebar.push(`</section>`)
  }

  if (spokenLanguages && spokenLanguages.length > 0) {
    sidebar.push(`<section style="margin-bottom: 1.2rem;">`)
    sidebar.push(sidebarSectionTitle(lang === 'fr' ? 'LANGUES' : 'LANGUAGES', colors))
    sidebar.push(`<div style="display: flex; flex-direction: column; gap: 0.2rem;">`)
    for (const item of spokenLanguages) {
      sidebar.push(`<p style="margin: 0; font-size: 0.8rem;"><span style="font-weight: 500; color: ${colors.text};">${escapeHtml(resolve(item.name))}</span><span style="color: ${colors.textSecondary};"> : ${escapeHtml(resolve(item.level))}</span></p>`)
    }
    sidebar.push(`</div>`)
    sidebar.push(`</section>`)
  }

  if (hobbies && hobbies.length > 0 && config.labels.sections.hobbies) {
    sidebar.push(`<section>`)
    sidebar.push(sidebarSectionTitle(resolve(config.labels.sections.hobbies), colors))
    sidebar.push(`<div style="display: flex; flex-direction: column; gap: 0.5rem;">`)
    for (const hobby of hobbies) {
      const details = (hobby.details ?? []).map((d) => resolve(d)).join(' - ')
      sidebar.push(`<div>`)
      sidebar.push(`<p style="margin: 0; font-size: 0.78rem; font-weight: 500; color: ${colors.text};">${escapeHtml(resolve(hobby.title))}</p>`)
      if (details) {
        sidebar.push(`<p style="margin: 0; font-size: 0.7rem; color: ${colors.textSecondary};">${escapeHtml(details)}</p>`)
      }
      sidebar.push(`</div>`)
    }
    sidebar.push(`</div>`)
    sidebar.push(`</section>`)
  }

  // ----- Main column (MainContent.tsx: header, featured project, experiences, education) -----
  const main: string[] = []

  main.push(`<div style="text-align: center; margin-bottom: 1.6rem;">`)
  main.push(`<h1 style="margin: 0; font-size: 1.55rem; font-weight: 700; letter-spacing: 0.1em; color: ${colors.text};">${escapeHtml(personal.name.toUpperCase())}</h1>`)
  main.push(`<p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; letter-spacing: 0.08em; color: ${colors.textSecondary};">${escapeHtml(resolve(personal.title).toUpperCase())}</p>`)
  if (personal.tagline) {
    main.push(`<p style="margin: 0.3rem 0 0 0; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.06em; color: ${colors.textSecondary}b3;">${escapeHtml(resolve(personal.tagline))}</p>`)
  }
  main.push(`</div>`)

  if (config.featuredProject) {
    const fp = config.featuredProject
    main.push(`<div style="margin-bottom: 1.6rem;">`)
    main.push(mainSectionTitle(lang === 'fr' ? 'PROJET PHARE' : 'FLAGSHIP PROJECT', colors))
    main.push(`<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 0.6rem;">`)
    main.push(`<div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; min-width: 0;">`)
    if (fp.role) {
      main.push(`<h3 style="margin: 0; font-size: 0.92rem; font-weight: 600; color: ${colors.text}; text-transform: uppercase;">${escapeHtml(resolve(fp.role))}</h3>`)
      main.push(`<span style="font-size: 0.92rem; color: ${colors.textSecondary};">- ${escapeHtml(resolve(fp.title))}</span>`)
    } else {
      main.push(`<h3 style="margin: 0; font-size: 0.92rem; font-weight: 600; color: ${colors.text};">${escapeHtml(resolve(fp.title))}</h3>`)
    }
    if (fp.type) {
      main.push(`<span style="font-size: 0.68rem; font-weight: 600; padding: 0.1rem 0.45rem; border-radius: 4px; background: ${colors.primary}1a; color: ${colors.primary};">${escapeHtml(resolve(fp.type))}</span>`)
    }
    main.push(`</div>`)
    main.push(`<span style="flex-shrink: 0; white-space: nowrap; font-size: 0.75rem; font-weight: 400; color: ${colors.textSecondary}cc;">${escapeHtml(resolve(fp.period))}</span>`)
    main.push(`</div>`)
    if (fp.url) {
      main.push(`<a href="${escapeHtml(fp.url)}" style="display: inline-block; margin-top: 0.2rem; font-size: 0.75rem; color: ${colors.primaryLight}; text-decoration: none;">${escapeHtml(fp.url)}</a>`)
    }
    if (fp.description) {
      main.push(`<p style="margin: 0.5rem 0 0 0; font-size: 0.82rem; color: ${colors.text};">${escapeHtml(resolve(fp.description))}</p>`)
    }
    const bullets = fp.bullets[lang] ?? Object.values(fp.bullets)[0] ?? []
    if (bullets.length > 0) {
      main.push(`<ul style="margin: 0.5rem 0 0 0; padding: 0; list-style: none;">`)
      for (const bullet of bullets) {
        main.push(`<li style="display: flex; align-items: baseline; gap: 0.4rem; font-size: 0.8rem; color: ${colors.textSecondary}; margin-bottom: 0.25rem;"><span style="color: ${colors.primary};">&bull;</span><span>${escapeHtml(bullet)}</span></li>`)
      }
      main.push(`</ul>`)
    }
    // Badges last — same order as the experiences below (description, tasks, badges).
    if (fp.techs && fp.techs.length > 0) {
      main.push(renderBadges(fp.techs, lang, mode, '0.35rem', '0.55rem'))
    }
    main.push(`</div>`)
  }

  if (experiences.length > 0) {
    main.push(`<div style="margin-bottom: 1.6rem;">`)
    main.push(mainSectionTitle(resolve(config.labels.sections.experience), colors))
    main.push(`<div style="display: flex; flex-direction: column; gap: 0.6rem;">`)
    experiences.forEach((exp, expIndex) => {
      const periodText = reverseDateRange(resolve(exp.period))
      if (expIndex > 0) {
        // Slightly narrower and more subtle than the section heading's border —
        // colored with the sidebar's own background instead of the primary accent.
        main.push(`<div style="height: 1px; width: 94%; margin: 0 auto 0.2rem auto; background: ${colors.sidebarFrom};"></div>`)
      }
      main.push(`<div>`)
      // Row 1: role (title) - company, then the type badge, date pinned to the right
      // edge on the same line, single line (no wrapping date column like the site's w-20).
      main.push(`<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 0.6rem;">`)
      main.push(`<div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; min-width: 0;">`)
      main.push(`<h3 style="margin: 0; font-size: 0.86rem; font-weight: 600; color: ${colors.text}; text-transform: uppercase;">${escapeHtml(resolve(exp.role))}</h3>`)
      main.push(`<span style="font-size: 0.86rem; color: ${colors.textSecondary};">- ${escapeHtml(resolve(exp.company))}</span>`)
      if (exp.type) {
        main.push(`<span style="font-size: 0.68rem; font-weight: 600; padding: 0.1rem 0.45rem; border-radius: 4px; background: ${colors.primary}1a; color: ${colors.primary};">${escapeHtml(resolve(exp.type))}</span>`)
      }
      main.push(`</div>`)
      main.push(`<span style="flex-shrink: 0; white-space: nowrap; font-size: 0.75rem; font-weight: 400; color: ${colors.textSecondary}cc;">${escapeHtml(periodText)}</span>`)
      main.push(`</div>`) // end row 1
      if (exp.url) {
        main.push(`<a href="${escapeHtml(exp.url)}" style="display: inline-block; margin-top: 0.15rem; font-size: 0.75rem; color: ${colors.primaryLight}; text-decoration: none; word-break: break-all;">${escapeHtml(exp.url)}</a>`)
      }

      // Row 2: description + tasks + badges — full width, spanning under the date
      // column too (the requested divergence from the site's indented layout).
      main.push(`<p style="margin: 0.55rem 0 0 0; font-size: 0.8rem; color: ${colors.text};">${escapeHtml(resolve(exp.description))}</p>`)
      if (exp.details?.tasks) {
        const tasks = exp.details.tasks[lang] ?? Object.values(exp.details.tasks)[0]
        if (tasks && tasks.length > 0) {
          main.push(`<div style="margin-top: 0.55rem;">`)
          main.push(`<ul style="margin: 0; padding: 0; list-style: none;">`)
          for (const task of tasks) {
            main.push(`<li style="display: flex; align-items: baseline; gap: 0.4rem; font-size: 0.78rem; color: ${colors.textSecondary}; margin-bottom: 0.2rem;"><span style="color: ${colors.primary};">&bull;</span><span>${escapeHtml(task)}</span></li>`)
          }
          main.push(`</ul>`)
          main.push(`</div>`)
        }
      }
      if (exp.techs.length > 0) {
        main.push(renderBadges(exp.techs, lang, mode, '0.35rem', '0.55rem'))
      }
      if (exp.subItem) {
        main.push(`<div style="margin-top: 0.5rem; padding-left: 0.6rem; border-left: 2px solid ${colors.primary}33;">`)
        main.push(`<p style="margin: 0; font-size: 0.78rem; font-weight: 500; color: ${colors.text};">${escapeHtml(resolve(exp.subItem.title))}</p>`)
        main.push(`<p style="margin: 0; font-size: 0.75rem; color: ${colors.textSecondary};">${escapeHtml(resolve(exp.subItem.description))}</p>`)
        main.push(`</div>`)
      }
      if (exp.portfolioNote) {
        const before = lang === 'fr' ? 'Détail complet sur mon ' : 'Full detail on my '
        main.push(`<p style="margin: 0.4rem 0 0 0; font-size: 0.72rem; font-style: italic; color: ${colors.textSecondary};">${escapeHtml(before)}<a href="https://vincentboutin.dev" style="color: ${colors.primaryLight}; text-decoration: none;">portfolio</a>.</p>`)
      }
      main.push(`</div>`)
    })
    main.push(`</div>`)
    main.push(`</div>`)
  }

  if (education.length > 0) {
    main.push(`<div>`)
    main.push(mainSectionTitle(resolve(config.labels.sections.education), colors))
    main.push(`<div style="display: flex; flex-direction: column; gap: 0.8rem;">`)
    for (const edu of education) {
      main.push(`<div>`)
      // Same row layout as experiences: degree (title) - school, badge, date on the
      // right edge, single line.
      main.push(`<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 0.6rem;">`)
      main.push(`<div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; min-width: 0;">`)
      main.push(`<h3 style="margin: 0; font-size: 0.86rem; font-weight: 600; color: ${colors.text};">${escapeHtml(resolve(edu.degree))}</h3>`)
      main.push(`<span style="font-size: 0.86rem; color: ${colors.textSecondary};">- ${escapeHtml(resolve(edu.school))}</span>`)
      if (edu.badge) {
        main.push(`<span style="font-size: 0.68rem; font-weight: 500; padding: 0.08rem 0.4rem; border-radius: 4px; background: rgba(248, 113, 113, 0.1); color: #f87171;">${escapeHtml(resolve(edu.badge))}</span>`)
      }
      main.push(`</div>`)
      if (edu.period) {
        main.push(`<span style="flex-shrink: 0; white-space: nowrap; font-size: 0.75rem; font-weight: 400; color: ${colors.textSecondary}cc;">${escapeHtml(edu.period)}</span>`)
      }
      main.push(`</div>`)
      if (edu.specialty) {
        main.push(`<p style="margin: 0.15rem 0 0 0; font-size: 0.78rem; color: ${colors.primary};">${escapeHtml(resolve(edu.specialty))}</p>`)
      }
      main.push(`</div>`)
    }
    main.push(`</div>`)
    main.push(`</div>`)
  }

  s.push(`<div style="float: left; width: ${SIDEBAR_WIDTH_PCT}%; box-sizing: border-box; padding: 2rem 1.4rem 0.8rem 1.8rem;">${sidebar.join('\n')}</div>`)
  s.push(`<div style="float: left; width: ${100 - SIDEBAR_WIDTH_PCT}%; box-sizing: border-box; padding: 2rem 2rem 2rem 1.6rem;">${main.join('\n')}</div>`)
  s.push(`<div style="clear: both;"></div>`)

  const bodyFragment = s.join('\n')

  // The page canvas background (painted on every printed page, regardless of where
  // floated columns break) is a flat left/right split — the sidebar tint doesn't need
  // to survive a real page break, since a continuation page with an empty colored
  // gutter reads the same way most two-column resume templates print.
  const pageBg = `linear-gradient(to right, ${colors.sidebarFrom} 0 ${SIDEBAR_WIDTH_PCT}%, ${colors.bgCard} ${SIDEBAR_WIDTH_PCT}% 100%)`

  return `<!DOCTYPE html>
<html lang="${lang}" style="font-size: 12.5px;">
  <head>
    <meta charset="utf-8" />
    <title>CV_VincentBOUTIN</title>
    <style>
      /* Self-hosted (see FONT_*_DATA_URI above): identical metrics locally and in the
         prod build container, so line-wrapping — and therefore page count — can't
         drift between the two depending on which system UI font happens to be installed. */
      @font-face {
        font-family: 'Selawik';
        src: url(${FONT_REGULAR_DATA_URI}) format('truetype');
        font-weight: 400 500;
        font-style: normal;
        font-display: block;
      }
      @font-face {
        font-family: 'Selawik';
        src: url(${FONT_SEMIBOLD_DATA_URI}) format('truetype');
        font-weight: 600;
        font-style: normal;
        font-display: block;
      }
      @font-face {
        font-family: 'Selawik';
        src: url(${FONT_BOLD_DATA_URI}) format('truetype');
        font-weight: 700;
        font-style: normal;
        font-display: block;
      }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body { font-family: 'Selawik', system-ui, -apple-system, sans-serif; }
      a { text-decoration: none; }
    </style>
  </head>
  <body style="margin: 0; background: ${pageBg}; line-height: 1.5;">
${bodyFragment}
  </body>
</html>`
}
