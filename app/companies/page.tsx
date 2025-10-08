'use client';

import { useQuery } from 'convex/react';
import * as React from 'react';
import { api } from '../../convex/_generated/api';
import { Card } from '@/components/ui/card'; // For skeleton loading placeholder only
import { CompanyCard } from '@/components/CompanyCard';
import { Button } from '@/components/ui/button';
// Removed quick vertical toggle group
// import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Skeleton } from '@/components/ui/skeleton'; // still used for loading cards, not for pills
import Navbar from '../../components/Navbar';
import { FiltersDrawer, type CompanyFilters } from '@/components/companies/FiltersDrawer';

/* -------------------------------------------------------------------------- */
/*                            Helpers / utilities                             */
/* -------------------------------------------------------------------------- */

// slugify helper removed (unused after quick vertical pills removal)

// Removed quick verticals limit and predefined vertical pill filtering

export default function CompaniesPage() {
  const [filters, setFilters] = React.useState<CompanyFilters>({});

  const companies = useQuery(api.companies.list, {
    techVerticals: filters.techVerticals,
    sectors: filters.sectors,
    stages: filters.stages, // ids of companyStages
    yearEstablished: filters.yearEstablished,
    limit: 20,
  });
  const companiesLoading = companies === undefined;

  /* Quick vertical toggles removed - vertical selection now only via FiltersDrawer */

  const clearAll = React.useCallback(() => {
    setFilters({});
  }, []);

  const hasActiveFilters = !!(filters.techVerticals || filters.sectors || filters.stages || filters.yearEstablished);

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
                <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                  Browse our latest products and find something you&apos;ll love.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 min-h-8">
                {/* Filters drawer trigger */}
                <FiltersDrawer value={filters} onApply={setFilters} />

                {/* Quick vertical pills removed */}
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
                <p className="text-muted-foreground">No products found for these filters.</p>
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
