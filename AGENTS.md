# Agent Development Guide
## Repo
This project is a monorepo managed with turborepo and pnpm. The main application is a Next.js 15 app located in the `apps/web` directory.

## Commands

- **Build**: `turbo build`
- **Lint**: `turbo lint`
- **Format**: `turbo format`
- **Type check**: `turbo check-types` 
- NEVER run the dev server, assume it is already running. If you suspect it's not, ask the user.
- you can use `--filter` to target specific packages, e.g. `turbo lint --filter=web`

## Code Style

- **Prettier**: Single quotes, trailing commas, 120 char width, semicolons
- **ESLint**: Next.js + TypeScript rules (extends `next/core-web-vitals`, `next/typescript`)
- **Types**: Strict TypeScript enabled, no implicit any

## Architecture

- **Frontend**: Next.js 15 with App Router, React 19, Tailwind CSS 4
- **Backend**: MSSQL database with Kysely query builder
- **Auth**: WorkOS AuthKit with middleware protection
- **Protected routes**: All except `/`, `/sign-in`, `/sign-up`
