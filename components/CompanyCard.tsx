'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Doc } from '@/convex/_generated/dataModel';
import { cn } from '@/lib/utils';
import { Company } from '../lib/model/profiiles';

/* -------------------------------------------------------------------------- */
/*                                 Types                                      */
/* -------------------------------------------------------------------------- */
export interface CompanyWithRelations extends Doc<'companies'> {
  techVerticals: Doc<'techVerticals'>[];
}

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const {
    Company_ID: id,
    Company_Name: name,
    Company_Description: description,
    Stage: stageName,
    Sector: sectorName,
  } = company;
  const websiteUrl = company.Website ? new URL(`https://${company.Website}`) : undefined;
  const techVerticals = company.Tech_Verticals ? company.Tech_Verticals.split(',') : [];
  const tags = techVerticals.map((tv) => (
    <Badge variant="outline" key={tv} className="whitespace-nowrap">
      {tv}
    </Badge>
  ));

  const [expanded, setExpanded] = React.useState(false);
  const [tagsOverflow, setTagsOverflow] = React.useState(false);
  const [descOverflow, setDescOverflow] = React.useState(false);

  const tagsRef = React.useRef<HTMLDivElement | null>(null);
  const descRef = React.useRef<HTMLParagraphElement | null>(null);

  React.useLayoutEffect(() => {
    const el = tagsRef.current;
    if (el) {
      const collapsedMax = 56;
      setTagsOverflow(el.scrollHeight > collapsedMax + 1);
    }
    const d = descRef.current;
    if (d) {
      setDescOverflow(d.scrollHeight > d.clientHeight + 1);
    }
  }, [techVerticals, description]);

  const showToggle = (tagsOverflow || descOverflow) && (description || techVerticals.length > 0);

  const toggle = () => setExpanded((e) => !e);

  return (
    <Card
      key={id}
      tabIndex={-1}
      className={cn(
        'relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        'gap-4 py-4',
      )}
      aria-describedby={`company-${id}-desc`}
    >
      <CardHeader className="pb-0 gap-1">
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
      <CardContent className="pt-3 px-6 pb-2">
        <dl className="grid grid-cols-[auto_1fr] items-start gap-x-2 gap-y-1 text-sm">
          <dt className="font-medium">Stage</dt>
          <dd className="text-muted-foreground">{stageName ?? '—'}</dd>
          <dt className="font-medium">Year</dt>
          <dd className="text-muted-foreground">{company.Established_Year ?? '—'}</dd>
          <dt className="font-medium">Sector</dt>
          <dd className="text-muted-foreground">{sectorName ?? '—'}</dd>
          {techVerticals.length > 0 && (
            <>
              <dt className="font-medium">Tech</dt>
              <dd className="text-muted-foreground relative">
                <div
                  ref={tagsRef}
                  className={cn(
                    'flex flex-wrap gap-1.5 pr-1 transition-[max-height] duration-300',
                    !expanded && 'max-h-14 overflow-hidden',
                  )}
                >
                  {tags}
                </div>
                {!expanded && tagsOverflow && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-background to-transparent"
                  />
                )}
              </dd>
            </>
          )}
        </dl>

        {description ? (
          <div className="mt-3 text-sm leading-snug">
            <p id={`company-${id}-desc`} ref={descRef} className={cn('transition-colors', !expanded && 'line-clamp-3')}>
              {description}
            </p>
            {!expanded && descOverflow && (
              <div
                aria-hidden="true"
                className="pointer-events-none -mt-6 h-6 bg-gradient-to-t from-background to-transparent"
              />
            )}
          </div>
        ) : null}

        {showToggle && (
          <div className="mt-3">
            <button
              type="button"
              onClick={toggle}
              className={cn(
                'inline-flex items-center gap-1 text-xs font-medium rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                'text-muted-foreground hover:text-foreground hover:underline transition-colors',
              )}
              aria-expanded={expanded}
            >
              <span>{expanded ? 'Show less' : 'Show more'}</span>
              <span
                aria-hidden="true"
                className={cn(
                  'transition-transform text-[0.65rem] translate-y-px text-muted-foreground',
                  expanded && 'rotate-180',
                )}
              >
                ▾
              </span>
              <span className="sr-only"> for {name}</span>
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
