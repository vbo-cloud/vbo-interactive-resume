# Vincent Boutin — Interactive Resume

Personal interactive resume/CV, deployed at **[cv.vincentboutin.dev](https://cv.vincentboutin.dev/)**.

Built with React, TypeScript, Tailwind CSS, and Framer Motion.

> This project is a personal fork of [Clément Bouly's Interactive Resume Template](https://github.com/clementbouly/interactive-resume-template). All credit for the original design and implementation goes to the original author — I am not the author of the underlying template, only of the content and the customizations described below.

## Features

- **Multi-language** — FR/EN via built-in i18n
- **Dark / Light mode** — Auto-detects time of day, with manual toggle
- **Responsive** — Mobile-first, works on all screen sizes
- **Expandable experiences** — Click to expand details (inline on desktop, modal on mobile)
- **Referent section** — Highlights a professional reference with a linked name
- **PDF download** — One PDF per language, generated at build time from the same config
  - Visual hero banner (clickable site preview + CTA) so a recruiter opening the file can jump straight to the interactive version
  - Chronological, print-friendly formatting (dates, links) distinct from the web layout
- **SEO & ATS ready** — Full CV content visible to crawlers at build time (JSON-LD, semantic HTML fallback)
- **3D photo flip** — Click the photo for a fun easter egg

## Tech Stack

- [Vite](https://vite.dev/) — Build tool
- [React 19](https://react.dev/) — UI framework
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Tailwind CSS v4](https://tailwindcss.com/) — Utility-first CSS
- [Framer Motion](https://www.framer.com/motion/) — Animations
- [Puppeteer](https://pptr.dev/) — Headless Chrome, used to generate the downloadable PDFs at build time

## Project Structure

```
├── vite-plugin-resume-seo.ts       # Build-time SEO/noscript injection plugin
├── vite-plugin-resume-validate.ts  # Build-time config sanity checks
├── vite-plugin-assets-detect.ts    # Auto-detects photo/PDF assets in public/
├── scripts/
│   ├── generate-pdfs.ts            # Renders the config to PDF (one per language)
│   └── render-resume-html.ts       # Shared flat HTML renderer (noscript + PDF)
src/
├── data/
│   ├── resume-config.ts            # THE CONFIG FILE — all CV content lives here
│   ├── resume-config.example.ts    # Annotated example
│   ├── types.ts                    # TypeScript types
│   └── presets.ts                  # Color presets
├── components/
│   └── Resume/                     # All resume components
├── lib/
│   ├── i18n/                       # Language system
│   ├── theme/                      # Dark/light mode
│   └── hooks/                      # Custom hooks
└── App.tsx                         # Entry point
```

## Local Development

```bash
npm install
npm run dev       # generates the PDFs, then starts Vite on http://localhost:5173
npm run build     # generates the PDFs, type-checks, then builds dist/
npm run lint
```

All CV content — personal info, experiences, skills, referent, labels — lives in `src/data/resume-config.ts`.

## Development with AI agents

This project includes [Agentation](https://agentation.dev/) — a visual feedback toolbar for AI coding agents. When running in development mode (`npm run dev`), a small toolbar appears at the bottom-right of the page.

It lets you click on any element, select text, or annotate parts of the resume, then copy a structured description to your clipboard — handy context to paste directly into an AI agent's chat.

Agentation is **only active in development** and is automatically stripped from production builds.

## Versioning

Git tags here (`vMAJOR.MINOR.PATCH`) represent finalized **versions of the CV content** — e.g. the exact version sent out for a given job application — not software releases in the traditional sense. See `CLAUDE.md` for the full branching/versioning convention used in this repo.

## Deployment

Pushes to `main` trigger a GitHub Actions workflow (`.github/workflows/deploy.yml`) that lints, builds, and deploys `dist/` to GitHub Pages, served at [cv.vincentboutin.dev](https://cv.vincentboutin.dev/) via the `public/CNAME` custom domain.

## ATS & SEO

**"Is it ATS-compatible?"** — ATS (Applicant Tracking Systems) today primarily parse PDF and DOCX files. This interactive site is designed as a **complement** to the PDF, not a replacement.

The template does everything possible to make the CV readable by bots and crawlers **without JavaScript**:

- **Build-time SEO injection** — A custom Vite plugin reads the config at build time and injects all data directly into the static HTML. Crawlers see the full CV, not an empty `<div id="root">`
- **JSON-LD structured data** — Name, job title, skills, and links are embedded as [schema.org/Person](https://schema.org/Person) metadata in the `<head>`
- **`<noscript>` semantic HTML** — The complete CV (contact, skills, experiences, education, projects, hobbies) is rendered as clean HTML inside `<noscript>`, so non-JS visitors and bots see everything
- **Static meta tags** — `<title>` and `<meta description>` are set from the config at build time
- **Shareable URL** — `?lang=en` / `?lang=fr` for the right language
- **PDF download** — Per-language PDF files for traditional ATS submissions

## License

MIT — based on the original [Interactive Resume Template](https://github.com/clementbouly/interactive-resume-template) by Clément Bouly.
