'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Doc } from '@/convex/_generated/dataModel';

export interface CompanyWithRelations extends Doc<'companies'> {
  techVerticals: Doc<'techVerticals'>[];
}

interface CompanyCardProps {
  company: CompanyWithRelations;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const { name, description, techVerticals } = company;
  const websiteUrl = company.websiteUrl ? new URL(company.websiteUrl) : undefined;
  const tags = techVerticals.map((tv) => (
    <Badge variant="outline" key={tv._id}>
      {tv.name}
    </Badge>
  ));

  const stageName = company.stage;
  const sectorName = company.sector;

  return (
    <Card
      key={company._id}
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
        <span className="sr-only">Focus or hover to expand full description and all tech verticals.</span>
      </CardContent>
    </Card>
  );
}
