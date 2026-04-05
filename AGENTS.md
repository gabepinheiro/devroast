# Agents

## About

DevRoast is a code roasting app where users paste code snippets and receive brutally honest (or sarcastic) reviews with a score from 0 to 10. Features a "shame leaderboard" ranking the worst code submissions.

## Stack

Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript. Formatter/linter: Biome. Package manager: pnpm.

## Project Structure

- `src/app/` — Pages and layouts (App Router)
- `src/components/ui/` — Reusable UI primitives (Button, Toggle, Badge, Card, etc.)
- `src/components/` — Page-level composition components (Navbar, CodeEditor, etc.)
- `src/app/globals.css` — All design tokens under `@theme`

## Coding Rules

- **No arbitrary Tailwind values.** Never use bracket syntax like `text-[13px]`, `w-[780px]`, or `text-[#A0A0A0]`. Always define design tokens in `src/app/globals.css` under `@theme` and reference them via canonical Tailwind utilities (e.g., `text-2xs`, `max-w-editor`, `text-text-code`). Tailwind v4 namespaces: colors use `--color-*`, font sizes use `--text-*`, max-widths use `--max-width-*`.
- **Component variants** use `tailwind-variants` (`tv`). Headless primitives come from `@base-ui/react`.
- **Dark theme only.** All design tokens assume a dark background (`#0a0a0a`).
- **Monospace-first.** Primary font is JetBrains Mono (`font-mono`). IBM Plex Mono (`font-plex`) is used for secondary/hint text.
- **Navbar** lives in the root layout (`layout.tsx`) and is shared across all pages. Page content is wrapped in a `max-w-page` centered container.
