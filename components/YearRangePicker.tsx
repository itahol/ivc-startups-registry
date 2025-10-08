'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { type UseSliderWithInputProps } from '@/hooks/use-slider-with-input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/**
 * Simple year range picker.
 * - Removes background / histogram drawing.
 * - Accepts config via UseSliderWithInputProps (minValue, maxValue, initialValue, defaultValue)
 * - Supports null (no selection) for start and end years. onChange emits `[start,end] | null`.
 */
export interface YearRangePickerProps extends UseSliderWithInputProps {
  label?: string;
  onChange?: (value: [number | null, number | null] | null) => void;
}

export default function YearRangePicker({
  minValue = 1980,
  maxValue = new Date().getFullYear(),
  initialValue,
  defaultValue,
  label = 'Year Range',
  onChange,
}: YearRangePickerProps) {
  const id = useId();

  const resolvedInitial: [number | null, number | null] = [initialValue?.[0] ?? null, initialValue?.[1] ?? null];
  const resolvedDefault: [number | null, number | null] = [defaultValue?.[0] ?? null, defaultValue?.[1] ?? null];

  const [startYear, setStartYear] = useState<number | null>(resolvedInitial[0]);
  const [endYear, setEndYear] = useState<number | null>(resolvedInitial[1]);
  const [startInput, setStartInput] = useState<string>(resolvedInitial[0]?.toString() ?? '');
  const [endInput, setEndInput] = useState<string>(resolvedInitial[1]?.toString() ?? '');

  // Emit changes
  useEffect(() => {
    if (onChange) {
      if (startYear === null && endYear === null) {
        onChange(null);
      } else {
        onChange([startYear, endYear]);
      }
    }
  }, [startYear, endYear, onChange]);

  // Helper to clamp + order
  const normalizeRange = useCallback(
    (a: number | null, b: number | null): [number | null, number | null] => {
      if (a === null || b === null) return [a, b];
      const clampedA = Math.min(Math.max(a, minValue), maxValue);
      const clampedB = Math.min(Math.max(b, minValue), maxValue);
      return clampedA <= clampedB ? [clampedA, clampedB] : [clampedB, clampedA];
    },
    [minValue, maxValue],
  );

  // Slider value always needs concrete numbers; fallback to bounds
  const sliderValue: [number, number] = [startYear ?? minValue, endYear ?? maxValue];

  const handleSliderChange = (values: number[]) => {
    const [s, e] = normalizeRange(values[0]!, values[1]!);
    setStartYear(s);
    setEndYear(e);
    setStartInput(s?.toString() ?? '');
    setEndInput(e?.toString() ?? '');
  };

  const handleInputCommit = (which: 'start' | 'end') => {
    const raw = which === 'start' ? startInput.trim() : endInput.trim();
    if (raw === '') {
      if (which === 'start') setStartYear(null);
      else setEndYear(null);
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
    } else {
      const [s, e] = normalizeRange(startYear, parsed);
      setStartYear(s);
      setEndYear(e);
      setStartInput(s?.toString() ?? '');
      setEndInput(e?.toString() ?? '');
    }
  };

  const showReset = startYear !== resolvedDefault[0] || endYear !== resolvedDefault[1];

  const handleClear = () => {
    setStartYear(null);
    setEndYear(null);
    setStartInput('');
    setEndInput('');
  };

  const handleReset = () => {
    setStartYear(resolvedDefault[0]);
    setEndYear(resolvedDefault[1]);
    setStartInput(resolvedDefault[0]?.toString() ?? '');
    setEndInput(resolvedDefault[1]?.toString() ?? '');
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      <Slider
        value={sliderValue}
        min={minValue}
        max={maxValue}
        onValueChange={handleSliderChange}
        aria-label="Year range"
      />
      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-1">
          <Label htmlFor={`${id}-start`}>Start</Label>
          <Input
            id={`${id}-start`}
            type="text"
            inputMode="numeric"
            placeholder="(none)"
            value={startInput}
            onChange={(e) => setStartInput(e.target.value.replace(/[^0-9]/g, ''))}
            onBlur={() => handleInputCommit('start')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInputCommit('start');
            }}
            aria-label="Enter start year"
          />
        </div>
        <div className="flex-1 space-y-1">
          <Label htmlFor={`${id}-end`}>End</Label>
          <Input
            id={`${id}-end`}
            type="text"
            inputMode="numeric"
            placeholder="(none)"
            value={endInput}
            onChange={(e) => setEndInput(e.target.value.replace(/[^0-9]/g, ''))}
            onBlur={() => handleInputCommit('end')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInputCommit('end');
            }}
            aria-label="Enter end year"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={handleClear}>
          Clear
        </Button>
        {showReset && (
          <Button type="button" variant="outline" className="flex-1" onClick={handleReset}>
            Reset
          </Button>
        )}
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
