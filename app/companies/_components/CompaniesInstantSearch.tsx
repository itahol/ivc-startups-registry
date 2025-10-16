'use client';

import * as React from 'react';
import { Configure } from 'react-instantsearch';
import { useHits, usePagination, useInstantSearch, useSearchBox } from 'react-instantsearch';
import {
  BASE_SEARCH_PARAMETERS,
  NATURAL_LANGUAGE_ADDITIONAL_PARAMETERS,
  searchClient,
  setNaturalLanguageSearch,
} from '@/lib/instantsearch/typesenseAdapter';
import { typesenseConfig } from '@/lib/server/typesense';
import type { CompanyFilters } from '@/lib/companies/filtersUrl';
import { CurrentRefinements } from '@/components/instantsearch/current-refinements';
import { RangeFilter } from '@/components/instantsearch/range-menu';
import NumericMenu from '@/components/instantsearch/numeric-menu';
import { StyledRefinementList } from '@/components/instantsearch/refinement-list';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { CompanyCard } from '@/components/CompanyCard';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import SearchInput from '@/components/SearchInput';
import { CompanyDetails } from '../../../lib/model';
import { InstantSearchNext } from 'react-instantsearch-nextjs';
import * as Typesense from 'typesense';
import { companiesSchema } from '@/lib/server/typesense/schema';

const typesenseClient = new Typesense.Client(typesenseConfig);

const INDEX_NAME = 'companies';

interface NaturalLanguageAugmentation {
  filterBy?: string;
  refinedQuery?: string;
  sortBy?: string | string[];
}

const deriveNaturalLanguageFilterClauses = (expression?: string | null): string[] => {
  if (!expression) return [];

  return expression
    .split('&&')
    .map((clause) => clause.replace(/^[()\s]+|[()\s]+$/g, '').trim())
    .filter(Boolean);
};

async function fetchNaturalLanguageAugmentation(query: string): Promise<NaturalLanguageAugmentation | null> {
  const response = await typesenseClient
    .collections<typeof companiesSchema.infer>('companies')
    .documents()
    .search({
      ...BASE_SEARCH_PARAMETERS,
      ...NATURAL_LANGUAGE_ADDITIONAL_PARAMETERS,
      q: query,
      per_page: 0,
    });
  const augmentedParams = response?.parsed_nl_query?.augmented_params;

  if (!augmentedParams) {
    return null;
  }

  return {
    refinedQuery: augmentedParams.q,
    filterBy: augmentedParams.filter_by,
    sortBy: augmentedParams.sort_by,
  };
}

interface CompaniesSearchBoxProps {
  naturalLanguageEnabled: boolean;
  onNaturalLanguageToggle: (enabled: boolean) => void;
  onSubmit: (query: string, context: { naturalLanguageEnabled: boolean }) => void;
  resolvedQuery: string;
}

function CompaniesSearchBox({
  naturalLanguageEnabled,
  onNaturalLanguageToggle,
  onSubmit,
  resolvedQuery,
}: CompaniesSearchBoxProps) {
  const { refine, query } = useSearchBox();
  const [input, setInput] = React.useState(resolvedQuery ?? query ?? '');

  React.useEffect(() => {
    setInput(resolvedQuery ?? '');
  }, [resolvedQuery]);

  const handleChange = (value: string) => {
    setInput(value);
    if (!naturalLanguageEnabled) {
      refine(value.trim() || '');
    }
  };

  const handleSubmit = (value: string) => {
    const trimmed = value.trim();
    setInput(trimmed);
    onSubmit(trimmed, { naturalLanguageEnabled });
  };

  const handleToggle = (checked: boolean) => {
    onNaturalLanguageToggle(checked);
  };

  return (
    <SearchInput
      value={input}
      onChange={handleChange}
      onSubmit={handleSubmit}
      nlEnabled={naturalLanguageEnabled}
      onNLToggle={handleToggle}
      label="Search companies"
      placeholder="Search by keyword..."
      hideLabel={true}
      size="large"
    />
  );
}

function CompaniesHits() {
  const { items } = useHits<CompanyDetails & { techVerticals: string[] | null }>();

  if (items.length === 0) {
    return null;
  }
  return (
    <div
      className={`
        grid grid-cols-1 gap-8
        sm:grid-cols-2
        lg:grid-cols-3
        2xl:grid-cols-4
      `}
    >
      {items.map((company) => (
        <CompanyCard
          key={company.companyID}
          company={{
            ...company,
            techVerticalsNames: Array.isArray(company.techVerticals) ? company.techVerticals.join(',') : null,
          }}
        />
      ))}
    </div>
  );
}

// ---------- Custom Pagination widget replicating existing UI ----------
function CustomPagination() {
  const { currentRefinement: page, refine, nbPages } = usePagination();
  const pageOne = page + 1; // InstantSearch is 0-based
  const totalPages = Math.max(nbPages, 1);

  const prevDisabled = pageOne <= 1;
  const nextDisabled = pageOne >= totalPages;

  const goPrev = () => !prevDisabled && refine(page - 1);
  const goNext = () => !nextDisabled && refine(page + 1);

  return (
    <div className="mt-12 flex flex-col items-center gap-3">
      <Pagination>
        <PaginationContent className="gap-3">
          <PaginationItem>
            <PaginationLink
              className={prevDisabled ? 'pointer-events-none opacity-50' : ''}
              href="#"
              aria-label="Go to previous page"
              onClick={(e) => {
                e.preventDefault();
                goPrev();
              }}
            >
              <ChevronLeftIcon size={16} aria-hidden="true" />
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <p className="text-muted-foreground text-sm" aria-live="polite">
              Page <span className="text-foreground">{pageOne}</span> of{' '}
              <span className="text-foreground">{totalPages}</span>
            </p>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink
              className={nextDisabled ? 'pointer-events-none opacity-50' : ''}
              href="#"
              aria-label="Go to next page"
              onClick={(e) => {
                e.preventDefault();
                goNext();
              }}
            >
              <ChevronRightIcon size={16} aria-hidden="true" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <ResultsSummary />
    </div>
  );
}

// ---------- Results summary ----------
function ResultsSummary() {
  const { results } = useInstantSearch();
  if (!results) return null;
  const { nbHits, hitsPerPage, page } = results;
  const from = nbHits === 0 ? 0 : page * hitsPerPage + 1;
  const to = Math.min((page + 1) * hitsPerPage, nbHits);
  return (
    <div className="text-xs text-muted-foreground">
      {nbHits.toLocaleString()} results · Showing {from.toLocaleString()}–{to.toLocaleString()}
    </div>
  );
}

// ---------- Empty state ----------
function CustomEmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyTitle>No companies found for these filters.</EmptyTitle>
        {hasFilters ? (
          <EmptyDescription>Try adjusting your filters to find what you&apos;re looking for.</EmptyDescription>
        ) : null}
      </EmptyHeader>
      <EmptyContent>
        {hasFilters ? (
          <div className="mt-4">
            <Button size="sm" variant="outline" aria-label="Clear filters to show all products">
              Clear filters
            </Button>
          </div>
        ) : null}
      </EmptyContent>
    </Empty>
  );
}

// ---------- Helper to convert filters to InstantSearch format ----------
function filtersToInstantSearchState(filters: CompanyFilters) {
  const filterParts: string[] = [];

  // Tech verticals
  if (filters.techVerticals?.ids?.length) {
    const verticalFilters = filters.techVerticals.ids.map((id) => `techVerticals:${id}`);
    if (filters.techVerticals.operator === 'AND') {
      filterParts.push(`(${verticalFilters.join(' && ')})`);
    } else {
      filterParts.push(`(${verticalFilters.join(' || ')})`);
    }
  }

  // Sectors
  if (filters.sectors?.length) {
    const sectorFilters = filters.sectors.map((sector) => `sector:${sector}`);
    filterParts.push(`(${sectorFilters.join(' || ')})`);
  }

  // Stages
  if (filters.stages?.length) {
    const stageFilters = filters.stages.map((stage) => `stage:${stage}`);
    filterParts.push(`(${stageFilters.join(' || ')})`);
  }

  // Year established
  if (filters.yearEstablished?.min !== undefined || filters.yearEstablished?.max !== undefined) {
    const min = filters.yearEstablished.min ?? '*';
    const max = filters.yearEstablished.max ?? '*';
    filterParts.push(`establishedYear:[${min}..${max}]`);
  }

  return filterParts.join(' && ');
}

// ---------- Main component ----------
export interface CompaniesInstantSearchClientProps {
  initialFilters: CompanyFilters;
  techVerticalsPromise: Promise<{ id: string; name: string }[]>;
  pageSize: number;
}

export function CompaniesInstantSearch({
  initialFilters,
  techVerticalsPromise,
  pageSize,
}: CompaniesInstantSearchClientProps) {
  console.count('InstantSearch mount');
  return (
    <InstantSearchNext
      searchClient={searchClient}
      indexName={INDEX_NAME}
      initialUiState={{ [INDEX_NAME]: { query: initialFilters.keyword ?? '' } }}
      routing={true}
    >
      <CompaniesInstantSearchInner initialFilters={initialFilters} pageSize={pageSize} />
    </InstantSearchNext>
  );
}

// ---------- Inner component that has access to InstantSearch context ----------
function CompaniesInstantSearchInner({
  initialFilters,
  pageSize,
}: {
  initialFilters: CompanyFilters;
  pageSize: number;
}) {
  const [filters, setFilters] = React.useState<CompanyFilters>(initialFilters);
  const { refine } = useSearchBox();

  const [naturalLanguageEnabled, setNaturalLanguageEnabled] = React.useState(false);
  const [resolvedQuery, setResolvedQuery] = React.useState(initialFilters.keyword ?? '');
  const [naturalLanguageFilterExpression, setNaturalLanguageFilterExpression] = React.useState<string | null>(null);
  const [naturalLanguageFilterClauses, setNaturalLanguageFilterClauses] = React.useState<string[]>([]);

  React.useEffect(() => {
    return () => {
      setNaturalLanguageSearch(false);
    };
  }, []);

  const clearNaturalLanguageFilters = React.useCallback(() => {
    setNaturalLanguageFilterExpression(null);
    setNaturalLanguageFilterClauses([]);
  }, []);

  const instantSearchFilters = React.useMemo(() => {
    const baseFilters = filtersToInstantSearchState(filters);
    if (baseFilters && naturalLanguageFilterExpression) {
      return `${baseFilters} && (${naturalLanguageFilterExpression})`;
    }
    if (naturalLanguageFilterExpression) {
      return naturalLanguageFilterExpression;
    }
    return baseFilters;
  }, [filters, naturalLanguageFilterExpression]);

  const configureFilters = React.useMemo(() => {
    if (!instantSearchFilters || !instantSearchFilters.trim()) {
      return undefined;
    }
    return instantSearchFilters;
  }, [instantSearchFilters]);

  const hasActiveFilters =
    Boolean(filters.techVerticals || filters.sectors || filters.stages || filters.yearEstablished || filters.keyword) ||
    naturalLanguageFilterClauses.length > 0;

  const handleClearFilters = React.useCallback(() => {
    const clearedFilters: CompanyFilters = {};
    setFilters(clearedFilters);
    clearNaturalLanguageFilters();
    setResolvedQuery('');
    refine('');
  }, [clearNaturalLanguageFilters, refine]);

  const handleNaturalLanguageToggle = React.useCallback(
    (enabled: boolean) => {
      setNaturalLanguageEnabled(enabled);
      setNaturalLanguageSearch(enabled);
      if (!enabled) {
        clearNaturalLanguageFilters();
        refine(resolvedQuery.trim() || '');
      }
    },
    [clearNaturalLanguageFilters, refine, resolvedQuery],
  );

  const handleSearchSubmit = React.useCallback(
    async (
      submittedQuery: string,
      { naturalLanguageEnabled: submitWithNaturalLanguage }: { naturalLanguageEnabled: boolean },
    ) => {
      const trimmedQuery = submittedQuery.trim();

      if (!submitWithNaturalLanguage) {
        setResolvedQuery(trimmedQuery);
        clearNaturalLanguageFilters();
        refine(trimmedQuery);
        return;
      }

      setNaturalLanguageEnabled(true);
      setNaturalLanguageSearch(true);

      if (!trimmedQuery) {
        clearNaturalLanguageFilters();
        setResolvedQuery('');
        refine('');
        return;
      }

      try {
        const augmentation = await fetchNaturalLanguageAugmentation(trimmedQuery);
        const refinedQuery = augmentation?.refinedQuery?.trim?.() || trimmedQuery;

        setResolvedQuery(refinedQuery);
        setNaturalLanguageFilterExpression(augmentation?.filterBy ?? null);
        setNaturalLanguageFilterClauses(deriveNaturalLanguageFilterClauses(augmentation?.filterBy));
        refine(refinedQuery);
      } catch (error) {
        console.error('Failed to interpret natural language query', error);
        setResolvedQuery(trimmedQuery);
        clearNaturalLanguageFilters();
        refine(trimmedQuery);
      }
    },
    [clearNaturalLanguageFilters, refine],
  );

  const clearNaturalLanguageFiltersAndRefresh = React.useCallback(() => {
    clearNaturalLanguageFilters();
    refine(resolvedQuery.trim() || '');
  }, [clearNaturalLanguageFilters, refine, resolvedQuery]);

  return (
    <>
      <Configure hitsPerPage={pageSize} filters={configureFilters} />

      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[320px_1fr] lg:gap-12">
        <aside className="flex flex-col gap-6">
          {/* Bounded Facets - Non-searchable */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Sector</h3>
            <StyledRefinementList attribute="sector" limit={10} enableOperatorToggle />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Stage</h3>
            <StyledRefinementList attribute="stage" limit={10} enableOperatorToggle />
          </div>

          {/* Unbounded Facets - Searchable with show more */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tech Verticals</h3>
            <StyledRefinementList
              attribute="techVerticals"
              searchable={true}
              showMore={true}
              showMoreLimit={20}
              limit={10}
              enableOperatorToggle
            />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Key Executives</h3>
            <StyledRefinementList
              attribute="executives"
              searchable={true}
              showMore={true}
              showMoreLimit={50}
              limit={10}
              enableOperatorToggle
            />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Investors</h3>
            <StyledRefinementList
              attribute="investors"
              searchable={true}
              showMore={true}
              showMoreLimit={50}
              limit={10}
              enableOperatorToggle
            />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Board Members</h3>
            <StyledRefinementList
              attribute="boardMembers"
              searchable={true}
              showMore={true}
              showMoreLimit={50}
              limit={10}
              enableOperatorToggle
            />
          </div>

          {/* Numeric Controls */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Employees</h3>
            <NumericMenu
              attribute="employees"
              items={[
                { label: 'Under 10', end: 10 },
                { label: '10-50', start: 10, end: 50 },
                { label: '50-250', start: 50, end: 250 },
                { label: '250-1000', start: 250, end: 1000 },
                { label: 'Over 1000', start: 1000 },
              ]}
            />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Founded Year</h3>
            <RangeFilter attribute="establishedYear" />
          </div>
        </aside>

        <section className="flex flex-col gap-10">
          <div className="flex flex-col items-center gap-6 lg:items-start">
            <div className="w-full max-w-2xl lg:max-w-none">
              <CompaniesSearchBox
                naturalLanguageEnabled={naturalLanguageEnabled}
                onNaturalLanguageToggle={handleNaturalLanguageToggle}
                onSubmit={handleSearchSubmit}
                resolvedQuery={resolvedQuery}
              />
            </div>
            <CurrentRefinements
              onClear={handleClearFilters}
              naturalLanguageFilters={naturalLanguageFilterClauses}
              onClearNaturalLanguageFilters={clearNaturalLanguageFiltersAndRefresh}
            />
          </div>

          <div className="relative">
            <CompaniesHits />
            <CustomEmptyState hasFilters={hasActiveFilters} />
          </div>

          <CustomPagination />
        </section>
      </div>
    </>
  );
}
