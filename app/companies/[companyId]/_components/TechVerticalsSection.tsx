'use client';
import { useState } from 'react';
import { Item, ItemTitle, ItemContent } from '@/components/ui/item';
import { Badge } from '@/components/ui/badge';
import { TechVertical } from '../../../../lib/model';

const TECH_PREVIEW = 8;

interface TechVerticalsSectionProps {
  techVerticals: TechVertical[];
}

export default function TechVerticalsSection({ techVerticals }: TechVerticalsSectionProps) {
  const [showAllTech, setShowAllTech] = useState(false);
  const techToShow = showAllTech ? techVerticals : techVerticals.slice(0, TECH_PREVIEW);

  return (
    <Item className="flex-col items-start p-0">
      <ItemTitle className="text-sm font-semibold">Tech Verticals</ItemTitle>
      <ItemContent className="mt-2 space-y-3">
        {techVerticals.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-1.5">
              {techToShow.map((tv) => (
                <Badge key={tv.tagID} variant="outline" className="text-[12px] py-1 px-2">
                  {tv.tagName}
                </Badge>
              ))}
            </div>
            {techVerticals.length > TECH_PREVIEW && (
              <button
                type="button"
                onClick={() => setShowAllTech((v: boolean) => !v)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm"
                aria-expanded={showAllTech}
              >
                {showAllTech ? 'Show less' : `Show all (${techVerticals.length})`}
              </button>
            )}
          </>
        ) : (
          <p className="text-muted-foreground text-sm">No tech verticals listed.</p>
        )}
      </ItemContent>
    </Item>
  );
}
