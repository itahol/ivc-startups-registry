import Navbar from '@/components/Navbar';
import { Metadata } from 'next';
import { HeroClient } from '@/app/_components/HeroClient';
import { StatsSection } from '@/app/_components/StatsSection';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Israeli High‑Tech Data Platform',
  description: 'Tap into the digital ecosystem of Israeli high‑tech: companies, investment firms, people, and funds.',
};

function StatsLoading() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 md:px-8 pb-20" aria-labelledby="stats-heading">
      <Skeleton className="h-8 w-64 mb-6" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4" role="list">
        {[...Array(4)].map((_, index) => (
          <div key={index} role="listitem" className="group relative overflow-hidden rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="mt-3">
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroClient />
        <Suspense fallback={<StatsLoading />}>
          <StatsSection />
        </Suspense>
      </main>
    </>
  );
}
