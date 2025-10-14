'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { CompanyFilters } from '@/lib/companies/filtersUrl';
import { readCompanyFilters, encodeCompanyFilters, hasActiveCompanyFilters } from '@/lib/companies/filtersUrl';
import { FiltersDrawer } from '@/app/companies/_components/FiltersDrawer';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { CompanyCard } from '@/components/CompanyCard';
import { use } from 'react';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import { CompanyDetails } from '@/lib/model';
import SearchInput from '@/components/SearchInput';

interface CompaniesClientProps {
  initialFilters: CompanyFilters;
  techVerticalsPromise: Promise<{ id: string; name: string }[]>;
  companiesPromise: Promise<CompanyDetails[]>;
  companiesCountPromise: Promise<number>;
  page: number;
  pageSize: number;
}

export function CompaniesClient({
  companiesPromise,
  companiesCountPromise,
  techVerticalsPromise,
  page,
  pageSize,
}: CompaniesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Derive filters from URL each render (URL = source of truth)
  const currentFilters = React.useMemo(() => readCompanyFilters(searchParams), [searchParams]);

  // Local state for keyword input (controlled component)
  const [keywordInput, setKeywordInput] = React.useState(currentFilters.keyword ?? '');

  // Sync keyword input with URL changes
  React.useEffect(() => {
    setKeywordInput(currentFilters.keyword ?? '');
  }, [currentFilters.keyword]);

  const techVerticals = use(techVerticalsPromise);
  const companies = use(companiesPromise);
  const total = use(companiesCountPromise);
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  const hasActiveFilters = hasActiveCompanyFilters(currentFilters);

  const prevHref = React.useMemo(() => {
    const sp = new URLSearchParams(searchParams.toString());
    if (page <= 2) {
      sp.delete('page');
    } else {
      sp.set('page', String(page - 1));
    }
    const qs = sp.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [page, pathname, searchParams]);

  const nextHref = React.useMemo(() => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('page', String(page + 1));
    const qs = sp.toString();
    return `${pathname}?${qs}`;
  }, [page, pathname, searchParams]);

  const onApply = React.useCallback(
    (next: CompanyFilters) => {
      const nextSp = encodeCompanyFilters(next);
      const currentQuery = searchParams.toString();
      if (nextSp.toString() === currentQuery) return; // no change

      // Reset pagination when filters change
      nextSp.delete('page');

      router.push(nextSp.toString() ? `${pathname}?${nextSp.toString()}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const clearAll = React.useCallback(() => {
    onApply({});
  }, [onApply]);

  const handleKeywordSubmit = React.useCallback(() => {
    const trimmedKeyword = keywordInput.trim();
    const nextFilters: CompanyFilters = {
      ...currentFilters,
      keyword: trimmedKeyword || undefined,
    };
    onApply(nextFilters);
  }, [keywordInput, currentFilters, onApply]);

  return (
    <div>
      {/* Search Section - Centered and Prominent */}
      <div className="mb-8 flex flex-col items-center gap-6">
        {/* Search Bar - Larger and Centered */}
        <div className="w-full max-w-2xl">
          <SearchInput
            value={keywordInput}
            onChange={setKeywordInput}
            onSubmit={handleKeywordSubmit}
            label="Search companies"
            placeholder="Search by keyword..."
            hideLabel={true}
            size="large"
          />
        </div>

        {/* Filters Row - Below Search */}
        <div className="flex flex-wrap items-center justify-center gap-2 min-h-8">
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
        {companies.map((company) => {
          return <CompanyCard key={company.companyID} company={company} />;
        })}
      </div>

      {/* Empty state */}
      {companies.length === 0 && (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyTitle>No companies found for these filters.</EmptyTitle>
            {hasActiveFilters ? (
              <EmptyDescription>Try adjusting your filters to find what you&apos;re looking for.</EmptyDescription>
            ) : null}
          </EmptyHeader>
          <EmptyContent>
            {hasActiveFilters ? (
              <div className="mt-4">
                <Button size="sm" variant="outline" onClick={clearAll} aria-label="Clear filters to show all products">
                  Clear filters
                </Button>
              </div>
            ) : null}
          </EmptyContent>
        </Empty>
      )}

      {/* Pagination */}
      <div className="mt-12 flex flex-col items-center gap-3">
        <Pagination>
          <PaginationContent className="gap-3">
            <PaginationItem>
              <PaginationLink
                className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                href={page === 1 ? undefined : prevHref}
                aria-label="Go to previous page"
                aria-disabled={page === 1 ? true : undefined}
                role={page === 1 ? 'link' : undefined}
                onClick={(e) => {
                  if (page === 1) return;
                  e.preventDefault();
                  router.push(prevHref, { scroll: false });
                }}
              >
                <ChevronLeftIcon size={16} aria-hidden="true" />
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <p className="text-muted-foreground text-sm" aria-live="polite">
                Page <span className="text-foreground">{page}</span> of{' '}
                <span className="text-foreground">{totalPages}</span>
              </p>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                href={page === totalPages ? undefined : nextHref}
                aria-label="Go to next page"
                aria-disabled={page === totalPages ? true : undefined}
                role={page === totalPages ? 'link' : undefined}
                onClick={(e) => {
                  if (page === totalPages) return;
                  e.preventDefault();
                  router.push(nextHref, { scroll: false });
                }}
              >
                <ChevronRightIcon size={16} aria-hidden="true" />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <div className="text-xs text-muted-foreground">
          {total.toLocaleString()} results · Showing {(total === 0 ? 0 : (page - 1) * pageSize + 1).toLocaleString()}–
          {Math.min(page * pageSize, total).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
