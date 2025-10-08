'use client';

import { useQuery } from 'convex/react';
import * as React from 'react';
import { api } from '../../convex/_generated/api';
import { Card } from '@/components/ui/card';
import { CompanyCard } from '@/components/CompanyCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '../../components/Navbar';
import { FiltersDrawer } from '@/components/companies/FiltersDrawer';
import type { CompanyFilters } from '@/lib/companies/filtersUrl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { encodeCompanyFilters, readCompanyFilters, hasActiveCompanyFilters } from '@/lib/companies/filtersUrl';

/* -------------------------------------------------------------------------- */
/*                               Page Component                              */
/* -------------------------------------------------------------------------- */

export default function CompaniesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = React.useState<CompanyFilters>({});
  const filtersRef = React.useRef(filters);
  filtersRef.current = filters;

  // Keep filters in sync when user navigates with back/forward or manual edits.
  const parsedFromUrl = React.useMemo(() => readCompanyFilters(searchParams), [searchParams]);
  React.useEffect(() => {
    // Compare canonical serialized forms to avoid object diff noise.
    const currentSerialized = encodeCompanyFilters(filtersRef.current).toString();
    const parsedSerialized = encodeCompanyFilters(parsedFromUrl).toString();
    if (currentSerialized !== parsedSerialized) {
      setFilters(parsedFromUrl);
    }
  }, [parsedFromUrl]);

  const updateUrl = React.useCallback(
    (next: CompanyFilters) => {
      const query = encodeCompanyFilters(next).toString();
      const currentQuery = searchParams.toString();
      if (query === currentQuery) return; // No change
      const url = query ? `${pathname}?${query}` : pathname;
      router.push(url, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleApply = React.useCallback(
    (next: CompanyFilters) => {
      setFilters(next);
      updateUrl(next);
    },
    [updateUrl],
  );

  const clearAll = React.useCallback(() => {
    handleApply({});
  }, [handleApply]);

  const companies = useQuery(api.companies.list, {
    techVerticals: filters.techVerticals,
    sectors: filters.sectors,
    stages: filters.stages,
    yearEstablished: filters.yearEstablished,
    limit: 20,
  });
  const companiesLoading = companies === undefined;

  const hasActiveFilters = hasActiveCompanyFilters(filters);

  /* ----------------------------- Render --------------------------------- */
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 py-10">
          <div
            className={`
            container px-4
            md:px-6
          `}
          >
            {/* Heading & filters */}
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

              <div className="flex flex-wrap items-center gap-2 min-h-8">
                {/* Filters drawer trigger */}
                <FiltersDrawer value={filters} onApply={handleApply} />

                {/* Clear button */}
                {hasActiveFilters ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    aria-label="Clear all selected filters"
                    className="rounded-full text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </Button>
                ) : null}
              </div>
            </div>

            {/* Product grid */}
            <div
              className={`
              grid grid-cols-1 gap-6
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-3
            `}
            >
              {companiesLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-12" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    </Card>
                  ))
                : companies?.map((company) => <CompanyCard key={company._id} company={company} />)}
            </div>

            {/* Empty state */}
            {!companiesLoading && (companies?.length ?? 0) === 0 && (
              <div className="mt-8 text-center">
                <p className="text-muted-foreground">No companies found for these filters.</p>
                {hasActiveFilters ? (
                  <div className="mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearAll}
                      aria-label="Clear filters to show all products"
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : null}
              </div>
            )}

            {/* Pagination placeholder */}
            <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
              <Button disabled variant="outline">
                Previous
              </Button>
              <Button aria-current="page" variant="default">
                1
              </Button>
              <Button disabled variant="outline">
                Next
              </Button>
            </nav>
          </div>
        </main>
      </div>
    </>
  );
}
