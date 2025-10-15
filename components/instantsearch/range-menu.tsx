'use client';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import React, { useEffect, useState, useCallback } from 'react';
import { useRange, UseRangeProps } from 'react-instantsearch';

export function RangeFilter(props: UseRangeProps) {
  const { start, range, canRefine, refine } = useRange(props);
  const minValue = range.min ?? 0;
  const maxValue = range.max ?? 100;

  // Convert InstantSearch start values to our internal state (null for unbounded)
  const [startYear, setStartYear] = useState<number | null>(null);
  const [endYear, setEndYear] = useState<number | null>(null);
  const [startInput, setStartInput] = useState<string>('');
  const [endInput, setEndInput] = useState<string>('');

  // Helper to convert null to undefined for InstantSearch
  const toInstantSearchValue = (value: number | null): number | undefined => {
    return value === null ? undefined : value;
  };

  // Helper to clamp and order range values
  const normalizeRange = useCallback(
    (a: number | null, b: number | null): [number | null, number | null] => {
      if (a === null || b === null) return [a, b];
      const clampedA = Math.min(Math.max(a, minValue), maxValue);
      const clampedB = Math.min(Math.max(b, minValue), maxValue);
      return clampedA <= clampedB ? [clampedA, clampedB] : [clampedB, clampedA];
    },
    [minValue, maxValue],
  );

  // Sync with InstantSearch state
  useEffect(() => {
    const newStart = start[0] !== undefined && start[0] !== -Infinity ? start[0] : null;
    const newEnd = start[1] !== undefined && start[1] !== Infinity ? start[1] : null;

    setStartYear(newStart);
    setEndYear(newEnd);
    setStartInput(newStart?.toString() ?? '');
    setEndInput(newEnd?.toString() ?? '');
  }, [start, minValue, maxValue]);

  // Slider value always needs concrete numbers; fallback to bounds
  const sliderValue: [number, number] = [startYear ?? minValue, endYear ?? maxValue];

  const handleSliderChange = (values: number[]) => {
    const [s, e] = normalizeRange(values[0]!, values[1]!);
    setStartYear(s);
    setEndYear(e);
    setStartInput(s?.toString() ?? '');
    setEndInput(e?.toString() ?? '');

    // Convert to InstantSearch format (null values become undefined)
    const instantSearchValues: [number | undefined, number | undefined] = [
      s === minValue ? undefined : toInstantSearchValue(s),
      e === maxValue ? undefined : toInstantSearchValue(e),
    ];
    refine(instantSearchValues);
  };

  const handleInputCommit = (which: 'start' | 'end') => {
    const raw = which === 'start' ? startInput.trim() : endInput.trim();
    if (raw === '') {
      if (which === 'start') {
        setStartYear(null);
        setStartInput('');
      } else {
        setEndYear(null);
        setEndInput('');
      }
      // Update InstantSearch with cleared value
      const instantSearchValues: [number | undefined, number | undefined] = [
        which === 'start' ? undefined : startYear === minValue ? undefined : toInstantSearchValue(startYear),
        which === 'end' ? undefined : endYear === maxValue ? undefined : toInstantSearchValue(endYear),
      ];
      refine(instantSearchValues);
      return;
    }

    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) return; // ignore invalid

    if (which === 'start') {
      const [s, e] = normalizeRange(parsed, endYear);
      setStartYear(s);
      setEndYear(e);
      setStartInput(s?.toString() ?? '');
      setEndInput(e?.toString() ?? '');

      // Convert to InstantSearch format
      const instantSearchValues: [number | undefined, number | undefined] = [
        s === minValue ? undefined : toInstantSearchValue(s),
        e === maxValue ? undefined : toInstantSearchValue(e),
      ];
      refine(instantSearchValues);
    } else {
      const [s, e] = normalizeRange(startYear, parsed);
      setStartYear(s);
      setEndYear(e);
      setStartInput(s?.toString() ?? '');
      setEndInput(e?.toString() ?? '');

      // Convert to InstantSearch format
      const instantSearchValues: [number | undefined, number | undefined] = [
        s === minValue ? undefined : toInstantSearchValue(s),
        e === maxValue ? undefined : toInstantSearchValue(e),
      ];
      refine(instantSearchValues);
    }
  };

  const handleClear = () => {
    setStartYear(null);
    setEndYear(null);
    setStartInput('');
    setEndInput('');
    refine([undefined, undefined]);
  };

  return (
    <div className="space-y-4">
      <Slider
        value={sliderValue}
        min={minValue}
        max={maxValue}
        onValueChange={handleSliderChange}
        disabled={!canRefine}
        aria-label="Year range"
      />
      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-1">
          <Label>Start</Label>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="(none)"
            value={startInput}
            onChange={(e) => setStartInput(e.target.value.replace(/[^0-9]/g, ''))}
            onBlur={() => handleInputCommit('start')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInputCommit('start');
            }}
            disabled={!canRefine}
            aria-label="Enter start year"
          />
        </div>
        <div className="flex-1 space-y-1">
          <Label>End</Label>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="(none)"
            value={endInput}
            onChange={(e) => setEndInput(e.target.value.replace(/[^0-9]/g, ''))}
            onBlur={() => handleInputCommit('end')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInputCommit('end');
            }}
            disabled={!canRefine}
            aria-label="Enter end year"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={handleClear} disabled={!canRefine}>
          Clear
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">
        {startYear === null && endYear === null && 'No years selected'}
        {startYear !== null && endYear === null && `From ${startYear} onwards`}
        {startYear === null && endYear !== null && `Up to ${endYear}`}
        {startYear !== null && endYear !== null && `${startYear} – ${endYear}`}
      </p>
    </div>
  );
}
