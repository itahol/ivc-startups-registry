'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { CompanyFilters } from '@/lib/companies/filtersUrl';
import { readCompanyFilters, encodeCompanyFilters, hasActiveCompanyFilters } from '@/lib/companies/filtersUrl';
import { FiltersDrawer } from '@/components/companies/FiltersDrawer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CompanyCard } from '@/components/CompanyCard';
import { Company } from '../../lib/model/profiiles';

interface CompaniesClientProps {
  initialFilters: CompanyFilters; // currently not strictly needed except for future preloading
  techVerticals: { id: string; name: string }[];
  companies: Company[];
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
}

export function CompaniesClient({ companies, techVerticals, page, pageSize, totalPages, total }: CompaniesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Derive filters from URL each render (URL = source of truth)
  const currentFilters = React.useMemo(() => readCompanyFilters(searchParams), [searchParams]);

  const companiesLoading = companies === undefined;

  const hasActiveFilters = hasActiveCompanyFilters(currentFilters);

  const onApply = React.useCallback(
    (next: CompanyFilters) => {
      const nextSp = encodeCompanyFilters(next).toString();
      const currentQuery = searchParams.toString();
      if (nextSp === currentQuery) return; // no change
      router.push(nextSp ? `${pathname}?${nextSp}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const clearAll = React.useCallback(() => {
    onApply({});
  }, [onApply]);

  return (
    <div>
      {/* Filters Row */}
      <div
        className={`
          mb-8 flex flex-col gap-4
          md:flex-row md:items-center md:justify-between
        `}
      >
        <div className="flex flex-wrap items-center gap-2 min-h-8">
          <FiltersDrawer value={currentFilters} onApply={onApply} techVerticals={techVerticals} />
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

      {/* Grid */}
      <div
        className={`
          grid grid-cols-1 gap-8
          sm:grid-cols-2
          lg:grid-cols-3
          2xl:grid-cols-4
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
          : companies?.map((company) => <CompanyCard key={company.Company_ID} company={company} />)}
      </div>

      {/* Empty state */}
      {!companiesLoading && (companies?.length ?? 0) === 0 && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">No companies found for these filters.</p>
          {hasActiveFilters ? (
            <div className="mt-4">
              <Button size="sm" variant="outline" onClick={clearAll} aria-label="Clear filters to show all products">
                Clear filters
              </Button>
            </div>
          ) : null}
        </div>
      )}

      {/* Pagination */}
      <nav aria-label="Pagination" className="mt-12 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => {
              const sp = new URLSearchParams(searchParams.toString());
              if (page <= 2) sp.delete('page');
              else sp.set('page', String(page - 1));
              router.push(`${pathname}?${sp.toString()}`, { scroll: false });
            }}
          >
            Previous
          </Button>
          <span className="text-sm tabular-nums">
            Page {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => {
              const sp = new URLSearchParams(searchParams.toString());
              sp.set('page', String(page + 1));
              router.push(`${pathname}?${sp.toString()}`, { scroll: false });
            }}
          >
            Next
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          {total.toLocaleString()} results · Showing {(total === 0 ? 0 : (page - 1) * pageSize + 1).toLocaleString()}–
          {Math.min(page * pageSize, total).toLocaleString()}
        </div>
      </nav>
    </div>
  );
}
