'use client';

import { Button } from '@/components/ui/button';
import { attributeMetaMap } from '@/lib/server/typesense/schema';
import { formatNumber } from '@/lib/utils';
import { X } from 'lucide-react';
import { useClearRefinements, useCurrentRefinements, UseCurrentRefinementsProps } from 'react-instantsearch';

type CurrentRefinement = ReturnType<typeof useCurrentRefinements>['items'][number]['refinements'][number];

const formatRefinementLabel = (label: string): string => {
  const labelParts = label.split(' ');

  if (labelParts.length > 1 && isFinite(Number(labelParts[1])) && !isNaN(Number(labelParts[1]))) {
    const formattedNumber = formatNumber(Number(labelParts[1]));
    return `${labelParts[0]} ${formattedNumber}${labelParts.slice(2).join(' ')}`;
  }

  return label;
};

function formatRefinement(refinement: CurrentRefinement) {
  console.log('Refinement:', refinement);
  console.dir(refinement);
  const shouldFormatLabel = attributeMetaMap[refinement.attribute]?.formatRefinementLabel !== false;
  const label = formatLabel(refinement.attribute);
  const value = shouldFormatLabel ? formatRefinementLabel(refinement.label) : refinement.label;
  return { label, value };
}

function isAttributeLabel(label: string): label is keyof typeof attributeMetaMap {
  return label in attributeMetaMap;
}

function formatLabel(label: string): string {
  return isAttributeLabel(label) ? attributeMetaMap[label].label : label;
}

interface CurrentRefinementsProps extends UseCurrentRefinementsProps {
  onClear?: () => void;
  naturalLanguageFilters?: string[];
  onClearNaturalLanguageFilters?: () => void;
}

export function CurrentRefinements({
  onClear,
  naturalLanguageFilters = [],
  onClearNaturalLanguageFilters,
  ...props
}: CurrentRefinementsProps) {
  const { refine: clearRefinements } = useClearRefinements();
  const { items, refine } = useCurrentRefinements(props);
  const hasStandardRefinements = items.length !== 0;
  const hasNaturalLanguageFilters = naturalLanguageFilters.length > 0;

  const handleClearAll = () => {
    if (hasStandardRefinements) {
      clearRefinements();
    }
    if (hasNaturalLanguageFilters) {
      onClearNaturalLanguageFilters?.();
    }
    onClear?.();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        {items
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((item) =>
            item.refinements.map((refinement) => {
              const { label: formattedLabel, value: formattedRefinementLabel } = formatRefinement(refinement);

              return (
                <Button
                  onClick={() => {
                    refine(refinement);
                  }}
                  variant="outline"
                  className="rounded-full"
                  key={[item.indexName, item.label, refinement.label].join('/')}
                  size="sm"
                >
                  <span>
                    <span className="font-bold">{`${formattedLabel}: `}</span>
                    {`${formattedRefinementLabel}`}
                  </span>
                  <X className="h-5" />
                </Button>
              );
            }),
          )}
        {naturalLanguageFilters.map((filter, index) => (
          <Button
            key={`nl-filter-${index}`}
            onClick={() => {
              onClearNaturalLanguageFilters?.();
            }}
            variant="outline"
            className="rounded-full"
            size="sm"
          >
            <span>
              <span className="font-bold">Natural Language: </span>
              {filter}
            </span>
            <X className="h-5" />
          </Button>
        ))}
      </div>
      {hasStandardRefinements || hasNaturalLanguageFilters ? (
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-muted-foreground hover:text-foreground"
            onClick={handleClearAll}
          >
            Clear
          </Button>
        </div>
      ) : null}
    </div>
  );
}
