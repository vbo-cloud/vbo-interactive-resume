import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolves a public asset path with the Vite base URL.
 * Ensures paths like "/images/photo.jpg" work correctly
 * when the app is deployed under a subpath (e.g. GitHub Pages).
 */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL
  // Avoid double slashes: base already ends with "/", path starts with "/"
  if (path.startsWith('/')) {
    return `${base}${path.slice(1)}`
  }
  return `${base}${path}`
}

/**
 * resume-config.ts stores periods "recent - older" (matching the timeline's
 * top-to-bottom sort — see resume-config.ts's period fields). The card display
 * reads left-to-right chronologically instead, so flip it here at render time
 * rather than changing the stored data (which the PDF renderer reads as-is).
 */
export function reverseDateRange(period: string): string {
  const parts = period.split(' - ')
  return parts.length === 2 ? `${parts[1]} - ${parts[0]}` : period
}
