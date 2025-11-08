import Link from 'next/link';
import { use } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { CompanyCard } from '@/components/CompanyCard';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { CompanyDetails } from '@/lib/model';

interface CompaniesResultsProps {
  companiesPromise: Promise<CompanyDetails[]>;
  companiesCountPromise: Promise<number>;
  page: number;
  pageSize: number;
  prevHref: string;
  nextHref: string;
  clearHref: string;
  hasActiveFilters: boolean;
}

export function CompaniesResults({
  companiesPromise,
  companiesCountPromise,
  page,
  pageSize,
  prevHref,
  nextHref,
  clearHref,
  hasActiveFilters,
}: CompaniesResultsProps) {
  const companies = use(companiesPromise);
  const total = use(companiesCountPromise);
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const isFirstPage = page === 1;
  const isLastPage = page === totalPages;

  return (
    <>
      <div
        className={`
          grid grid-cols-1 gap-8
          sm:grid-cols-2
          lg:grid-cols-3
          2xl:grid-cols-4
        `}
      >
        {companies.map((company) => (
          <CompanyCard key={company.companyID} company={company} />
        ))}
      </div>
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
                <Button size="sm" variant="outline" asChild>
                  <Link href={clearHref} scroll={false} aria-label="Clear filters to show all products">
                    Clear filters
                  </Link>
                </Button>
              </div>
            ) : null}
          </EmptyContent>
        </Empty>
      )}
      <div className="mt-12 flex flex-col items-center gap-3">
        <Pagination>
          <PaginationContent className="gap-3">
            <PaginationItem>
              {isFirstPage ? (
                <PaginationLink
                  className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  aria-label="Go to previous page"
                  aria-disabled={true}
                  tabIndex={-1}
                >
                  <ChevronLeftIcon size={16} aria-hidden="true" />
                </PaginationLink>
              ) : (
                <PaginationLink
                  asChild
                  className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  aria-label="Go to previous page"
                >
                  <Link href={prevHref} scroll={false}>
                    <ChevronLeftIcon size={16} aria-hidden="true" />
                  </Link>
                </PaginationLink>
              )}
            </PaginationItem>
            <PaginationItem>
              <p className="text-muted-foreground text-sm" aria-live="polite">
                Page <span className="text-foreground">{page}</span> of <span className="text-foreground">{totalPages}</span>
              </p>
            </PaginationItem>
            <PaginationItem>
              {isLastPage ? (
                <PaginationLink
                  className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  aria-label="Go to next page"
                  aria-disabled={true}
                  tabIndex={-1}
                >
                  <ChevronRightIcon size={16} aria-hidden="true" />
                </PaginationLink>
              ) : (
                <PaginationLink
                  asChild
                  className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  aria-label="Go to next page"
                >
                  <Link href={nextHref} scroll={false}>
                    <ChevronRightIcon size={16} aria-hidden="true" />
                  </Link>
                </PaginationLink>
              )}
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <div className="text-xs text-muted-foreground">
          {total.toLocaleString()} results · Showing {(total === 0 ? 0 : (page - 1) * pageSize + 1).toLocaleString()}–
          {Math.min(page * pageSize, total).toLocaleString()}
        </div>
      </div>
    </>
  );
}
