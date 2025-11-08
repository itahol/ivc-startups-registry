'use client';

import * as React from 'react';
import type { CompanyFilters } from '@/lib/companies/filtersUrl';
import SearchInput from '@/components/SearchInput';
import { Button } from '@/components/ui/button';
import { FiltersDrawer } from './FiltersDrawer';

interface SearchControlsProps {
  keywordInput: string;
  onKeywordChange: (value: string) => void;
  onKeywordSubmit: () => void;
  currentFilters: CompanyFilters;
  techVerticals: { id: string; name: string }[];
  hasActiveFilters: boolean;
  onClearAll: () => void;
  onApply: (filters: CompanyFilters) => void;
}

export function SearchControls({
  keywordInput,
  onKeywordChange,
  onKeywordSubmit,
  currentFilters,
  techVerticals,
  hasActiveFilters,
  onClearAll,
  onApply,
}: SearchControlsProps) {
  return (
    <div className="mb-8 flex flex-col items-center gap-6">
      <div className="w-full max-w-2xl">
        <SearchInput
          value={keywordInput}
          onChange={onKeywordChange}
          onSubmit={onKeywordSubmit}
          label="Search companies"
          placeholder="Search by keyword..."
          hideLabel={true}
          size="large"
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 min-h-8">
        <FiltersDrawer value={currentFilters} onApply={onApply} techVerticals={techVerticals} />
        {hasActiveFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
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
