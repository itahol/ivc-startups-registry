import * as React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { cn } from '@/lib/utils';

export type YearRange = { start?: number | null; end?: number | null };

interface YearRangePickerProps {
  value?: YearRange;
  onChange?: (range: YearRange) => void;
  placeholderStart?: string;
  placeholderEnd?: string;
  className?: string;
  disabled?: boolean;
  minYear?: number; // inclusive
  maxYear?: number; // inclusive
}

interface YearSelectProps {
  year: number | null;
  onSelect: (year: number | null) => void;
  placeholder?: string;
  disabled?: boolean;
  minYear?: number;
  maxYear?: number;
  align?: 'start' | 'center' | 'end';
}

const thisYear = new Date().getFullYear();

function clamp(value: number, min?: number, max?: number) {
  if (typeof min === 'number') value = Math.max(min, value);
  if (typeof max === 'number') value = Math.min(max, value);
  return value;
}

function decadeStart(y: number) {
  return Math.floor(y / 10) * 10;
}

const YearSelect: React.FC<YearSelectProps> = ({
  year,
  onSelect,
  placeholder = 'Any year',
  disabled,
  minYear = thisYear - 100,
  maxYear = thisYear + 10,
  align = 'start',
}) => {
  const initialPage = decadeStart(clamp(year ?? thisYear, minYear, maxYear));
  const [open, setOpen] = React.useState(false);
  const [pageStart, setPageStart] = React.useState(initialPage);

  React.useEffect(() => {
    if (open) {
      setPageStart(decadeStart(clamp(year ?? thisYear, minYear, maxYear)));
    }
  }, [open]);

  const years = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => pageStart + i);
  }, [pageStart]);

  const canPrev = pageStart - 10 >= minYear - 2;
  const canNext = pageStart + 10 <= maxYear;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn('w-[10.5rem] justify-between', !year && 'text-muted-foreground', disabled && 'opacity-60')}
          disabled={disabled}
        >
          <span className="truncate">{year ?? placeholder}</span>
          <CalendarIcon className="h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[18rem] p-2" align={align}>
        <div className="flex items-center justify-between px-2 py-1">
          <Button variant="ghost" size="icon" onClick={() => setPageStart((p) => p - 10)} disabled={!canPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium select-none">
            {pageStart} – {pageStart + 11}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setPageStart((p) => p + 10)} disabled={!canNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2 p-2">
          {years.map((y) => {
            const isDisabled =
              (typeof minYear === 'number' && y < minYear) || (typeof maxYear === 'number' && y > maxYear);
            const isActive = year === y;
            return (
              <Button
                key={y}
                type="button"
                variant={isActive ? 'default' : 'secondary'}
                className={cn('h-9', isDisabled && 'opacity-40')}
                disabled={isDisabled}
                onClick={() => {
                  onSelect(y);
                  setOpen(false);
                }}
              >
                {y}
              </Button>
            );
          })}
        </div>
        <div className="flex items-center justify-between px-2 pb-2">
          <Button
            type="button"
            variant="ghost"
            className="gap-1"
            onClick={() => {
              onSelect(null);
              setOpen(false);
            }}
          >
            <X className="h-4 w-4" /> Clear
          </Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const YearRangePicker: React.FC<YearRangePickerProps> = ({
  value,
  onChange,
  placeholderStart = 'Start year',
  placeholderEnd = 'End year',
  className,
  disabled,
  minYear = thisYear - 100,
  maxYear = thisYear,
}) => {
  const [range, setRange] = React.useState<YearRange>({ start: value?.start ?? null, end: value?.end ?? null });

  React.useEffect(() => {
    if (value) setRange({ start: value.start ?? null, end: value.end ?? null });
  }, [value?.start, value?.end]);

  function commit(next: YearRange) {
    setRange(next);
    onChange?.(next);
  }

  function setStart(y: number | null) {
    let next: YearRange = { ...range, start: y };
    if (y != null && range.end != null && y > range.end) {
      next.end = y;
    }
    commit(next);
  }

  function setEnd(y: number | null) {
    let next: YearRange = { ...range, end: y };
    if (y != null && range.start != null && y < range.start) {
      next.start = y;
    }
    commit(next);
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <YearSelect
        year={range.start ?? null}
        onSelect={setStart}
        placeholder={placeholderStart}
        disabled={disabled}
        minYear={minYear}
        maxYear={maxYear}
        align="start"
      />
      <span className="text-sm text-muted-foreground">to</span>
      <YearSelect
        year={range.end ?? null}
        onSelect={setEnd}
        placeholder={placeholderEnd}
        disabled={disabled}
        minYear={minYear}
        maxYear={maxYear}
        align="end"
      />
    </div>
  );
};
