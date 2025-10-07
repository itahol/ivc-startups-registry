'use client';

import { useQuery } from 'convex/react';
import * as React from 'react';
import { api } from '../../convex/_generated/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Doc } from '../../convex/_generated/dataModel';

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
  selected: 'All' | Doc<'techVerticals'>;
  allVerticals: Doc<'techVerticals'>[];
  visibleNames: string[]; // includes 'All'
  onSelect: (val: 'All' | Doc<'techVerticals'>) => void;
}

function Combobox({ selected, allVerticals, visibleNames, onSelect }: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (!containerRef.current) return;
      if (containerRef.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    window.addEventListener('mousedown', handle);
    return () => window.removeEventListener('mousedown', handle);
  }, [open]);

  // Focus search when opening
  React.useEffect(() => {
    if (open) {
      // Slight delay to ensure input is mounted
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const display = selected === 'All' ? 'More' : selected.name;
  const hidden = allVerticals.filter((tv) => !visibleNames.includes(tv.name));
  return (
    <div className="relative" ref={containerRef}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="rounded-full"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {display}
        <span className="ml-1 text-xs text-muted-foreground">▼</span>
      </Button>
      {open ? (
        <div className="absolute z-50 mt-2 w-56 rounded-md border bg-popover shadow-md">
          <Command className="max-h-64">
            <CommandInput ref={inputRef} placeholder="Search verticals" />
            <CommandList>
              <CommandEmpty>No results.</CommandEmpty>
              <CommandGroup heading="Verticals">
                <CommandItem
                  value="All"
                  onSelect={() => {
                    onSelect('All');
                    setOpen(false);
                  }}
                >
                  All
                </CommandItem>
                {hidden.map((tv) => (
                  <CommandItem
                    key={tv._id}
                    value={tv.name}
                    onSelect={() => {
                      onSelect(tv);
                      setOpen(false);
                    }}
                  >
                    {tv.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      ) : null}
    </div>
  );
}

export default function CompaniesPage() {
  const [selectedVertical, setSelectedVertical] = React.useState<'All' | Doc<'techVerticals'>>('All');

  // Limited list for pill display
  const techVerticalsLimited = useQuery(api.techVerticals.list, { limit: TECH_VERTICALS_LIMIT });
  // Full list for select (no limit)
  const allTechVerticals = useQuery(api.techVerticals.list, {});

  const techVerticalsLoading = techVerticalsLimited === undefined || allTechVerticals === undefined;

  const limitedNames = techVerticalsLimited?.map((tv) => tv.name).sort() ?? [];
  const verticals = ['All', ...limitedNames];

  const companies = useQuery(api.companies.list, {
    techVerticals:
      selectedVertical !== 'All'
        ? {
            ids: [selectedVertical._id],
            operator: 'OR',
          }
        : undefined,
    limit: 20,
  });
  const companiesLoading = companies === undefined;

  /* ----------------------------- Render --------------------------------- */
  return (
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
            <div className="flex flex-wrap gap-2 min-h-8">
              {techVerticalsLoading ? (
                // Skeleton pills (approximate size of buttons)
                Array.from({ length: TECH_VERTICALS_LIMIT + 1 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-20 rounded-full" />
                ))
              ) : (
                <>
                  {verticals.map((vertical) => (
                    <Button
                      aria-pressed={
                        vertical === (selectedVertical === 'All' ? selectedVertical : selectedVertical.name)
                      }
                      className="rounded-full"
                      key={slugify(vertical)}
                      onClick={() =>
                        setSelectedVertical(
                          (vertical === 'All' ? 'All' : allTechVerticals?.find((tv) => tv.name === vertical)) ?? 'All',
                        )
                      }
                      size="sm"
                      title={`Filter by ${vertical}`}
                      variant={
                        vertical === (selectedVertical === 'All' ? selectedVertical : selectedVertical.name)
                          ? 'default'
                          : 'outline'
                      }
                    >
                      {vertical}
                    </Button>
                  ))}

                  {/* Select for all verticals beyond pills */}
                  {allTechVerticals && allTechVerticals.length > TECH_VERTICALS_LIMIT ? (
                    <Combobox
                      selected={selectedVertical}
                      allVerticals={allTechVerticals}
                      visibleNames={verticals}
                      onSelect={(val) => setSelectedVertical(val)}
                    />
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
              lg:grid-cols-4
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
              : companies.map((company) => {
                  const { name, description, techVerticals } = company;
                  const websiteUrl = company.websiteUrl ? new URL(company.websiteUrl) : undefined;
                  const tags = techVerticals.map((tv) => (
                    <Badge variant={'outline'} key={tv._id}>
                      {tv.name}
                    </Badge>
                  ));

                  const stageName = company.stage?.name;
                  const sectorName = company.sector;

                  return (
                    <Card
                      key={company._id}
                      // Make whole card focusable so keyboard users get the same expand affordance as hover.
                      tabIndex={0}
                      className={`
                        group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50
                        transition-colors
                      `}
                      aria-describedby={`company-${company._id}-desc`}
                    >
                      <CardHeader className="pb-0">
                        <CardTitle className="text-base font-semibold leading-snug tracking-tight">{name}</CardTitle>
                        {websiteUrl ? (
                          <CardDescription className="truncate">
                            <a
                              href={websiteUrl.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline focus-visible:underline"
                            >
                              {websiteUrl.hostname.replace(/^www\./, '')}
                            </a>
                          </CardDescription>
                        ) : null}
                      </CardHeader>
                      <CardContent className="pt-4">
                        <dl className="grid grid-cols-[auto_1fr] items-start gap-x-2 gap-y-1 text-sm">
                          <dt className="font-medium">Stage</dt>
                          <dd className="text-muted-foreground">{stageName ?? '—'}</dd>

                          <dt className="font-medium">Year Established</dt>
                          <dd className="text-muted-foreground">{company.yearEstablished ?? '—'}</dd>

                          <dt className="font-medium">Sector</dt>
                          <dd className="text-muted-foreground">{sectorName ?? '—'}</dd>

                          {techVerticals.length > 0 && (
                            <>
                              <dt className="font-medium">Tech Verticals</dt>
                              <dd className="text-muted-foreground">
                                <div className="relative" aria-label="Tech verticals list">
                                  <div
                                    className={`flex flex-wrap gap-1.5 overflow-hidden transition-all duration-300
                                      max-h-16 group-hover:max-h-96 group-focus-within:max-h-96
                                    `}
                                  >
                                    {tags}
                                  </div>
                                  {/* Fade overlay when collapsed */}
                                  <div
                                    className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent group-hover:opacity-0 group-focus-within:opacity-0 transition-opacity"
                                    aria-hidden="true"
                                  />
                                </div>
                              </dd>
                            </>
                          )}
                        </dl>

                        {/* Description */}
                        {description ? (
                          <div className="mt-3 text-sm leading-snug">
                            <p
                              id={`company-${company._id}-desc`}
                              className={`
                                line-clamp-3 transition-[color] group-hover:line-clamp-none group-focus-within:line-clamp-none
                              `}
                            >
                              {description}
                            </p>
                            <div
                              className="pointer-events-none mt-1 h-6 bg-gradient-to-t from-background to-transparent group-hover:hidden group-focus-within:hidden -translate-y-6"
                              aria-hidden="true"
                            />
                          </div>
                        ) : null}
                        <span className="sr-only">
                          Focus or hover to expand full description and all tech verticals.
                        </span>
                      </CardContent>
                    </Card>
                  );
                })}
          </div>

          {/* Empty state */}
          {!companiesLoading && companies.length === 0 && (
            <div className="mt-8 text-center">
              <p className="text-muted-foreground">No products found in this category.</p>
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
  );
}
