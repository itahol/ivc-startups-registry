- MSSQL as a DB, using Kysely as a query builder
- [React](https://react.dev/) as your frontend (web page interactivity)
- [Next.js](https://nextjs.org/) for optimized web hosting and page routing
- [Tailwind](https://tailwindcss.com/) for building great looking accessible UI
- [WorkOS AuthKit](https://authkit.com/) for authentication

## Get started

1. Clone this repository and install dependencies:

   ```bash
   npm install
   ```

2. Set up your environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

   This starts both the Next.js frontend and Convex backend in parallel

4. Open [http://localhost:3000](http://localhost:3000) to see your app

## WorkOS AuthKit Setup

This app uses WorkOS AuthKit for authentication. Key features:

- **Redirect-based authentication**: Users are redirected to WorkOS for sign-in/sign-up
- **Session management**: Automatic token refresh and session handling
- **Middleware protection**: Routes are protected using Next.js middleware
- **Client and server hooks**: `useAuth()` for client components, `withAuth()` for server components
