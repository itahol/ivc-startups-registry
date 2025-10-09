import { cache, Suspense } from 'react';
import Navbar from '../../components/Navbar';
import { readCompanyFilters } from '@/lib/companies/filtersUrl';
import { CompaniesSkeleton } from '@/components/companies/CompaniesSkeleton';
import { CompaniesClient } from '@/components/companies/CompaniesClient';
import { QUERIES } from '../../lib/server/db/queries';

const getTechVerticals = cache(async () => {
  return (await QUERIES.getTechVerticals()) as { id: string; name: string }[];
});

/* -------------------------------------------------------------------------- */
/*                     Server Component Wrapper (RSC Page)                    */
/* -------------------------------------------------------------------------- */

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const resolved: Record<string, string | string[] | undefined> = await Promise.resolve(
    searchParams as
      | Record<string, string | string[] | undefined>
      | Promise<Record<string, string | string[] | undefined>>,
  );
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(resolved)) {
    if (typeof value === 'string') usp.set(key, value);
    else if (Array.isArray(value) && value.length) usp.set(key, value[0]!);
  }
  const initialFilters = readCompanyFilters(usp);
  const techVerticals = await getTechVerticals();

  const pageSizeParam = usp.get('limit');
  const pageParam = usp.get('page');
  const pageSize = pageSizeParam ? Math.min(Math.max(parseInt(pageSizeParam, 10) || 20, 1), 100) : 20;
  const page = pageParam ? Math.max(parseInt(pageParam, 10) || 1, 1) : 1;
  const offset = (page - 1) * pageSize;

  const [companies, countResult] = await Promise.all([
    QUERIES.getCompanies({
      limit: pageSize,
      offset,
      techVerticalsFilter: initialFilters.techVerticals,
      sectors: initialFilters.sectors,
      stages: initialFilters.stages,
      yearEstablished: initialFilters.yearEstablished,
    }),
    QUERIES.getCompaniesCount({
      techVerticalsFilter: initialFilters.techVerticals,
      sectors: initialFilters.sectors,
      stages: initialFilters.stages,
      yearEstablished: initialFilters.yearEstablished,
    }),
  ]);
  const total = countResult?.count ?? 0;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  // const companies = useQuery(api.companies.list, {
  //   techVerticals: currentFilters.techVerticals,
  //   sectors: currentFilters.sectors,
  //   stages: currentFilters.stages,
  //   yearEstablished: currentFilters.yearEstablished,
  //   limit: 20,
  // });
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

            <Suspense fallback={<CompaniesSkeleton />}>
              {/* Client side filters + grid */}
              <CompaniesClient
                initialFilters={initialFilters}
                companies={companies}
                techVerticals={techVerticals}
                page={page}
                pageSize={pageSize}
                totalPages={totalPages}
                total={total}
              />
            </Suspense>
          </div>
        </main>
      </div>
    </>
  );
}
