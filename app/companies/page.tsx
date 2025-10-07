'use client';

import { useQuery } from 'convex/react';
import * as React from 'react';
import { api } from '../../convex/_generated/api';
import { Card } from '@/components/ui/card'; // For skeleton loading placeholder only
import { CompanyCard, CompanyWithRelations } from '@/components/CompanyCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Doc } from '../../convex/_generated/dataModel';
import Navbar from '../../components/Navbar';

/* -------------------------------------------------------------------------- */
/*                            Helpers / utilities                             */
/* -------------------------------------------------------------------------- */

const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

const TECH_VERTICALS_LIMIT = 5;

interface ComboboxProps {
  selected: Doc<'techVerticals'>[]; // currently selected verticals (can be empty)
  allVerticals: Doc<'techVerticals'>[];
  visibleNames: string[]; // names already rendered as pills
  onToggle: (vertical: Doc<'techVerticals'>) => void; // toggle selection
}

function Combobox({ selected, allVerticals, visibleNames, onToggle }: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (!containerRef.current) return;
      if (containerRef.current.contains(e.target as Node)) return;
      setOpen(false);
      triggerRef.current?.focus();
    }
    window.addEventListener('mousedown', handle);
    return () => window.removeEventListener('mousedown', handle);
  }, [open]);

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  // Focus search when opening
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Hidden verticals = not already shown as pills
  const hiddenVerticals = allVerticals.filter((vertical) => !visibleNames.includes(vertical.name));
  const hiddenSelectedCount = selected.filter((vertical) => !visibleNames.includes(vertical.name)).length;
  const display = hiddenSelectedCount > 0 ? `More (+${hiddenSelectedCount})` : 'More';

  const isSelected = React.useCallback(
    (id: string) => selected.some((selectedVertical) => selectedVertical._id === id),
    [selected],
  );

  return (
    <div className="relative" ref={containerRef}>
      <Button
        ref={triggerRef}
        type="button"
        size="sm"
        variant="outline"
        className="rounded-full"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if ((e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') && !open) {
            e.preventDefault();
            setOpen(true);
          } else if (e.key === 'Escape' && open) {
            setOpen(false);
          }
        }}
        aria-label={
          hiddenSelectedCount > 0 ? `Select more verticals (${hiddenSelectedCount} selected)` : 'Select more verticals'
        }
      >
        {display}
        <span className="ml-1 text-xs text-muted-foreground">▼</span>
      </Button>
      {open ? (
        <div className="absolute z-50 mt-2 w-56 rounded-md border bg-popover shadow-md">
          <Command className="max-h-64">
            <CommandInput ref={inputRef} placeholder="Search verticals" />
            <CommandList aria-multiselectable="true">
              <CommandEmpty>No results.</CommandEmpty>
              <CommandGroup heading="Verticals">
                {hiddenVerticals.map((vertical) => {
                  const selectedHere = isSelected(vertical._id);
                  return (
                    <CommandItem
                      key={vertical._id}
                      value={vertical.name}
                      aria-selected={selectedHere}
                      onSelect={() => {
                        onToggle(vertical);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === ' ') {
                          e.preventDefault();
                          onToggle(vertical);
                        }
                      }}
                    >
                      {selectedHere ? '✓ ' : ''}
                      {vertical.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      ) : null}
    </div>
  );
}

export default function CompaniesPage() {
  const [selectedVerticals, setSelectedVerticals] = React.useState<Doc<'techVerticals'>[]>([]);

  // Full list for select (no limit)
  const allTechVerticals = useQuery(api.techVerticals.list, {});
  const techVerticalsLoading = allTechVerticals === undefined;
  const verticals = allTechVerticals?.slice(0, TECH_VERTICALS_LIMIT).sort((a, b) => a.name.localeCompare(b.name)) ?? [];

  const companies = useQuery(api.companies.list, {
    techVerticals:
      selectedVerticals.length > 0
        ? {
            ids: selectedVerticals.map((vertical) => vertical._id),
            operator: 'OR' as const,
          }
        : undefined,
    limit: 20,
  });
  const companiesLoading = companies === undefined;

  const toggleVertical = React.useCallback((vertical: Doc<'techVerticals'>) => {
    setSelectedVerticals((prev) =>
      prev.some((selectedVertical) => selectedVertical._id === vertical._id)
        ? prev.filter((selectedVertical) => selectedVertical._id !== vertical._id)
        : [...prev, vertical],
    );
  }, []);

  const clearAll = React.useCallback(() => setSelectedVerticals([]), []);
  const isSelected = React.useCallback(
    (vertical: Doc<'techVerticals'>) =>
      selectedVerticals.some((selectedVertical) => selectedVertical._id === vertical._id),
    [selectedVerticals],
  );

  /* ----------------------------- Render --------------------------------- */
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 py-10">
          <div
            className={`
            container px-4
            md:px-6
          `}
          >
            {/* Heading & filters */}
            <div
              className={`
              mb-8 flex flex-col gap-4
              md:flex-row md:items-center md:justify-between
            `}
            >
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                  Browse our latest products and find something you&apos;ll love.
                </p>
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap items-center gap-2 min-h-8">
                {techVerticalsLoading ? (
                  // Skeleton pills (approximate size of buttons)
                  Array.from({ length: TECH_VERTICALS_LIMIT }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-20 rounded-full" />
                  ))
                ) : (
                  <>
                    {verticals.map((vertical) => {
                      const active = isSelected(vertical);
                      return (
                        <Button
                          aria-pressed={active}
                          className="rounded-full"
                          key={slugify(vertical.name)}
                          onClick={() => toggleVertical(vertical)}
                          size="sm"
                          title={`Filter by ${vertical.name}`}
                          variant={active ? 'default' : 'outline'}
                        >
                          {vertical.name}
                        </Button>
                      );
                    })}

                    {/* Select for all verticals beyond pills */}
                    {allTechVerticals && allTechVerticals.length > TECH_VERTICALS_LIMIT ? (
                      <Combobox
                        selected={selectedVerticals}
                        allVerticals={allTechVerticals}
                        visibleNames={verticals.map((vertical) => vertical.name)}
                        onToggle={toggleVertical}
                      />
                    ) : null}

                    {/* Clear filters button (only when something selected) */}
                    {selectedVerticals.length > 0 ? (
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
                  </>
                )}
              </div>
            </div>

            {/* Product grid */}
            <div
              className={`
              grid grid-cols-1 gap-6
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-3
            `}
            >
              {companiesLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-12" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    </Card>
                  ))
                : companies.map((company) => (
                    <CompanyCard key={company._id} company={company as CompanyWithRelations} />
                  ))}
            </div>

            {/* Empty state */}
            {!companiesLoading && companies.length === 0 && (
              <div className="mt-8 text-center">
                <p className="text-muted-foreground">No products found in these categories.</p>
                {selectedVerticals.length > 0 ? (
                  <div className="mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearAll}
                      aria-label="Clear filters to show all products"
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : null}
              </div>
            )}

            {/* Pagination */}
            <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
              <Button disabled variant="outline">
                Previous
              </Button>
              <Button aria-current="page" variant="default">
                1
              </Button>
              <Button disabled variant="outline">
                Next
              </Button>
            </nav>
          </div>
        </main>
      </div>
    </>
  );
}
