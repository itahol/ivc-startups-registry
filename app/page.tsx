import Navbar from '@/components/Navbar';
import { preloadQuery, preloadedQueryResult } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { Metadata } from 'next';
import { Building2, Landmark, Users, Banknote } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Israeli High‑Tech Data Platform',
  description: 'Tap into the digital ecosystem of Israeli high‑tech: companies, investment firms, people, and funds.',
};

// Server Component Landing Page
export default async function Home() {
  // Preload all counts in parallel (SSR)
  const companiesP = preloadQuery(api.stats.companiesCount, {});
  const investmentFirmsP = preloadQuery(api.stats.investmentFirmsCount, {});
  const peopleP = preloadQuery(api.stats.peopleCount, {});
  const fundsP = preloadQuery(api.stats.fundsCount, {});

  const [companiesQ, investmentFirmsQ, peopleQ, fundsQ] = await Promise.all([
    companiesP,
    investmentFirmsP,
    peopleP,
    fundsP,
  ]);

  const companies = preloadedQueryResult(companiesQ) ?? 0;
  const investmentFirms = preloadedQueryResult(investmentFirmsQ) ?? 0;
  const people = preloadedQueryResult(peopleQ) ?? 0;
  const funds = preloadedQueryResult(fundsQ) ?? 0;

  const stats: { label: string; value: number; icon: React.ReactNode; testId: string }[] = [
    { label: 'Companies', value: companies, icon: <Building2 className="h-5 w-5" aria-hidden />, testId: 'companies' },
    {
      label: 'Investment Firms',
      value: investmentFirms,
      icon: <Landmark className="h-5 w-5" aria-hidden />,
      testId: 'investment-firms',
    },
    { label: 'People', value: people, icon: <Users className="h-5 w-5" aria-hidden />, testId: 'people' },
    { label: 'Funds', value: funds, icon: <Banknote className="h-5 w-5" aria-hidden />, testId: 'funds' },
  ];

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <section className="mx-auto w-full max-w-7xl px-4 md:px-8 pb-20" aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="text-xl font-semibold tracking-tight mb-6">
            Currently Available Profiles
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4" role="list">
            {stats.map((s) => (
              <div
                key={s.label}
                role="listitem"
                data-testid={`stat-${s.testId}`}
                className="group relative overflow-hidden rounded-lg border p-4 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {s.icon}
                    <span className="text-xs font-medium uppercase tracking-wide">{s.label}</span>
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span
                    data-testid="stat-number"
                    className="text-3xl font-semibold tabular-nums"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                    aria-label={`${s.value} ${s.label}`}
                  >
                    {s.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function Hero() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 md:px-8 py-16 md:py-24" aria-labelledby="hero-heading">
      <div className="flex flex-col items-start gap-6 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            NEW
          </span>
          <span className="text-xs font-medium text-muted-foreground">AI-based Search (Beta)</span>
        </div>
        <h1 id="hero-heading" className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
          Tap into the Digital Ecosystem of the Israeli High‑Tech
        </h1>
        <p className="text-lg text-muted-foreground">Data. Insights. Reports.</p>
        <form className="w-full" role="search" aria-label="Site search" action="/companies" method="get" noValidate>
          <label htmlFor="hero-search" className="sr-only">
            Search companies
          </label>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <input
              id="hero-search"
              name="q"
              type="text"
              placeholder="Find Israeli Tech Companies with Free Text"
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              autoComplete="off"
              spellCheck={false}
            />
            <div className="flex gap-2">
              <Link
                href="/companies"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Try it Now
              </Link>
              <Link
                href="/companies"
                className="inline-flex items-center justify-center rounded-md border px-5 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Advanced Search
              </Link>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
