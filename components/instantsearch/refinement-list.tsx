'use client';

import * as React from 'react';
import { useRefinementList, UseRefinementListProps } from 'react-instantsearch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

export interface RefinementListProps extends UseRefinementListProps {
  searchPlaceholder?: string;
  className?: string;
  searchable?: boolean;
  enableOperatorToggle?: boolean;
}

export function StyledRefinementList({
  searchPlaceholder = 'Search here...',
  className,
  searchable = false,
  enableOperatorToggle = false,
  operator: initialOperator,
  ...props
}: RefinementListProps) {
  const [currentOperator, setCurrentOperator] = React.useState<'and' | 'or'>(initialOperator ?? 'or');
  const { items, refine, searchForItems, canToggleShowMore, toggleShowMore, isShowingMore } = useRefinementList({
    ...props,
    operator: currentOperator,
  });
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    searchForItems(value);
  };

  const refinedCount = items.filter((item) => item.isRefined).length;
  const showOperatorToggle = enableOperatorToggle && refinedCount > 0;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {searchable && (
        <Input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
          className="h-9 text-sm"
        />
      )}

      {showOperatorToggle && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Match</span>
          <ToggleGroup
            type="single"
            value={currentOperator}
            onValueChange={(val) => (val === 'and' || val === 'or') && setCurrentOperator(val)}
            size="sm"
            aria-label="Choose match mode for refinement list"
          >
            <ToggleGroupItem value="or" className="px-3 text-xs">
              Any
            </ToggleGroupItem>
            <ToggleGroupItem value="and" className="px-3 text-xs">
              All
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      <div className="flex flex-col">
        {items.length === 0 && searchQuery && <p className="text-sm text-muted-foreground py-2">No results found.</p>}
        {items.map((item) => (
          <label
            key={item.value}
            className="flex items-center gap-2.5 cursor-pointer group py-1 hover:bg-muted/50 -mx-2 px-2 rounded-sm transition-colors"
          >
            <Checkbox checked={item.isRefined} onCheckedChange={() => refine(item.value)} />
            <span className="flex-1 text-sm text-foreground group-hover:text-foreground/90">{item.label}</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded min-w-[2.5rem] text-center">
              {item.count.toLocaleString()}
            </span>
          </label>
        ))}
      </div>

      {canToggleShowMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleShowMore}
          className="text-sm text-muted-foreground hover:text-foreground w-full justify-start px-2"
        >
          {isShowingMore ? 'Show less' : 'Show more'}
        </Button>
      )}
    </div>
  );
}
