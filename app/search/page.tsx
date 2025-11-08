import { cache, Suspense } from 'react';
import Navbar from '../../components/Navbar';
import { hasActiveCompanyFilters, readCompanyFilters } from '@/lib/companies/filtersUrl';
import { QUERIES } from '@/lib/server/db/queries';
import { CompaniesSkeleton } from './_components/CompaniesSkeleton';
import { CompaniesResults } from './_components/CompaniesResults';
import { SearchControls } from './_components/SearchControls';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';

export const experimental_ppr = true;

const getTechVerticals = cache(async () => {
  return (await QUERIES.getTechVerticals()) as { id: string; name: string }[];
});

const PATHNAME = '/search';

export default function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const techVerticalsPromise = getTechVerticals();

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

            <Suspense fallback={null}>
              <SearchControls techVerticalsPromise={techVerticalsPromise} />
            </Suspense>
            <Suspense fallback={<CompaniesSkeleton />}>
              <ResultsSection searchParamsPromise={searchParams} />
            </Suspense>
          </div>
        </main>
      </div>
    </>
  );
}

async function ResultsSection({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const usp = await normalizeSearchParams(searchParamsPromise);
  const filters = readCompanyFilters(usp);
  const hasFilters = hasActiveCompanyFilters(filters);

  if (!hasFilters) {
    return <NoFiltersCallout />;
  }

  const pageSizeParam = usp.get('limit');
  const pageParam = usp.get('page');
  const pageSize = pageSizeParam ? Math.min(Math.max(parseInt(pageSizeParam, 10) || 20, 1), 100) : 20;
  const page = pageParam ? Math.max(parseInt(pageParam, 10) || 1, 1) : 1;

  const paramsSnapshot = usp.toString();
  const buildHref = (sp: URLSearchParams) => {
    const qs = sp.toString();
    return qs ? `${PATHNAME}?${qs}` : PATHNAME;
  };

  const prevHref = (() => {
    const sp = new URLSearchParams(paramsSnapshot);
    if (page <= 2) {
      sp.delete('page');
    } else {
      sp.set('page', String(page - 1));
    }
    return buildHref(sp);
  })();

  const nextHref = (() => {
    const sp = new URLSearchParams(paramsSnapshot);
    sp.set('page', String(page + 1));
    return buildHref(sp);
  })();

  return (
    <CompaniesResults
      filters={filters}
      page={page}
      pageSize={pageSize}
      prevHref={prevHref}
      nextHref={nextHref}
      clearHref={PATHNAME}
      hasActiveFilters={hasFilters}
    />
  );
}

function NoFiltersCallout() {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyTitle>Add filters to explore companies</EmptyTitle>
        <EmptyDescription>Use the search box and filters above to narrow down the dataset before fetching results.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <p className="text-sm text-muted-foreground">
          Try selecting a tech vertical, sector, stage, or keyword to see matching companies.
        </p>
      </EmptyContent>
    </Empty>
  );
}

async function normalizeSearchParams(
  searchParams: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>,
) {
  const resolved = await searchParams;
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(resolved)) {
    if (typeof value === 'string') {
      usp.set(key, value);
    } else if (Array.isArray(value)) {
      const first = value.at(0);
      if (first) usp.set(key, first);
    }
  }
  return usp;
}
