'use client';

import * as React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { MultiSelectCombobox } from '@/components/ui/multi-select-combobox';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { SECTOR_VALUES, COMPANY_STAGE_VALUES } from '../../convex/schema';

export type SectorOption = (typeof SECTOR_VALUES)[number];
export type CompanyStageOption = (typeof COMPANY_STAGE_VALUES)[number];

export interface CompanyFilters {
  techVerticals?: { ids: Id<'techVerticals'>[]; operator: 'AND' | 'OR' };
  sectors?: SectorOption[];
  stages?: CompanyStageOption[];
  yearEstablished?: { min?: number; max?: number };
}

export interface FiltersDrawerProps {
  value: CompanyFilters;
  onApply: (next: CompanyFilters) => void;
  trigger?: React.ReactNode;
}

export function FiltersDrawer({ value, onApply, trigger }: FiltersDrawerProps) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<CompanyFilters>(value);

  React.useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const allVerticals = useQuery(api.techVerticals.list, {});
  const verticalsLoading = allVerticals === undefined;

  function setVerticalOperator(op: 'AND' | 'OR') {
    setDraft((prev) =>
      prev.techVerticals
        ? { ...prev, techVerticals: { ...prev.techVerticals, operator: op } }
        : { ...prev, techVerticals: { ids: [], operator: op } },
    );
  }

  function updateYear(part: 'min' | 'max', val: string) {
    const num = val === '' ? undefined : Number(val);
    setDraft((prev) => {
      const cur = prev.yearEstablished ?? {};
      const next = { ...cur, [part]: num };
      if (next.min === undefined && next.max === undefined) {
        const { yearEstablished: _unused, ...rest } = prev;
        void _unused;
        return rest as CompanyFilters;
      }
      return { ...prev, yearEstablished: next };
    });
  }

  const verticalOperator = draft.techVerticals?.operator ?? 'OR';
  const selectedVerticalIds = React.useMemo(() => draft.techVerticals?.ids ?? [], [draft.techVerticals]);
  const hasAnyFilters = !!(draft.techVerticals || draft.sectors || draft.stages || draft.yearEstablished);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger ?? (
        <SheetTrigger asChild>
          <Button variant="outline" aria-haspopup="dialog" aria-label="Open filters panel">
            Filters{hasAnyFilters ? ' *' : ''}
          </Button>
        </SheetTrigger>
      )}
      <SheetContent side="left" aria-label="Filters panel">
        <SheetHeader>
          <h2 className="text-lg font-semibold">Refine Your Search</h2>
        </SheetHeader>

        <div className="flex h-full flex-col overflow-y-auto pr-1">
          {/* Tech Verticals */}
          <fieldset className="mb-6" aria-labelledby="tech-verticals-label">
            <legend id="tech-verticals-label" className="mb-2 text-sm font-medium">
              Tech Verticals
            </legend>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MultiSelectCombobox
                  options={allVerticals ?? []}
                  getOptionLabel={(o) => o.name}
                  getOptionValue={(o) => o._id}
                  value={selectedVerticalIds}
                  onChange={(ids) =>
                    setDraft((prev) => ({
                      ...prev,
                      techVerticals: ids.length
                        ? { ids: ids as Id<'techVerticals'>[], operator: prev.techVerticals?.operator ?? 'OR' }
                        : undefined,
                    }))
                  }
                  placeholder="Select verticals"
                  disabled={verticalsLoading}
                />
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
                    onValueChange={(val) => (val === 'AND' || val === 'OR') && setVerticalOperator(val)}
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
                    stages: vals.length ? (vals as CompanyStageOption[]) : undefined,
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
            <legend id="year-established-label" className="mb-2 text-sm font-medium">
              Year Established
            </legend>
            <div className="flex items-center gap-2">
              <label className="text-xs" htmlFor="year-min">
                Min
              </label>
              <input
                id="year-min"
                inputMode="numeric"
                type="number"
                className="w-24 rounded-md border bg-background px-2 py-1 text-sm"
                value={draft.yearEstablished?.min ?? ''}
                onChange={(e) => updateYear('min', e.target.value)}
              />
              <label className="text-xs" htmlFor="year-max">
                Max
              </label>
              <input
                id="year-max"
                inputMode="numeric"
                type="number"
                className="w-24 rounded-md border bg-background px-2 py-1 text-sm"
                value={draft.yearEstablished?.max ?? ''}
                onChange={(e) => updateYear('max', e.target.value)}
              />
            </div>
          </fieldset>

          <div className="mt-auto flex gap-2 pb-4">
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
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
