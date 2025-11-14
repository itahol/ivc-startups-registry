"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SearchInput from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  encodeCompanyFilters,
  hasActiveCompanyFilters,
  readCompanyFilters,
  type CompanyFilters,
} from "@/lib/companies/filtersUrl";
import { FiltersDrawer } from "./FiltersDrawer";
import { parseSearchEntity, type SearchEntity } from "../constants";

interface SearchControlsProps {
  techVerticalsPromise: Promise<{ id: string; name: string }[]>;
}

export function SearchControls({ techVerticalsPromise }: SearchControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentFilters = React.useMemo(
    () => readCompanyFilters(searchParams),
    [searchParams],
  );
  const currentQuery = searchParams.toString();
  const entity = parseSearchEntity(searchParams.get("entity"));
  const [keywordInput, setKeywordInput] = React.useState(
    currentFilters.keyword ?? "",
  );

  React.useEffect(() => {
    setKeywordInput(currentFilters.keyword ?? "");
  }, [currentFilters.keyword]);

  const applyFilters = React.useCallback(
    (next: CompanyFilters, nextEntity: SearchEntity = entity) => {
      const nextSp = encodeCompanyFilters(next);
      nextSp.delete("page");
      if (nextEntity === "people") {
        nextSp.set("entity", "people");
      } else {
        nextSp.delete("entity");
      }
      nextSp.sort();
      const qs = nextSp.toString();
      if (qs === currentQuery) return;
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [currentQuery, entity, pathname, router],
  );

  const clearAll = React.useCallback(
    () => applyFilters({}, entity),
    [applyFilters, entity],
  );

  const handleKeywordSubmit = React.useCallback(() => {
    const trimmedKeyword = keywordInput.trim();
    const nextFilters: CompanyFilters = {
      ...currentFilters,
      keyword: trimmedKeyword || undefined,
    };
    applyFilters(nextFilters);
  }, [keywordInput, currentFilters, applyFilters]);

  const hasActiveFilters = hasActiveCompanyFilters(currentFilters);
  const searchLabel = entity === "people" ? "Search people" : "Search companies";
  const placeholder =
    entity === "people"
      ? "Search people or company names..."
      : "Search by keyword...";

  return (
    <div className="mb-8 flex flex-col items-center gap-6">
      <ToggleGroup
        type="single"
        value={entity}
        onValueChange={(value) => {
          if (value !== "companies" && value !== "people") return;
          if (value === entity) return;
          applyFilters(currentFilters, value);
        }}
        variant="outline"
        size="sm"
        aria-label="Select what to search"
      >
        <ToggleGroupItem value="companies" className="px-4 text-sm font-medium">
          Companies
        </ToggleGroupItem>
        <ToggleGroupItem value="people" className="px-4 text-sm font-medium">
          People
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="w-full max-w-2xl">
        <SearchInput
          value={keywordInput}
          onChange={setKeywordInput}
          onSubmit={handleKeywordSubmit}
          label={searchLabel}
          placeholder={placeholder}
          hideLabel={true}
          size="large"
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 min-h-8">
        <FiltersDrawer
          value={currentFilters}
          onApply={(next) => applyFilters(next)}
          techVerticalsPromise={techVerticalsPromise}
        />
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
