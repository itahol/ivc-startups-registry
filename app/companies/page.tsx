'use client';

import { useQuery } from 'convex/react';
import * as React from 'react';
import { api } from '../../convex/_generated/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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

export default function CompaniesPage() {
  const [selectedVertical, setSelectedVertical] = React.useState<'All' | Doc<'techVerticals'>>('All');

  // Raw query results (undefined while loading)
  const techVerticals = useQuery(api.techVerticals.list, { limit: TECH_VERTICALS_LIMIT });
  const techVerticalsLoading = techVerticals === undefined;
  const veticalsNames = techVerticalsLoading ? [] : techVerticals.map((tv) => tv.name);
  const dynamic = veticalsNames.sort();
  const verticals = ['All', ...dynamic];

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
              {techVerticalsLoading
                ? // Skeleton pills (approximate size of buttons)
                  Array.from({ length: TECH_VERTICALS_LIMIT + 1 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-20 rounded-full" />
                  ))
                : verticals.map((vertical) => (
                    <Button
                      aria-pressed={
                        vertical === (selectedVertical === 'All' ? selectedVertical : selectedVertical.name)
                      }
                      className="rounded-full"
                      key={slugify(vertical)}
                      onClick={() => setSelectedVertical(techVerticals?.find((tv) => tv.name === vertical) ?? 'All')}
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
                  return (
                    <Card key={company._id}>
                      <CardHeader>
                        <CardTitle>{name}</CardTitle>
                        {websiteUrl ? (
                          <CardDescription>
                            <a href={websiteUrl.href} target="_blank" rel="noopener noreferrer">
                              {websiteUrl.hostname}
                            </a>
                          </CardDescription>
                        ) : null}
                      </CardHeader>
                      <CardContent>
                        {techVerticals.length > 0 ? tags : null}
                        <p>{description}</p>
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
