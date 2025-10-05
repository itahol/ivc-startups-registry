'use client';

import { useQuery } from 'convex/react';
import * as React from 'react';
import { api } from '../../convex/_generated/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/* -------------------------------------------------------------------------- */
/*                            Helpers / utilities                             */
/* -------------------------------------------------------------------------- */

const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

export default function CompaniesPage() {
  const companies =
    useQuery(api.companies.list, {
      limit: 20,
    }) ?? [];

  const veticalsNames = new Set(companies.flatMap((p) => p.techVerticals).map((tv) => tv.name));
  console.log({ veticalsNames });
  const dynamic = Array.from(new Set(companies.flatMap((p) => p.techVerticals).map((tv) => tv.name))).sort();
  const verticals = ['All', ...dynamic];

  const [selectedVertical, setSelectedVertical] = React.useState('All');

  /* --------------------- Filtered products (memo) ----------------------- */
  const filteredCompanies =
    selectedVertical === 'All'
      ? companies
      : companies.filter((company) => company.techVerticals.map((tv) => tv.name).includes(selectedVertical));
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
            <div className="flex flex-wrap gap-2">
              {verticals.map((vertical) => (
                <Button
                  aria-pressed={vertical === selectedVertical}
                  className="rounded-full"
                  key={slugify(vertical)}
                  onClick={() => setSelectedVertical(vertical)}
                  size="sm"
                  title={`Filter by ${vertical}`}
                  variant={vertical === selectedVertical ? 'default' : 'outline'}
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
            {filteredCompanies?.map((company) => {
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
          {filteredCompanies.length === 0 && (
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
