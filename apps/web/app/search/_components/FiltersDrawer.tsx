"use client";

import * as React from "react";
import { Suspense, use } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import type { CompanyFilters } from "@/lib/companies/filtersUrl";
import SearchInput from "@/components/SearchInput";
import YearRangePicker from "@/components/YearRangePicker";
import {
  SECTOR_VALUES,
  COMPANY_STAGE_VALUES,
  CompanyStageOption,
} from "@repo/model/model";
import { Skeleton } from "@/components/ui/skeleton";

interface FiltersDrawerProps {
  techVerticalsPromise: Promise<{ id: string; name: string }[]>;
  value: CompanyFilters;
  onApply: (next: CompanyFilters) => void;
}

export function FiltersDrawer({
  value,
  onApply,
  techVerticalsPromise,
}: FiltersDrawerProps) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<CompanyFilters>(value);

  React.useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  function setVerticalOperator(op: "AND" | "OR") {
    setDraft((prev) =>
      prev.techVerticals
        ? { ...prev, techVerticals: { ...prev.techVerticals, operator: op } }
        : { ...prev, techVerticals: { ids: [], operator: op } },
    );
  }

  const verticalOperator = draft.techVerticals?.operator ?? "OR";
  const selectedVerticalIds = React.useMemo(
    () => draft.techVerticals?.ids ?? [],
    [draft.techVerticals],
  );
  const hasAnyFilters = !!(
    draft.techVerticals ||
    draft.sectors ||
    draft.stages ||
    draft.yearEstablished ||
    draft.keyword
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          aria-haspopup="dialog"
          aria-label="Open filters panel"
        >
          Filters{hasAnyFilters ? " *" : ""}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <SheetHeader className="flex-none border-b p-6 text-left">
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Refine your search criteria</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-8 p-6">
            {/* Keyword Search */}
            <fieldset className="mb-6" aria-labelledby="keyword-label">
              <legend id="keyword-label" className="mb-2 text-sm font-medium">
                Keyword
              </legend>
              <SearchInput
                value={draft.keyword ?? ""}
                onChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    keyword: value.trim() || undefined,
                  }))
                }
                placeholder="Search by keyword..."
                hideSubmitButton={true}
                hideLabel={true}
              />
            </fieldset>

            {/* Tech Verticals */}
            <fieldset className="mb-6" aria-labelledby="tech-verticals-label">
              <legend
                id="tech-verticals-label"
                className="mb-2 text-sm font-medium"
              >
                Tech Verticals
              </legend>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Suspense
                    fallback={<Skeleton className="h-10 flex-1 rounded-md" />}
                  >
                    <TechVerticalsCombobox
                      techVerticalsPromise={techVerticalsPromise}
                      selectedVerticalIds={selectedVerticalIds}
                      setDraft={setDraft}
                    />
                  </Suspense>
                  {selectedVerticalIds.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() =>
                        setDraft((prev) => {
                          const { techVerticals: _unused, ...rest } = prev;
                          void _unused;
                          return rest;
                        })
                      }
                      aria-label="Clear selected verticals"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                {/* Operator visible only when at least one vertical selected */}
                {selectedVerticalIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Match</span>
                    <ToggleGroup
                      type="single"
                      value={verticalOperator}
                      onValueChange={(val) =>
                        (val === "AND" || val === "OR") &&
                        setVerticalOperator(val)
                      }
                      size="sm"
                      aria-label="Choose whether selected tech verticals should all match or any match"
                    >
                      <ToggleGroupItem value="OR" className="px-3 text-xs">
                        Any
                      </ToggleGroupItem>
                      <ToggleGroupItem value="AND" className="px-3 text-xs">
                        All
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                )}
              </div>
            </fieldset>

            {/* Sector (multi-select combobox) */}
            <fieldset className="mb-6" aria-labelledby="sector-label">
              <legend id="sector-label" className="mb-2 text-sm font-medium">
                Sector
              </legend>
              <div className="flex items-center gap-2">
                <MultiSelectCombobox
                  options={SECTOR_VALUES}
                  getOptionLabel={(o) => o}
                  getOptionValue={(o) => o}
                  value={draft.sectors ?? []}
                  onChange={(vals) =>
                    setDraft((prev) => ({
                      ...prev,
                      sectors: vals.length ? vals : undefined,
                    }))
                  }
                  placeholder="Select sectors"
                />
                {(draft.sectors?.length ?? 0) > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() =>
                      setDraft((prev) => {
                        const { sectors: _unused, ...rest } = prev;
                        void _unused;
                        return rest;
                      })
                    }
                    aria-label="Clear selected sectors"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </fieldset>

            {/* Stage (multi-select combobox) */}
            <fieldset className="mb-6" aria-labelledby="stage-label">
              <legend id="stage-label" className="mb-2 text-sm font-medium">
                Stage
              </legend>
              <div className="flex items-center gap-2">
                <MultiSelectCombobox
                  options={COMPANY_STAGE_VALUES}
                  getOptionLabel={(o) => o}
                  getOptionValue={(o) => o}
                  value={draft.stages ?? []}
                  onChange={(vals) =>
                    setDraft((prev) => ({
                      ...prev,
                      stages: vals.length
                        ? (vals as CompanyStageOption[])
                        : undefined,
                    }))
                  }
                  placeholder="Any stage"
                />
                {(draft.stages?.length ?? 0) > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() =>
                      setDraft((prev) => {
                        const { stages: _unused, ...rest } = prev;
                        void _unused;
                        return rest;
                      })
                    }
                    aria-label="Clear selected stages"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </fieldset>

            {/* Year Established */}
            <fieldset className="mb-8" aria-labelledby="year-established-label">
              <legend
                id="year-established-label"
                className="mb-2 text-sm font-medium"
              >
                Year Established
              </legend>
              <YearRangePicker
                minValue={1970}
                maxValue={new Date().getFullYear()}
                initialValue={
                  draft.yearEstablished &&
                  (draft.yearEstablished.min !== undefined ||
                    draft.yearEstablished.max !== undefined)
                    ? [
                        draft.yearEstablished.min ??
                          draft.yearEstablished.max ??
                          0,
                        draft.yearEstablished.max ??
                          draft.yearEstablished.min ??
                          0,
                      ]
                    : undefined
                }
                defaultValue={
                  value.yearEstablished &&
                  (value.yearEstablished.min !== undefined ||
                    value.yearEstablished.max !== undefined)
                    ? [
                        value.yearEstablished.min ??
                          value.yearEstablished.max ??
                          0,
                        value.yearEstablished.max ??
                          value.yearEstablished.min ??
                          0,
                      ]
                    : undefined
                }
                onChange={(yr) => {
                  setDraft((prev) => {
                    if (!yr || (yr[0] === null && yr[1] === null)) {
                      const { yearEstablished: _unused, ...rest } = prev;
                      void _unused;
                      return rest as CompanyFilters;
                    }
                    const [min, max] = yr;
                    return {
                      ...prev,
                      yearEstablished: {
                        min: min === null ? undefined : min,
                        max: max === null ? undefined : max,
                      },
                    };
                  });
                }}
              />
            </fieldset>
          </div>
        </div>
        <SheetFooter className="flex-none border-t p-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDraft({})}
            disabled={!hasAnyFilters}
            aria-label="Clear all filters"
          >
            Clear All
          </Button>
          <Button
            type="button"
            onClick={() => {
              onApply(draft);
              setOpen(false);
            }}
          >
            Apply
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setDraft(value);
              setOpen(false);
            }}
          >
            Cancel
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function TechVerticalsCombobox({
  techVerticalsPromise,
  selectedVerticalIds,
  setDraft,
}: {
  techVerticalsPromise: Promise<{ id: string; name: string }[]>;
  selectedVerticalIds: string[];
  setDraft: React.Dispatch<React.SetStateAction<CompanyFilters>>;
}) {
  const techVerticals = use(techVerticalsPromise);
  return (
    <MultiSelectCombobox
      options={techVerticals}
      getOptionLabel={(o) => o.name}
      getOptionValue={(o) => o.id}
      value={selectedVerticalIds}
      onChange={(ids) =>
        setDraft((prev) => ({
          ...prev,
          techVerticals: ids.length
            ? { ids, operator: prev.techVerticals?.operator ?? "OR" }
            : undefined,
        }))
      }
      placeholder="Select verticals"
    />
  );
}
