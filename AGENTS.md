# Agent Development Guide

## Commands

- **Build**: `pnpm build`
- **Lint**: `pnpm lint`
- **Format**: `pnpm format` (Prettier)
- **Type check**: `tsc --noEmit` (run in root for Next.js, in convex/ for backend)
- NEVER run the dev server, assume it is already running. If you suspect it's not, ask the user.

## Code Style

- **Prettier**: Single quotes, trailing commas, 120 char width, semicolons
- **ESLint**: Next.js + TypeScript rules (extends `next/core-web-vitals`, `next/typescript`)
- **Imports**: Use `@/*` path alias for local imports
- **Types**: Strict TypeScript enabled, no implicit any

## Architecture

- **Frontend**: Next.js 15 with App Router, React 19, Tailwind CSS 4
- **Backend**: Convex (realtime database + server functions)
- **Auth**: WorkOS AuthKit with middleware protection
- **Protected routes**: All except `/`, `/sign-in`, `/sign-up`
