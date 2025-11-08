'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { CompanyFilters } from '@/lib/companies/filtersUrl';
import { readCompanyFilters, encodeCompanyFilters, hasActiveCompanyFilters } from '@/lib/companies/filtersUrl';
import { use } from 'react';
import { SearchControls } from './SearchControls';

interface CompaniesClientProps {
  initialFilters: CompanyFilters;
  techVerticalsPromise: Promise<{ id: string; name: string }[]>;
  children?: React.ReactNode;
}

export function CompaniesClient({
  techVerticalsPromise,
  children,
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

  const hasActiveFilters = hasActiveCompanyFilters(currentFilters);

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
      <SearchControls
        keywordInput={keywordInput}
        onKeywordChange={setKeywordInput}
        onKeywordSubmit={handleKeywordSubmit}
        currentFilters={currentFilters}
        techVerticals={techVerticals}
        hasActiveFilters={hasActiveFilters}
        onClearAll={clearAll}
        onApply={onApply}
      />

      {children}
    </div>
  );
}
