/**
 * Splits a task line written as "Label : rest" (or "Label: rest" in English) so the
 * label can be shown in bold. Lines without that shape come back unchanged (no label).
 * Shared by the site (ExperienceDetails.tsx) and the PDF (render-resume-pdf.ts).
 */
export function splitTaskLabel(text: string): { label?: string; rest: string } {
  const match = /^(.{1,60}?\s?:)\s+([\s\S]*)$/.exec(text)
  return match ? { label: match[1], rest: match[2] } : { rest: text }
}
