'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import SearchInput from '@/components/SearchInput';
import { Button } from '@/components/ui/button';
import {
  encodeCompanyFilters,
  hasActiveCompanyFilters,
  readCompanyFilters,
  type CompanyFilters,
} from '@/lib/companies/filtersUrl';
import { FiltersDrawer } from './FiltersDrawer';

interface SearchControlsProps {
  techVerticalsPromise: Promise<{ id: string; name: string }[]>;
}

export function SearchControls({ techVerticalsPromise }: SearchControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentFilters = React.useMemo(() => readCompanyFilters(searchParams), [searchParams]);
  const currentQuery = searchParams.toString();
  const [keywordInput, setKeywordInput] = React.useState(currentFilters.keyword ?? '');

  React.useEffect(() => {
    setKeywordInput(currentFilters.keyword ?? '');
  }, [currentFilters.keyword]);

  const onApply = React.useCallback(
    (next: CompanyFilters) => {
      const nextSp = encodeCompanyFilters(next);
      nextSp.delete('page');
      const qs = nextSp.toString();
      if (qs === currentQuery) return;
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [currentQuery, pathname, router],
  );

  const clearAll = React.useCallback(() => onApply({}), [onApply]);

  const handleKeywordSubmit = React.useCallback(() => {
    const trimmedKeyword = keywordInput.trim();
    const nextFilters: CompanyFilters = {
      ...currentFilters,
      keyword: trimmedKeyword || undefined,
    };
    onApply(nextFilters);
  }, [keywordInput, currentFilters, onApply]);

  const hasActiveFilters = hasActiveCompanyFilters(currentFilters);

  return (
    <div className="mb-8 flex flex-col items-center gap-6">
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

      <div className="flex flex-wrap items-center justify-center gap-2 min-h-8">
        <FiltersDrawer value={currentFilters} onApply={onApply} techVerticalsPromise={techVerticalsPromise} />
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
  );
}
