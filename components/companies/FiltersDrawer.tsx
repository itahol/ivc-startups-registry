'use client';

import * as React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { MultiSelectCombobox, SingleSelectCombobox } from '@/components/ui/combobox';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Doc, Id } from '@/convex/_generated/dataModel';
import { SECTORS } from '../../convex/schema';

export interface CompanyFilters {
  techVerticals?: { ids: Id<'techVerticals'>[]; operator: 'AND' | 'OR' };
  sectors?: SectorOption[];
  stages?: Id<'companyStages'>[];
  yearEstablished?: { min?: number; max?: number };
}

export interface FiltersDrawerProps {
  value: CompanyFilters;
  onApply: (next: CompanyFilters) => void;
  trigger?: React.ReactNode;
}

const SECTOR_OPTIONS = Object.values(SECTORS);

type SectorOption = (typeof SECTOR_OPTIONS)[number];

export function FiltersDrawer({ value, onApply, trigger }: FiltersDrawerProps) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<CompanyFilters>(value);

  React.useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const allVerticals = useQuery(api.techVerticals.list, {});
  const stages = useQuery(api.companyStages.list, {});
  const verticalsLoading = allVerticals === undefined;
  const stagesLoading = stages === undefined;

  function toggleVertical(v: Doc<'techVerticals'>) {
    setDraft((prev) => {
      const current = prev.techVerticals?.ids ?? [];
      const exists = current.includes(v._id);
      const nextIds = exists ? current.filter((id) => id !== v._id) : [...current, v._id];
      return {
        ...prev,
        techVerticals: nextIds.length ? { ids: nextIds, operator: prev.techVerticals?.operator ?? 'OR' } : undefined,
      };
    });
  }

  function setVerticalOperator(op: 'AND' | 'OR') {
    setDraft((prev) =>
      prev.techVerticals
        ? { ...prev, techVerticals: { ...prev.techVerticals, operator: op } }
        : { ...prev, techVerticals: { ids: [], operator: op } },
    );
  }

  function toggleSector(sector: SectorOption) {
    setDraft((prev) => {
      const cur = prev.sectors ?? [];
      const exists = cur.includes(sector);
      const next = exists ? cur.filter((s) => s !== sector) : [...cur, sector];
      return { ...prev, sectors: next.length ? next : undefined };
    });
  }

  function selectStage(id: Id<'companyStages'> | undefined) {
    setDraft((prev) => {
      if (!id) {
        const { stages: _unused, ...rest } = prev;
        void _unused;
        return rest;
      }
      return { ...prev, stages: [id] };
    });
  }

  function updateYear(part: 'min' | 'max', val: string) {
    const num = val === '' ? undefined : Number(val);
    setDraft((prev) => {
      const cur = prev.yearEstablished ?? {};
      const next = { ...cur, [part]: num };
      if (next.min === undefined && next.max === undefined) {
        const { yearEstablished: _unused, ...rest } = prev;
        void _unused;
        return rest;
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
            <MultiSelectCombobox
              label="Verticals"
              items={allVerticals}
              loading={verticalsLoading}
              isSelected={(item) => selectedVerticalIds.includes(item._id)}
              getKey={(item) => item._id}
              getLabel={(item) => item.name}
              onToggle={(item) => toggleVertical(item)}
              placeholder="Search verticals..."
              search
              onClear={() =>
                setDraft((prev) => {
                  const { techVerticals: _unused, ...rest } = prev;
                  void _unused;
                  return rest;
                })
              }
            />
            {/* Operator visible only when at least one vertical selected */}
            {selectedVerticalIds.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
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
          </fieldset>

          {/* Sector (multi-select combobox) */}
          <fieldset className="mb-6" aria-labelledby="sector-label">
            <legend id="sector-label" className="mb-2 text-sm font-medium">
              Sector
            </legend>
            <MultiSelectCombobox
              label="Sectors"
              items={SECTOR_OPTIONS}
              loading={false}
              isSelected={(item) => (draft.sectors ?? []).includes(item)}
              getKey={(item) => item}
              getLabel={(item) => item}
              onToggle={(item) => toggleSector(item)}
              selectedBadgeLimit={6}
              emptyMessage="No sectors"
              onClear={() =>
                setDraft((prev) => {
                  const { sectors: _unused, ...rest } = prev;
                  void _unused;
                  return rest;
                })
              }
            />
          </fieldset>

          {/* Stage (single-select combobox) */}
          <fieldset className="mb-6" aria-labelledby="stage-label">
            <legend id="stage-label" className="mb-2 text-sm font-medium">
              Stage
            </legend>
            <SingleSelectCombobox
              label="Stage"
              items={stages}
              loading={stagesLoading}
              selected={stages?.find((s) => draft.stages?.[0] === s._id)}
              onSelect={(item) => selectStage(item ? item._id : undefined)}
              getKey={(item) => item._id}
              getLabel={(item) => item.name}
              placeholder="Search stages..."
            />
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
