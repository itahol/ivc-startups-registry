# Agent Development Guide

## Commands

- **Dev**: `pnpm dev` (runs frontend + backend in parallel)
- **Build**: `pnpm build`
- **Lint**: `pnpm lint`
- **Format**: `pnpm format` (Prettier)
- **Type check**: `tsc --noEmit` (run in root for Next.js, in convex/ for backend)

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

## Key Patterns

- **Convex functions**: Define in `convex/myFunctions.ts`, use `query`/`mutation`
- **Schema**: Optional but recommended in `convex/schema.ts` for TypeScript types
- **Auth hooks**: `useAuth()` (client), `withAuth()` (server components)
- **Error handling**: Use standard try/catch, Convex handles backend errors
- **No test framework**: Project has no tests configured
