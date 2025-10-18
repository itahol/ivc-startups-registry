import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import { readCompanyFilters } from '@/lib/companies/filtersUrl';
import { CompaniesInstantSearch } from './_components/CompaniesInstantSearch';
import { CompaniesSkeleton } from './_components/CompaniesSkeleton';

/* -------------------------------------------------------------------------- */
/*                     Server Component Wrapper (RSC Page)                    */
/* -------------------------------------------------------------------------- */

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(resolved)) {
    if (typeof value === 'string') usp.set(key, value);
    else if (Array.isArray(value)) {
      const v = value.at(0);
      if (v) {
        usp.set(key, v);
      }
    }
  }
  const initialFilters = readCompanyFilters(usp);

  const pageSizeParam = usp.get('limit');
  const pageSize = pageSizeParam ? Math.min(Math.max(parseInt(pageSizeParam, 10) || 20, 1), 100) : 20;

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 py-10">
          <div
            className={`
            w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 mx-auto
          `}
          >
            {/* Heading (SSR) */}
            <div
              className={`
              mb-8 flex flex-col gap-4
              md:flex-row md:items-center md:justify-between
            `}
            >
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
                <p className="mt-1 text-lg text-muted-foreground">Discover and explore the companies in our dataset.</p>
              </div>
            </div>
            <Suspense key={usp.toString()} fallback={<CompaniesSkeleton />}>
              {/* Client side InstantSearch */}
              <CompaniesInstantSearch initialFilters={initialFilters} pageSize={pageSize} />
            </Suspense>
          </div>
        </main>
      </div>
    </>
  );
}
